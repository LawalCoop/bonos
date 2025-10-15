import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // Marcar como ruta dinámica

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const estado = searchParams.get("estado") || "PROGRAMADO";
    const limit = parseInt(searchParams.get("limit") || "10");

    // Si se proporciona slug, buscar por slug
    if (slug) {
      const evento = await prisma.evento.findUnique({
        where: { slug },
        include: {
          artistas: {
            include: {
              artista: true,
            },
            orderBy: {
              orden: "asc",
            },
          },
        },
      });
      return NextResponse.json(evento ? [evento] : []);
    }

    // Sino, listar eventos
    const eventos = await prisma.evento.findMany({
      where: {
        estado,
        fecha: {
          gte: new Date(), // Solo eventos futuros
        },
      },
      include: {
        artistas: {
          include: {
            artista: true,
          },
          orderBy: {
            orden: "asc",
          },
        },
      },
      orderBy: {
        fecha: "asc",
      },
      take: limit,
    });

    return NextResponse.json(eventos);
  } catch (error) {
    console.error("Error fetching eventos:", error);
    return NextResponse.json(
      { error: "Error al cargar eventos" },
      { status: 500 }
    );
  }
}
