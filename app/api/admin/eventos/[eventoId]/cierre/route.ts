import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// POST - Finalizar evento y opcionalmente asignar al objetivo
export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  const { eventoId } = await params;
  try {
    logger.info("=== CIERRE DE EVENTO INICIADO ===", { eventoId: eventoId });

    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      logger.warn("Intento de acceso no autorizado a cierre de evento");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { asignarAObjetivo, montoBayer } = body;

    logger.info("Datos de cierre", { asignarAObjetivo, montoBayer });

    // Get event with objetivo
    const evento = await prisma.evento.findUnique({
      where: { id: eventoId },
      include: {
        objetivos: {
          include: {
            objetivo: true,
          },
        },
      },
    });

    if (!evento) {
      logger.warn("Evento no encontrado", { eventoId: eventoId });
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Check if already finalized
    if (evento.estado === "FINALIZADO") {
      logger.warn("Evento ya finalizado", { eventoId: eventoId });
      return NextResponse.json(
        { error: "Este evento ya fue finalizado" },
        { status: 400 }
      );
    }

    logger.info("Evento encontrado", { eventoNombre: evento.nombre, estado: evento.estado });

    // If asignar al objetivo and there's an active objetivo
    const eventoObjetivo = evento.objetivos[0];
    if (asignarAObjetivo && eventoObjetivo?.objetivo && eventoObjetivo.objetivo.activo) {
      logger.info("Asignando monto al objetivo", {
        objetivoId: eventoObjetivo.objetivoId,
        objetivoNombre: eventoObjetivo.objetivo.nombre,
        monto: montoBayer,
      });

      // Contar usuarios únicos del evento que compraron bonos
      const usuariosUnicos = await prisma.bono.findMany({
        where: {
          eventoId: eventoId,
          estado: {
            in: ["PAGADO", "UTILIZADO"],
          },
          usuarioId: {
            not: null,
          },
        },
        select: {
          usuarioId: true,
        },
        distinct: ["usuarioId"],
      });

      const cantidadPersonasEvento = usuariosUnicos.length;

      logger.info(`Contados ${cantidadPersonasEvento} usuarios únicos en el evento`);

      // Obtener usuarios que YA aportaron al objetivo (de otros eventos)
      const eventosFinalizadosDelObjetivo = await prisma.eventoObjetivo.findMany({
        where: {
          objetivoId: eventoObjetivo.objetivoId,
          evento: {
            estado: "FINALIZADO",
          },
        },
        include: {
          evento: {
            select: {
              bonos: {
                where: {
                  estado: {
                    in: ["PAGADO", "UTILIZADO"],
                  },
                  usuarioId: {
                    not: null,
                  },
                },
                select: {
                  usuarioId: true,
                },
              },
            },
          },
        },
      });

      // Obtener IDs de usuarios que ya aportaron en eventos finalizados
      const usuariosYaContados = new Set<string>();
      eventosFinalizadosDelObjetivo.forEach((eo) => {
        eo.evento.bonos.forEach((bono) => {
          if (bono.usuarioId) {
            usuariosYaContados.add(bono.usuarioId);
          }
        });
      });

      // Contar solo usuarios NUEVOS (que no estaban en eventos finalizados anteriores)
      const usuariosNuevos = usuariosUnicos.filter(
        (u) => u.usuarioId && !usuariosYaContados.has(u.usuarioId)
      ).length;

      logger.info(`${usuariosNuevos} usuarios nuevos aportaron al objetivo`);

      // Update objetivo montoActual y cantidadPersonas
      await prisma.objetivoAmpliacion.update({
        where: { id: eventoObjetivo.objetivoId },
        data: {
          montoActual: {
            increment: montoBayer,
          },
          cantidadPersonas: {
            increment: usuariosNuevos, // Solo sumar usuarios NUEVOS
          },
        },
      });

      // Update EventoObjetivo with the assigned amount and people count
      await prisma.eventoObjetivo.update({
        where: { id: eventoObjetivo.id },
        data: {
          montoAsignado: montoBayer,
          cantidadPersonas: cantidadPersonasEvento, // Total del evento (para registro)
        },
      });

      logger.info(`Objetivo ${eventoObjetivo.objetivo.nombre} actualizado: +$${montoBayer.toFixed(2)}, +${usuariosNuevos} personas`);
    } else if (asignarAObjetivo) {
      logger.warn("Se solicitó asignar al objetivo pero no hay objetivo activo", {
        eventoId: eventoId,
      });
    }

    // Mark event as FINALIZADO
    const eventoFinalizado = await prisma.evento.update({
      where: { id: eventoId },
      data: {
        estado: "FINALIZADO",
      },
    });

    logger.info("Evento marcado como FINALIZADO", {
      eventoId: eventoId,
      eventoNombre: eventoFinalizado.nombre,
    });

    return NextResponse.json({
      success: true,
      evento: eventoFinalizado,
      objetivoAsignado: asignarAObjetivo && !!eventoObjetivo,
      montoAsignado: asignarAObjetivo && eventoObjetivo ? montoBayer : 0,
    });
  } catch (error: any) {
    logger.error("Error en cierre de evento", {
      error: error.message,
      stack: error.stack,
      eventoId: eventoId,
    });
    return NextResponse.json(
      {
        error: "Error al finalizar evento",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
