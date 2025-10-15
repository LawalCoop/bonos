import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, nombre, esAsociado, organizacionId } = body;

    // Validar campos
    if (name === undefined && nombre === undefined && esAsociado === undefined && organizacionId === undefined) {
      return NextResponse.json(
        { error: "Debes proporcionar al menos un campo para actualizar" },
        { status: 400 }
      );
    }

    // Preparar datos para actualizar
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (nombre !== undefined) updateData.nombre = nombre;
    if (esAsociado !== undefined) {
      updateData.esAsociado = esAsociado;
      // Si se está marcando como asociado, registrar la fecha
      if (esAsociado && !session.user.esAsociado) {
        updateData.fechaAsociado = new Date();
      }
      // Si se está desmarcando, limpiar la fecha
      if (!esAsociado) {
        updateData.fechaAsociado = null;
      }
    }

    // Si organizacionId es null o una cadena vacía, desvincularlo
    if (organizacionId !== undefined) {
      if (organizacionId === null || organizacionId === "") {
        updateData.organizacionId = null;
      } else {
        // Validar que la organización existe y está activa
        const org = await prisma.organizacion.findFirst({
          where: { id: organizacionId, activo: true },
        });

        if (!org) {
          return NextResponse.json(
            { error: "Organización no válida" },
            { status: 400 }
          );
        }

        updateData.organizacionId = organizacionId;
      }
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        name: true,
        nombre: true,
        email: true,
        image: true,
        puntos: true,
        nivel: true,
        esAsociado: true,
        fechaAsociado: true,
        organizacionId: true,
        organizacion: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            descuentoPorcentaje: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}
