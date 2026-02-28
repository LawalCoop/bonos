import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

// PUT - Actualizar gasto
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ eventoId: string; gastoId: string }> }
) {
  try {
    const { eventoId, gastoId } = await params;
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      concepto,
      descripcion,
      monto,
      esCompartido,
      porcentajeArtista,
      porcentajeBayer,
      proveedor,
      pagado,
      fechaPago,
    } = body;

    // Si es compartido, validar porcentajes
    if (esCompartido) {
      const pArtista = porcentajeArtista || 50;
      const pBayer = porcentajeBayer || 50;

      if (pArtista + pBayer !== 100) {
        return NextResponse.json(
          { error: "Los porcentajes deben sumar 100%" },
          { status: 400 }
        );
      }
    }

    const gasto = await prisma.gastoEvento.update({
      where: { id: gastoId },
      data: {
        concepto,
        descripcion,
        monto: monto ? parseFloat(monto) : undefined,
        esCompartido,
        porcentajeArtista: esCompartido
          ? parseFloat(porcentajeArtista || 50)
          : null,
        porcentajeBayer: esCompartido ? parseFloat(porcentajeBayer || 50) : null,
        proveedor,
        pagado,
        fechaPago: fechaPago ? new Date(fechaPago) : undefined,
      },
    });

    return NextResponse.json(gasto);
  } catch (error) {
    console.error("Error updating gasto:", error);
    return NextResponse.json(
      { error: "Error al actualizar gasto" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar gasto
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventoId: string; gastoId: string }> }
) {
  try {
    const { eventoId, gastoId } = await params;
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await prisma.gastoEvento.delete({
      where: { id: gastoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gasto:", error);
    return NextResponse.json(
      { error: "Error al eliminar gasto" },
      { status: 500 }
    );
  }
}

// PATCH - Marcar como pagado/no pagado
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventoId: string; gastoId: string }> }
) {
  try {
    const { eventoId, gastoId } = await params;
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const gasto = await prisma.gastoEvento.findUnique({
      where: { id: gastoId },
    });

    if (!gasto) {
      return NextResponse.json(
        { error: "Gasto no encontrado" },
        { status: 404 }
      );
    }

    const updated = await prisma.gastoEvento.update({
      where: { id: gastoId },
      data: {
        pagado: !gasto.pagado,
        fechaPago: !gasto.pagado ? new Date() : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error toggling pagado:", error);
    return NextResponse.json(
      { error: "Error al cambiar estado de pago" },
      { status: 500 }
    );
  }
}
