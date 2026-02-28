import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// GET single evento
export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  try {
    const { eventoId } = await params;
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const evento = await prisma.evento.findUnique({
      where: { id: eventoId },
      include: {
        artistas: {
          include: {
            artista: true,
          },
        },
        objetivos: {
          include: {
            objetivo: true,
          },
        },
      },
    });

    if (!evento) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(evento);
  } catch (error) {
    console.error("Error fetching evento:", error);
    return NextResponse.json(
      { error: "Error al obtener evento" },
      { status: 500 }
    );
  }
}

// PUT update evento
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  try {
    const { eventoId } = await params;
    const session = await auth();

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
      estado,
      artistas,
      objetivoId,
      mensajeBonos,
    } = body;

    console.log("PUT /api/admin/eventos/[eventoId] - Artistas recibidos:", artistas);

    // Verificar que el evento existe
    const existingEvento = await prisma.evento.findUnique({
      where: { id: eventoId },
    });

    if (!existingEvento) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Si se cambió el slug, verificar que no exista
    if (slug !== existingEvento.slug) {
      const slugExists = await prisma.evento.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "Ya existe un evento con ese slug" },
          { status: 400 }
        );
      }
    }

    // Si se enviaron artistas, primero eliminar los existentes y crear los nuevos
    if (artistas !== undefined) {
      console.log("Eliminando artistas existentes del evento:", eventoId);
      await prisma.eventoArtista.deleteMany({
        where: { eventoId: eventoId },
      });

      if (artistas.length > 0) {
        console.log("Creando nuevos artistas:", artistas);
        await prisma.eventoArtista.createMany({
          data: artistas.map((a: any) => ({
            eventoId: eventoId,
            artistaId: a.artistaId,
            orden: a.orden,
            rol: a.rol,
          })),
        });
        console.log("Artistas creados exitosamente");
      }
    }

    // Manejar actualización del objetivo
    if (objetivoId !== undefined) {
      // Primero eliminar objetivo existente (si hay)
      await prisma.eventoObjetivo.deleteMany({
        where: { eventoId: eventoId },
      });

      // Si hay un objetivoId nuevo, crear la relación
      if (objetivoId) {
        await prisma.eventoObjetivo.create({
          data: {
            eventoId: eventoId,
            objetivoId: objetivoId,
          },
        });
        console.log("Objetivo asignado al evento:", objetivoId);
      }
    }

    // Crear fecha con la hora del evento para evitar problemas de timezone
    const fechaConHora = new Date(`${fecha}T${horaInicio}:00`);

    const evento = await prisma.evento.update({
      where: { id: eventoId },
      data: {
        nombre,
        slug,
        descripcion,
        fecha: fechaConHora,
        horaInicio,
        ubicacion,
        capacidad: parseInt(capacidad),
        precioBase: parseFloat(precioBase),
        porcentajeArtista: porcentajeArtista !== undefined ? parseFloat(porcentajeArtista) : undefined,
        porcentajeBayer: porcentajeBayer !== undefined ? parseFloat(porcentajeBayer) : undefined,
        imagenPrincipal,
        videoYoutubeId: videoYoutubeId || null,
        mensajeBonos: mensajeBonos !== undefined ? (mensajeBonos || null) : undefined,
        estado: estado || existingEvento.estado,
      },
      include: {
        artistas: {
          include: {
            artista: true,
          },
        },
      },
    });

    console.log("Evento actualizado con artistas:", evento.artistas.length);
    return NextResponse.json(evento);
  } catch (error) {
    console.error("Error updating evento:", error);
    return NextResponse.json(
      { error: "Error al actualizar evento" },
      { status: 500 }
    );
  }
}

// DELETE evento
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  try {
    const { eventoId } = await params;
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el evento existe
    const evento = await prisma.evento.findUnique({
      where: { id: eventoId },
      include: {
        _count: {
          select: {
            bonos: true,
          },
        },
      },
    });

    if (!evento) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Si tiene bonos vendidos, solo cambiar estado a CANCELADO
    if (evento._count.bonos > 0) {
      const updated = await prisma.evento.update({
        where: { id: eventoId },
        data: {
          estado: "CANCELADO",
        },
      });

      return NextResponse.json({
        message: "Evento cancelado (tiene bonos vendidos)",
        evento: updated,
      });
    }

    // Si no tiene bonos, eliminar
    await prisma.evento.delete({
      where: { id: eventoId },
    });

    return NextResponse.json({ message: "Evento eliminado" });
  } catch (error) {
    console.error("Error deleting evento:", error);
    return NextResponse.json(
      { error: "Error al eliminar evento" },
      { status: 500 }
    );
  }
}
