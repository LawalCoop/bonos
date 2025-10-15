"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Loader2, QrCode, CheckCircle2, Banknote, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import QRCodeStyling from "qr-code-styling";
import { PrecioDesglose } from "@/components/precio-desglose";

interface VentaRapidaProps {
  eventoId: string;
  eventoNombre: string;
}

interface VentaState {
  status: "idle" | "loading" | "payment" | "success";
  preferenceId?: string;
  paymentUrl?: string;
  bonoQR?: string;
  bonoCode?: string;
  error?: string;
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

export function VentaRapida({ eventoId, eventoNombre }: VentaRapidaProps) {
  const [open, setOpen] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [metodoPago, setMetodoPago] = useState<"mercadopago" | "efectivo" | "transferencia" | "otro">("mercadopago");
  const [ventaState, setVentaState] = useState<VentaState>({ status: "idle" });
  const [eventoInfo, setEventoInfo] = useState<EventoInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [calculoDescuentos, setCalculoDescuentos] = useState<CalculoDescuentos | null>(null);
  const [loadingDescuentos, setLoadingDescuentos] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const bonoQrRef = useRef<HTMLDivElement>(null);

  // Fetch event info when dialog opens
  useEffect(() => {
    if (open && eventoId && !eventoInfo) {
      setLoadingInfo(true);
      fetch(`/api/admin/eventos/${eventoId}/info`)
        .then((res) => res.json())
        .then((data) => {
          setEventoInfo(data);
          setLoadingInfo(false);
        })
        .catch((error) => {
          console.error("Error fetching event info:", error);
          setLoadingInfo(false);
        });
    }
  }, [open, eventoId, eventoInfo]);

  // Fetch descuentos when email or cantidad changes
  useEffect(() => {
    if (open && eventoId && email && email.includes('@')) {
      setLoadingDescuentos(true);
      fetch(
        `/api/eventos/${eventoId}/descuentos?cantidad=${cantidad}&email=${encodeURIComponent(email)}`
      )
        .then((res) => res.json())
        .then((data) => {
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
  }, [open, eventoId, email, cantidad]);

  // Generate payment QR
  useEffect(() => {
    if (ventaState.status === "payment" && ventaState.paymentUrl && qrRef.current) {
      qrRef.current.innerHTML = "";
      const qrCode = new QRCodeStyling({
        width: 300,
        height: 300,
        data: ventaState.paymentUrl,
        margin: 10,
        qrOptions: { typeNumber: 0, mode: "Byte", errorCorrectionLevel: "Q" },
        imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 0 },
        dotsOptions: { type: "rounded", color: "#000000" },
        backgroundOptions: { color: "#ffffff" },
        cornersSquareOptions: { type: "extra-rounded", color: "#000000" },
        cornersDotOptions: { type: "dot", color: "#000000" },
      });
      qrCode.append(qrRef.current);
    }
  }, [ventaState.status, ventaState.paymentUrl]);

  // Generate bono QR
  useEffect(() => {
    if (ventaState.status === "success" && ventaState.bonoQR && bonoQrRef.current) {
      bonoQrRef.current.innerHTML = "";
      const qrCode = new QRCodeStyling({
        width: 400,
        height: 400,
        data: ventaState.bonoQR,
        margin: 10,
        qrOptions: { typeNumber: 0, mode: "Byte", errorCorrectionLevel: "Q" },
        imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 0 },
        dotsOptions: { type: "rounded", color: "#000000" },
        backgroundOptions: { color: "#ffffff" },
        cornersSquareOptions: { type: "extra-rounded", color: "#000000" },
        cornersDotOptions: { type: "dot", color: "#000000" },
      });
      qrCode.append(bonoQrRef.current);
    }
  }, [ventaState.status, ventaState.bonoQR]);

  const handleVenderEntrada = async () => {
    setVentaState({ status: "loading" });

    try {
      const res = await fetch(`/api/admin/eventos/${eventoId}/venta-rapida`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cantidad: parseInt(cantidad.toString()),
          email: email || undefined,
          telefono: telefono || undefined,
          metodoPago,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear venta");
      }

      // Si es efectivo u otro método, el bono ya está creado y pagado
      if (metodoPago !== "mercadopago") {
        setVentaState({
          status: "success",
          bonoQR: data.bonos[0].qrCode,
          bonoCode: data.bonos[0].codigo,
        });
      } else {
        // Si es MercadoPago, mostrar QR de pago
        setVentaState({
          status: "payment",
          preferenceId: data.preferenceId,
          paymentUrl: data.init_point,
        });

        // Poll for payment status
        pollPaymentStatus(data.preferenceId);
      }
    } catch (error: any) {
      setVentaState({
        status: "idle",
        error: error.message,
      });
    }
  };

  const pollPaymentStatus = async (preferenceId: string) => {
    const checkPayment = async () => {
      try {
        const res = await fetch(
          `/api/admin/eventos/${eventoId}/venta-rapida/status?preferenceId=${preferenceId}`
        );
        const data = await res.json();

        if (data.status === "approved") {
          setVentaState({
            status: "success",
            bonoQR: data.bonoQR,
            bonoCode: data.bonoCode,
          });
        } else if (data.status === "pending") {
          // Continue polling
          setTimeout(checkPayment, 2000);
        }
      } catch (error) {
        console.error("Error checking payment:", error);
        setTimeout(checkPayment, 2000);
      }
    };

    checkPayment();
  };

  const resetVenta = () => {
    setVentaState({ status: "idle" });
    setCantidad(1);
    setEmail("");
    setTelefono("");
    setMetodoPago("mercadopago");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="outline"
          className="w-full h-14 lg:h-12 text-lg lg:text-base font-semibold border-2 border-green-600 text-green-600 hover:bg-green-50"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Vender Entrada en Puerta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Venta Rápida en Puerta</DialogTitle>
          <DialogDescription>
            {eventoNombre}
          </DialogDescription>
        </DialogHeader>

        {ventaState.status === "idle" && (
          <div className="space-y-4">
            {/* Event pricing info */}
            {(loadingInfo || loadingDescuentos) ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Cargando info...</span>
              </div>
            ) : eventoInfo ? (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p>Precio del evento:</p>
                    </div>
                    <PrecioDesglose
                      precioBase={eventoInfo.evento.precio * cantidad}
                      precioFinal={
                        calculoDescuentos
                          ? calculoDescuentos.precioFinal
                          : eventoInfo.promociones && eventoInfo.promociones.length > 0
                          ? (() => {
                              const promo = eventoInfo.promociones[0];
                              const precioBase = eventoInfo.evento.precio;
                              if (promo.tipo === "2x1") {
                                return (precioBase / 2) * cantidad;
                              } else if (promo.tipo === "PORCENTAJE") {
                                return precioBase * (1 - promo.valor / 100) * cantidad;
                              } else if (promo.tipo === "MONTO_FIJO") {
                                return (precioBase - promo.valor) * cantidad;
                              }
                              return precioBase * cantidad;
                            })()
                          : eventoInfo.evento.precio * cantidad
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
                    {cantidad > 1 && (
                      <p className="text-xs text-muted-foreground">
                        Cantidad: {cantidad} entrada{cantidad > 1 ? 's' : ''}
                      </p>
                    )}
                    {email && !calculoDescuentos && !loadingDescuentos && (
                      <p className="text-xs text-yellow-600">
                        No se encontró un usuario con ese email
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <div>
              <Label htmlFor="cantidad">Cantidad de Entradas</Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <Label htmlFor="metodoPago">Método de Pago</Label>
              <Select value={metodoPago} onValueChange={(value: any) => setMetodoPago(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mercadopago">MercadoPago (QR)</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="cliente@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="telefono">Teléfono (opcional)</Label>
              <Input
                id="telefono"
                type="tel"
                placeholder="+54 9 11 1234-5678"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            {ventaState.error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {ventaState.error}
              </div>
            )}

            <Button onClick={handleVenderEntrada} className="w-full">
              {metodoPago === "mercadopago" ? "Generar QR de Pago" : "Generar Entrada"}
            </Button>
          </div>
        )}

        {ventaState.status === "loading" && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
            <p className="text-gray-600">Generando pago...</p>
          </div>
        )}

        {ventaState.status === "payment" && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Escanea el código QR para pagar
              </p>
              <div
                ref={qrRef}
                className="flex justify-center mb-4 bg-white p-4 rounded"
              />
              <p className="text-xs text-gray-500">
                Esperando confirmación de pago...
              </p>
              <div className="mt-4">
                <Loader2 className="h-6 w-6 mx-auto animate-spin text-blue-600" />
              </div>
            </div>
            <Button
              onClick={() => setVentaState({ status: "idle" })}
              variant="outline"
              className="w-full"
            >
              Cancelar y elegir otro método de pago
            </Button>
          </div>
        )}

        {ventaState.status === "success" && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-600 mb-3" />
              <h3 className="text-xl font-bold text-green-600 mb-2">
                ¡Pago Confirmado!
              </h3>
              <p className="text-sm text-gray-600">
                Entrada generada exitosamente
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    QR de Entrada
                  </p>
                  <div
                    ref={bonoQrRef}
                    className="flex justify-center mb-4 bg-white p-4 rounded"
                  />
                  <p className="text-xs font-mono text-gray-500 mb-2">
                    Código: {ventaState.bonoCode}
                  </p>
                  <p className="text-xs text-gray-500">
                    El cliente puede entrar inmediatamente
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button onClick={resetVenta} className="w-full">
              Nueva Venta
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
