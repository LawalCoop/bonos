"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, X, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { GastosEvento } from "./gastos-evento";
import { ArtistaCombobox } from "./artista-combobox";
import { GenerarConIAButton } from "./generar-con-ia-button";
import slugify from "slugify";

interface EventoFormProps {
  evento?: any;
  artistas: Array<{
    id: string;
    nombre: string;
  }>;
  objetivos?: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    montoActual: number;
    montoObjetivo: number;
  }>;
  eventoId?: string;
}

interface ArtistaAsignado {
  artistaId: string;
  orden: number;
  rol: string;
}

export function EventoForm({ evento, artistas: artistasIniciales, objetivos = [], eventoId }: EventoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDistribucion, setShowDistribucion] = useState(false);
  const [showGastos, setShowGastos] = useState(false);
  const [artistas, setArtistas] = useState(artistasIniciales);
  const [formData, setFormData] = useState({
    nombre: evento?.nombre || "",
    slug: evento?.slug || "",
    descripcion: evento?.descripcion || "",
    fecha: evento?.fecha
      ? new Date(evento.fecha).toISOString().split("T")[0]
      : "",
    horaInicio: evento?.horaInicio || "",
    ubicacion: evento?.ubicacion || "La Bayer Experimental",
    capacidad: evento?.capacidad || 100,
    precioBase: evento?.precioBase || 5000,
    porcentajeArtista: evento?.porcentajeArtista || 70,
    porcentajeBayer: evento?.porcentajeBayer || 30,
    imagenPrincipal: evento?.imagenPrincipal || "",
    videoYoutubeId: evento?.videoYoutubeId || "",
  });

  // Estado para el objetivo seleccionado (solo ID, sin porcentaje)
  const [objetivoId, setObjetivoId] = useState<string>(
    evento?.objetivos?.[0]?.objetivoId || ""
  );

  const [artistasAsignados, setArtistasAsignados] = useState<ArtistaAsignado[]>(
    evento?.artistas?.map((ea: any, index: number) => ({
      artistaId: ea.artistaId,
      orden: ea.orden || index + 1,
      rol: ea.rol || "",
    })) || []
  );

  const [selectedArtistaId, setSelectedArtistaId] = useState("");
  const [selectedRol, setSelectedRol] = useState("Headliner");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = evento
        ? `/api/admin/eventos/${evento.id}`
        : "/api/admin/eventos";
      const method = evento ? "PUT" : "POST";

      const payload = {
        ...formData,
        capacidad: parseInt(formData.capacidad.toString()),
        precioBase: parseFloat(formData.precioBase.toString()),
        porcentajeArtista: parseInt(formData.porcentajeArtista.toString()),
        porcentajeBayer: parseInt(formData.porcentajeBayer.toString()),
        artistas: artistasAsignados,
        objetivoId: objetivoId || null,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Si es edición, refrescar la página para ver los cambios
        if (evento) {
          window.location.reload();
        } else {
          // Si es creación, ir a la lista
          router.push("/admin/eventos");
          router.refresh();
        }
      } else {
        const error = await res.json();
        console.error("Error del servidor:", error);
        alert(error.error || "Error al guardar el evento");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar el evento");
    } finally {
      setLoading(false);
    }
  };

  const agregarArtista = () => {
    if (!selectedArtistaId) return;

    // Verificar que no esté ya agregado
    if (artistasAsignados.find((a) => a.artistaId === selectedArtistaId)) {
      return;
    }

    setArtistasAsignados([
      ...artistasAsignados,
      {
        artistaId: selectedArtistaId,
        orden: artistasAsignados.length + 1,
        rol: selectedRol,
      },
    ]);

    setSelectedArtistaId("");
    setSelectedRol("Headliner");
  };

  const eliminarArtista = (artistaId: string) => {
    setArtistasAsignados(
      artistasAsignados
        .filter((a) => a.artistaId !== artistaId)
        .map((a, index) => ({ ...a, orden: index + 1 }))
    );
  };

  const moverArtista = (index: number, direccion: "arriba" | "abajo") => {
    const newArtistas = [...artistasAsignados];
    const targetIndex = direccion === "arriba" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newArtistas.length) return;

    [newArtistas[index], newArtistas[targetIndex]] = [
      newArtistas[targetIndex],
      newArtistas[index],
    ];

    setArtistasAsignados(
      newArtistas.map((a, i) => ({ ...a, orden: i + 1 }))
    );
  };

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nombre = e.target.value;
    setFormData({
      ...formData,
      nombre,
      slug: slugify(nombre, { lower: true, strict: true }),
    });
  };

  return (
    <div className="space-y-6">
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Evento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
      {/* Nombre y Slug */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del Evento *</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={handleNombreChange}
            required
            placeholder="Ej: Noche de Rock Experimental"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) =>
              setFormData({ ...formData, slug: e.target.value })
            }
            required
            placeholder="noche-de-rock-experimental"
          />
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="descripcion">Descripción *</Label>
          <GenerarConIAButton
            tipo="descripcion_evento"
            nombreArtista={
              // Usar el artista seleccionado, o el primero agregado si no hay selección
              selectedArtistaId
                ? artistas.find((a) => a.id === selectedArtistaId)?.nombre || ''
                : artistasAsignados.length > 0
                ? artistas.find((a) => a.id === artistasAsignados[0].artistaId)?.nombre || ''
                : ''
            }
            onTextoGenerado={(texto) =>
              setFormData({ ...formData, descripcion: texto })
            }
            size="sm"
          />
        </div>
        <textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) =>
            setFormData({ ...formData, descripcion: e.target.value })
          }
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe el evento..."
        />
        <p className="text-xs text-muted-foreground">
          💡 Tip: Selecciona un artista para generar la descripción con IA
        </p>
      </div>

      {/* Fecha y Hora */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="fecha">Fecha *</Label>
          <Input
            id="fecha"
            type="date"
            value={formData.fecha}
            onChange={(e) =>
              setFormData({ ...formData, fecha: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="horaInicio">Hora de Inicio *</Label>
          <Input
            id="horaInicio"
            type="time"
            value={formData.horaInicio}
            onChange={(e) =>
              setFormData({ ...formData, horaInicio: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacidad">Capacidad</Label>
          <Input
            id="capacidad"
            type="number"
            value={formData.capacidad}
            onChange={(e) =>
              setFormData({ ...formData, capacidad: parseInt(e.target.value) })
            }
            required
          />
        </div>
      </div>

      {/* Ubicación y Precio */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ubicacion">Ubicación *</Label>
          <Input
            id="ubicacion"
            value={formData.ubicacion}
            onChange={(e) =>
              setFormData({ ...formData, ubicacion: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="precioBase">Precio Base (ARS) *</Label>
          <Input
            id="precioBase"
            type="number"
            step="0.01"
            value={formData.precioBase}
            onChange={(e) =>
              setFormData({
                ...formData,
                precioBase: parseFloat(e.target.value),
              })
            }
            required
          />
        </div>
      </div>

      {/* Imagen y Video */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="imagenPrincipal">URL de Imagen Principal *</Label>
          <Input
            id="imagenPrincipal"
            type="url"
            value={formData.imagenPrincipal}
            onChange={(e) =>
              setFormData({ ...formData, imagenPrincipal: e.target.value })
            }
            required
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="videoYoutubeId">ID de Video YouTube (opcional)</Label>
          <Input
            id="videoYoutubeId"
            value={formData.videoYoutubeId}
            onChange={(e) =>
              setFormData({ ...formData, videoYoutubeId: e.target.value })
            }
            placeholder="dQw4w9WgXcQ"
          />
        </div>
      </div>

      {/* Objetivo Colectivo */}
      {objetivos && objetivos.length > 0 && (
        <div className="space-y-4 p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/20">
          <div>
            <h3 className="font-medium text-lg flex items-center gap-2">
              🎯 Objetivo Colectivo (Opcional)
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              La parte que le toca a La Bayer ({formData.porcentajeBayer}%) irá al objetivo seleccionado
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivoSelect">Seleccionar Objetivo</Label>
            <select
              id="objetivoSelect"
              value={objetivoId}
              onChange={(e) => setObjetivoId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Sin objetivo (va a gastos generales) --</option>
              {objetivos.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.nombre} (${obj.montoActual.toLocaleString()} / ${obj.montoObjetivo.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {objetivoId && (
            <div className="text-sm bg-purple-100 dark:bg-purple-900/30 p-3 rounded">
              {(() => {
                const objetivo = objetivos.find(o => o.id === objetivoId);
                return objetivo ? (
                  <>
                    <strong>{objetivo.nombre}:</strong> {objetivo.descripcion}
                  </>
                ) : null;
              })()}
            </div>
          )}
        </div>
      )}

      {/* Artistas */}
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <h3 className="font-medium text-lg">Artistas del Evento</h3>

        {/* Agregar artista */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-1">
            <Label>Seleccionar Artista</Label>
            <ArtistaCombobox
              artistas={artistas}
              value={selectedArtistaId}
              onValueChange={setSelectedArtistaId}
              excludeIds={artistasAsignados.map((aa) => aa.artistaId)}
              placeholder="Buscar o crear artista..."
              onArtistaCreado={(artista) => {
                setArtistas([...artistas, artista])
                setSelectedArtistaId(artista.id)
              }}
            />
          </div>

          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="rolSelect">Rol</Label>
            <select
              id="rolSelect"
              value={selectedRol}
              onChange={(e) => setSelectedRol(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Headliner">Headliner</option>
              <option value="Telonero">Telonero</option>
              <option value="Invitado">Invitado</option>
              <option value="DJ">DJ</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                agregarArtista();
              }}
              variant="outline"
              disabled={!selectedArtistaId}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>
        </div>

        {/* Lista de artistas asignados */}
        {artistasAsignados.length > 0 && (
          <div className="space-y-2">
            <Label>Artistas agregados (en orden de aparición):</Label>
            {artistasAsignados.map((aa, index) => {
              const artista = artistas.find((a) => a.id === aa.artistaId);
              return (
                <div
                  key={aa.artistaId}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-md border"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">
                      #{aa.orden}
                    </span>
                    <span className="font-medium">{artista?.nombre}</span>
                    {aa.rol && (
                      <Badge variant="secondary" className="text-xs">
                        {aa.rol}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moverArtista(index, "arriba")}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moverArtista(index, "abajo")}
                      disabled={index === artistasAsignados.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => eliminarArtista(aa.artistaId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
        </CardContent>
      </Card>

      {/* Distribución de Ingresos y Gastos - Solo para edición */}
      {evento && eventoId && (
        <>
          {/* Distribución de Ingresos - Colapsable */}
          <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setShowDistribucion(!showDistribucion)}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Distribución de Ingresos</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Define cómo se reparten los ingresos (usado para el bordereau)
                </p>
              </div>
              {showDistribucion ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </CardHeader>

          {showDistribucion && (
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="porcentajeArtista">% Artista/Productor</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="porcentajeArtista"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.porcentajeArtista}
                      onChange={(e) => {
                        const porcentajeArtista = parseInt(e.target.value) || 0;
                        setFormData({
                          ...formData,
                          porcentajeArtista,
                          porcentajeBayer: 100 - porcentajeArtista,
                        });
                      }}
                    />
                    <span className="text-sm font-medium">%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="porcentajeBayer">% La Bayer</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="porcentajeBayer"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.porcentajeBayer}
                      onChange={(e) => {
                        const porcentajeBayer = parseInt(e.target.value) || 0;
                        setFormData({
                          ...formData,
                          porcentajeBayer,
                          porcentajeArtista: 100 - porcentajeBayer,
                        });
                      }}
                    />
                    <span className="text-sm font-medium">%</span>
                  </div>
                </div>
              </div>

              {formData.porcentajeArtista + formData.porcentajeBayer !== 100 && (
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ Los porcentajes deben sumar 100%
                </p>
              )}

              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <strong>Nota:</strong> Los gastos compartidos se restan antes de aplicar esta distribución.
                Los gastos exclusivos de Bayer se restan solo de la parte de Bayer.
              </div>
            </CardContent>
          )}
        </Card>
        </>
      )}

      {/* Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {evento ? "Guardar Cambios" : "Crear Evento"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>

    {/* Gastos del Evento - FUERA del form para evitar anidamiento */}
    {evento && eventoId && (
      <Card>
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          onClick={() => setShowGastos(!showGastos)}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Gastos del Evento</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Gastos compartidos y exclusivos (usado para el bordereau)
              </p>
            </div>
            {showGastos ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </CardHeader>

        {showGastos && (
          <CardContent>
            <GastosEvento eventoId={eventoId} />
          </CardContent>
        )}
      </Card>
    )}
    </div>
  );
}
