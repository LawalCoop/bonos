import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// GET all descuentos
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const descuentos = await prisma.descuento.findMany({
      include: {
        organizacion: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        prioridad: "asc",
      },
    });

    return NextResponse.json(descuentos);
  } catch (error) {
    console.error("Error fetching descuentos:", error);
    return NextResponse.json(
      { error: "Error al obtener descuentos" },
      { status: 500 }
    );
  }
}

// POST create descuento
export async function POST(request: Request) {
  try {
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

    // Validar campos requeridos
    if (!nombre || !tipo || porcentaje === undefined) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Validar tipo
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

    // Validar que el porcentaje esté entre 0 y 100
    if (porcentaje < 0 || porcentaje > 100) {
      return NextResponse.json(
        { error: "El porcentaje debe estar entre 0 y 100" },
        { status: 400 }
      );
    }

    const descuento = await prisma.descuento.create({
      data: {
        nombre,
        descripcion,
        tipo,
        porcentaje: parseFloat(porcentaje),
        esAcumulable: esAcumulable !== undefined ? esAcumulable : true,
        prioridad: prioridad !== undefined ? parseInt(prioridad) : 0,
        activo: activo !== undefined ? activo : true,
        nivelMinimo: nivelMinimo ? parseInt(nivelMinimo) : null,
        vecesVistoMinimo: vecesVistoMinimo ? parseInt(vecesVistoMinimo) : null,
        comprasMesMinimo: comprasMesMinimo ? parseInt(comprasMesMinimo) : null,
        organizacionId: organizacionId || null,
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
    console.error("Error creating descuento:", error);
    return NextResponse.json(
      { error: "Error al crear descuento" },
      { status: 500 }
    );
  }
}
