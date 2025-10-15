"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Target, Calendar, Users } from "lucide-react";
import { differenceInDays } from "date-fns";

interface Objetivo {
  id: string;
  nombre: string;
  descripcion: string;
  montoObjetivo: number;
  montoActual: number;
  porcentaje: number;
  estado: string;
  activo: boolean;
  prioridad: number;
  fechaObjetivo: Date | null;
  cantidadPersonas: number;
}

interface ObjetivosListProps {
  objetivos: Objetivo[];
}

export function ObjetivosList({ objetivos }: ObjetivosListProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    montoObjetivo: 0,
    prioridad: 0,
    fechaInicio: new Date().toISOString().split("T")[0],
    fechaObjetivo: "",
    activo: true,
  });

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      montoObjetivo: 0,
      prioridad: 0,
      fechaInicio: new Date().toISOString().split("T")[0],
      fechaObjetivo: "",
      activo: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (objetivo: Objetivo) => {
    setFormData({
      nombre: objetivo.nombre,
      descripcion: objetivo.descripcion,
      montoObjetivo: objetivo.montoObjetivo,
      prioridad: objetivo.prioridad,
      fechaInicio: new Date().toISOString().split("T")[0],
      fechaObjetivo: "",
      activo: objetivo.activo,
    });
    setEditingId(objetivo.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId
        ? `/api/admin/objetivos/${editingId}`
        : "/api/admin/objetivos";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.refresh();
        resetForm();
      } else {
        const error = await res.json();
        alert(error.error || "Error al guardar");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este objetivo?")) return;

    try {
      const res = await fetch(`/api/admin/objetivos/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar");
    }
  };

  const getEstadoBadge = (objetivo: Objetivo) => {
    if (!objetivo.activo) return <Badge variant="destructive">Inactivo</Badge>;
    if (objetivo.estado === "COMPLETADO") return <Badge className="bg-green-600">Completado</Badge>;
    if (objetivo.estado === "PAUSADO") return <Badge variant="secondary">Pausado</Badge>;
    return <Badge className="bg-blue-600">Activo</Badge>;
  };

  return (
    <div className="space-y-6">
      {!showForm && (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Objetivo
        </Button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                placeholder="Nueva sala de lectura"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="montoObjetivo">Monto Objetivo (ARS) *</Label>
              <Input
                id="montoObjetivo"
                type="number"
                step="0.01"
                value={formData.montoObjetivo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    montoObjetivo: parseFloat(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción *</Label>
            <textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe el objetivo..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="prioridad">Prioridad</Label>
              <Input
                id="prioridad"
                type="number"
                value={formData.prioridad}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    prioridad: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha Inicio</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={formData.fechaInicio}
                onChange={(e) =>
                  setFormData({ ...formData, fechaInicio: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaObjetivo">Fecha Objetivo</Label>
              <Input
                id="fechaObjetivo"
                type="date"
                value={formData.fechaObjetivo}
                onChange={(e) =>
                  setFormData({ ...formData, fechaObjetivo: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Guardar" : "Crear"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {objetivos.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">
              No hay objetivos registrados
            </p>
          </div>
        ) : (
          objetivos.map((objetivo) => (
            <div
              key={objetivo.id}
              className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {objetivo.nombre}
                    </h3>
                    {getEstadoBadge(objetivo)}
                    {objetivo.prioridad > 0 && (
                      <Badge variant="outline">
                        Prioridad {objetivo.prioridad}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {objetivo.descripcion}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(objetivo)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(objetivo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300">
                    ${objetivo.montoActual.toLocaleString()} / $
                    {objetivo.montoObjetivo.toLocaleString()}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {((objetivo.montoActual / objetivo.montoObjetivo) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((objetivo.montoActual / objetivo.montoObjetivo) * 100, 100)}%` }}
                  />
                </div>
                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-1">
                  {objetivo.cantidadPersonas > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{objetivo.cantidadPersonas} personas</span>
                    </div>
                  )}
                  {objetivo.fechaObjetivo && (() => {
                    const diasFaltantes = differenceInDays(new Date(objetivo.fechaObjetivo), new Date());
                    if (diasFaltantes >= 0) {
                      return (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {diasFaltantes === 0
                              ? "Hoy"
                              : `${diasFaltantes} día${diasFaltantes === 1 ? '' : 's'}`}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
