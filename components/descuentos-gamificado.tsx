"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Lock,
  Trophy,
  Heart,
  Users,
  Zap,
  ShoppingCart,
  Star,
  HelpCircle,
  TrendingUp,
  Gift,
} from "lucide-react";
import { getNivelInfo, NIVELES } from "@/lib/constants";

interface Descuento {
  tipo: string;
  nombre: string;
  porcentaje: number;
  monto: number;
}

interface DescuentoPotencial {
  nombre: string;
  porcentaje: number;
  requisito: string;
  progreso?: number;
  tipo?: string;
}

interface DescuentoGamificadoProps {
  descuentosActuales: Descuento[];
  descuentosPotenciales: DescuentoPotencial[];
  totalDescuentoActual: number;
  usuarioNivel?: number;
  usuarioPuntos?: number;
  precioBase?: number;
  precioConPromocion?: number;
  mostrarDesglose?: boolean; // Nuevo prop para controlar si se muestra el desglose
}

// Función para agrupar descuentos por categoría
function agruparDescuentos(descuentos: Descuento[]) {
  const grupos = {
    socio: [] as Descuento[],
    organizacion: [] as Descuento[],
    fan: [] as Descuento[],
    multiples: [] as Descuento[],
    nivel: [] as Descuento[],
    otros: [] as Descuento[],
  };

  descuentos.forEach((desc) => {
    if (desc.tipo === "SOCIO") grupos.socio.push(desc);
    else if (desc.tipo === "ORGANIZACION") grupos.organizacion.push(desc);
    else if (desc.tipo === "VECES_VISTO_ARTISTA") grupos.fan.push(desc);
    else if (desc.tipo === "MULTIPLES_COMPRAS_MES") grupos.multiples.push(desc);
    else if (desc.tipo === "NIVEL") grupos.nivel.push(desc);
    else grupos.otros.push(desc);
  });

  return grupos;
}

function agruparPotenciales(descuentos: DescuentoPotencial[]) {
  const grupos = {
    socio: [] as DescuentoPotencial[],
    organizacion: [] as DescuentoPotencial[],
    fan: [] as DescuentoPotencial[],
    multiples: [] as DescuentoPotencial[],
    nivel: [] as DescuentoPotencial[],
  };

  descuentos.forEach((desc) => {
    if (desc.requisito.includes("Asociate")) grupos.socio.push(desc);
    else if (desc.requisito.includes("Unite")) grupos.organizacion.push(desc);
    else if (desc.requisito.includes("Vení") || desc.requisito.includes("artista"))
      grupos.fan.push(desc);
    else if (desc.requisito.includes("Comprá")) grupos.multiples.push(desc);
    else if (desc.requisito.includes("nivel") || desc.requisito.includes("Alcanzá"))
      grupos.nivel.push(desc);
  });

  return grupos;
}

function GrupoDescuento({
  titulo,
  icon: Icon,
  color,
  descuentos,
  potenciales,
  esAcumulable = true,
}: {
  titulo: string;
  icon: any;
  color: string;
  descuentos: Descuento[];
  potenciales: DescuentoPotencial[];
  esAcumulable?: boolean;
}) {
  if (descuentos.length === 0 && potenciales.length === 0) return null;

  const totalPorcentaje = descuentos.reduce((sum, d) => sum + d.porcentaje, 0);

  // Si hay múltiples descuentos y no son acumulables, identificar el mayor
  const mejorDescuento = descuentos.length > 1 && !esAcumulable
    ? descuentos.reduce((mejor, actual) => actual.porcentaje > mejor.porcentaje ? actual : mejor)
    : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <h4 className="font-semibold text-sm">{titulo}</h4>
      </div>

      {/* Descuentos Activos */}
      {descuentos.length > 0 && (
        <div className={`p-3 rounded-lg border-2 ${color.replace("text-", "border-")} bg-opacity-10 space-y-2`}>
          {/* Si hay un solo descuento o son acumulables, mostrar normalmente */}
          {(descuentos.length === 1 || esAcumulable) ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-5 w-5 ${color}`} />
                <div>
                  {descuentos.length === 1 ? (
                    <p className="font-medium text-sm">{descuentos[0].nombre}</p>
                  ) : (
                    <p className="font-medium text-sm">
                      {descuentos.length} descuentos activos
                    </p>
                  )}
                </div>
              </div>
              <Badge className="bg-green-600 text-white border-transparent font-semibold">
                -{totalPorcentaje}%
              </Badge>
            </div>
          ) : (
            /* Si hay múltiples y no son acumulables, mostrar todos indicando cuál gana */
            <>
              <div className="text-xs text-muted-foreground mb-2">
                Solo se aplica el descuento mayor:
              </div>
              {descuentos.map((desc, idx) => {
                const esElMejor = mejorDescuento?.nombre === desc.nombre;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded ${
                      esElMejor
                        ? 'bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-700'
                        : 'opacity-50 bg-gray-50 dark:bg-gray-900/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {esElMejor ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-400" />
                      )}
                      <p className={`text-sm ${esElMejor ? 'font-semibold' : ''}`}>
                        {desc.nombre}
                      </p>
                    </div>
                    <Badge
                      className={`border-transparent font-semibold ${
                        esElMejor
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-400 text-white'
                      }`}
                    >
                      -{desc.porcentaje}%
                    </Badge>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Descuentos Potenciales */}
      {potenciales.map((pot, idx) => (
        <div
          key={idx}
          className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-muted-foreground">{pot.requisito}</p>
            </div>
            <Badge variant="outline" className="text-xs">
              -{pot.porcentaje}%
            </Badge>
          </div>
          {pot.progreso !== undefined && (
            <div className="space-y-1">
              <Progress value={pot.progreso} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {Math.round(pot.progreso)}% completado
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function DescuentosGamificado({
  descuentosActuales,
  descuentosPotenciales,
  totalDescuentoActual,
  usuarioNivel,
  usuarioPuntos,
  precioBase,
  precioConPromocion,
  mostrarDesglose = true,
}: DescuentoGamificadoProps) {
  console.log('DescuentosGamificado - descuentosActuales:', descuentosActuales);

  const gruposActuales = agruparDescuentos(descuentosActuales);
  const gruposPotenciales = agruparPotenciales(descuentosPotenciales);

  const maxDescuentoPosible =
    totalDescuentoActual +
    descuentosPotenciales.reduce((sum, d) => sum + d.porcentaje, 0);

  // Calcular precio final con descuentos
  const precioConDescuentos = precioBase ? precioBase * (1 - totalDescuentoActual / 100) : null;

  // Determinar el mejor precio
  const usarPromocion = precioConPromocion && precioConDescuentos && precioConPromocion < precioConDescuentos;
  const precioFinal = usarPromocion ? precioConPromocion : precioConDescuentos;

  // Calculate level progress
  const calcularProgreso = () => {
    if (!usuarioNivel || !usuarioPuntos) return 0;

    const nivelActual = usuarioNivel;
    const puntosActuales = usuarioPuntos;
    const siguienteNivel = nivelActual + 1;

    // If max level, return 100%
    if (nivelActual >= 8) return 100;

    const puntosNivelActual = getNivelInfo(nivelActual).puntos;
    const puntosNivelSiguiente = getNivelInfo(siguienteNivel).puntos;

    const puntosEnNivel = puntosActuales - puntosNivelActual;
    const puntosNecesarios = puntosNivelSiguiente - puntosNivelActual;

    return Math.min((puntosEnNivel / puntosNecesarios) * 100, 100);
  };

  const progreso = calcularProgreso();
  const nivelActual = usuarioNivel || 1;
  const puntosActuales = usuarioPuntos || 0;
  const nivelInfo = getNivelInfo(nivelActual);
  const siguienteNivelInfo = nivelActual < 8 ? getNivelInfo(nivelActual + 1) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Tus Beneficios
          </CardTitle>
          {totalDescuentoActual > 0 && (
            <Badge className="bg-green-600 text-lg px-3 py-1">
              {Math.round(totalDescuentoActual)}% OFF
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nivel Widget - Primero */}
        {usuarioNivel && usuarioPuntos !== undefined && (
          <div className="space-y-3 pt-4 border-t">
            {/* Intuitive Level Widget */}
            {(
              <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 dark:from-yellow-950/40 dark:via-orange-950/40 dark:to-yellow-900/40 border-2 border-yellow-400 dark:border-yellow-600 shadow-sm">
                {/* Header with help button */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <h3 className="font-bold text-yellow-900 dark:text-yellow-200">
                      Sistema de Niveles
                    </h3>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-yellow-700 hover:text-yellow-900 dark:text-yellow-300 dark:hover:text-yellow-100"
                      >
                        <HelpCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs">Info</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                          <Trophy className="h-6 w-6 text-yellow-500" />
                          Sistema de Niveles
                        </DialogTitle>
                        <DialogDescription>
                          Sumá puntos asistiendo a eventos y desbloqueá descuentos increíbles
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 mt-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                            <Gift className="h-5 w-5" />
                            ¿Cómo funciona?
                          </h4>
                          <p className="text-sm text-blue-800 dark:text-blue-300">
                            Ganás <strong>100 puntos</strong> por cada evento al que asistís.
                            A medida que sumás puntos, subís de nivel y desbloqueás descuentos permanentes.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-bold text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            Todos los niveles
                          </h4>

                          {Object.entries(NIVELES).map(([nivel, info]) => {
                            const nivelNum = parseInt(nivel);
                            const isCurrentLevel = nivelNum === nivelActual;
                            const isUnlocked = nivelNum <= nivelActual;

                            return (
                              <div
                                key={nivel}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                  isCurrentLevel
                                    ? "border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950"
                                    : isUnlocked
                                    ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                                    : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3">
                                    <div className="text-3xl">{info.icono}</div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className={`font-bold ${isCurrentLevel ? "text-yellow-900 dark:text-yellow-200" : ""}`}>
                                          Nivel {nivel}: {info.nombre}
                                        </p>
                                        {isCurrentLevel && (
                                          <Badge className="bg-yellow-500 text-white text-xs">
                                            Tu nivel
                                          </Badge>
                                        )}
                                        {isUnlocked && !isCurrentLevel && (
                                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {info.puntos === 0 ? "Nivel inicial" : `${info.puntos} puntos`}
                                        {info.eventosMinimos > 0 && ` • ${info.eventosMinimos} eventos`}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge
                                    variant={info.descuento === 0 ? "outline" : "default"}
                                    className={info.descuento > 0 ? "bg-green-600 text-white" : ""}
                                  >
                                    {info.descuento > 0 ? `-${info.descuento}%` : "Sin descuento"}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Main level display - Vertical layout */}
                <div className="space-y-3 mb-4">
                  {/* Current Level - Full width */}
                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-900/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{nivelInfo.icono}</div>
                      <div>
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">
                          Nivel Actual
                        </p>
                        <p className="font-bold text-lg text-yellow-900 dark:text-yellow-100">
                          Nivel {nivelActual} • {nivelInfo.nombre}
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-400">
                          {puntosActuales} puntos
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Current Discount - Full width with prominent display */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-lg border-2 border-green-300 dark:border-green-700">
                    <div className="flex items-center gap-3">
                      <Gift className="h-10 w-10 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-xs text-green-700 dark:text-green-400 font-medium uppercase tracking-wide">
                          Descuento Activo
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                          En todos tus bonos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-4xl text-green-700 dark:text-green-400">
                        {nivelInfo.descuento}<span className="text-2xl">%</span>
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-500 font-medium">
                        OFF
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-yellow-800 dark:text-yellow-300">
                      Progreso al siguiente nivel
                    </span>
                    <span className="font-bold text-yellow-900 dark:text-yellow-200">
                      {puntosActuales} / {siguienteNivelInfo ? siguienteNivelInfo.puntos : "MAX"} pts
                    </span>
                  </div>
                  <div className="relative">
                    <Progress
                      value={progreso}
                      className="h-4 bg-yellow-200 dark:bg-yellow-900"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[11px] font-bold text-yellow-900 dark:text-yellow-100 drop-shadow">
                        {Math.round(progreso)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Next level preview */}
                {siguienteNivelInfo ? (
                  <div className="flex items-center justify-between p-3 bg-white/30 dark:bg-gray-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-yellow-700 dark:text-yellow-400" />
                      <div>
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">
                          Próximo Nivel
                        </p>
                        <p className="text-sm font-bold text-yellow-900 dark:text-yellow-100">
                          {siguienteNivelInfo.icono} {siguienteNivelInfo.nombre}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        Próximo descuento
                      </p>
                      <Badge className="bg-yellow-600 text-white font-bold">
                        {siguienteNivelInfo.descuento}%
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-3 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg border-2 border-yellow-400">
                    <Trophy className="h-6 w-6 mx-auto mb-1 text-yellow-700" />
                    <p className="text-sm font-bold text-yellow-900 dark:text-yellow-200">
                      ¡Nivel Máximo Alcanzado!
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-400">
                      Sos un verdadero guardián de La Bayer
                    </p>
                  </div>
                )}
              </div>
            )}</div>
        )}

        {/* Otros descuentos después del nivel - Solo mostrar si mostrarDesglose es true */}
        {mostrarDesglose && (
          <>
        {/* Socio - No acumulable (solo uno puede ser socio) */}
        <GrupoDescuento
          titulo="Socie de La Bayer"
          icon={Heart}
          color="text-red-500"
          descuentos={gruposActuales.socio}
          potenciales={gruposPotenciales.socio}
          esAcumulable={false}
        />

        {/* Organizaciones - No acumulable (solo puede pertenecer a una organización) */}
        <GrupoDescuento
          titulo="Mutuales & Organizaciones"
          icon={Users}
          color="text-blue-500"
          descuentos={gruposActuales.organizacion}
          potenciales={gruposPotenciales.organizacion}
          esAcumulable={false}
        />

        {/* Fan de Artistas - Acumulable (puede ser fan de varios artistas) */}
        <GrupoDescuento
          titulo="Fan de Artistas"
          icon={Star}
          color="text-purple-500"
          descuentos={gruposActuales.fan}
          potenciales={gruposPotenciales.fan}
          esAcumulable={true}
        />

        {/* Múltiples Compras - No acumulable (solo un descuento por compras) */}
        <GrupoDescuento
          titulo="Compras Frecuentes"
          icon={ShoppingCart}
          color="text-orange-500"
          descuentos={gruposActuales.multiples}
          potenciales={gruposPotenciales.multiples}
          esAcumulable={false}
        />

        {/* Desglose de precio con descuentos */}
        {precioBase && totalDescuentoActual > 0 && mostrarDesglose && (
          <div className="pt-4 border-t space-y-3">
            <h3 className="font-bold text-sm">Desglose de Precio</h3>

            {/* Precio base */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Precio base</span>
              <span className="font-medium">${precioBase.toLocaleString("es-AR")}</span>
            </div>

            {/* Descuentos aplicados con iconos */}
            {descuentosActuales.map((desc, idx) => {
              const icono =
                desc.tipo === "SOCIO" ? <Heart className="h-3 w-3 text-red-500" /> :
                desc.tipo === "ORGANIZACION" ? <Users className="h-3 w-3 text-blue-500" /> :
                desc.tipo === "VECES_VISTO_ARTISTA" ? <Star className="h-3 w-3 text-purple-500" /> :
                desc.tipo === "MULTIPLES_COMPRAS_MES" ? <ShoppingCart className="h-3 w-3 text-orange-500" /> :
                desc.tipo === "NIVEL" ? <Zap className="h-3 w-3 text-yellow-500" /> :
                null;

              return (
                <div key={idx} className="flex items-center justify-between text-sm text-green-700 dark:text-green-400">
                  <div className="flex items-center gap-2">
                    {icono}
                    <span>{desc.nombre}</span>
                  </div>
                  <span className="font-medium">-{desc.porcentaje}%</span>
                </div>
              );
            })}

            {/* Precio final con descuentos */}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="font-bold">
                {usarPromocion ? "Con promoción" : "Con descuentos"}
              </span>
              <span className="text-2xl font-bold text-green-600">
                ${precioFinal ? Math.round(precioFinal).toLocaleString("es-AR") : "0"}
              </span>
            </div>

            {/* Ahorro total */}
            {precioFinal && precioBase && (
              <div className="text-center p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <p className="text-xs text-green-700 dark:text-green-400">
                  {usarPromocion ? "⚡ La promoción es mejor que tus descuentos" : `✨ Ahorrás $${Math.round(precioBase - precioFinal).toLocaleString("es-AR")}`}
                </p>
              </div>
            )}

            {maxDescuentoPosible > totalDescuentoActual && (
              <p className="text-xs text-muted-foreground text-center">
                Máximo posible: {Math.round(maxDescuentoPosible)}% de descuento
              </p>
            )}
          </div>
        )}

        {totalDescuentoActual === 0 && descuentosPotenciales.length > 0 && mostrarDesglose && (
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm font-medium mb-1">
              ¡Desbloqueá hasta {Math.round(maxDescuentoPosible)}% de descuento!
            </p>
            <p className="text-xs text-muted-foreground">
              Completá los requisitos para acceder a los beneficios
            </p>
          </div>
        )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
