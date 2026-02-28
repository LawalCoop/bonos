import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// DELETE - Eliminar una venta externa
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventoId: string; ventaId: string }> }
) {
  try {
    const { eventoId, ventaId } = await params;
    const session = await auth();

    if (!session || session.user.rol !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await prisma.ventaExterna.delete({
      where: {
        id: ventaId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar venta externa:", error);
    return NextResponse.json(
      { error: "Error al eliminar venta externa" },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar una venta externa
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventoId: string; ventaId: string }> }
) {
  try {
    const { eventoId, ventaId } = await params;
    const session = await auth();

    if (!session || session.user.rol !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      nombre,
      apellido,
      dni,
      telefono,
      email,
      precio,
      cantidad,
      vendidoPor,
      notas,
    } = body;

    const ventaExterna = await prisma.ventaExterna.update({
      where: {
        id: ventaId,
      },
      data: {
        ...(nombre && { nombre }),
        ...(apellido && { apellido }),
        ...(dni && { dni }),
        ...(telefono !== undefined && { telefono }),
        ...(email !== undefined && { email }),
        ...(precio && { precio: parseFloat(precio) }),
        ...(cantidad && { cantidad: parseInt(cantidad) }),
        ...(vendidoPor !== undefined && { vendidoPor }),
        ...(notas !== undefined && { notas }),
      },
    });

    return NextResponse.json(ventaExterna);
  } catch (error) {
    console.error("Error al actualizar venta externa:", error);
    return NextResponse.json(
      { error: "Error al actualizar venta externa" },
      { status: 500 }
    );
  }
}
