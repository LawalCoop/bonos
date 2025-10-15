import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Obtener todas las ventas externas de un evento
export async function GET(
  request: NextRequest,
  { params }: { params: { eventoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.rol !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const ventasExternas = await prisma.ventaExterna.findMany({
      where: {
        eventoId: params.eventoId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(ventasExternas);
  } catch (error) {
    console.error("Error al obtener ventas externas:", error);
    return NextResponse.json(
      { error: "Error al obtener ventas externas" },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva venta externa
export async function POST(
  request: NextRequest,
  { params }: { params: { eventoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

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

    // Validaciones básicas
    if (!nombre || !apellido || !dni || !precio || !cantidad) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el evento existe
    const evento = await prisma.evento.findUnique({
      where: { id: params.eventoId },
    });

    if (!evento) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const ventaExterna = await prisma.ventaExterna.create({
      data: {
        eventoId: params.eventoId,
        nombre,
        apellido,
        dni,
        telefono,
        email,
        precio: parseFloat(precio),
        cantidad: parseInt(cantidad),
        vendidoPor,
        notas,
      },
    });

    return NextResponse.json(ventaExterna, { status: 201 });
  } catch (error) {
    console.error("Error al crear venta externa:", error);
    return NextResponse.json(
      { error: "Error al crear venta externa" },
      { status: 500 }
    );
  }
}
