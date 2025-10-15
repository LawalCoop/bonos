import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { PUNTOS, calcularNivel } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { codigo, eventoId } = body;

    if (!codigo) {
      return NextResponse.json(
        { error: "Código de bono requerido" },
        { status: 400 }
      );
    }

    // Primero intentar buscar como venta externa (ID directo)
    const ventaExterna = await prisma.ventaExterna.findUnique({
      where: { id: codigo },
      include: {
        evento: true,
      },
    });

    // Si encontramos una venta externa, procesarla
    if (ventaExterna) {
      // Verificar que sea para el evento seleccionado
      if (eventoId && ventaExterna.eventoId !== eventoId) {
        return NextResponse.json({
          error: `Esta entrada es para "${ventaExterna.evento.nombre}", no para el evento seleccionado`,
          valid: false,
        });
      }

      // Verificar si ya fue utilizada
      if (ventaExterna.utilizado) {
        return NextResponse.json({
          error: "Esta entrada ya fue utilizada",
          valid: false,
          ventaExterna,
          fechaUtilizacion: ventaExterna.fechaUtilizacion,
        });
      }

      // Marcar como utilizada
      const ventaActualizada = await prisma.ventaExterna.update({
        where: { id: ventaExterna.id },
        data: {
          utilizado: true,
          fechaUtilizacion: new Date(),
        },
        include: {
          evento: true,
        },
      });

      return NextResponse.json({
        valid: true,
        message: "Entrada validada correctamente (Venta Externa)",
        tipo: "venta_externa",
        ventaExterna: ventaActualizada,
      });
    }

    // Si no es venta externa, buscar como bono (QR)
    const bono = await prisma.bono.findUnique({
      where: { codigo },
      include: {
        evento: true,
        usuario: {
          select: {
            id: true,
            name: true,
            nombre: true,
            email: true,
            nivel: true,
            puntos: true,
          },
        },
      },
    });

    if (!bono) {
      return NextResponse.json(
        { error: "Bono no encontrado", valid: false },
        { status: 404 }
      );
    }

    // Verificar estado
    if (bono.estado === "CANCELADO") {
      return NextResponse.json({
        error: "Este bono fue cancelado",
        valid: false,
        bono,
      });
    }

    if (bono.estado === "PENDIENTE") {
      return NextResponse.json({
        error: "Pago pendiente - bono no válido",
        valid: false,
        bono,
      });
    }

    if (bono.estado === "UTILIZADO") {
      return NextResponse.json({
        error: "Este bono ya fue utilizado",
        valid: false,
        bono,
        fechaUtilizacion: bono.fechaUtilizacion,
      });
    }

    // Verificar que el bono sea para el evento seleccionado
    if (eventoId && bono.eventoId !== eventoId) {
      return NextResponse.json({
        error: `Este bono es para "${bono.evento.nombre}", no para el evento seleccionado`,
        valid: false,
        bono,
      });
    }

    // Marcar como utilizado
    const bonoActualizado = await prisma.bono.update({
      where: { id: bono.id },
      data: {
        estado: "UTILIZADO",
        fechaUtilizacion: new Date(),
      },
      include: {
        evento: true,
        usuario: {
          select: {
            id: true,
            name: true,
            nombre: true,
            email: true,
            nivel: true,
            puntos: true,
          },
        },
      },
    });

    // Otorgar puntos al usuario por asistir al evento
    if (bono.usuarioId) {
      const puntosGanados = PUNTOS.ASISTIR_EVENTO;

      // Obtener puntos actuales del usuario
      const usuario = await prisma.user.findUnique({
        where: { id: bono.usuarioId },
        select: { puntos: true, nivel: true },
      });

      if (usuario) {
        const nuevosPuntos = usuario.puntos + puntosGanados;
        const nivelAnterior = usuario.nivel;
        const nuevoNivel = calcularNivel(nuevosPuntos);

        await prisma.user.update({
          where: { id: bono.usuarioId },
          data: {
            puntos: nuevosPuntos,
            nivel: nuevoNivel,
          },
        });

        // Si subió de nivel, podríamos enviar un email de felicitaciones
        if (nuevoNivel > nivelAnterior) {
          console.log(`Usuario ${bono.usuarioId} subió de nivel ${nivelAnterior} a ${nuevoNivel}`);
          // TODO: Enviar email de felicitaciones por subir de nivel
        }
      }
    }

    return NextResponse.json({
      valid: true,
      message: "Bono validado correctamente",
      tipo: "bono",
      bono: bonoActualizado,
    });
  } catch (error) {
    console.error("Error validando bono:", error);
    return NextResponse.json(
      { error: "Error al validar bono", valid: false },
      { status: 500 }
    );
  }
}
