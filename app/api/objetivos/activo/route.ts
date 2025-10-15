import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const objetivo = await prisma.objetivoAmpliacion.findFirst({
      where: {
        estado: "ACTIVO",
        activo: true,
      },
      orderBy: {
        prioridad: "desc",
      },
    });

    if (!objetivo) {
      return NextResponse.json(null);
    }

    return NextResponse.json(objetivo);
  } catch (error) {
    console.error("Error fetching objetivo activo:", error);
    return NextResponse.json({ error: "Error al obtener objetivo" }, { status: 500 });
  }
}
