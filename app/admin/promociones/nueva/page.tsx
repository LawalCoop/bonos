"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Evento {
  id: string;
  nombre: string;
  fecha: Date;
  estado: string;
}

export default function NuevaPromocionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "PORCENTAJE",
    valor: 0,
    activo: true,
    prioridad: 1,
    requiereAuth: false,
    codigo: "",
    fechaInicio: "",
    fechaFin: "",
    eventoId: "GLOBAL",
  });

  useEffect(() => {
    fetch("/api/admin/eventos")
      .then((res) => res.json())
      .then((data) => {
        const availableEventos = data.filter(
          (e: Evento) => e.estado === "PROGRAMADO" || e.estado === "PUBLICADO"
        );
        setEventos(availableEventos);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        valor: Number(formData.valor),
        prioridad: Number(formData.prioridad),
        eventoId: formData.eventoId === "GLOBAL" ? null : formData.eventoId,
        codigo: formData.codigo || null,
      };

      const res = await fetch("/api/admin/promociones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/promociones");
        router.refresh();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || "No se pudo crear la promoción"}`);
      }
    } catch (error) {
      console.error("Error creating promocion:", error);
      alert("Error al crear la promoción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/promociones">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Nueva Promoción
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Crea una nueva promoción o descuento
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Promoción</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre y Descripción */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  placeholder="Ej: Descuento Early Bird"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">
                  Descripción <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  placeholder="Ej: 20% de descuento para los primeros 50 compradores"
                  required
                />
              </div>
            </div>

            {/* Tipo y Valor */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tipo">
                  Tipo de Descuento <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PORCENTAJE">Porcentaje (%)</SelectItem>
                    <SelectItem value="MONTO_FIJO">Monto Fijo ($)</SelectItem>
                    <SelectItem value="2x1">2x1</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">
                  Valor {formData.tipo === "2x1" ? "(no aplicable)" : <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="valor"
                  type="number"
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: Number(e.target.value) })
                  }
                  placeholder={
                    formData.tipo === "PORCENTAJE" ? "Ej: 20" : "Ej: 500"
                  }
                  disabled={formData.tipo === "2x1"}
                  required={formData.tipo !== "2x1"}
                />
                <p className="text-xs text-gray-500">
                  {formData.tipo === "PORCENTAJE" && "Porcentaje de descuento"}
                  {formData.tipo === "MONTO_FIJO" && "Monto en pesos"}
                  {formData.tipo === "2x1" && "Compra 1 y lleva 2"}
                </p>
              </div>
            </div>

            {/* Fechas */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">
                  Fecha de Inicio <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fechaInicio"
                  type="datetime-local"
                  value={formData.fechaInicio}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaInicio: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaFin">
                  Fecha de Fin <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fechaFin"
                  type="datetime-local"
                  value={formData.fechaFin}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaFin: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Evento y Código */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eventoId">Evento (opcional)</Label>
                <Select
                  value={formData.eventoId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, eventoId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GLOBAL">Global (todos los eventos)</SelectItem>
                    {eventos.map((evento) => (
                      <SelectItem key={evento.id} value={evento.id}>
                        {evento.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Selecciona "Global" para aplicar a todos los eventos
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo">Código (opcional)</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      codigo: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="Ej: EARLYBIRD2024"
                />
                <p className="text-xs text-gray-500">
                  Si no especificas código, se aplica automáticamente
                </p>
              </div>
            </div>

            {/* Prioridad */}
            <div className="space-y-2">
              <Label htmlFor="prioridad">Prioridad</Label>
              <Input
                id="prioridad"
                type="number"
                min="1"
                value={formData.prioridad}
                onChange={(e) =>
                  setFormData({ ...formData, prioridad: Number(e.target.value) })
                }
              />
              <p className="text-xs text-gray-500">
                Mayor prioridad = se aplica primero cuando hay múltiples descuentos
              </p>
            </div>

            {/* Switches */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="activo" className="text-base">
                    Promoción Activa
                  </Label>
                  <p className="text-sm text-gray-500">
                    La promoción estará visible y aplicable
                  </p>
                </div>
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, activo: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="requiereAuth" className="text-base">
                    Requiere Login
                  </Label>
                  <p className="text-sm text-gray-500">
                    Solo usuarios registrados pueden usar esta promoción
                  </p>
                </div>
                <Switch
                  id="requiereAuth"
                  checked={formData.requiereAuth}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, requiereAuth: checked })
                  }
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Promoción"}
              </Button>
              <Link href="/admin/promociones">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
