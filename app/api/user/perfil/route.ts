import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcularNivel, getNivelInfo, NIVELES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener datos completos del usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizacion: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            descuentoPorcentaje: true,
          },
        },
        bonos: {
          include: {
            evento: {
              select: {
                id: true,
                nombre: true,
                slug: true,
                fecha: true,
                imagenPrincipal: true,
              },
            },
          },
          orderBy: {
            fechaCompra: "desc",
          },
        },
        artistasVistos: {
          include: {
            artista: {
              select: {
                id: true,
                nombre: true,
                ciudad: true,
                provincia: true,
                pais: true,
                foto: true,
              },
            },
          },
          orderBy: {
            vecesVisto: "desc",
          },
          take: 10, // Top 10 artistas favoritos
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Calcular nivel actual
    const nivelActual = calcularNivel(user.puntos);
    const infoNivelActual = getNivelInfo(nivelActual);

    // Calcular siguiente nivel
    const siguienteNivel = nivelActual < 8 ? nivelActual + 1 : 8;
    const infoSiguienteNivel = getNivelInfo(siguienteNivel);

    // Calcular puntos necesarios para siguiente nivel
    const puntosParaSiguienteNivel =
      nivelActual < 8 ? infoSiguienteNivel.puntos - user.puntos : 0;

    // Calcular progreso al siguiente nivel (%)
    const puntosNivelActual = infoNivelActual.puntos;
    const puntosNivelSiguiente = infoSiguienteNivel.puntos;
    const progreso =
      nivelActual < 8
        ? ((user.puntos - puntosNivelActual) /
            (puntosNivelSiguiente - puntosNivelActual)) *
          100
        : 100;

    // Estadísticas de eventos
    const bonosUtilizados = user.bonos.filter(
      (b) => b.estado === "UTILIZADO"
    ).length;
    const bonosPagados = user.bonos.filter(
      (b) => b.estado === "PAGADO"
    ).length;
    const proximosEventos = user.bonos.filter(
      (b) =>
        (b.estado === "PAGADO" || b.estado === "UTILIZADO") &&
        new Date(b.evento.fecha) > new Date()
    );
    const eventosAsistidos = user.bonos.filter(
      (b) => b.estado === "UTILIZADO"
    );

    // Agrupar bonos por evento para próximos eventos
    const proximosEventosAgrupados = proximosEventos.reduce((acc: any, bono) => {
      const eventoId = bono.evento.id;
      if (!acc[eventoId]) {
        acc[eventoId] = {
          evento: bono.evento,
          bonos: [],
          cantidad: 0,
          totalGastado: 0,
        };
      }
      acc[eventoId].bonos.push(bono);
      acc[eventoId].cantidad += 1;
      acc[eventoId].totalGastado += bono.precioFinal;
      return acc;
    }, {});

    // Agrupar eventos asistidos por evento
    const eventosAsistidosAgrupados = eventosAsistidos.reduce((acc: any, bono) => {
      const eventoId = bono.evento.id;
      if (!acc[eventoId]) {
        acc[eventoId] = {
          evento: bono.evento,
          bonos: [],
          cantidad: 0,
          totalGastado: 0,
        };
      }
      acc[eventoId].bonos.push(bono);
      acc[eventoId].cantidad += 1;
      acc[eventoId].totalGastado += bono.precioFinal;
      return acc;
    }, {});

    // Respuesta
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        nombre: user.nombre,
        email: user.email,
        image: user.image,
        puntos: user.puntos,
        esAsociado: user.esAsociado,
        fechaAsociado: user.fechaAsociado,
        organizacionId: user.organizacionId,
        organizacion: user.organizacion,
        rol: user.rol,
      },
      nivel: {
        actual: nivelActual,
        nombre: infoNivelActual.nombre,
        icono: infoNivelActual.icono,
        descuento: infoNivelActual.descuento,
        siguiente: {
          nivel: siguienteNivel,
          nombre: infoSiguienteNivel.nombre,
          icono: infoSiguienteNivel.icono,
          descuento: infoSiguienteNivel.descuento,
        },
        puntosParaSiguienteNivel,
        progreso: Math.round(progreso),
      },
      estadisticas: {
        totalBonos: user.bonos.length,
        eventosAsistidos: bonosUtilizados,
        proximosEventos: proximosEventos.length,
        bonosPendientes: bonosPagados,
      },
      artistasFavoritos: user.artistasVistos.map((ua) => ({
        artista: ua.artista,
        vecesVisto: ua.vecesVisto,
      })),
      proximosEventos: Object.values(proximosEventosAgrupados).sort((a: any, b: any) =>
        new Date(a.evento.fecha).getTime() - new Date(b.evento.fecha).getTime()
      ),
      eventosAsistidos: Object.values(eventosAsistidosAgrupados).sort((a: any, b: any) =>
        new Date(b.evento.fecha).getTime() - new Date(a.evento.fecha).getTime()
      ),
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Error al obtener perfil" },
      { status: 500 }
    );
  }
}
