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
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
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
    <div className="space-y-6">
      {eventosBonos.map(({ evento, bonos }) => {
        const fechaEvento = new Date(evento.fecha);
        const esFuturo = fechaEvento >= now;
        const totalBonos = bonos.length;
        const totalRecaudado = bonos.reduce((sum: number, b: any) => sum + b.precioFinal, 0);
        const isExpanded = expandedEventos.has(evento.id);

        return (
          <Card key={evento.id}>
            <CardHeader
              className={`cursor-pointer ${
                esFuturo ? "bg-green-50 dark:bg-green-950/20" : "bg-gray-50 dark:bg-gray-900"
              }`}
              onClick={() => toggleEvento(evento.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{evento.nombre}</CardTitle>
                    {esFuturo ? (
                      <Badge className="bg-green-600">Próximo</Badge>
                    ) : (
                      <Badge variant="secondary">Realizado</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {fechaEvento.toLocaleDateString("es-AR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      - {evento.horaInicio}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {totalBonos} bono{totalBonos !== 1 ? "s" : ""}
                    </p>
                    <p className="text-lg font-bold text-emerald-600">
                      ${totalRecaudado.toLocaleString()}
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
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {bonos.map((bono: any) => (
                    <div
                      key={bono.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getEstadoBadge(bono.estado)}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              ${bono.precioFinal.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <User className="h-3 w-3" />
                            {bono.usuario?.name ||
                              bono.usuario?.nombre ||
                              bono.usuario?.email ||
                              "Sin usuario"}
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

                        <div>
                          <BonoActions bonoId={bono.id} estadoActual={bono.estado} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Código</p>
                          <p className="font-mono text-sm">{bono.codigo}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Comprado</p>
                          <p className="text-sm">
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
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Utilizado
                            </p>
                            <p className="text-sm">
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
