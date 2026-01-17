import { prisma } from "@/lib/prisma";
import { getNivelesFromDB } from "@/lib/niveles";

export interface DescuentoAplicado {
  tipo: string;
  nombre: string;
  porcentaje: number;
  monto: number;
}

export interface CalculoDescuentos {
  precioBase: number;
  descuentos: DescuentoAplicado[];
  totalDescuento: number;
  precioFinal: number;
}

export async function calcularDescuentos(
  eventoId: string,
  userId?: string,
  cantidadBonos: number = 1,
  codigoPromocion?: string
): Promise<CalculoDescuentos> {
  // Obtener precio base del evento
  const evento = await prisma.evento.findUnique({
    where: { id: eventoId },
  });

  if (!evento) {
    throw new Error("Evento no encontrado");
  }

  const precioBase =
    evento.esFechaEspecial && evento.precioEspecial
      ? evento.precioEspecial
      : evento.precioBase;

  const descuentos: DescuentoAplicado[] = [];
  let totalDescuentoPorcentaje = 0;
  let precioFinal = precioBase * cantidadBonos;

  // Obtener promociones activas
  const now = new Date();
  const promociones = await prisma.promocion.findMany({
    where: {
      activo: true,
      fechaInicio: { lte: now },
      fechaFin: { gte: now },
      OR: [
        { eventoId: eventoId },
        { eventoId: null }, // Promociones globales
      ],
    },
    orderBy: { prioridad: "desc" },
  });

  // Filtrar promociones según código y auth
  let promocionAplicable = null;
  for (const promo of promociones) {
    // Si tiene código, debe coincidir
    if (promo.codigo && promo.codigo !== codigoPromocion) {
      continue;
    }

    // Si requiere auth, debe haber usuario
    if (promo.requiereAuth && !userId) {
      continue;
    }

    // Si no tiene código, aplicar automáticamente
    if (!promo.codigo) {
      promocionAplicable = promo;
      break;
    }

    // Si tiene código y coincide
    if (promo.codigo === codigoPromocion) {
      promocionAplicable = promo;
      break;
    }
  }

  // Calcular descuento equivalente de la promoción
  let promocionDescuentoPorcentaje = 0;
  let promocionDescuentoMonto = 0;
  let promocionPrecioFinal = precioBase * cantidadBonos;

  if (promocionAplicable) {
    if (promocionAplicable.tipo === "2x1" && cantidadBonos >= 2) {
      const cantidadAPagar = Math.ceil(cantidadBonos / 2);
      promocionDescuentoMonto = precioBase * (cantidadBonos - cantidadAPagar);
      promocionPrecioFinal = precioBase * cantidadAPagar;
      promocionDescuentoPorcentaje = 50; // 2x1 equivale a 50% de descuento
    } else if (promocionAplicable.tipo === "PORCENTAJE") {
      promocionDescuentoMonto = (promocionPrecioFinal * promocionAplicable.valor) / 100;
      promocionPrecioFinal -= promocionDescuentoMonto;
      promocionDescuentoPorcentaje = promocionAplicable.valor;
    } else if (promocionAplicable.tipo === "MONTO_FIJO") {
      promocionDescuentoMonto = promocionAplicable.valor;
      promocionPrecioFinal -= promocionDescuentoMonto;
      promocionDescuentoPorcentaje = (promocionAplicable.valor / precioBase) * 100;
    }
  }

  // Si no hay usuario, devolver solo con promociones
  if (!userId) {
    if (promocionAplicable) {
      const tipoPromo = promocionAplicable.tipo === "2x1"
        ? "PROMOCION_2X1"
        : promocionAplicable.tipo === "PORCENTAJE"
        ? "PROMOCION_PORCENTAJE"
        : "PROMOCION_MONTO_FIJO";

      return {
        precioBase,
        descuentos: [{
          tipo: tipoPromo,
          nombre: promocionAplicable.nombre,
          porcentaje: promocionDescuentoPorcentaje,
          monto: promocionDescuentoMonto,
        }],
        totalDescuento: promocionDescuentoMonto,
        precioFinal: Math.max(promocionPrecioFinal, 0),
      };
    }

    return {
      precioBase,
      descuentos: [],
      totalDescuento: 0,
      precioFinal: precioBase * cantidadBonos,
    };
  }

  // Obtener datos del usuario
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organizacion: true,
      artistasVistos: {
        include: {
          artista: {
            include: {
              eventos: {
                where: { eventoId },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  // Obtener todas las reglas de descuento activas, ordenadas por prioridad
  const reglasDescuento = await prisma.descuento.findMany({
    where: {
      activo: true,
    },
    include: {
      organizacion: true,
    },
    orderBy: {
      prioridad: "asc",
    },
  });

  // Calcular compras del mes (para regla MULTIPLES_COMPRAS_MES)
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const comprasEsteMes = await prisma.bono.count({
    where: {
      usuarioId: userId,
      estado: { in: ["PAGADO", "UTILIZADO"] },
      fechaCompra: {
        gte: inicioMes,
      },
    },
  });

  // Para NIVEL: solo aplicar el descuento del nivel exacto del usuario
  let nivelAplicado = false;

  // Separar descuentos en acumulables y no acumulables
  const descuentosAcumulables: DescuentoAplicado[] = [];
  const descuentosNoAcumulables: DescuentoAplicado[] = [];

  // Obtener niveles de la base de datos
  const niveles = await getNivelesFromDB();

  // Procesar cada regla de descuento
  for (const regla of reglasDescuento) {
    let aplica = false;
    let nombreDescuento = regla.nombre;

    switch (regla.tipo) {
      case "SOCIO":
        // Descuento por ser socio/asociado
        aplica = user.esAsociado;
        break;

      case "ORGANIZACION":
        // Descuento por pertenecer a una organización específica
        if (regla.organizacionId && user.organizacionId) {
          aplica = user.organizacionId === regla.organizacionId;
          if (aplica && regla.organizacion) {
            nombreDescuento = `${regla.organizacion.nombre}`;
          }
        }
        break;

      case "NIVEL":
        // Descuento por nivel: solo aplicar el descuento del nivel exacto del usuario
        // (no todos los niveles anteriores)
        if (regla.nivelMinimo && !nivelAplicado) {
          aplica = user.nivel === regla.nivelMinimo;
          if (aplica) {
            const nivelInfo = niveles[user.nivel] || { nombre: `Nivel ${user.nivel}` };
            nombreDescuento = `Nivel ${user.nivel}: ${nivelInfo.nombre}`;
            nivelAplicado = true; // Marcar que ya aplicamos un descuento de nivel
          }
        }
        break;

      case "VECES_VISTO_ARTISTA":
        // Descuento por haber visto artistas del evento
        if (regla.vecesVistoMinimo) {
          const artistasDelEvento = user.artistasVistos.filter(
            (ua) => ua.artista.eventos.length > 0
          );

          for (const usuarioArtista of artistasDelEvento) {
            if (usuarioArtista.vecesVisto >= regla.vecesVistoMinimo) {
              aplica = true;
              nombreDescuento = `Fan de ${usuarioArtista.artista.nombre} (${usuarioArtista.vecesVisto}x)`;
              break; // Solo aplicar una vez por regla
            }
          }
        }
        break;

      case "MULTIPLES_COMPRAS_MES":
        // Descuento por múltiples compras en el mes
        if (regla.comprasMesMinimo) {
          aplica = comprasEsteMes >= regla.comprasMesMinimo;
          if (aplica) {
            nombreDescuento = `Múltiples compras este mes (${comprasEsteMes})`;
          }
        }
        break;

      default:
        console.warn(`Tipo de descuento desconocido: ${regla.tipo}`);
        break;
    }

    // Si la regla aplica, agregar al grupo correspondiente
    if (aplica) {
      const porcentaje = regla.porcentaje;
      const monto = (precioBase * porcentaje) / 100;

      const descuento: DescuentoAplicado = {
        tipo: regla.tipo,
        nombre: nombreDescuento,
        porcentaje,
        monto,
      };

      if (regla.esAcumulable) {
        descuentosAcumulables.push(descuento);
      } else {
        descuentosNoAcumulables.push(descuento);
      }
    }
  }

  // Lógica de aplicación de descuentos
  if (descuentosNoAcumulables.length > 0) {
    // Si hay descuentos no acumulables, elegir el de mayor porcentaje
    console.log('Descuentos no acumulables encontrados:', descuentosNoAcumulables);
    const mejorDescuento = descuentosNoAcumulables.reduce((mejor, actual) =>
      actual.porcentaje > mejor.porcentaje ? actual : mejor
    );
    console.log('Mejor descuento seleccionado:', mejorDescuento);
    descuentos.push(mejorDescuento);
    totalDescuentoPorcentaje = mejorDescuento.porcentaje;
  } else if (descuentosAcumulables.length > 0) {
    // Si solo hay acumulables, sumarlos todos
    descuentos.push(...descuentosAcumulables);
    totalDescuentoPorcentaje = descuentosAcumulables.reduce((sum, d) => sum + d.porcentaje, 0);
  }

  console.log('Descuentos finales aplicados:', descuentos);
  console.log('Total descuento porcentaje:', totalDescuentoPorcentaje);

  // Comparar promoción vs descuentos del usuario
  // Limitamos el descuento total del usuario a 50% máximo
  const descuentoUsuarioFinal = Math.min(totalDescuentoPorcentaje, 50);

  // Determinar cuál es mejor
  if (promocionAplicable && promocionDescuentoPorcentaje > descuentoUsuarioFinal) {
    // La promoción es mejor, usar solo la promoción
    const tipoPromo = promocionAplicable.tipo === "2x1"
      ? "PROMOCION_2X1"
      : promocionAplicable.tipo === "PORCENTAJE"
      ? "PROMOCION_PORCENTAJE"
      : "PROMOCION_MONTO_FIJO";

    return {
      precioBase,
      descuentos: [{
        tipo: tipoPromo,
        nombre: promocionAplicable.nombre,
        porcentaje: promocionDescuentoPorcentaje,
        monto: promocionDescuentoMonto,
      }],
      totalDescuento: promocionDescuentoMonto,
      precioFinal: Math.max(promocionPrecioFinal, 0),
    };
  } else if (descuentoUsuarioFinal > 0) {
    // Los descuentos del usuario son mejores, usar solo esos
    const precioBaseTotal = precioBase * cantidadBonos;
    const descuentoUsuarioMonto = (precioBaseTotal * descuentoUsuarioFinal) / 100;
    const precioFinalUsuario = precioBaseTotal - descuentoUsuarioMonto;

    return {
      precioBase,
      descuentos,
      totalDescuento: descuentoUsuarioMonto,
      precioFinal: Math.max(precioFinalUsuario, 0),
    };
  } else if (promocionAplicable) {
    // No hay descuentos de usuario, solo promoción
    const tipoPromo = promocionAplicable.tipo === "2x1"
      ? "PROMOCION_2X1"
      : promocionAplicable.tipo === "PORCENTAJE"
      ? "PROMOCION_PORCENTAJE"
      : "PROMOCION_MONTO_FIJO";

    return {
      precioBase,
      descuentos: [{
        tipo: tipoPromo,
        nombre: promocionAplicable.nombre,
        porcentaje: promocionDescuentoPorcentaje,
        monto: promocionDescuentoMonto,
      }],
      totalDescuento: promocionDescuentoMonto,
      precioFinal: Math.max(promocionPrecioFinal, 0),
    };
  } else {
    // No hay ni promoción ni descuentos
    return {
      precioBase,
      descuentos: [],
      totalDescuento: 0,
      precioFinal: precioBase * cantidadBonos,
    };
  }
}
