import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { eventoId: string; objetivoId: string } }
) {
  try {
    const eventoObjetivo = await prisma.eventoObjetivo.findUnique({
      where: {
        eventoId_objetivoId: {
          eventoId: params.eventoId,
          objetivoId: params.objetivoId,
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
