import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// GET single descuento
export async function GET(
  request: Request,
  { params }: { params: Promise<{ descuentoId: string }> }
) {
  try {
    const { descuentoId } = await params;
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const descuento = await prisma.descuento.findUnique({
      where: { id: descuentoId },
      include: {
        organizacion: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!descuento) {
      return NextResponse.json(
        { error: "Descuento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(descuento);
  } catch (error) {
    console.error("Error fetching descuento:", error);
    return NextResponse.json(
      { error: "Error al obtener descuento" },
      { status: 500 }
    );
  }
}

// PUT update descuento
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ descuentoId: string }> }
) {
  try {
    const { descuentoId } = await params;
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      nombre,
      descripcion,
      tipo,
      porcentaje,
      esAcumulable,
      prioridad,
      activo,
      nivelMinimo,
      vecesVistoMinimo,
      comprasMesMinimo,
      organizacionId,
    } = body;

    // Verificar que el descuento existe
    const existingDescuento = await prisma.descuento.findUnique({
      where: { id: descuentoId },
    });

    if (!existingDescuento) {
      return NextResponse.json(
        { error: "Descuento no encontrado" },
        { status: 404 }
      );
    }

    // Validar tipo si se proporciona
    if (tipo) {
      const tiposValidos = [
        "NIVEL",
        "VECES_VISTO_ARTISTA",
        "SOCIO",
        "ORGANIZACION",
        "MULTIPLES_COMPRAS_MES",
      ];

      if (!tiposValidos.includes(tipo)) {
        return NextResponse.json(
          { error: "Tipo de descuento inválido" },
          { status: 400 }
        );
      }
    }

    // Validar porcentaje si se proporciona
    if (porcentaje !== undefined && (porcentaje < 0 || porcentaje > 100)) {
      return NextResponse.json(
        { error: "El porcentaje debe estar entre 0 y 100" },
        { status: 400 }
      );
    }

    const descuento = await prisma.descuento.update({
      where: { id: descuentoId },
      data: {
        ...(nombre && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(tipo && { tipo }),
        ...(porcentaje !== undefined && { porcentaje: parseFloat(porcentaje) }),
        ...(esAcumulable !== undefined && { esAcumulable }),
        ...(prioridad !== undefined && { prioridad: parseInt(prioridad) }),
        ...(activo !== undefined && { activo }),
        ...(nivelMinimo !== undefined && {
          nivelMinimo: nivelMinimo ? parseInt(nivelMinimo) : null,
        }),
        ...(vecesVistoMinimo !== undefined && {
          vecesVistoMinimo: vecesVistoMinimo
            ? parseInt(vecesVistoMinimo)
            : null,
        }),
        ...(comprasMesMinimo !== undefined && {
          comprasMesMinimo: comprasMesMinimo
            ? parseInt(comprasMesMinimo)
            : null,
        }),
        ...(organizacionId !== undefined && { organizacionId }),
      },
      include: {
        organizacion: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return NextResponse.json(descuento);
  } catch (error) {
    console.error("Error updating descuento:", error);
    return NextResponse.json(
      { error: "Error al actualizar descuento" },
      { status: 500 }
    );
  }
}

// DELETE descuento
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ descuentoId: string }> }
) {
  try {
    const { descuentoId } = await params;
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el descuento existe
    const descuento = await prisma.descuento.findUnique({
      where: { id: descuentoId },
    });

    if (!descuento) {
      return NextResponse.json(
        { error: "Descuento no encontrado" },
        { status: 404 }
      );
    }

    await prisma.descuento.delete({
      where: { id: descuentoId },
    });

    return NextResponse.json({ message: "Descuento eliminado" });
  } catch (error) {
    console.error("Error deleting descuento:", error);
    return NextResponse.json(
      { error: "Error al eliminar descuento" },
      { status: 500 }
    );
  }
}

// PATCH toggle activo
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ descuentoId: string }> }
) {
  try {
    const { descuentoId } = await params;
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const descuento = await prisma.descuento.findUnique({
      where: { id: descuentoId },
    });

    if (!descuento) {
      return NextResponse.json(
        { error: "Descuento no encontrado" },
        { status: 404 }
      );
    }

    const updated = await prisma.descuento.update({
      where: { id: descuentoId },
      data: {
        activo: !descuento.activo,
      },
      include: {
        organizacion: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error toggling descuento:", error);
    return NextResponse.json(
      { error: "Error al cambiar estado del descuento" },
      { status: 500 }
    );
  }
}
