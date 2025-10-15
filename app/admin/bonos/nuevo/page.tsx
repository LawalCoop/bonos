"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Tag } from "lucide-react";
import Link from "next/link";
import { PrecioDesglose } from "@/components/precio-desglose";

interface Evento {
  id: string;
  nombre: string;
  fecha: Date;
  precioBase: number;
  estado: string;
}

interface EventoInfo {
  evento: {
    id: string;
    nombre: string;
    precio: number;
  };
  promociones: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    tipo: string;
    valor: number;
  }>;
}

interface CalculoDescuentos {
  precioBase: number;
  descuentos: Array<{
    tipo: string;
    nombre: string;
    porcentaje: number;
    monto: number;
  }>;
  totalDescuento: number;
  precioFinal: number;
}

export default function NuevoBonoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoInfo, setEventoInfo] = useState<EventoInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [calculoDescuentos, setCalculoDescuentos] = useState<CalculoDescuentos | null>(null);
  const [loadingDescuentos, setLoadingDescuentos] = useState(false);
  const [formData, setFormData] = useState({
    eventoId: "",
    cantidad: 1,
    metodoPago: "efectivo",
    email: "",
    telefono: "",
    nombre: "",
  });

  useEffect(() => {
    // Fetch eventos
    fetch("/api/admin/eventos")
      .then((res) => res.json())
      .then((data) => {
        const availableEventos = data.filter(
          (e: Evento) =>
            e.estado === "PROGRAMADO" || e.estado === "PUBLICADO"
        );
        setEventos(availableEventos);
      })
      .catch((err) => {
        console.error("Error fetching eventos:", err);
      });
  }, []);

  // Fetch event info when eventoId changes
  useEffect(() => {
    if (formData.eventoId) {
      setLoadingInfo(true);
      fetch(`/api/admin/eventos/${formData.eventoId}/info`)
        .then((res) => res.json())
        .then((data) => {
          setEventoInfo(data);
          setLoadingInfo(false);
        })
        .catch((error) => {
          console.error("Error fetching event info:", error);
          setLoadingInfo(false);
        });
    } else {
      setEventoInfo(null);
    }
  }, [formData.eventoId]);

  // Fetch descuentos when email or cantidad changes
  useEffect(() => {
    console.log("useEffect descuentos triggered", { eventoId: formData.eventoId, email: formData.email, hasAt: formData.email.includes('@') });
    if (formData.eventoId && formData.email && formData.email.includes('@')) {
      setLoadingDescuentos(true);
      const url = `/api/eventos/${formData.eventoId}/descuentos?cantidad=${formData.cantidad}&email=${encodeURIComponent(formData.email)}`;
      console.log("Fetching descuentos from:", url);
      // Calcular descuentos usando el email directamente
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          console.log("Descuentos received:", data);
          setCalculoDescuentos(data);
          setLoadingDescuentos(false);
        })
        .catch((error) => {
          console.error("Error fetching descuentos:", error);
          setCalculoDescuentos(null);
          setLoadingDescuentos(false);
        });
    } else {
      setCalculoDescuentos(null);
    }
  }, [formData.eventoId, formData.email, formData.cantidad]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/bonos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear bono");
      }

      // Redirect to bonos list
      router.push("/admin/bonos");
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/bonos">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Crear Bono Manual
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Registra una venta realizada fuera del sistema
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Bono</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="eventoId">Evento *</Label>
              <Select
                value={formData.eventoId}
                onValueChange={(value) =>
                  setFormData({ ...formData, eventoId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un evento" />
                </SelectTrigger>
                <SelectContent>
                  {eventos.map((evento) => (
                    <SelectItem key={evento.id} value={evento.id}>
                      {evento.nombre} - ${evento.precioBase} -{" "}
                      {new Date(evento.fecha).toLocaleDateString("es-AR")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email">Email del Cliente (opcional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="cliente@ejemplo.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ingresá el email para calcular descuentos personalizados
              </p>
            </div>

            {/* Event pricing info */}
            {formData.eventoId && (
              <>
                {(loadingInfo || loadingDescuentos) ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">
                      Cargando info del evento...
                    </span>
                  </div>
                ) : eventoInfo ? (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                          <p>Precio del evento:</p>
                        </div>
                        <PrecioDesglose
                          precioBase={eventoInfo.evento.precio * formData.cantidad}
                          precioFinal={
                            calculoDescuentos
                              ? calculoDescuentos.precioFinal
                              : eventoInfo.promociones && eventoInfo.promociones.length > 0
                              ? (() => {
                                  const promo = eventoInfo.promociones[0];
                                  const precioBase = eventoInfo.evento.precio;
                                  if (promo.tipo === "2x1") {
                                    return (precioBase / 2) * formData.cantidad;
                                  } else if (promo.tipo === "PORCENTAJE") {
                                    return precioBase * (1 - promo.valor / 100) * formData.cantidad;
                                  } else if (promo.tipo === "MONTO_FIJO") {
                                    return (precioBase - promo.valor) * formData.cantidad;
                                  }
                                  return precioBase * formData.cantidad;
                                })()
                              : eventoInfo.evento.precio * formData.cantidad
                          }
                          tipoDescuento={
                            calculoDescuentos && calculoDescuentos.descuentos.length > 0
                              ? calculoDescuentos.descuentos.some(d => d.tipo?.includes("PROMOCION"))
                                ? "promocion"
                                : "descuentos"
                              : eventoInfo.promociones && eventoInfo.promociones.length > 0
                              ? "promocion"
                              : "ninguno"
                          }
                          promocion={
                            calculoDescuentos && calculoDescuentos.descuentos.length > 0
                              ? calculoDescuentos.descuentos.find(d => d.tipo?.includes("PROMOCION"))
                                ? {
                                    nombre: calculoDescuentos.descuentos.find(d => d.tipo?.includes("PROMOCION"))!.nombre,
                                    tipo: calculoDescuentos.descuentos.find(d => d.tipo === "PROMOCION_2X1")?.tipo === "PROMOCION_2X1" ? "2x1" : "PORCENTAJE",
                                    valor: calculoDescuentos.descuentos.find(d => d.tipo?.includes("PROMOCION"))!.porcentaje || 0,
                                  }
                                : undefined
                              : eventoInfo.promociones && eventoInfo.promociones.length > 0
                              ? {
                                  nombre: eventoInfo.promociones[0].nombre,
                                  tipo: eventoInfo.promociones[0].tipo,
                                  valor: eventoInfo.promociones[0].valor,
                                }
                              : undefined
                          }
                          descuentos={
                            calculoDescuentos
                              ? calculoDescuentos.descuentos.filter(d => !d.tipo?.includes("PROMOCION"))
                              : []
                          }
                          totalDescuentoPorcentaje={
                            calculoDescuentos && calculoDescuentos.descuentos.length > 0
                              ? calculoDescuentos.descuentos
                                  .filter(d => !d.tipo?.includes("PROMOCION"))
                                  .reduce((sum, d) => sum + d.porcentaje, 0)
                              : 0
                          }
                        />
                        {formData.cantidad > 1 && (
                          <p className="text-xs text-muted-foreground">
                            Cantidad: {formData.cantidad} bono{formData.cantidad > 1 ? 's' : ''}
                          </p>
                        )}
                        {formData.email && !calculoDescuentos && !loadingDescuentos && (
                          <p className="text-xs text-yellow-600">
                            No se encontró un usuario con ese email
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </>
            )}

            <div>
              <Label htmlFor="cantidad">Cantidad de Bonos</Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                value={formData.cantidad}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cantidad: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="metodoPago">Método de Pago *</Label>
              <Select
                value={formData.metodoPago}
                onValueChange={(value) =>
                  setFormData({ ...formData, metodoPago: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="mercadopago">MercadoPago</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="nombre">Nombre del Cliente (opcional)</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Juan Pérez"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="telefono">Teléfono (opcional)</Label>
              <Input
                id="telefono"
                type="tel"
                placeholder="+54 9 11 1234-5678"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={loading || !formData.eventoId}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Bono"
                )}
              </Button>
              <Link href="/admin/bonos">
                <Button type="button" variant="outline">
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
