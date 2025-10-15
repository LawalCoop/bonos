"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Coins, Users, Wrench, Target } from "lucide-react";

interface DistribucionDineroProps {
  precioTotal: number;
  porcentajeArtista: number;
  porcentajeBayer: number;
  porcentajeObjetivo?: number; // No se usa más, mantenido para compatibilidad
  nombreObjetivo?: string;
  showDetails?: boolean;
  tieneObjetivoActivo?: boolean; // Nueva prop para indicar si hay objetivo
}

export function DistribucionDinero({
  precioTotal,
  porcentajeArtista,
  porcentajeBayer,
  porcentajeObjetivo = 0,
  nombreObjetivo,
  showDetails = true,
  tieneObjetivoActivo = false,
}: DistribucionDineroProps) {
  const montoArtista = precioTotal * (porcentajeArtista / 100);
  const montoBayer = precioTotal * (porcentajeBayer / 100);

  // Si hay objetivo activo, TODO lo de La Bayer va al objetivo (~70% después de gastos)
  // Mostramos una estimación del 70% de lo que le toca a La Bayer
  const montoObjetivoEstimado = tieneObjetivoActivo ? montoBayer * 0.7 : 0;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Coins className="h-5 w-5 text-purple-600" />
          ¿A dónde va tu aporte?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-purple-600">
            ${precioTotal.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total de tu bono
          </p>
        </div>

        {/* Artistas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Artistas</p>
                <p className="text-xs text-gray-500">
                  {porcentajeArtista}% de tu bono
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-blue-600">${montoArtista.toLocaleString()}</p>
            </div>
          </div>
          {showDetails && (
            <p className="text-xs text-gray-600 dark:text-gray-400 ml-10">
              Paga directamente a quienes hacen la música posible
            </p>
          )}
        </div>

        {/* La Bayer / Gastos operativos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Wrench className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="font-medium text-sm">La Bayer</p>
                <p className="text-xs text-gray-500">
                  {porcentajeBayer}% de tu bono
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-orange-600">${montoBayer.toLocaleString()}</p>
            </div>
          </div>
          {showDetails && (
            <p className="text-xs text-gray-600 dark:text-gray-400 ml-10">
              Sonido, luces, limpieza, mantenimiento del espacio
            </p>
          )}
        </div>

        {/* Objetivo de ampliación - DESPUÉS de la distribución básica */}
        {tieneObjetivoActivo && nombreObjetivo && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {nombreObjetivo}
                    </p>
                    <p className="text-xs text-gray-500">
                      ~70% de la parte de La Bayer
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">~${montoObjetivoEstimado.toFixed(0)}</p>
                  <p className="text-xs text-gray-500">estimado</p>
                </div>
              </div>
              {showDetails && (
                <>
                  <p className="text-xs text-gray-600 dark:text-gray-400 ml-10">
                    Ayuda a construir y mejorar el espacio para todes
                  </p>
                  <div className="ml-10 mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-xs text-muted-foreground">
                    💡 El monto final se determinará al cierre del evento, una vez calculados todos los gastos reales.
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {showDetails && (
          <div className="pt-4 border-t border-purple-200 dark:border-purple-800">
            <p className="text-xs text-center text-gray-600 dark:text-gray-400 italic">
              Tu entrada no solo te da música en vivo, construye un espacio cultural autogestionado 🎵
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
