import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import QRCode from "qrcode";
import { enviarBonoEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { calcularDescuentos } from "@/lib/descuentos";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    logger.info("=== CREACION MANUAL DE BONO INICIADA ===");

    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      logger.warn("Intento de acceso no autorizado a creación de bonos");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { eventoId, cantidad, metodoPago, email, telefono, nombre } = body;

    logger.info("Datos recibidos para creación de bono", { eventoId, cantidad, metodoPago, email, nombre });

    if (!eventoId) {
      return NextResponse.json(
        { error: "Evento requerido" },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

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

    logger.info("Descuentos calculados", {
      precioBase: calculo.precioBase,
      precioFinal: calculo.precioFinal,
      totalDescuento: calculo.totalDescuento,
      descuentos: descuentosAplicados,
    });

    // Create bonos as PAGADO (manual creation assumes payment was received)
    const bonos = [];
    for (let i = 0; i < cantidad; i++) {
      const codigo = `MANUAL-${Date.now()}-${i}`;
      const qrCode = await QRCode.toDataURL(codigo);

      const bono = await prisma.bono.create({
        data: {
          codigo,
          qrCode,
          eventoId: evento.id,
          usuarioId, // Asignar usuario si existe
          precioFinal: precioFinal / cantidad,
          descuentosAplicados: { descuentos: descuentosAplicados } as any,
          estado: "PAGADO",
        },
      });

      bonos.push(bono);
    }

    logger.info("Bonos creados exitosamente", {
      cantidad: bonos.length,
      asignadoAUsuario: usuarioId ? true : false
    });

    // Send email if provided
    if (email) {
      try {
        logger.info("Enviando email con bono", { destinatario: email });
        await enviarBonoEmail({
          to: email,
          nombreUsuario: nombre || "Cliente",
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
      message: `${bonos.length} bono(s) creado(s) exitosamente`,
    });
  } catch (error: any) {
    logger.error("Error creating manual bono", {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      {
        error: "Error al crear bono",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
