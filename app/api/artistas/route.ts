import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      // Obtener un artista específico por slug
      const artista = await prisma.artista.findUnique({
        where: { slug },
        include: {
          eventos: {
            include: {
              evento: {
                select: {
                  id: true,
                  nombre: true,
                  slug: true,
                  fecha: true,
                  ubicacion: true,
                  estado: true,
                },
              },
            },
            orderBy: {
              evento: {
                fecha: "desc",
              },
            },
          },
          _count: {
            select: {
              seguidores: true,
            },
          },
        },
      });

      if (!artista) {
        return NextResponse.json(
          { error: "Artista no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(artista);
    }

    // Obtener todos los artistas
    const artistas = await prisma.artista.findMany({
      orderBy: {
        nombre: "asc",
      },
      include: {
        _count: {
          select: {
            eventos: true,
            seguidores: true,
          },
        },
      },
    });

    return NextResponse.json(artistas);
  } catch (error: any) {
    console.error("Error obteniendo artistas:", error);
    return NextResponse.json(
      { error: "Error al obtener artistas" },
      { status: 500 }
    );
  }
}
