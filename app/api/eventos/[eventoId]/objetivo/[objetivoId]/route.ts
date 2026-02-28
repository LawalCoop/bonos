import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventoId: string; objetivoId: string }> }
) {
  try {
    const { eventoId, objetivoId } = await params;
    const eventoObjetivo = await prisma.eventoObjetivo.findUnique({
      where: {
        eventoId_objetivoId: {
          eventoId: eventoId,
          objetivoId: objetivoId,
        },
      },
    });

    if (!eventoObjetivo) {
      return NextResponse.json(
        { porcentaje: 0 },
        { status: 200 }
      );
    }

    return NextResponse.json(eventoObjetivo);
  } catch (error) {
    console.error("Error fetching evento objetivo:", error);
    return NextResponse.json(
      { error: "Error al obtener información del objetivo" },
      { status: 500 }
    );
  }
}
