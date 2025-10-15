import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";
import QRCode from "qrcode";
import { PUNTOS, calcularNivel } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("Webhook recibido:", body);

    // Mercado Pago envía el tipo de notificación
    const { type, data } = body;

    // Solo procesamos notificaciones de payment
    if (type !== "payment") {
      return NextResponse.json({ received: true });
    }

    if (!data?.id) {
      return NextResponse.json({ error: "No payment ID" }, { status: 400 });
    }

    // Configurar Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
    });

    const payment = new Payment(client);

    // Obtener información del pago
    const paymentInfo = await payment.get({ id: data.id });

    console.log("Payment info:", paymentInfo);

    // Solo procesar pagos aprobados
    if (paymentInfo.status !== "approved") {
      return NextResponse.json({ received: true });
    }

    // Verificar si ya existe el pago
    const pagoExistente = await prisma.pago.findUnique({
      where: { mercadoPagoId: String(paymentInfo.id) },
    });

    if (pagoExistente) {
      console.log("Pago ya procesado");
      return NextResponse.json({ received: true });
    }

    // Obtener metadata
    const metadata = paymentInfo.metadata as any;
    const userId = metadata?.user_id || metadata?.userId;
    const eventoId = metadata?.evento_id || metadata?.eventoId;
    const cantidad = parseInt(metadata?.cantidad || "1");

    // Parsear descuentos si vienen como string JSON
    let descuentos = [];
    try {
      descuentos = typeof metadata?.descuentos === 'string'
        ? JSON.parse(metadata.descuentos)
        : (metadata?.descuentos || []);
    } catch (e) {
      console.error("Error parseando descuentos:", e);
      descuentos = [];
    }

    if (!userId || !eventoId) {
      console.error("Faltan datos en metadata:", metadata);
      return NextResponse.json({ error: "Metadata incompleta" }, { status: 400 });
    }

    // Crear registro de pago
    const pago = await prisma.pago.create({
      data: {
        mercadoPagoId: String(paymentInfo.id),
        monto: paymentInfo.transaction_amount || 0,
        estado: "APPROVED",
        metodoPago: paymentInfo.payment_type_id,
        metadata: paymentInfo.metadata,
        usuarioId: userId,
      },
    });

    // Crear los bonos
    const bonos = [];
    for (let i = 0; i < cantidad; i++) {
      const codigo = `${eventoId}-${userId}-${Date.now()}-${i}`;

      // Generar QR code
      const qrCodeData = await QRCode.toDataURL(codigo, {
        errorCorrectionLevel: "H",
        margin: 1,
        width: 300,
      });

      const bono = await prisma.bono.create({
        data: {
          codigo,
          qrCode: qrCodeData,
          eventoId,
          usuarioId: userId,
          precioFinal: (paymentInfo.transaction_amount || 0) / cantidad,
          descuentosAplicados: { descuentos },
          estado: "PAGADO",
          pagoId: pago.id,
        },
      });

      bonos.push(bono);
    }

    // Enviar email con los bonos
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const evento = await prisma.evento.findUnique({
      where: { id: eventoId },
    });

    if (user && evento && user.email) {
      try {
        const { enviarBonoEmail } = await import("@/lib/email");

        await enviarBonoEmail({
          to: user.email,
          nombreUsuario: user.name || user.nombre || "Amigue",
          bonos: bonos.map(b => ({
            codigo: b.codigo,
            qrCode: b.qrCode,
          })),
          evento: {
            nombre: evento.nombre,
            fecha: evento.fecha,
            horaInicio: evento.horaInicio,
            ubicacion: evento.ubicacion,
          },
          precioFinal: paymentInfo.transaction_amount || 0,
          descuentos: descuentos,
        });

        console.log(`Email enviado a ${user.email} con ${bonos.length} bonos`);
      } catch (emailError) {
        console.error("Error enviando email:", emailError);
        // No fallar el webhook si el email falla
      }
    }

    console.log(`${bonos.length} bonos creados para usuario ${userId}`);

    // Actualizar totales del evento
    await prisma.evento.update({
      where: { id: eventoId },
      data: {
        totalRecaudado: {
          increment: paymentInfo.transaction_amount || 0,
        },
      },
    });

    // NOTA: Ya no asignamos dinero al objetivo inmediatamente.
    // El dinero se asignará al objetivo cuando el admin cierre el evento,
    // después de calcular todos los gastos y la distribución real.

    // Crear/actualizar relación UsuarioArtista para tracking
    if (userId && eventoId) {
      const eventoConArtistas = await prisma.evento.findUnique({
        where: { id: eventoId },
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
            // Buscar si ya existe la relación
            const relacionExistente = await prisma.usuarioArtista.findFirst({
              where: {
                usuarioId: userId,
                artistaId: ea.artistaId,
              },
            });

            if (relacionExistente) {
              // Actualizar: incrementar vecesVisto y actualizar ultimaVez
              await prisma.usuarioArtista.update({
                where: { id: relacionExistente.id },
                data: {
                  vecesVisto: { increment: 1 },
                  ultimaVez: now,
                },
              });
            } else {
              // Crear nueva relación
              await prisma.usuarioArtista.create({
                data: {
                  usuarioId: userId,
                  artistaId: ea.artistaId,
                  vecesVisto: 1,
                  primeraVez: now,
                  ultimaVez: now,
                  esFavorito: false,
                },
              });
            }
          } catch (error) {
            console.error(`Error creando/actualizando UsuarioArtista para artista ${ea.artistaId}:`, error);
            // Continuar con los demás artistas
          }
        }

        console.log(`Relación UsuarioArtista actualizada para ${eventoConArtistas.artistas.length} artistas`);
      }
    }

    // Otorgar puntos al usuario por la compra (100 puntos por bono)
    if (userId) {
      const puntosGanados = PUNTOS.ASISTIR_EVENTO * cantidad; // 100 puntos por bono

      const usuario = await prisma.user.findUnique({
        where: { id: userId },
        select: { puntos: true, nivel: true },
      });

      if (usuario) {
        const nuevosPuntos = usuario.puntos + puntosGanados;
        const nivelAnterior = usuario.nivel;
        const nuevoNivel = calcularNivel(nuevosPuntos);

        await prisma.user.update({
          where: { id: userId },
          data: {
            puntos: nuevosPuntos,
            nivel: nuevoNivel,
          },
        });

        console.log(`Usuario ${userId}: +${puntosGanados} puntos (${usuario.puntos} → ${nuevosPuntos})`);

        if (nuevoNivel > nivelAnterior) {
          console.log(`¡Usuario subió de nivel ${nivelAnterior} a ${nuevoNivel}!`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      bonosCreados: bonos.length
    });
  } catch (error) {
    console.error("Error procesando webhook:", error);
    return NextResponse.json(
      { error: "Error procesando pago" },
      { status: 500 }
    );
  }
}
