import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { promocionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const promocion = await prisma.promocion.findUnique({
      where: { id: params.promocionId },
      include: {
        evento: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!promocion) {
      return NextResponse.json(
        { error: "Promoción no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(promocion);
  } catch (error) {
    console.error("Error fetching promocion:", error);
    return NextResponse.json(
      { error: "Error al obtener promoción" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { promocionId: string } }
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

    const promocion = await prisma.promocion.update({
      where: { id: params.promocionId },
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

    return NextResponse.json(promocion);
  } catch (error) {
    console.error("Error updating promocion:", error);
    return NextResponse.json(
      { error: "Error al actualizar promoción" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { promocionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { activo } = body;

    const promocion = await prisma.promocion.update({
      where: { id: params.promocionId },
      data: {
        activo,
      },
    });

    return NextResponse.json(promocion);
  } catch (error) {
    console.error("Error updating promocion:", error);
    return NextResponse.json(
      { error: "Error al actualizar promoción" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { promocionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await prisma.promocion.delete({
      where: { id: params.promocionId },
    });

    return NextResponse.json({ message: "Promoción eliminada" });
  } catch (error) {
    console.error("Error deleting promocion:", error);
    return NextResponse.json(
      { error: "Error al eliminar promoción" },
      { status: 500 }
    );
  }
}
