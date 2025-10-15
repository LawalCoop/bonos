import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// GET all eventos (admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const eventos = await prisma.evento.findMany({
      orderBy: {
        fecha: "desc",
      },
      include: {
        artistas: {
          include: {
            artista: true,
          },
        },
        _count: {
          select: {
            bonos: true,
          },
        },
      },
    });

    return NextResponse.json(eventos);
  } catch (error) {
    console.error("Error fetching eventos:", error);
    return NextResponse.json(
      { error: "Error al obtener eventos" },
      { status: 500 }
    );
  }
}

// POST create evento
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      nombre,
      slug,
      descripcion,
      fecha,
      horaInicio,
      ubicacion,
      capacidad,
      precioBase,
      porcentajeArtista,
      porcentajeBayer,
      imagenPrincipal,
      videoYoutubeId,
      artistas,
      objetivoId,
    } = body;

    // Validar campos requeridos
    if (
      !nombre ||
      !slug ||
      !descripcion ||
      !fecha ||
      !horaInicio ||
      !ubicacion ||
      !precioBase ||
      !imagenPrincipal
    ) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el slug no exista
    const existingEvento = await prisma.evento.findUnique({
      where: { slug },
    });

    if (existingEvento) {
      return NextResponse.json(
        { error: "Ya existe un evento con ese slug" },
        { status: 400 }
      );
    }

    const evento = await prisma.evento.create({
      data: {
        nombre,
        slug,
        descripcion,
        fecha: new Date(fecha),
        horaInicio,
        ubicacion,
        capacidad: parseInt(capacidad),
        precioBase: parseFloat(precioBase),
        porcentajeArtista: porcentajeArtista ? parseFloat(porcentajeArtista) : 70,
        porcentajeBayer: porcentajeBayer ? parseFloat(porcentajeBayer) : 30,
        imagenPrincipal,
        videoYoutubeId: videoYoutubeId || null,
        galeria: [],
        estado: "PROGRAMADO",
        artistas: artistas?.length
          ? {
              create: artistas.map((a: any) => ({
                artistaId: a.artistaId,
                orden: a.orden,
                rol: a.rol,
              })),
            }
          : undefined,
        objetivos: objetivoId
          ? {
              create: {
                objetivoId: objetivoId,
              },
            }
          : undefined,
      },
    });

    return NextResponse.json(evento);
  } catch (error) {
    console.error("Error creating evento:", error);
    return NextResponse.json(
      { error: "Error al crear evento" },
      { status: 500 }
    );
  }
}
