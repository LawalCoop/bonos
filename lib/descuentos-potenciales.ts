import { prisma } from "@/lib/prisma";
import { NIVELES } from "@/lib/constants";

interface DescuentoPotencial {
  nombre: string;
  porcentaje: number;
  requisito: string;
  progreso?: number;
}

export async function obtenerDescuentosPotenciales(
  userId: string
): Promise<DescuentoPotencial[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organizacion: true,
    },
  });

  if (!user) return [];

  const potenciales: DescuentoPotencial[] = [];

  // Obtener todas las reglas de descuento activas
  const reglasDescuento = await prisma.descuento.findMany({
    where: { activo: true },
    include: { organizacion: true },
    orderBy: { prioridad: "asc" },
  });

  // Calcular compras del mes
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const comprasEsteMes = await prisma.bono.count({
    where: {
      usuarioId: userId,
      estado: { in: ["PAGADO", "UTILIZADO"] },
      fechaCompra: { gte: inicioMes },
    },
  });

  for (const regla of reglasDescuento) {
    let esPotencial = false;
    let requisito = "";
    let progreso: number | undefined = undefined;

    switch (regla.tipo) {
      case "SOCIO":
        if (!user.esAsociado) {
          esPotencial = true;
          requisito = "Asociate a la biblioteca";
        }
        break;

      case "ORGANIZACION":
        if (
          regla.organizacionId &&
          user.organizacionId !== regla.organizacionId
        ) {
          esPotencial = true;
          const org = regla.organizacion;
          requisito = `Unite a ${org?.nombre || "la organización"}`;
        }
        break;

      case "NIVEL":
        if (regla.nivelMinimo && user.nivel < regla.nivelMinimo) {
          esPotencial = true;
          const nivelInfo = NIVELES[regla.nivelMinimo as keyof typeof NIVELES];
          requisito = `Alcanzá el nivel ${regla.nivelMinimo}: ${nivelInfo.nombre}`;

          // Calcular progreso (eventos vistos)
          const eventosVistos = await prisma.bono.count({
            where: {
              usuarioId: userId,
              estado: "UTILIZADO",
            },
          });

          const eventosNecesarios = nivelInfo.eventosMinimos;
          progreso = Math.min(
            (eventosVistos / eventosNecesarios) * 100,
            100
          );
        }
        break;

      case "VECES_VISTO_ARTISTA":
        if (regla.vecesVistoMinimo) {
          esPotencial = true;
          requisito = `Vení ${regla.vecesVistoMinimo} veces a ver al mismo artista`;
          // No podemos calcular progreso sin saber qué artista
        }
        break;

      case "MULTIPLES_COMPRAS_MES":
        if (
          regla.comprasMesMinimo &&
          comprasEsteMes < regla.comprasMesMinimo
        ) {
          esPotencial = true;
          requisito = `Comprá ${regla.comprasMesMinimo} bonos este mes`;
          progreso = Math.min(
            (comprasEsteMes / regla.comprasMesMinimo) * 100,
            100
          );
        }
        break;
    }

    if (esPotencial) {
      potenciales.push({
        nombre: regla.nombre,
        porcentaje: regla.porcentaje,
        requisito,
        progreso,
      });
    }
  }

  return potenciales;
}
