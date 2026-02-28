import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

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

    // Obtener evento con todas las relaciones necesarias
    const evento = await prisma.evento.findUnique({
      where: { id: eventoId },
      include: {
        artistas: {
          include: {
            artista: true,
          },
          orderBy: { orden: "asc" },
        },
        bonos: {
          where: {
            estado: { in: ["PAGADO", "UTILIZADO"] },
          },
          select: {
            id: true,
            precioFinal: true,
            descuentosAplicados: true,
            estado: true,
            fechaCompra: true,
            usuario: {
              select: {
                name: true,
                email: true,
                nivel: true,
              },
            },
          },
        },
        ventasExternas: {
          orderBy: { createdAt: "desc" },
        },
        gastos: {
          orderBy: { createdAt: "asc" },
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

    // Calcular estadísticas de ventas externas
    const totalVentasExternas = evento.ventasExternas.reduce(
      (sum, venta) => sum + venta.cantidad,
      0
    );
    const recaudadoVentasExternas = evento.ventasExternas.reduce(
      (sum, venta) => sum + venta.precio * venta.cantidad,
      0
    );

    // Calcular estadísticas de ventas
    const totalBonos = evento.bonos.length;
    const totalRecaudadoBonos = evento.bonos.reduce(
      (sum, bono) => sum + bono.precioFinal,
      0
    );

    // Total de entradas (para capacidad)
    const totalEntradasVendidas = totalBonos + totalVentasExternas;

    // IMPORTANTE: Las ventas externas NO se incluyen en la distribución
    // El dinero de ventas externas ya lo tiene el artista/productor
    const totalRecaudadoParaDistribuir = totalRecaudadoBonos;
    const totalRecaudadoGeneral = totalRecaudadoBonos + recaudadoVentasExternas;

    // Calcular promedio de precio pagado (sobre todas las entradas)
    const precioPromedio = totalEntradasVendidas > 0 ? totalRecaudadoGeneral / totalEntradasVendidas : 0;

    // Analizar descuentos aplicados
    interface DescuentoStats {
      tipo: string;
      nombre: string;
      cantidad: number;
      totalDescuento: number;
      promedioDescuento: number;
    }

    const descuentosMap = new Map<string, DescuentoStats>();

    evento.bonos.forEach((bono) => {
      const descuentos = bono.descuentosAplicados as any;
      if (descuentos && Array.isArray(descuentos.descuentos)) {
        descuentos.descuentos.forEach((desc: any) => {
          const key = `${desc.tipo}-${desc.nombre}`;
          const existing = descuentosMap.get(key);

          if (existing) {
            existing.cantidad += 1;
            existing.totalDescuento += desc.monto;
            existing.promedioDescuento =
              existing.totalDescuento / existing.cantidad;
          } else {
            descuentosMap.set(key, {
              tipo: desc.tipo,
              nombre: desc.nombre,
              cantidad: 1,
              totalDescuento: desc.monto,
              promedioDescuento: desc.monto,
            });
          }
        });
      }
    });

    const descuentosStats = Array.from(descuentosMap.values());

    // Calcular distribución por precio
    interface PrecioStats {
      precio: number;
      cantidad: number;
      porcentaje: number;
      totalRecaudado: number;
    }

    const preciosMap = new Map<number, PrecioStats>();

    evento.bonos.forEach((bono) => {
      const precio = Math.round(bono.precioFinal);
      const existing = preciosMap.get(precio);

      if (existing) {
        existing.cantidad += 1;
        existing.totalRecaudado += bono.precioFinal;
      } else {
        preciosMap.set(precio, {
          precio,
          cantidad: 1,
          porcentaje: 0,
          totalRecaudado: bono.precioFinal,
        });
      }
    });

    // Agregar ventas externas a la distribución de precios
    evento.ventasExternas.forEach((venta) => {
      const precio = Math.round(venta.precio);
      const existing = preciosMap.get(precio);

      if (existing) {
        existing.cantidad += venta.cantidad;
        existing.totalRecaudado += venta.precio * venta.cantidad;
      } else {
        preciosMap.set(precio, {
          precio,
          cantidad: venta.cantidad,
          porcentaje: 0,
          totalRecaudado: venta.precio * venta.cantidad,
        });
      }
    });

    // Calcular porcentajes
    preciosMap.forEach((stats) => {
      stats.porcentaje = totalEntradasVendidas > 0 ? (stats.cantidad / totalEntradasVendidas) * 100 : 0;
    });

    const preciosStats = Array.from(preciosMap.values()).sort(
      (a, b) => b.precio - a.precio
    );

    // Calcular gastos
    const gastosTotal = evento.gastos.reduce(
      (sum, gasto) => sum + gasto.monto,
      0
    );

    const gastosCompartidos = evento.gastos.filter((g) => g.esCompartido);
    const gastosNoCompartidos = evento.gastos.filter((g) => !g.esCompartido);

    // Calcular cuánto de los gastos compartidos paga cada parte
    let gastosCompartidosArtista = 0;
    let gastosCompartidosBayer = 0;

    gastosCompartidos.forEach((gasto) => {
      const porcentajeArtista = gasto.porcentajeArtista || 50;
      const porcentajeBayer = gasto.porcentajeBayer || 50;

      gastosCompartidosArtista += (gasto.monto * porcentajeArtista) / 100;
      gastosCompartidosBayer += (gasto.monto * porcentajeBayer) / 100;
    });

    const gastosNoCompartidosTotal = gastosNoCompartidos.reduce(
      (sum, gasto) => sum + gasto.monto,
      0
    );

    // PASO 1: Calcular ingresos netos (después de gastos compartidos)
    // SOLO se distribuye el dinero de bonos vendidos por La Bayer
    const totalGastosCompartidos = gastosCompartidosArtista + gastosCompartidosBayer;
    const ingresosNetosAntesDistribucion = totalRecaudadoParaDistribuir - totalGastosCompartidos;

    // PASO 2: Distribución según porcentajes del evento
    const porcentajeArtista = evento.porcentajeArtista || 70;
    const porcentajeBayer = evento.porcentajeBayer || 30;

    const montoParaArtista = (ingresosNetosAntesDistribucion * porcentajeArtista) / 100;
    const montoParaBayer = (ingresosNetosAntesDistribucion * porcentajeBayer) / 100;

    // PASO 3: Ajustes finales
    // Artista: restar ventas externas (ya las cobró)
    const montoFinalArtista = montoParaArtista - recaudadoVentasExternas;

    // Bayer: restar gastos exclusivos
    const montoFinalBayer = montoParaBayer - gastosNoCompartidosTotal;

    // Get objetivo if exists
    const eventoObjetivo = evento.objetivos[0];
    const objetivo = eventoObjetivo?.objetivo ? {
      id: eventoObjetivo.objetivo.id,
      nombre: eventoObjetivo.objetivo.nombre,
      descripcion: eventoObjetivo.objetivo.descripcion,
      montoActual: eventoObjetivo.objetivo.montoActual,
      montoObjetivo: eventoObjetivo.objetivo.montoObjetivo,
      activo: eventoObjetivo.objetivo.activo,
    } : null;

    // Preparar respuesta del bordereau
    const bordereau = {
      evento: {
        id: evento.id,
        nombre: evento.nombre,
        fecha: evento.fecha,
        ubicacion: evento.ubicacion,
        capacidad: evento.capacidad,
        estado: evento.estado,
      },
      artistas: evento.artistas.map((ea) => ({
        nombre: ea.artista.nombre,
        rol: ea.rol,
      })),
      ventas: {
        totalBonos,
        totalVentasExternas,
        totalEntradas: totalEntradasVendidas,
        capacidad: evento.capacidad,
        porcentajeOcupacion: (totalEntradasVendidas / evento.capacidad) * 100,
        totalRecaudadoGeneral: totalRecaudadoGeneral,
        totalRecaudadoBonos: totalRecaudadoBonos,
        totalRecaudadoVentasExternas: recaudadoVentasExternas,
        precioBase: evento.precioBase,
        precioPromedio,
        precioEspecial: evento.precioEspecial,
        esFechaEspecial: evento.esFechaEspecial,
      },
      ventasExternas: evento.ventasExternas.map((venta) => ({
        id: venta.id,
        nombre: venta.nombre,
        apellido: venta.apellido,
        dni: venta.dni,
        precio: venta.precio,
        cantidad: venta.cantidad,
        vendidoPor: venta.vendidoPor,
        utilizado: venta.utilizado,
      })),
      distribucionPrecios: preciosStats,
      descuentos: {
        totalDescuentos: descuentosStats.reduce(
          (sum, d) => sum + d.totalDescuento,
          0
        ),
        detalles: descuentosStats,
      },
      gastos: {
        total: gastosTotal,
        compartidos: {
          total: gastosCompartidos.reduce((sum, g) => sum + g.monto, 0),
          artista: gastosCompartidosArtista,
          bayer: gastosCompartidosBayer,
          detalles: gastosCompartidos.map((g) => ({
            concepto: g.concepto,
            monto: g.monto,
            porcentajeArtista: g.porcentajeArtista,
            porcentajeBayer: g.porcentajeBayer,
            montoArtista: (g.monto * (g.porcentajeArtista || 50)) / 100,
            montoBayer: (g.monto * (g.porcentajeBayer || 50)) / 100,
            proveedor: g.proveedor,
            pagado: g.pagado,
          })),
        },
        noCompartidos: {
          total: gastosNoCompartidosTotal,
          detalles: gastosNoCompartidos.map((g) => ({
            concepto: g.concepto,
            monto: g.monto,
            descripcion: g.descripcion,
            proveedor: g.proveedor,
            pagado: g.pagado,
          })),
        },
      },
      distribucion: {
        porcentajes: {
          artista: porcentajeArtista,
          bayer: porcentajeBayer,
        },
        ingresosNetos: ingresosNetosAntesDistribucion,
        artista: {
          porcentajeIngresos: porcentajeArtista,
          montoIngresos: montoParaArtista,
          ventasExternasYaCobradas: recaudadoVentasExternas,
          montoFinal: montoFinalArtista,
        },
        bayer: {
          porcentajeIngresos: porcentajeBayer,
          montoIngresos: montoParaBayer,
          gastosExclusivos: gastosNoCompartidosTotal,
          montoFinal: montoFinalBayer,
        },
        gastosCompartidosTotal: totalGastosCompartidos,
      },
      objetivo,
      generadoEn: new Date().toISOString(),
    };

    return NextResponse.json(bordereau);
  } catch (error: any) {
    console.error("Error calculando bordereau:", error);
    return NextResponse.json(
      { error: "Error al calcular bordereau" },
      { status: 500 }
    );
  }
}
