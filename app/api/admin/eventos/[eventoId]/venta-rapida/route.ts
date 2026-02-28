import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { MercadoPagoConfig, Preference } from "mercadopago";
import QRCode from "qrcode";
import { enviarBonoEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { calcularDescuentos } from "@/lib/descuentos";
import { PUNTOS, calcularNivel } from "@/lib/constants";

export const dynamic = "force-dynamic";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await params;
  try {
    logger.info("=== VENTA RAPIDA INICIADA ===", { eventoId: eventoId });

    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      logger.warn("Intento de acceso no autorizado a venta rápida");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { cantidad, email, telefono, metodoPago = "mercadopago" } = body;

    logger.info("Venta rápida solicitada", { cantidad, email, telefono, metodoPago });

    if (!cantidad || cantidad < 1) {
      return NextResponse.json(
        { error: "Cantidad inválida" },
        { status: 400 }
      );
    }

    // Get event
    const evento = await prisma.evento.findUnique({
      where: { id: eventoId },
    });

    if (!evento) {
      logger.warn("Evento no encontrado", { eventoId: eventoId });
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    logger.info("Evento encontrado", { eventoNombre: evento.nombre });

    // Buscar usuario por email si se proporciona
    let usuarioId: string | null = null;
    if (email) {
      try {
        const usuario = await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        });
        if (usuario) {
          usuarioId = usuario.id;
          logger.info("Usuario encontrado para asignar bono", { email, usuarioId });
        } else {
          logger.warn("Usuario no encontrado con el email proporcionado", { email });
        }
      } catch (error: any) {
        logger.error("Error buscando usuario por email", { error: error.message, email });
      }
    }

    // Calculate final price with discounts using calcularDescuentos
    const calculo = await calcularDescuentos(
      evento.id,
      usuarioId || undefined,
      cantidad
    );

    const precioFinal = calculo.precioFinal;
    const descuentosAplicados = calculo.descuentos;

    logger.info("Descuentos calculados para venta rápida", {
      precioBase: calculo.precioBase,
      precioFinal: calculo.precioFinal,
      totalDescuento: calculo.totalDescuento,
      descuentos: descuentosAplicados,
    });

    // Create bonos - PAGADO if cash/transfer/other, PENDIENTE if MercadoPago
    const estadoBono = metodoPago === "mercadopago" ? "PENDIENTE" : "PAGADO";
    logger.info("Creando bonos", { cantidad, estado: estadoBono, precioFinal, asignadoAUsuario: usuarioId ? true : false });

    const bonos = [];
    for (let i = 0; i < cantidad; i++) {
      const codigo = `VENTA-${Date.now()}-${i}`;
      const qrCode = await QRCode.toDataURL(codigo);

      const bono = await prisma.bono.create({
        data: {
          codigo,
          qrCode,
          eventoId: evento.id,
          usuarioId, // Asignar usuario si existe
          precioFinal: precioFinal / cantidad, // Split price evenly
          descuentosAplicados: { descuentos: descuentosAplicados } as any,
          estado: estadoBono,
        },
      });

      bonos.push(bono);
    }

    logger.info("Bonos creados exitosamente", {
      cantidad: bonos.length,
      asignadoAUsuario: usuarioId ? true : false
    });

    // If not MercadoPago, return bonos directly and send email if provided
    if (metodoPago !== "mercadopago") {
      logger.info("Pago registrado sin MercadoPago", { metodoPago });

      // Actualizar totales del evento
      await prisma.evento.update({
        where: { id: evento.id },
        data: {
          totalRecaudado: {
            increment: precioFinal,
          },
        },
      });

      // NOTA: Ya no asignamos dinero al objetivo inmediatamente.
      // El dinero se asignará al objetivo cuando el admin cierre el evento,
      // después de calcular todos los gastos y la distribución real.

      // Crear/actualizar relación UsuarioArtista para tracking
      if (usuarioId) {
        const eventoConArtistas = await prisma.evento.findUnique({
          where: { id: evento.id },
          include: {
            artistas: {
              select: {
                artistaId: true,
              },
            },
          },
        });

        if (eventoConArtistas && eventoConArtistas.artistas.length > 0) {
          const now = new Date();

          for (const ea of eventoConArtistas.artistas) {
            try {
              const relacionExistente = await prisma.usuarioArtista.findFirst({
                where: {
                  usuarioId,
                  artistaId: ea.artistaId,
                },
              });

              if (relacionExistente) {
                await prisma.usuarioArtista.update({
                  where: { id: relacionExistente.id },
                  data: {
                    vecesVisto: { increment: 1 },
                    ultimaVez: now,
                  },
                });
              } else {
                await prisma.usuarioArtista.create({
                  data: {
                    usuarioId,
                    artistaId: ea.artistaId,
                    vecesVisto: 1,
                    primeraVez: now,
                    ultimaVez: now,
                    esFavorito: false,
                  },
                });
              }
            } catch (error: any) {
              logger.error(`Error actualizando UsuarioArtista para artista ${ea.artistaId}`, { error: error.message });
            }
          }

          logger.info(`Relación UsuarioArtista actualizada para ${eventoConArtistas.artistas.length} artistas`);
        }
      }

      // Otorgar puntos al usuario si está asignado (100 puntos por bono)
      if (usuarioId) {
        const puntosGanados = PUNTOS.ASISTIR_EVENTO * cantidad;

        const usuario = await prisma.user.findUnique({
          where: { id: usuarioId },
          select: { puntos: true, nivel: true },
        });

        if (usuario) {
          const nuevosPuntos = usuario.puntos + puntosGanados;
          const nivelAnterior = usuario.nivel;
          const nuevoNivel = calcularNivel(nuevosPuntos);

          await prisma.user.update({
            where: { id: usuarioId },
            data: {
              puntos: nuevosPuntos,
              nivel: nuevoNivel,
            },
          });

          logger.info(`Usuario ${usuarioId}: +${puntosGanados} puntos (${usuario.puntos} → ${nuevosPuntos})`);

          if (nuevoNivel > nivelAnterior) {
            logger.info(`¡Usuario subió de nivel ${nivelAnterior} a ${nuevoNivel}!`);
          }
        }
      }

      // Send email if email provided
      if (email) {
        try {
          logger.info("Enviando email con bono", { destinatario: email });
          await enviarBonoEmail({
            to: email,
            nombreUsuario: "Cliente",
            bonos: bonos.map((b) => ({ codigo: b.codigo, qrCode: b.qrCode })),
            evento: {
              nombre: evento.nombre,
              fecha: evento.fecha,
              horaInicio: evento.horaInicio,
              ubicacion: evento.ubicacion,
            },
            precioFinal,
            descuentos: descuentosAplicados.map((d) => ({
              nombre: d.nombre,
              porcentaje: d.porcentaje || 0,
              monto: d.monto,
            })),
          });
          logger.info("Email enviado exitosamente", { destinatario: email });
        } catch (error: any) {
          logger.error("Error enviando email", { error: error.message, destinatario: email });
          // Don't fail the request if email fails
        }
      }

      return NextResponse.json({
        bonos: bonos.map((b) => ({ id: b.id, codigo: b.codigo, qrCode: b.qrCode })),
        metodoPago,
      });
    }

    // Create MercadoPago preference
    logger.info("Creando preferencia de MercadoPago");
    const preference = new Preference(client);

    const preferenceData = await preference.create({
      body: {
        items: [
          {
            id: evento.id,
            title: `${cantidad}x ${evento.nombre}`,
            quantity: 1,
            unit_price: precioFinal,
            currency_id: "ARS",
          },
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL}/admin/ingreso`,
          failure: `${process.env.NEXT_PUBLIC_URL}/admin/ingreso`,
          pending: `${process.env.NEXT_PUBLIC_URL}/admin/ingreso`,
        },
        auto_return: "approved",
        notification_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/mercadopago`,
        metadata: {
          bonos: bonos.map((b) => b.id).join(","),
          eventoId: evento.id,
          tipo: "venta_rapida",
          email: email || "",
          telefono: telefono || "",
        },
      },
    });

    return NextResponse.json({
      preferenceId: preferenceData.id,
      init_point: preferenceData.init_point,
      bonos: bonos.map((b) => ({ id: b.id, codigo: b.codigo })),
    });
  } catch (error: any) {
    logger.error("Error creating quick sale", {
      error: error.message,
      stack: error.stack,
      eventoId: eventoId
    });
    return NextResponse.json(
      {
        error: "Error al crear venta rápida",
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
