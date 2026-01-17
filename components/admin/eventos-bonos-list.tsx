"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ChevronDown, ChevronUp } from "lucide-react";
import { BonoActions } from "@/components/admin/bono-actions";

interface EventoBonosListProps {
  eventosBonos: Array<{
    evento: any;
    bonos: any[];
  }>;
  searchQuery?: string;
}

export function EventoBonosList({ eventosBonos, searchQuery }: EventoBonosListProps) {
  const [expandedEventos, setExpandedEventos] = useState<Set<string>>(new Set());
  const now = new Date();

  const toggleEvento = (eventoId: string) => {
    setExpandedEventos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventoId)) {
        newSet.delete(eventoId);
      } else {
        newSet.add(eventoId);
      }
      return newSet;
    });
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "PAGADO":
        return <Badge className="bg-green-600">Pagado</Badge>;
      case "UTILIZADO":
        return <Badge variant="secondary">Utilizado</Badge>;
      case "CANCELADO":
        return <Badge variant="destructive">Cancelado</Badge>;
      case "PENDIENTE":
        return <Badge variant="outline">Pendiente</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  if (eventosBonos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 md:py-12">
          <div className="text-center">
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "No se encontraron bonos con ese criterio"
                : "No hay bonos todavía"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {eventosBonos.map(({ evento, bonos }) => {
        const fechaEvento = new Date(evento.fecha);
        const esFuturo = fechaEvento >= now;
        const totalBonos = bonos.length;
        const totalRecaudado = bonos.reduce((sum: number, b: any) => sum + b.precioFinal, 0);
        const isExpanded = expandedEventos.has(evento.id);

        return (
          <Card key={evento.id}>
            <CardHeader
              className={`cursor-pointer p-3 md:p-6 ${
                esFuturo ? "bg-green-50 dark:bg-green-950/20" : "bg-gray-50 dark:bg-gray-900"
              }`}
              onClick={() => toggleEvento(evento.id)}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <CardTitle className="text-base md:text-xl truncate">{evento.nombre}</CardTitle>
                    {esFuturo ? (
                      <Badge className="bg-green-600 w-fit">Próximo</Badge>
                    ) : (
                      <Badge variant="secondary" className="w-fit">Realizado</Badge>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {fechaEvento.toLocaleDateString("es-AR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        - {evento.horaInicio}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                  <div className="text-left sm:text-right">
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {totalBonos} bono{totalBonos !== 1 ? "s" : ""}
                    </p>
                    <p className="text-base md:text-lg font-bold text-emerald-600">
                      ${totalRecaudado.toLocaleString("es-AR")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleEvento(evento.id);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 md:h-5 md:w-5" />
                    ) : (
                      <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="p-3 md:p-6 pt-3 md:pt-4">
                <div className="space-y-2 md:space-y-3">
                  {bonos.map((bono: any) => (
                    <div
                      key={bono.id}
                      className="p-3 md:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                            {getEstadoBadge(bono.estado)}
                            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                              ${bono.precioFinal.toLocaleString("es-AR")}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {bono.usuario?.name ||
                                bono.usuario?.nombre ||
                                bono.usuario?.email ||
                                "Sin usuario"}
                            </span>
                          </div>

                          {/* Mostrar descuentos aplicados */}
                          {bono.descuentosAplicados &&
                            typeof bono.descuentosAplicados === "object" &&
                            "descuentos" in bono.descuentosAplicados &&
                            Array.isArray((bono.descuentosAplicados as any).descuentos) &&
                            (bono.descuentosAplicados as any).descuentos.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {(bono.descuentosAplicados as any).descuentos.map(
                                  (desc: any, idx: number) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-xs bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                                    >
                                      {desc.nombre} -{desc.porcentaje}%
                                    </Badge>
                                  )
                                )}
                              </div>
                            )}
                        </div>

                        <div className="self-start">
                          <BonoActions bonoId={bono.id} estadoActual={bono.estado} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Código</p>
                          <p className="font-mono text-xs md:text-sm truncate">{bono.codigo}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Comprado</p>
                          <p className="text-xs md:text-sm">
                            {new Date(bono.fechaCompra).toLocaleDateString("es-AR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {bono.fechaUtilizacion && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Utilizado
                            </p>
                            <p className="text-xs md:text-sm">
                              {new Date(bono.fechaUtilizacion).toLocaleDateString("es-AR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
