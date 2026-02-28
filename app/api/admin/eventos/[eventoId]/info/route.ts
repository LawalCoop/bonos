import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  try {
    const { eventoId } = await params;
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const evento = await prisma.evento.findUnique({
      where: { id: eventoId },
      select: {
        id: true,
        nombre: true,
        precioBase: true,
        esFechaEspecial: true,
        precioEspecial: true,
      },
    });

    if (!evento) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Obtener promociones activas
    const now = new Date();
    const promociones = await prisma.promocion.findMany({
      where: {
        activo: true,
        fechaInicio: { lte: now },
        fechaFin: { gte: now },
        OR: [
          { eventoId: eventoId },
          { eventoId: null }, // Globales
        ],
        requiereAuth: false,
      },
      orderBy: { prioridad: "desc" },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        tipo: true,
        valor: true,
      },
    });

    const precio =
      evento.esFechaEspecial && evento.precioEspecial
        ? evento.precioEspecial
        : evento.precioBase;

    return NextResponse.json({
      evento: {
        id: evento.id,
        nombre: evento.nombre,
        precio,
      },
      promociones,
    });
  } catch (error: any) {
    console.error("Error fetching evento info:", error);
    return NextResponse.json(
      { error: "Error al obtener información del evento" },
      { status: 500 }
    );
  }
}
