import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { objetivoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      nombre,
      descripcion,
      montoObjetivo,
      prioridad,
      fechaInicio,
      fechaObjetivo,
      activo,
    } = body;

    const objetivo = await prisma.objetivoAmpliacion.update({
      where: { id: params.objetivoId },
      data: {
        nombre,
        descripcion,
        montoObjetivo: parseFloat(montoObjetivo),
        prioridad: prioridad || 0,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
        fechaObjetivo: fechaObjetivo ? new Date(fechaObjetivo) : null,
        activo,
      },
    });

    return NextResponse.json(objetivo);
  } catch (error) {
    console.error("Error updating objetivo:", error);
    return NextResponse.json(
      { error: "Error al actualizar objetivo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { objetivoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await prisma.objetivoAmpliacion.delete({
      where: { id: params.objetivoId },
    });

    return NextResponse.json({ message: "Objetivo eliminado" });
  } catch (error) {
    console.error("Error deleting objetivo:", error);
    return NextResponse.json(
      { error: "Error al eliminar objetivo" },
      { status: 500 }
    );
  }
}
