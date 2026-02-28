import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener todas las organizaciones activas
    const organizaciones = await prisma.organizacion.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        descuentoPorcentaje: true,
      },
    });

    return NextResponse.json(organizaciones);
  } catch (error) {
    console.error("Error fetching organizaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener organizaciones" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, tipo, descuentoPorcentaje, activo } = body;

    if (!nombre || descuentoPorcentaje === undefined) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const organizacion = await prisma.organizacion.create({
      data: {
        nombre,
        tipo: tipo || null,
        descuentoPorcentaje: parseFloat(descuentoPorcentaje),
        activo: activo !== undefined ? activo : true,
      },
    });

    return NextResponse.json(organizacion);
  } catch (error) {
    console.error("Error creating organizacion:", error);
    return NextResponse.json(
      { error: "Error al crear organización" },
      { status: 500 }
    );
  }
}
