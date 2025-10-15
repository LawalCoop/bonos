"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Check, Edit2, Trash2 } from "lucide-react";

interface Gasto {
  id: string;
  concepto: string;
  descripcion?: string;
  monto: number;
  esCompartido: boolean;
  porcentajeArtista?: number;
  porcentajeBayer?: number;
  proveedor?: string;
  pagado: boolean;
  fechaPago?: string;
}

interface GastosEventoProps {
  eventoId: string;
}

export function GastosEvento({ eventoId }: GastosEventoProps) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);

  const [formData, setFormData] = useState({
    concepto: "",
    descripcion: "",
    monto: "",
    esCompartido: false,
    porcentajeArtista: "50",
    porcentajeBayer: "50",
    proveedor: "",
    pagado: false,
  });

  useEffect(() => {
    fetchGastos();
  }, [eventoId]);

  const fetchGastos = async () => {
    try {
      const res = await fetch(`/api/admin/eventos/${eventoId}/gastos`);
      if (res.ok) {
        const data = await res.json();
        setGastos(data);
      }
    } catch (error) {
      console.error("Error fetching gastos:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      concepto: "",
      descripcion: "",
      monto: "",
      esCompartido: false,
      porcentajeArtista: "50",
      porcentajeBayer: "50",
      proveedor: "",
      pagado: false,
    });
    setEditingGasto(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingGasto
      ? `/api/admin/eventos/${eventoId}/gastos/${editingGasto.id}`
      : `/api/admin/eventos/${eventoId}/gastos`;

    const method = editingGasto ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          monto: parseFloat(formData.monto),
          porcentajeArtista: formData.esCompartido
            ? parseInt(formData.porcentajeArtista)
            : null,
          porcentajeBayer: formData.esCompartido
            ? parseInt(formData.porcentajeBayer)
            : null,
        }),
      });

      if (res.ok) {
        fetchGastos();
        resetForm();
      } else {
        const error = await res.json();
        alert(error.error || "Error al guardar gasto");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar gasto");
    }
  };

  const handleEdit = (gasto: Gasto) => {
    setEditingGasto(gasto);
    setFormData({
      concepto: gasto.concepto,
      descripcion: gasto.descripcion || "",
      monto: gasto.monto.toString(),
      esCompartido: gasto.esCompartido,
      porcentajeArtista: (gasto.porcentajeArtista || 50).toString(),
      porcentajeBayer: (gasto.porcentajeBayer || 50).toString(),
      proveedor: gasto.proveedor || "",
      pagado: gasto.pagado,
    });
    setShowForm(true);
  };

  const handleDelete = async (gastoId: string) => {
    if (!confirm("¿Eliminar este gasto?")) return;

    try {
      const res = await fetch(
        `/api/admin/eventos/${eventoId}/gastos/${gastoId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        fetchGastos();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleTogglePagado = async (gastoId: string) => {
    try {
      const res = await fetch(
        `/api/admin/eventos/${eventoId}/gastos/${gastoId}`,
        { method: "PATCH" }
      );

      if (res.ok) {
        fetchGastos();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
  const totalCompartidos = gastos
    .filter((g) => g.esCompartido)
    .reduce((sum, g) => sum + g.monto, 0);
  const totalExclusivos = gastos
    .filter((g) => !g.esCompartido)
    .reduce((sum, g) => sum + g.monto, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? "outline" : "default"}
        >
          {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showForm ? "Cancelar" : "Agregar Gasto"}
        </Button>
      </div>
        {/* Formulario */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="concepto">Concepto *</Label>
                <Input
                  id="concepto"
                  value={formData.concepto}
                  onChange={(e) =>
                    setFormData({ ...formData, concepto: e.target.value })
                  }
                  required
                  placeholder="Ej: Sonidista"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monto">Monto (ARS) *</Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  value={formData.monto}
                  onChange={(e) =>
                    setFormData({ ...formData, monto: e.target.value })
                  }
                  required
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                placeholder="Detalles adicionales..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Input
                id="proveedor"
                value={formData.proveedor}
                onChange={(e) =>
                  setFormData({ ...formData, proveedor: e.target.value })
                }
                placeholder="Nombre del proveedor/prestador"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="esCompartido"
                checked={formData.esCompartido}
                onChange={(e) =>
                  setFormData({ ...formData, esCompartido: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="esCompartido">
                Gasto compartido con el artista/productor
              </Label>
            </div>

            {formData.esCompartido && (
              <div className="grid gap-4 md:grid-cols-2 p-3 border rounded bg-blue-50 dark:bg-blue-900/20">
                <div className="space-y-2">
                  <Label htmlFor="porcentajeArtista">% Artista</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="porcentajeArtista"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.porcentajeArtista}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setFormData({
                          ...formData,
                          porcentajeArtista: val.toString(),
                          porcentajeBayer: (100 - val).toString(),
                        });
                      }}
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="porcentajeBayer">% Bayer</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="porcentajeBayer"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.porcentajeBayer}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setFormData({
                          ...formData,
                          porcentajeBayer: val.toString(),
                          porcentajeArtista: (100 - val).toString(),
                        });
                      }}
                    />
                    <span>%</span>
                  </div>
                </div>

                {parseInt(formData.porcentajeArtista) +
                  parseInt(formData.porcentajeBayer) !==
                  100 && (
                  <p className="text-sm text-red-600 col-span-2">
                    ⚠️ Los porcentajes deben sumar 100%
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pagado"
                checked={formData.pagado}
                onChange={(e) =>
                  setFormData({ ...formData, pagado: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="pagado">Marcar como pagado</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingGasto ? "Actualizar" : "Agregar"} Gasto
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {/* Resumen */}
        {gastos.length > 0 && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Total Gastos</p>
              <p className="text-lg font-bold">
                ${totalGastos.toLocaleString("es-AR")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Compartidos</p>
              <p className="text-lg font-bold text-blue-600">
                ${totalCompartidos.toLocaleString("es-AR")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Exclusivos Bayer</p>
              <p className="text-lg font-bold text-purple-600">
                ${totalExclusivos.toLocaleString("es-AR")}
              </p>
            </div>
          </div>
        )}

        {/* Lista de Gastos */}
        {loading ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : gastos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay gastos registrados</p>
            <p className="text-sm mt-1">
              Agrega gastos para calcular el bordereau
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {gastos.map((gasto) => (
              <div
                key={gasto.id}
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{gasto.concepto}</h4>
                      {gasto.esCompartido ? (
                        <Badge variant="outline" className="text-xs">
                          Compartido
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Exclusivo Bayer
                        </Badge>
                      )}
                      <Badge
                        variant={gasto.pagado ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {gasto.pagado ? "Pagado" : "Pendiente"}
                      </Badge>
                    </div>

                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      ${gasto.monto.toLocaleString("es-AR")}
                    </p>

                    {gasto.esCompartido && (
                      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                        <div>
                          <span className="text-gray-500">
                            Artista ({gasto.porcentajeArtista}%):
                          </span>{" "}
                          <span className="font-medium">
                            $
                            {(
                              (gasto.monto * (gasto.porcentajeArtista || 50)) /
                              100
                            ).toLocaleString("es-AR")}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">
                            Bayer ({gasto.porcentajeBayer}%):
                          </span>{" "}
                          <span className="font-medium">
                            $
                            {(
                              (gasto.monto * (gasto.porcentajeBayer || 50)) /
                              100
                            ).toLocaleString("es-AR")}
                          </span>
                        </div>
                      </div>
                    )}

                    {gasto.descripcion && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {gasto.descripcion}
                      </p>
                    )}

                    {gasto.proveedor && (
                      <p className="text-xs text-gray-500">
                        Proveedor: {gasto.proveedor}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePagado(gasto.id)}
                      title={gasto.pagado ? "Marcar no pagado" : "Marcar pagado"}
                    >
                      <Check
                        className={`h-4 w-4 ${
                          gasto.pagado ? "text-green-600" : "text-gray-400"
                        }`}
                      />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(gasto)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(gasto.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
