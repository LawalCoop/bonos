"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Heart, Users, Star, ShoppingCart, Zap } from "lucide-react";

interface Descuento {
  tipo: string;
  nombre: string;
  porcentaje: number;
  monto: number;
}

interface PrecioDesgloseProps {
  precioBase: number;
  precioFinal: number;
  tipoDescuento: "promocion" | "descuentos" | "ninguno";
  promocion?: {
    nombre: string;
    tipo: string;
    valor: number;
  };
  descuentos?: Descuento[];
  totalDescuentoPorcentaje?: number;
}

export function PrecioDesglose({
  precioBase,
  precioFinal,
  tipoDescuento,
  promocion,
  descuentos = [],
  totalDescuentoPorcentaje = 0,
}: PrecioDesgloseProps) {
  const [open, setOpen] = useState(false);

  const ahorro = precioBase - precioFinal;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="space-y-2">
        {/* Precio principal - siempre visible */}
        <CollapsibleTrigger className="w-full">
          <div className="flex items-start justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                {tipoDescuento === "promocion" && promocion && (
                  <Badge className="bg-green-600">
                    {promocion.tipo === "2x1" && "2x1"}
                    {promocion.tipo === "PORCENTAJE" && `${promocion.valor}% OFF`}
                    {promocion.tipo === "MONTO_FIJO" && `$${promocion.valor} OFF`}
                  </Badge>
                )}
                {tipoDescuento === "descuentos" && (
                  <Badge className="bg-blue-600">
                    {totalDescuentoPorcentaje}% OFF
                  </Badge>
                )}
              </div>
              <p className="text-4xl font-bold">${Math.round(precioFinal).toLocaleString()}</p>
              {precioFinal < precioBase && (
                <p className="text-sm text-muted-foreground line-through">
                  Antes: ${precioBase.toLocaleString()}
                </p>
              )}
              {promocion?.tipo === "2x1" && (
                <p className="text-xs text-green-600 font-medium mt-1">
                  Precio efectivo c/u comprando 2
                </p>
              )}
            </div>
            <ChevronDown
              className={`h-5 w-5 text-muted-foreground transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>
        </CollapsibleTrigger>

        {/* Desglose - colapsable */}
        <CollapsibleContent>
          <div className="p-4 bg-muted/50 rounded-lg space-y-3 text-sm">
            <h4 className="font-semibold">Desglose:</h4>

            {/* Precio base */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Precio base</span>
              <span className="font-medium">${precioBase.toLocaleString()}</span>
            </div>

            {/* Promoción */}
            {tipoDescuento === "promocion" && promocion && (
              <>
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600 text-xs">{promocion.nombre}</Badge>
                    </div>
                    {promocion.tipo === "2x1" ? (
                      <span className="font-medium">2x1</span>
                    ) : (
                      <span className="font-medium">
                        -{promocion.tipo === "PORCENTAJE"
                          ? `${promocion.valor}%`
                          : `$${promocion.valor}`}
                      </span>
                    )}
                  </div>
                  {promocion.tipo === "2x1" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Pagás ${precioBase.toLocaleString()} y llevás 2 bonos
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Descuentos del usuario */}
            {tipoDescuento === "descuentos" && descuentos.length > 0 && (
              <>
                <div className="border-t pt-2 space-y-2">
                  {descuentos.map((desc, idx) => {
                    const icono =
                      desc.tipo === "SOCIO" ? (
                        <Heart className="h-3 w-3 text-red-500" />
                      ) : desc.tipo === "ORGANIZACION" ? (
                        <Users className="h-3 w-3 text-blue-500" />
                      ) : desc.tipo === "VECES_VISTO_ARTISTA" ? (
                        <Star className="h-3 w-3 text-purple-500" />
                      ) : desc.tipo === "MULTIPLES_COMPRAS_MES" ? (
                        <ShoppingCart className="h-3 w-3 text-orange-500" />
                      ) : desc.tipo === "NIVEL" ? (
                        <Zap className="h-3 w-3 text-yellow-500" />
                      ) : null;

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-blue-600 dark:text-blue-400"
                      >
                        <div className="flex items-center gap-2">
                          {icono}
                          <span>{desc.nombre}</span>
                        </div>
                        <span className="font-medium">-{desc.porcentaje}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Total */}
            <div className="border-t pt-2 flex items-center justify-between font-bold">
              <span>Total a pagar</span>
              <span className="text-lg">${Math.round(precioFinal).toLocaleString()}</span>
            </div>

            {/* Ahorro */}
            {ahorro > 0 && (
              <div className="text-center p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <p className="text-xs font-medium text-green-700 dark:text-green-400">
                  ✨ Ahorrás ${Math.round(ahorro).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
