import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// PUT update artista
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ artistaId: string }> }
) {
  try {
    const { artistaId } = await params;
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

    // Verificar que el artista existe
    const existingArtista = await prisma.artista.findUnique({
      where: { id: artistaId },
    });

    if (!existingArtista) {
      return NextResponse.json(
        { error: "Artista no encontrado" },
        { status: 404 }
      );
    }

    // Si se cambió el slug, verificar que no exista
    if (slug !== existingArtista.slug) {
      const slugExists = await prisma.artista.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "Ya existe un artista con ese slug" },
          { status: 400 }
        );
      }
    }

    const artista = await prisma.artista.update({
      where: { id: artistaId },
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
    console.error("Error updating artista:", error);
    return NextResponse.json(
      { error: "Error al actualizar artista" },
      { status: 500 }
    );
  }
}

// DELETE artista
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ artistaId: string }> }
) {
  try {
    const { artistaId } = await params;
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el artista existe
    const artista = await prisma.artista.findUnique({
      where: { id: artistaId },
      include: {
        _count: {
          select: {
            eventos: true,
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

    // No permitir eliminar si tiene eventos asociados
    if (artista._count.eventos > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un artista con eventos asociados" },
        { status: 400 }
      );
    }

    await prisma.artista.delete({
      where: { id: artistaId },
    });

    return NextResponse.json({ message: "Artista eliminado" });
  } catch (error) {
    console.error("Error deleting artista:", error);
    return NextResponse.json(
      { error: "Error al eliminar artista" },
      { status: 500 }
    );
  }
}
