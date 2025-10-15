"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Evento {
  id: string;
  nombre: string;
  fecha: Date;
}

interface Promocion {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  valor: number;
  activo: boolean;
  prioridad: number;
  requiereAuth: boolean;
  codigo: string | null;
  fechaInicio: Date;
  fechaFin: Date;
  eventoId: string | null;
  evento?: {
    nombre: string;
    fecha: Date;
  } | null;
}

interface PromocionesTableProps {
  promociones: Promocion[];
  eventos: Evento[];
}

export function PromocionesTable({ promociones, eventos }: PromocionesTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const toggleActivo = async (id: string, currentState: boolean) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/promociones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !currentState }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error toggling promocion:", error);
    } finally {
      setLoading(null);
    }
  };

  const deletePromocion = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta promoción?")) return;

    setLoading(id);
    try {
      const res = await fetch(`/api/admin/promociones/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting promocion:", error);
    } finally {
      setLoading(null);
    }
  };

  const getTipoBadge = (tipo: string, valor: number) => {
    switch (tipo) {
      case "2x1":
        return <Badge className="bg-purple-600">2x1</Badge>;
      case "PORCENTAJE":
        return <Badge className="bg-blue-600">{valor}% OFF</Badge>;
      case "MONTO_FIJO":
        return <Badge className="bg-green-600">${valor} OFF</Badge>;
      default:
        return <Badge>{tipo}</Badge>;
    }
  };

  if (promociones.length === 0) {
    return (
      <div className="text-center py-8 md:py-12">
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
          No hay promociones todavía
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 md:space-y-3">
      {promociones.map((promo) => (
        <div
          key={promo.id}
          className="p-3 md:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex flex-col gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 mb-2">
                <h3 className="font-medium text-sm md:text-base text-gray-900 dark:text-white truncate">
                  {promo.nombre}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {getTipoBadge(promo.tipo, promo.valor)}
                  {promo.codigo && (
                    <Badge variant="outline" className="font-mono text-xs">
                      Código: {promo.codigo}
                    </Badge>
                  )}
                  {!promo.eventoId && (
                    <Badge variant="secondary">Global</Badge>
                  )}
                  {promo.requiereAuth && (
                    <Badge variant="outline" className="text-xs">
                      Requiere Login
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">
                {promo.descripcion}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                {promo.eventoId && promo.evento && (
                  <div className="truncate">
                    <span className="font-semibold">Evento:</span>{" "}
                    {promo.evento.nombre}
                  </div>
                )}
                <div>
                  <span className="font-semibold">Inicio:</span>{" "}
                  {new Date(promo.fechaInicio).toLocaleDateString("es-AR")}
                </div>
                <div>
                  <span className="font-semibold">Fin:</span>{" "}
                  {new Date(promo.fechaFin).toLocaleDateString("es-AR")}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={promo.activo}
                  onCheckedChange={() => toggleActivo(promo.id, promo.activo)}
                  disabled={loading === promo.id}
                />
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  {promo.activo ? "Activa" : "Inactiva"}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Prioridad: {promo.prioridad}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/admin/promociones/${promo.id}`} className="flex-1 sm:flex-none">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading === promo.id}
                  className="w-full sm:w-auto"
                >
                  <Edit className="h-3 w-3 sm:mr-1" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deletePromocion(promo.id)}
                disabled={loading === promo.id}
                className="flex-1 sm:flex-none"
              >
                <Trash2 className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
