"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  Save,
  X,
  Loader2,
  Percent,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface Descuento {
  id: string;
  nombre: string;
  descripcion: string | null;
  tipo: string;
  porcentaje: number;
  esAcumulable: boolean;
  prioridad: number;
  activo: boolean;
  nivelMinimo: number | null;
  vecesVistoMinimo: number | null;
  comprasMesMinimo: number | null;
  organizacionId: string | null;
  organizacion: {
    id: string;
    nombre: string;
  } | null;
}

interface FormData {
  nombre: string;
  descripcion: string;
  tipo: string;
  porcentaje: string;
  esAcumulable: boolean;
  prioridad: string;
  activo: boolean;
  nivelMinimo: string;
  vecesVistoMinimo: string;
  comprasMesMinimo: string;
  organizacionId: string;
}

export default function DescuentosPage() {
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [organizaciones, setOrganizaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    descripcion: "",
    tipo: "NIVEL",
    porcentaje: "",
    esAcumulable: true,
    prioridad: "0",
    activo: true,
    nivelMinimo: "",
    vecesVistoMinimo: "",
    comprasMesMinimo: "",
    organizacionId: "",
  });

  useEffect(() => {
    fetchDescuentos();
    fetchOrganizaciones();
  }, []);

  const fetchDescuentos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/descuentos");
      const data = await res.json();
      if (res.ok) {
        setDescuentos(data);
      }
    } catch (error) {
      console.error("Error fetching descuentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizaciones = async () => {
    try {
      const res = await fetch("/api/admin/organizaciones");
      const data = await res.json();
      if (res.ok) {
        setOrganizaciones(data);
      }
    } catch (error) {
      console.error("Error fetching organizaciones:", error);
    }
  };

  const handleCrear = () => {
    setCreando(true);
    setEditando(null);
    setFormData({
      nombre: "",
      descripcion: "",
      tipo: "NIVEL",
      porcentaje: "",
      esAcumulable: true,
      prioridad: "0",
      activo: true,
      nivelMinimo: "",
      vecesVistoMinimo: "",
      comprasMesMinimo: "",
      organizacionId: "",
    });
  };

  const handleEditar = (descuento: Descuento) => {
    setEditando(descuento.id);
    setCreando(false);
    setFormData({
      nombre: descuento.nombre,
      descripcion: descuento.descripcion || "",
      tipo: descuento.tipo,
      porcentaje: descuento.porcentaje.toString(),
      esAcumulable: descuento.esAcumulable,
      prioridad: descuento.prioridad.toString(),
      activo: descuento.activo,
      nivelMinimo: descuento.nivelMinimo?.toString() || "",
      vecesVistoMinimo: descuento.vecesVistoMinimo?.toString() || "",
      comprasMesMinimo: descuento.comprasMesMinimo?.toString() || "",
      organizacionId: descuento.organizacionId || "",
    });
  };

  const handleCancelar = () => {
    setCreando(false);
    setEditando(null);
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);

      const url = editando
        ? `/api/admin/descuentos/${editando}`
        : "/api/admin/descuentos";

      const method = editando ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          porcentaje: parseFloat(formData.porcentaje),
          prioridad: parseInt(formData.prioridad),
          nivelMinimo: formData.nivelMinimo
            ? parseInt(formData.nivelMinimo)
            : null,
          vecesVistoMinimo: formData.vecesVistoMinimo
            ? parseInt(formData.vecesVistoMinimo)
            : null,
          comprasMesMinimo: formData.comprasMesMinimo
            ? parseInt(formData.comprasMesMinimo)
            : null,
          organizacionId: formData.organizacionId || null,
        }),
      });

      if (res.ok) {
        await fetchDescuentos();
        setCreando(false);
        setEditando(null);
      } else {
        const error = await res.json();
        alert(error.error || "Error al guardar descuento");
      }
    } catch (error) {
      console.error("Error saving descuento:", error);
      alert("Error al guardar descuento");
    } finally {
      setGuardando(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/descuentos/${id}`, {
        method: "PATCH",
      });

      if (res.ok) {
        await fetchDescuentos();
      }
    } catch (error) {
      console.error("Error toggling descuento:", error);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este descuento?")) return;

    try {
      const res = await fetch(`/api/admin/descuentos/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchDescuentos();
      }
    } catch (error) {
      console.error("Error deleting descuento:", error);
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      NIVEL: "Por Nivel",
      VECES_VISTO_ARTISTA: "Veces Visto Artista",
      SOCIO: "Socio/Asociado",
      ORGANIZACION: "Organización/Mutual",
      MULTIPLES_COMPRAS_MES: "Múltiples Compras/Mes",
    };
    return tipos[tipo] || tipo;
  };

  const getTipoBadgeColor = (tipo: string) => {
    const colors: { [key: string]: string } = {
      NIVEL: "bg-blue-600",
      VECES_VISTO_ARTISTA: "bg-purple-600",
      SOCIO: "bg-green-600",
      ORGANIZACION: "bg-orange-600",
      MULTIPLES_COMPRAS_MES: "bg-pink-600",
    };
    return colors[tipo] || "bg-gray-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Descuentos
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
            Configura las reglas de descuentos del sistema
          </p>
        </div>
        {!creando && !editando && (
          <Button onClick={handleCrear} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Descuento
          </Button>
        )}
      </div>

      {/* Formulario Crear/Editar */}
      {(creando || editando) && (
        <Card>
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="text-base md:text-lg">
              {editando ? "Editar Descuento" : "Crear Nuevo Descuento"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  placeholder="Ej: Descuento por Nivel 3"
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950"
                >
                  <option value="NIVEL">Por Nivel</option>
                  <option value="VECES_VISTO_ARTISTA">
                    Veces Visto Artista
                  </option>
                  <option value="SOCIO">Socio/Asociado</option>
                  <option value="ORGANIZACION">Organización/Mutual</option>
                  <option value="MULTIPLES_COMPRAS_MES">
                    Múltiples Compras/Mes
                  </option>
                </select>
              </div>

              <div>
                <Label htmlFor="porcentaje">Porcentaje *</Label>
                <div className="relative">
                  <Input
                    id="porcentaje"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.porcentaje}
                    onChange={(e) =>
                      setFormData({ ...formData, porcentaje: e.target.value })
                    }
                    placeholder="15"
                  />
                  <Percent className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <Label htmlFor="prioridad">Prioridad (orden aplicación)</Label>
                <Input
                  id="prioridad"
                  type="number"
                  value={formData.prioridad}
                  onChange={(e) =>
                    setFormData({ ...formData, prioridad: e.target.value })
                  }
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  placeholder="Descripción del descuento..."
                />
              </div>

              {/* Campos condicionales según tipo */}
              {formData.tipo === "NIVEL" && (
                <div>
                  <Label htmlFor="nivelMinimo">Nivel Mínimo *</Label>
                  <Input
                    id="nivelMinimo"
                    type="number"
                    min="1"
                    max="8"
                    value={formData.nivelMinimo}
                    onChange={(e) =>
                      setFormData({ ...formData, nivelMinimo: e.target.value })
                    }
                    placeholder="3"
                  />
                </div>
              )}

              {formData.tipo === "VECES_VISTO_ARTISTA" && (
                <div>
                  <Label htmlFor="vecesVistoMinimo">
                    Veces Visto Mínimo *
                  </Label>
                  <Input
                    id="vecesVistoMinimo"
                    type="number"
                    min="1"
                    value={formData.vecesVistoMinimo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vecesVistoMinimo: e.target.value,
                      })
                    }
                    placeholder="3"
                  />
                </div>
              )}

              {formData.tipo === "MULTIPLES_COMPRAS_MES" && (
                <div>
                  <Label htmlFor="comprasMesMinimo">
                    Compras en el Mes Mínimo *
                  </Label>
                  <Input
                    id="comprasMesMinimo"
                    type="number"
                    min="2"
                    value={formData.comprasMesMinimo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        comprasMesMinimo: e.target.value,
                      })
                    }
                    placeholder="2"
                  />
                </div>
              )}

              {formData.tipo === "ORGANIZACION" && (
                <div>
                  <Label htmlFor="organizacionId">Organización *</Label>
                  <select
                    id="organizacionId"
                    value={formData.organizacionId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organizacionId: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950"
                  >
                    <option value="">Seleccionar...</option>
                    {organizaciones.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.esAcumulable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        esAcumulable: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Es Acumulable</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) =>
                      setFormData({ ...formData, activo: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Activo</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-6">
              <Button onClick={handleGuardar} disabled={guardando} className="w-full sm:w-auto">
                {guardando ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar
              </Button>
              <Button variant="outline" onClick={handleCancelar} className="w-full sm:w-auto">
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Descuentos */}
      <Card>
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="text-base md:text-lg">Descuentos Configurados ({descuentos.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          {descuentos.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <Percent className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-gray-400" />
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                No hay descuentos configurados todavía
              </p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {descuentos.map((descuento) => (
                <div
                  key={descuento.id}
                  className="p-3 md:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2 mb-2">
                        <h3 className="font-medium text-sm md:text-base text-gray-900 dark:text-white truncate">
                          {descuento.nombre}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge className={getTipoBadgeColor(descuento.tipo)}>
                            {getTipoLabel(descuento.tipo)}
                          </Badge>
                          <Badge variant="outline">
                            {descuento.porcentaje}%
                          </Badge>
                          {descuento.esAcumulable && (
                            <Badge variant="secondary">Acumulable</Badge>
                          )}
                          {!descuento.activo && (
                            <Badge variant="destructive">Inactivo</Badge>
                          )}
                        </div>
                      </div>

                      {descuento.descripcion && (
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {descuento.descripcion}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        <span>Prioridad: {descuento.prioridad}</span>
                        {descuento.nivelMinimo && (
                          <span>Nivel mín: {descuento.nivelMinimo}</span>
                        )}
                        {descuento.vecesVistoMinimo && (
                          <span>
                            Veces visto mín: {descuento.vecesVistoMinimo}
                          </span>
                        )}
                        {descuento.comprasMesMinimo && (
                          <span>
                            Compras/mes mín: {descuento.comprasMesMinimo}
                          </span>
                        )}
                        {descuento.organizacion && (
                          <span className="truncate">Org: {descuento.organizacion.nombre}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(descuento.id)}
                        title={descuento.activo ? "Desactivar" : "Activar"}
                        className="flex-1 sm:flex-none"
                      >
                        {descuento.activo ? (
                          <Power className="h-4 w-4 text-green-600" />
                        ) : (
                          <PowerOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditar(descuento)}
                        className="flex-1 sm:flex-none"
                      >
                        <Edit2 className="h-3 w-3 md:h-4 md:w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEliminar(descuento.id)}
                        className="flex-1 sm:flex-none"
                      >
                        <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-red-600 sm:mr-1" />
                        <span className="hidden sm:inline">Eliminar</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
