import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

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
      montoObjetivo,
      prioridad,
      fechaInicio,
      fechaObjetivo,
      activo,
    } = body;

    if (!nombre || !descripcion || !montoObjetivo) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const objetivo = await prisma.objetivoAmpliacion.create({
      data: {
        nombre,
        descripcion,
        montoObjetivo: parseFloat(montoObjetivo),
        prioridad: prioridad || 0,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : new Date(),
        fechaObjetivo: fechaObjetivo ? new Date(fechaObjetivo) : null,
        activo: activo !== undefined ? activo : true,
        estado: "ACTIVO",
      },
    });

    return NextResponse.json(objetivo);
  } catch (error) {
    console.error("Error creating objetivo:", error);
    return NextResponse.json(
      { error: "Error al crear objetivo" },
      { status: 500 }
    );
  }
}
