import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// POST create artista
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      nombre,
      slug,
      bio,
      ciudad,
      provincia,
      pais,
      esLocal,
      foto,
      linkInstagram,
      linkSpotify,
      linkBandcamp,
      linkWeb,
      linkYoutube,
    } = body;

    // Validar campos requeridos
    if (!nombre || !slug || !bio || !ciudad || !pais) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el slug no exista
    const existingArtista = await prisma.artista.findUnique({
      where: { slug },
    });

    if (existingArtista) {
      return NextResponse.json(
        { error: "Ya existe un artista con ese slug" },
        { status: 400 }
      );
    }

    const artista = await prisma.artista.create({
      data: {
        nombre,
        slug,
        bio,
        ciudad,
        provincia: provincia || null,
        pais,
        esLocal: esLocal || false,
        foto: foto || null,
        linkInstagram: linkInstagram || null,
        linkSpotify: linkSpotify || null,
        linkBandcamp: linkBandcamp || null,
        linkWeb: linkWeb || null,
        linkYoutube: linkYoutube || null,
      },
    });

    return NextResponse.json(artista);
  } catch (error) {
    console.error("Error creating artista:", error);
    return NextResponse.json(
      { error: "Error al crear artista" },
      { status: 500 }
    );
  }
}
