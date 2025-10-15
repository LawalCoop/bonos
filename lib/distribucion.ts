import { prisma } from "@/lib/prisma";

export interface DistribucionDinero {
  montoArtista: number;
  montoBayer: number;
  montoObjetivo: number;
  porcentajeArtista: number;
  porcentajeBayer: number;
  porcentajeObjetivo: number;
  detalleGastos: {
    gastosArtista: number;
    gastosBayer: number;
    gastosCompartidos: {
      total: number;
      parteArtista: number;
      parteBayer: number;
    };
  };
}

/**
 * Calcula la distribución real del dinero de un bono basándose en los gastos del evento
 */
export async function calcularDistribucionReal(
  eventoId: string,
  montoBono: number
): Promise<DistribucionDinero> {
  // Obtener evento con gastos y objetivo
  const evento = await prisma.evento.findUnique({
    where: { id: eventoId },
    include: {
      gastos: true,
      objetivos: {
        include: {
          objetivo: true,
        },
      },
    },
  });

  if (!evento) {
    throw new Error("Evento no encontrado");
  }

  // Calcular gastos
  let gastosArtista = evento.costoArtistas || 0;
  let gastosBayer = 0;
  let gastosCompartidosTotal = 0;
  let gastosCompartidosArtista = 0;
  let gastosCompartidosBayer = 0;

  for (const gasto of evento.gastos) {
    if (gasto.esCompartido) {
      gastosCompartidosTotal += gasto.monto;
      const parteArtista = (gasto.monto * (gasto.porcentajeArtista || 50)) / 100;
      const parteBayer = (gasto.monto * (gasto.porcentajeBayer || 50)) / 100;
      gastosCompartidosArtista += parteArtista;
      gastosCompartidosBayer += parteBayer;
      gastosArtista += parteArtista;
      gastosBayer += parteBayer;
    } else {
      // Gasto 100% de La Bayer
      gastosBayer += gasto.monto;
    }
  }

  // Distribuir según porcentajes del evento
  const porcentajeArtista = evento.porcentajeArtista;
  const porcentajeBayer = evento.porcentajeBayer;

  const montoArtista = (montoBono * porcentajeArtista) / 100;
  const montoBayer = (montoBono * porcentajeBayer) / 100;

  // Si hay objetivo activo, TODO lo de La Bayer va al objetivo
  const eventoObjetivo = evento.objetivos[0];
  const tieneObjetivoActivo = eventoObjetivo?.objetivo?.activo;

  // El porcentaje del objetivo es el mismo que el de La Bayer (100% de su parte)
  const porcentajeObjetivo = tieneObjetivoActivo ? porcentajeBayer : 0;
  const montoObjetivo = tieneObjetivoActivo ? montoBayer : 0;

  console.log('DEBUG distribucion:', {
    eventoId,
    montoBono,
    porcentajeArtista,
    porcentajeBayer,
    montoArtista,
    montoBayer,
    tieneObjetivo: !!eventoObjetivo,
    objetivoActivo: tieneObjetivoActivo,
    porcentajeObjetivo,
    montoObjetivo
  });

  return {
    montoArtista,
    montoBayer,
    montoObjetivo,
    porcentajeArtista,
    porcentajeBayer,
    porcentajeObjetivo,
    detalleGastos: {
      gastosArtista,
      gastosBayer,
      gastosCompartidos: {
        total: gastosCompartidosTotal,
        parteArtista: gastosCompartidosArtista,
        parteBayer: gastosCompartidosBayer,
      },
    },
  };
}
