"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Users, Wrench } from "lucide-react";

interface DistribucionDineroProps {
  precioTotal: number;
  porcentajeArtista: number;
  porcentajeBayer: number;
  showDetails?: boolean;
}

export function DistribucionDinero({
  precioTotal,
  porcentajeArtista,
  porcentajeBayer,
  showDetails = true,
}: DistribucionDineroProps) {
  const montoArtista = precioTotal * (porcentajeArtista / 100);
  const montoBayer = precioTotal * (porcentajeBayer / 100);

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
              Sonido, luces, limpieza, mantenimiento y mejoras del espacio
            </p>
          )}
        </div>

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
