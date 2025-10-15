import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdmin(session.user.rol)) {
      logger.warn("Intento de acceso no autorizado a creación de promociones");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      nombre,
      descripcion,
      tipo,
      valor,
      activo,
      prioridad,
      requiereAuth,
      codigo,
      fechaInicio,
      fechaFin,
      eventoId,
    } = body;

    // Validaciones
    if (!nombre || !descripcion || !tipo || !fechaInicio || !fechaFin) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (tipo !== "2x1" && (valor === undefined || valor === null)) {
      return NextResponse.json(
        { error: "El valor es requerido para este tipo de descuento" },
        { status: 400 }
      );
    }

    logger.info("Creando nueva promoción", {
      nombre,
      tipo,
      valor,
      eventoId: eventoId || "global",
    });

    const promocion = await prisma.promocion.create({
      data: {
        nombre,
        descripcion,
        tipo,
        valor: tipo === "2x1" ? 0 : valor,
        activo,
        prioridad,
        requiereAuth,
        codigo: codigo || null,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        eventoId: eventoId || null,
      },
    });

    logger.info("Promoción creada exitosamente", { promocionId: promocion.id });

    return NextResponse.json(promocion);
  } catch (error: any) {
    logger.error("Error creando promoción", {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Error al crear la promoción" },
      { status: 500 }
    );
  }
}
