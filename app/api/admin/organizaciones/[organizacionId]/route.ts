import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ organizacionId: string }> }
) {
  try {
    const { organizacionId } = await params;
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, tipo, descuentoPorcentaje, activo } = body;

    const organizacion = await prisma.organizacion.update({
      where: { id: organizacionId },
      data: {
        nombre,
        tipo: tipo || null,
        descuentoPorcentaje: parseFloat(descuentoPorcentaje),
        activo,
      },
    });

    return NextResponse.json(organizacion);
  } catch (error) {
    console.error("Error updating organizacion:", error);
    return NextResponse.json(
      { error: "Error al actualizar organización" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ organizacionId: string }> }
) {
  try {
    const { organizacionId } = await params;
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const organizacion = await prisma.organizacion.findUnique({
      where: { id: organizacionId },
      include: {
        _count: {
          select: {
            usuarios: true,
          },
        },
      },
    });

    if (!organizacion) {
      return NextResponse.json(
        { error: "Organización no encontrada" },
        { status: 404 }
      );
    }

    if (organizacion._count.usuarios > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar una organización con usuarios asociados" },
        { status: 400 }
      );
    }

    await prisma.organizacion.delete({
      where: { id: organizacionId },
    });

    return NextResponse.json({ message: "Organización eliminada" });
  } catch (error) {
    console.error("Error deleting organizacion:", error);
    return NextResponse.json(
      { error: "Error al eliminar organización" },
      { status: 500 }
    );
  }
}
