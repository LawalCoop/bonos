"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ObjetivoColectivoProps {
  nombre: string;
  descripcion: string;
  montoObjetivo: number;
  montoActual: number;
  porcentaje: number;
  fechaObjetivo?: Date;
  icono?: string;
  imagen?: string;
  contributores?: number;
  compact?: boolean;
}

export function ObjetivoColectivo({
  nombre,
  descripcion,
  montoObjetivo,
  montoActual,
  porcentaje,
  fechaObjetivo,
  icono,
  imagen,
  contributores,
  compact = false,
}: ObjetivoColectivoProps) {
  const montoFaltante = montoObjetivo - montoActual;
  const estaCompletado = porcentaje >= 100;

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-bold text-lg text-green-900 dark:text-green-100">
                  {nombre}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {descripcion}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    ${montoActual.toLocaleString()} de ${montoObjetivo.toLocaleString()}
                  </span>
                  <span className="font-bold text-green-600">
                    {porcentaje.toFixed(0)}%
                  </span>
                </div>
                <Progress value={porcentaje} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-green-900 dark:text-green-100">
                {nombre}
              </CardTitle>
              {estaCompletado && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                  ¡Completado! 🎉
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-gray-700 dark:text-gray-300">{descripcion}</p>

        {imagen && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={imagen}
              alt={nombre}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Progreso */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">
                ${montoActual.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                recaudados de ${montoObjetivo.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-700 dark:text-green-500">
                {porcentaje.toFixed(0)}%
              </p>
            </div>
          </div>

          <Progress value={porcentaje} className="h-3" />

          {!estaCompletado && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Faltan <span className="font-bold text-green-600">${montoFaltante.toLocaleString()}</span> para alcanzar el objetivo
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-green-200 dark:border-green-800">
          {contributores && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">{contributores} personas</p>
                <p className="text-xs text-gray-500">aportando</p>
              </div>
            </div>
          )}

          {fechaObjetivo && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">
                  {format(fechaObjetivo, "MMM yyyy", { locale: es })}
                </p>
                <p className="text-xs text-gray-500">meta</p>
              </div>
            </div>
          )}
        </div>

        {/* Mensaje motivacional */}
        <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Cada entrada que comprás suma a este objetivo colectivo.
              {!estaCompletado && " ¡Juntes estamos construyendo algo más grande!"}
              {estaCompletado && " ¡Gracias por ser parte de este logro!"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
