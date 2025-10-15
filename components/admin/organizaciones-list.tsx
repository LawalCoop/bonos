"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface Organizacion {
  id: string;
  nombre: string;
  tipo: string | null;
  descuentoPorcentaje: number;
  activo: boolean;
  _count: {
    usuarios: number;
  };
}

interface OrganizacionesListProps {
  organizaciones: Organizacion[];
}

export function OrganizacionesList({ organizaciones: initialOrganizaciones }: OrganizacionesListProps) {
  const router = useRouter();
  const [organizaciones, setOrganizaciones] = useState(initialOrganizaciones);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "",
    descuentoPorcentaje: 10,
    activo: true,
  });

  const resetForm = () => {
    setFormData({
      nombre: "",
      tipo: "",
      descuentoPorcentaje: 10,
      activo: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (org: Organizacion) => {
    setFormData({
      nombre: org.nombre,
      tipo: org.tipo || "",
      descuentoPorcentaje: org.descuentoPorcentaje,
      activo: org.activo,
    });
    setEditingId(org.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId
        ? `/api/admin/organizaciones/${editingId}`
        : "/api/admin/organizaciones";
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
    if (!confirm("¿Estás seguro de eliminar esta organización?")) return;

    try {
      const res = await fetch(`/api/admin/organizaciones/${id}`, {
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

  return (
    <div className="space-y-4 md:space-y-6">
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Organización
        </Button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4 p-3 md:p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                placeholder="Mutual de Trabajadores"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Input
                id="tipo"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                placeholder="Mutual, Sindicato, Cooperativa..."
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="descuentoPorcentaje">Descuento (%)</Label>
              <Input
                id="descuentoPorcentaje"
                type="number"
                step="0.1"
                value={formData.descuentoPorcentaje}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    descuentoPorcentaje: parseFloat(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activo">Estado</Label>
              <div className="flex items-center h-10">
                <input
                  id="activo"
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) =>
                    setFormData({ ...formData, activo: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="activo" className="ml-2 text-sm">
                  Activo
                </label>
              </div>
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

      <div className="space-y-2 md:space-y-3">
        {organizaciones.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No hay organizaciones registradas
          </p>
        ) : (
          organizaciones.map((org) => (
            <div
              key={org.id}
              className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 md:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 mb-2">
                  <h3 className="font-medium text-sm md:text-base text-gray-900 dark:text-white truncate">
                    {org.nombre}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {org.tipo && (
                      <Badge variant="secondary">{org.tipo}</Badge>
                    )}
                    {!org.activo && (
                      <Badge variant="destructive">Inactivo</Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  Descuento: {org.descuentoPorcentaje}% • {org._count.usuarios} usuarios
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(org)}
                  className="flex-1 sm:flex-none"
                >
                  <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(org.id)}
                  disabled={org._count.usuarios > 0}
                  className="flex-1 sm:flex-none"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
