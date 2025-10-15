"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle } from "lucide-react";
import { PrecioDesglose } from "@/components/precio-desglose";
import { DistribucionDinero } from "@/components/distribucion-dinero";

interface DescuentoAplicado {
  tipo: string;
  nombre: string;
  porcentaje: number;
  monto: number;
}

interface CalculoDescuentos {
  precioBase: number;
  descuentos: DescuentoAplicado[];
  totalDescuento: number;
  precioFinal: number;
}

export default function ComprarBonoPage({ params }: { params: { slug: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [evento, setEvento] = useState<any>(null);
  const [cantidad, setCantidad] = useState(1);
  const [calculo, setCalculo] = useState<CalculoDescuentos | null>(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [objetivoActivo, setObjetivoActivo] = useState<any>(null);
  const [porcentajeObjetivo, setPorcentajeObjetivo] = useState<number>(0);

  useEffect(() => {
    async function fetchEvento() {
      try {
        const res = await fetch(`/api/eventos?slug=${params.slug}`);
        const data = await res.json();
        if (data.length > 0) {
          setEvento(data[0]);

          // Fetch objetivo activo
          const objRes = await fetch('/api/objetivos/activo');
          if (objRes.ok) {
            const objData = await objRes.json();
            setObjetivoActivo(objData);

            // Si hay objetivo activo, buscar el porcentaje para este evento
            if (objData && objData.id) {
              const eventoObjRes = await fetch(`/api/eventos/${data[0].id}/objetivo/${objData.id}`);
              if (eventoObjRes.ok) {
                const eventoObjData = await eventoObjRes.json();
                setPorcentajeObjetivo(eventoObjData.porcentaje || 0);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error cargando evento:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvento();
  }, [params.slug]);

  useEffect(() => {
    if (!evento) return;

    async function fetchDescuentos() {
      try {
        const res = await fetch(
          `/api/eventos/${evento.id}/descuentos?cantidad=${cantidad}`
        );
        const data = await res.json();
        setCalculo(data);
      } catch (error) {
        console.error("Error calculando descuentos:", error);
      }
    }

    fetchDescuentos();
  }, [evento, cantidad, session]);

  const handleComprar = async () => {
    if (!session) {
      router.push(`/api/auth/signin?callbackUrl=/eventos/${params.slug}/comprar`);
      return;
    }

    if (!evento) return;

    setProcesando(true);
    try {
      const res = await fetch("/api/pagos/crear-preferencia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventoId: evento.id,
          cantidad,
        }),
      });

      const data = await res.json();

      if (data.initPoint) {
        // Redirigir a Mercado Pago
        window.location.href = data.initPoint;
      } else {
        alert("Error al crear la preferencia de pago");
        setProcesando(false);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al procesar el pago");
      setProcesando(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg">Evento no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sacar bono</h1>
          <p className="text-xl text-muted-foreground mt-2">{evento.nombre}</p>
        </div>

        {/* Selección de cantidad */}
        <Card>
          <CardHeader>
            <CardTitle>Cantidad de bonos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                disabled={cantidad <= 1}
              >
                -
              </Button>
              <span className="text-2xl font-bold w-12 text-center">{cantidad}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCantidad(Math.min(10, cantidad + 1))}
                disabled={cantidad >= 10}
              >
                +
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Máximo 10 bonos por compra
            </p>
          </CardContent>
        </Card>

        {/* Resumen de descuentos */}
        {calculo && (
          <Card>
            <CardHeader>
              <CardTitle>Resumen de tu compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session ? (
                <>
                  {/* Información de cantidad */}
                  {cantidad > 1 && (
                    <div className="text-sm text-muted-foreground">
                      <p>Comprando {cantidad} bonos</p>
                    </div>
                  )}

                  {/* Componente de precio con desglose */}
                  <PrecioDesglose
                    precioBase={calculo.precioBase * cantidad}
                    precioFinal={calculo.precioFinal}
                    tipoDescuento={
                      calculo.descuentos.some(d => d.tipo === "PROMOCION_2X1") ||
                      calculo.descuentos.some(d => d.tipo?.includes("PROMOCION"))
                        ? "promocion"
                        : calculo.descuentos.length > 0
                        ? "descuentos"
                        : "ninguno"
                    }
                    promocion={
                      calculo.descuentos.find(d => d.tipo === "PROMOCION_2X1" || d.tipo?.includes("PROMOCION"))
                        ? {
                            nombre: calculo.descuentos.find(d => d.tipo === "PROMOCION_2X1" || d.tipo?.includes("PROMOCION"))!.nombre,
                            tipo: calculo.descuentos.find(d => d.tipo === "PROMOCION_2X1")?.tipo === "PROMOCION_2X1" ? "2x1" : "PORCENTAJE",
                            valor: calculo.descuentos.find(d => d.tipo === "PROMOCION_2X1" || d.tipo?.includes("PROMOCION"))!.porcentaje || 0,
                          }
                        : undefined
                    }
                    descuentos={calculo.descuentos.filter(d => !d.tipo?.includes("PROMOCION"))}
                    totalDescuentoPorcentaje={calculo.descuentos.reduce((sum, d) => sum + d.porcentaje, 0)}
                  />
                </>
              ) : (
                <>
                  {/* Sin sesión - mostrar precio base */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Precio base x {cantidad}</span>
                      <span>${(calculo.precioBase * cantidad).toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total a pagar</span>
                      <span>${calculo.precioFinal.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      ¡Iniciá sesión para acceder a descuentos de hasta 50%!
                    </p>
                  </div>
                </>
              )}

              <Button
                size="lg"
                className="w-full"
                onClick={handleComprar}
                disabled={procesando}
              >
                {procesando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : session ? (
                  `Pagar con Mercado Pago`
                ) : (
                  "Iniciar sesión para comprar"
                )}
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                <p>
                  Al confirmar la compra, recibirás tu bono por email con un código QR.
                  Todo lo recaudado va para les artistas y la ampliación de la biblioteca.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Distribución del dinero */}
        {calculo && evento && (
          <DistribucionDinero
            precioTotal={calculo.precioFinal}
            porcentajeArtista={evento.porcentajeArtista || 70}
            porcentajeBayer={evento.porcentajeBayer || 30}
            showDetails={true}
          />
        )}
      </div>
    </div>
  );
}
