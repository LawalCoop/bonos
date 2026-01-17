"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";

interface NivelConfig {
  id?: string;
  nivel: number;
  nombre: string;
  icono: string;
  puntos: number;
  descuento: number;
}

export function NivelesConfig() {
  const [niveles, setNiveles] = useState<NivelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchNiveles();
  }, []);

  const fetchNiveles = async () => {
    try {
      const res = await fetch("/api/admin/niveles");
      const data = await res.json();
      // Asegurarse de que sea un array
      if (Array.isArray(data)) {
        setNiveles(data);
      } else if (data.error) {
        setError(data.error);
      } else {
        setError("Formato de respuesta inválido");
      }
    } catch (error) {
      console.error("Error fetching niveles:", error);
      setError("Error al cargar los niveles");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof NivelConfig, value: string | number) => {
    const newNiveles = [...niveles];
    newNiveles[index] = {
      ...newNiveles[index],
      [field]: field === "puntos" || field === "descuento" || field === "nivel"
        ? Number(value)
        : value,
    };
    setNiveles(newNiveles);
    setSuccess(false);
  };

  const handleAddNivel = () => {
    const lastNivel = niveles[niveles.length - 1];
    const newNivel: NivelConfig = {
      nivel: lastNivel ? lastNivel.nivel + 1 : 1,
      nombre: "Nuevo Nivel",
      icono: "🎯",
      puntos: lastNivel ? lastNivel.puntos + 1000 : 0,
      descuento: lastNivel ? Math.min(lastNivel.descuento + 2, 50) : 0,
    };
    setNiveles([...niveles, newNivel]);
    setSuccess(false);
  };

  const handleRemoveNivel = (index: number) => {
    if (niveles.length <= 1) {
      setError("Debe haber al menos un nivel");
      return;
    }
    const newNiveles = niveles.filter((_, i) => i !== index);
    // Renumerar niveles
    const renumbered = newNiveles.map((n, i) => ({ ...n, nivel: i + 1 }));
    setNiveles(renumbered);
    setSuccess(false);
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/niveles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niveles }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }

      setSuccess(true);
      // Refrescar para obtener los IDs actualizados
      await fetchNiveles();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
          Niveles guardados correctamente
        </div>
      )}

      <div className="space-y-3">
        {niveles.map((nivel, index) => (
          <Card key={nivel.id || index} className="relative">
            <CardContent className="p-3 md:p-4">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
                <div className="space-y-1">
                  <Label className="text-xs">Nivel</Label>
                  <Input
                    type="number"
                    value={nivel.nivel}
                    disabled
                    className="bg-gray-100 dark:bg-gray-800"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Icono</Label>
                  <Input
                    value={nivel.icono}
                    onChange={(e) => handleChange(index, "icono", e.target.value)}
                    className="text-center text-lg"
                    maxLength={4}
                  />
                </div>

                <div className="space-y-1 col-span-2 md:col-span-1">
                  <Label className="text-xs">Nombre</Label>
                  <Input
                    value={nivel.nombre}
                    onChange={(e) => handleChange(index, "nombre", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Puntos</Label>
                  <Input
                    type="number"
                    value={nivel.puntos}
                    onChange={(e) => handleChange(index, "puntos", e.target.value)}
                    min={0}
                    disabled={index === 0} // El primer nivel siempre es 0 puntos
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Descuento %</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={nivel.descuento}
                      onChange={(e) => handleChange(index, "descuento", e.target.value)}
                      min={0}
                      max={100}
                      step={1}
                    />
                    {niveles.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveNivel(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddNivel}
          className="flex-1 sm:flex-none"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Nivel
        </Button>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 sm:flex-none"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Los usuarios suben de nivel al acumular puntos asistiendo a eventos. Cada nivel puede otorgar un porcentaje de descuento.
      </p>
    </div>
  );
}
