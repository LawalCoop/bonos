import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, TrendingUp, Users, Target, DollarSign, Award } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { calcularDistribucionReal } from "@/lib/distribucion";
import { NIVELES, calcularNivel } from "@/lib/constants";

export default async function PagoExitoPage({
  searchParams,
}: {
  searchParams: { payment_id?: string; external_reference?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  // Obtener el último pago del usuario
  const ultimoPago = await prisma.pago.findFirst({
    where: {
      usuarioId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      bonos: {
        include: {
          evento: {
            include: {
              objetivos: {
                include: {
                  objetivo: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!ultimoPago || ultimoPago.bonos.length === 0) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center space-y-6">
              <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto" />
              <div>
                <h1 className="text-3xl font-bold mb-2">¡Pago exitoso!</h1>
                <p className="text-lg text-muted-foreground">
                  Tu compra fue procesada correctamente
                </p>
              </div>
              <div className="space-y-2">
                <Button asChild className="w-full" size="lg">
                  <Link href="/mis-bonos">Ver mis bonos</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">Volver al inicio</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const bono = ultimoPago.bonos[0];
  const evento = bono.evento;
  const cantidadBonos = ultimoPago.bonos.length;
  const montoTotal = ultimoPago.monto;

  // Calcular distribución real basada en gastos
  const distribucion = await calcularDistribucionReal(evento.id, montoTotal);
  const eventoObjetivo = evento.objetivos[0];

  console.log('DEBUG página éxito:', {
    eventoId: evento.id,
    tieneObjetivos: evento.objetivos.length,
    eventoObjetivo: eventoObjetivo ? {
      id: eventoObjetivo.id,
      objetivo: eventoObjetivo.objetivo ? {
        id: eventoObjetivo.objetivo.id,
        nombre: eventoObjetivo.objetivo.nombre,
        activo: eventoObjetivo.objetivo.activo,
        montoActual: eventoObjetivo.objetivo.montoActual,
        montoObjetivo: eventoObjetivo.objetivo.montoObjetivo
      } : null
    } : null,
    distribucion: {
      porcentajeObjetivo: distribucion.porcentajeObjetivo,
      montoObjetivo: distribucion.montoObjetivo
    }
  });

  // Obtener información del usuario actualizada (con puntos)
  const usuario = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { puntos: true, nivel: true },
  });

  // Calcular puntos ganados en esta compra (100 por bono)
  const puntosGanados = cantidadBonos * 100;

  // Calcular información de nivel
  const nivelActual = usuario?.nivel || 1;
  const puntosActuales = usuario?.puntos || 0;
  const nivelInfo = NIVELES[nivelActual as keyof typeof NIVELES];
  const siguienteNivel = nivelActual < 8 ? nivelActual + 1 : null;
  const siguienteNivelInfo = siguienteNivel ? NIVELES[siguienteNivel as keyof typeof NIVELES] : null;
  const puntosFaltantes = siguienteNivelInfo ? siguienteNivelInfo.puntos - puntosActuales : 0;
  const porcentajeProgreso = siguienteNivelInfo
    ? ((puntosActuales - nivelInfo.puntos) / (siguienteNivelInfo.puntos - nivelInfo.puntos)) * 100
    : 100;

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-12 text-center space-y-6">
            <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto" />
            <div>
              <h1 className="text-3xl font-bold mb-2">¡Pago exitoso!</h1>
              <p className="text-lg text-muted-foreground">
                Tu compra fue procesada correctamente
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <p className="text-sm text-green-900 dark:text-green-100">
                Vas a recibir {cantidadBonos} bono{cantidadBonos > 1 ? "s" : ""} por email en los próximos minutos.
                Revisá tu bandeja de entrada y spam.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Points and Level Progress */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Award className="h-8 w-8 text-yellow-500" />
              <h2 className="text-2xl font-bold">
                ¡Ganaste {puntosGanados} puntos!
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Nivel actual</p>
                  <p className="text-2xl font-bold">
                    {nivelInfo.icono} {nivelInfo.nombre}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {puntosActuales} puntos totales
                  </p>
                </div>
                {nivelInfo.descuento > 0 && (
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {nivelInfo.descuento}%
                    </p>
                    <p className="text-sm text-muted-foreground">descuento</p>
                  </div>
                )}
              </div>

              {siguienteNivelInfo && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      Progreso al siguiente nivel: {siguienteNivelInfo.icono} {siguienteNivelInfo.nombre}
                    </span>
                    <span className="text-muted-foreground">
                      Faltan {puntosFaltantes} puntos
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(porcentajeProgreso, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Al alcanzar el nivel {siguienteNivel}, desbloquearás un descuento del{" "}
                    <strong>{siguienteNivelInfo.descuento}%</strong> en tus futuras compras
                  </p>
                </div>
              )}

              {nivelActual === 8 && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg text-center">
                  <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                    🎉 ¡Alcanzaste el nivel máximo!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Disfrutá de tu descuento del {nivelInfo.descuento}% en todas tus compras
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
              ¿A dónde va tu aporte?
            </h2>
            <div className="space-y-6">
              {/* 1. Artistas */}
              <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">Artistas</h3>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      ${distribucion.montoArtista.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {distribucion.porcentajeArtista}% de tu compra va directamente a les artistas que participan del evento
                  </p>
                </div>
              </div>

              {/* 2. La Bayer / Biblioteca */}
              <div className="flex items-start gap-4 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <DollarSign className="h-8 w-8 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">La Bayer</h3>
                    <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      ${distribucion.montoBayer.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {distribucion.porcentajeBayer}% se destina a gastos operativos del evento (sonido, luces, limpieza, etc)
                  </p>
                </div>
              </div>

              {/* 3. Objetivo (solo si hay objetivo activo) */}
              {distribucion.porcentajeObjetivo > 0 && eventoObjetivo?.objetivo && (
                <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                  <Target className="h-8 w-8 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{eventoObjetivo.objetivo.nombre}</h3>
                      <div className="text-right">
                        <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          ~${(distribucion.montoObjetivo * 0.7).toFixed(2)}
                        </span>
                        <p className="text-xs text-muted-foreground">aporte estimado</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Aproximadamente el 70% de lo que le toca a La Bayer contribuye a {eventoObjetivo.objetivo.descripcion.toLowerCase()}
                    </p>
                    <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded text-xs text-muted-foreground">
                      💡 <strong>El monto final</strong> se determinará al cierre del evento, una vez calculados todos los gastos reales. Este valor es una estimación.
                    </div>

                    {/* Objective Progress Bar */}
                    <div className="space-y-2 mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="font-semibold text-sm text-purple-700 dark:text-purple-300">
                            Objetivo colectivo
                          </span>
                          <p className="text-xs text-muted-foreground">
                            (de eventos finalizados)
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            ${eventoObjetivo.objetivo.montoActual.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {" "}/ ${eventoObjetivo.objetivo.montoObjetivo.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-purple-200 dark:bg-purple-900 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all flex items-center justify-end pr-2"
                          style={{
                            width: `${Math.min(
                              (eventoObjetivo.objetivo.montoActual / eventoObjetivo.objetivo.montoObjetivo) * 100,
                              100
                            )}%`,
                          }}
                        >
                          <span className="text-xs font-bold text-white">
                            {((eventoObjetivo.objetivo.montoActual / eventoObjetivo.objetivo.montoObjetivo) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      {eventoObjetivo.objetivo.montoActual < eventoObjetivo.objetivo.montoObjetivo ? (
                        <p className="text-sm text-muted-foreground">
                          <strong>Faltan ${(eventoObjetivo.objetivo.montoObjetivo - eventoObjetivo.objetivo.montoActual).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</strong> para alcanzar la meta
                        </p>
                      ) : (
                        <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                          🎉 ¡Meta alcanzada! Gracias por tu aporte
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Button asChild className="w-full" size="lg">
            <Link href="/mis-bonos">Ver mis bonos</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Gracias por apoyar la cultura autogestiva.
          Todo lo recaudado se distribuye de forma transparente entre artistas y la comunidad.
        </p>
      </div>
    </div>
  );
}
