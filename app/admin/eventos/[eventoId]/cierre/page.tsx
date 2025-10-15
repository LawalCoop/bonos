"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Target,
  Users,
  Receipt,
  Loader2,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Bordereau {
  evento: {
    nombre: string;
    fecha: string;
    ubicacion: string;
    capacidad: number;
    estado: string;
  };
  artistas: Array<{
    nombre: string;
    rol: string | null;
  }>;
  ventas: {
    totalBonos: number;
    totalRecaudado: number;
    precioPromedio: number;
    porcentajeOcupacion: number;
  };
  gastos: {
    total: number;
    compartidos: {
      total: number;
      artista: number;
      bayer: number;
    };
    noCompartidos: {
      total: number;
    };
  };
  distribucion: {
    porcentajes: {
      artista: number;
      bayer: number;
    };
    ingresosNetos: number;
    artista: {
      montoIngresos: number;
      gastosCompartidos: number;
      montoFinal: number;
    };
    bayer: {
      montoIngresos: number;
      gastosCompartidos: number;
      gastosExclusivos: number;
      montoFinal: number;
    };
  };
  objetivo: {
    id: string;
    nombre: string;
    descripcion: string;
    montoActual: number;
    montoObjetivo: number;
    activo: boolean;
  } | null;
}

export default function CierrePage() {
  const params = useParams();
  const router = useRouter();
  const [bordereau, setBordereau] = useState<Bordereau | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    fetchBordereau();
  }, []);

  const fetchBordereau = async () => {
    try {
      const res = await fetch(`/api/admin/eventos/${params.eventoId}/bordereau`);
      if (res.ok) {
        const data = await res.json();
        setBordereau(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizarEvento = async (asignarAObjetivo: boolean) => {
    if (!bordereau) return;

    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/eventos/${params.eventoId}/cierre`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asignarAObjetivo,
          montoBayer: bordereau.distribucion.bayer.montoFinal,
        }),
      });

      if (res.ok) {
        alert("Evento finalizado exitosamente");
        router.push("/admin/eventos");
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al finalizar evento");
    } finally {
      setProcessing(false);
      setShowConfirmDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!bordereau) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500">No se pudo cargar la información del evento</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if event is already finalized
  if (bordereau.evento.estado === "FINALIZADO") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Cierre de Evento</h1>
            <p className="text-gray-500">{bordereau.evento.nombre}</p>
          </div>
        </div>
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardContent className="py-8 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">
                Este evento ya fue finalizado
              </h2>
              <p className="text-green-700 dark:text-green-300 mt-2">
                El cierre contable y la distribución de fondos ya fueron procesados.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push(`/admin/eventos/${params.eventoId}/bordereau`)}>
                <FileText className="h-4 w-4 mr-2" />
                Ver Bordereau
              </Button>
              <Button variant="outline" onClick={() => router.push("/admin/eventos")}>
                Volver a Eventos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Cierre de Evento</h1>
            <p className="text-gray-500">{bordereau.evento.nombre}</p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/admin/eventos/${params.eventoId}/bordereau`)}
          variant="outline"
        >
          <FileText className="h-4 w-4 mr-2" />
          Ver Bordereau Completo
        </Button>
      </div>

      {/* Warning Alert */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                Esta acción finalizará el evento
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Una vez finalizado, no se podrán realizar más ventas ni modificar los gastos.
                Revisá cuidadosamente toda la información antes de continuar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Ventas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Entradas Vendidas</p>
                <p className="text-2xl font-bold">{bordereau.ventas.totalBonos}</p>
                <p className="text-xs text-gray-500">
                  {bordereau.ventas.porcentajeOcupacion.toFixed(1)}% ocupación
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Recaudado</p>
                <p className="text-2xl font-bold">
                  ${bordereau.ventas.totalRecaudado.toLocaleString("es-AR")}
                </p>
                <p className="text-xs text-gray-500">
                  Promedio: ${bordereau.ventas.precioPromedio.toFixed(0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Gastos</p>
                <p className="text-2xl font-bold text-red-600">
                  -${bordereau.gastos.total.toLocaleString("es-AR")}
                </p>
                <p className="text-xs text-gray-500">
                  Compartidos + Exclusivos
                </p>
              </div>
              <Receipt className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución Final */}
      <Card className="border-2 border-blue-200 dark:border-blue-800">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
          <CardTitle className="text-2xl">Distribución Final</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Ingresos Netos */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Ingresos Netos</p>
            <p className="text-3xl font-bold">
              ${bordereau.distribucion.ingresosNetos.toLocaleString("es-AR")}
            </p>
          </div>

          {/* Split Artista/Bayer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Artista */}
            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Artista/Productor</h3>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {bordereau.distribucion.porcentajes.artista}%
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Ingresos</span>
                  <span className="font-medium">
                    ${bordereau.distribucion.artista.montoIngresos.toLocaleString("es-AR")}
                  </span>
                </div>

                {bordereau.distribucion.artista.gastosCompartidos > 0 && (
                  <div className="flex items-center justify-between text-sm text-red-600">
                    <span>Gastos compartidos</span>
                    <span className="font-medium">
                      -${bordereau.distribucion.artista.gastosCompartidos.toLocaleString("es-AR")}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t-2 border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">Monto Final</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${bordereau.distribucion.artista.montoFinal.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bayer */}
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">La Bayer</h3>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {bordereau.distribucion.porcentajes.bayer}%
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Ingresos</span>
                  <span className="font-medium">
                    ${bordereau.distribucion.bayer.montoIngresos.toLocaleString("es-AR")}
                  </span>
                </div>

                {bordereau.distribucion.bayer.gastosCompartidos > 0 && (
                  <div className="flex items-center justify-between text-sm text-red-600">
                    <span>Gastos compartidos</span>
                    <span className="font-medium">
                      -${bordereau.distribucion.bayer.gastosCompartidos.toLocaleString("es-AR")}
                    </span>
                  </div>
                )}

                {bordereau.distribucion.bayer.gastosExclusivos > 0 && (
                  <div className="flex items-center justify-between text-sm text-red-600">
                    <span>Gastos exclusivos</span>
                    <span className="font-medium">
                      -${bordereau.distribucion.bayer.gastosExclusivos.toLocaleString("es-AR")}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t-2 border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">Monto Final</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${bordereau.distribucion.bayer.montoFinal.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Objetivo Section */}
      {bordereau.objetivo && bordereau.objetivo.activo && (
        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-purple-600" />
              <div className="flex-1">
                <CardTitle>{bordereau.objetivo.nombre}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {bordereau.objetivo.descripcion}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Progreso actual del objetivo</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${bordereau.objetivo.montoActual.toLocaleString("es-AR")}
                </p>
                <p className="text-xs text-gray-500">
                  de ${bordereau.objetivo.montoObjetivo.toLocaleString("es-AR")} (
                  {((bordereau.objetivo.montoActual / bordereau.objetivo.montoObjetivo) * 100).toFixed(1)}%)
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Aporte de este evento</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${bordereau.distribucion.bayer.montoFinal.toLocaleString("es-AR")}
                </p>
                <p className="text-xs text-gray-500">
                  100% de lo que le toca a La Bayer
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💡 <strong>Al finalizar el evento,</strong> tendrás la opción de asignar el monto de La Bayer (
                ${bordereau.distribucion.bayer.montoFinal.toLocaleString("es-AR")}) al objetivo activo.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div>
              <h3 className="font-semibold text-lg">¿Listo para finalizar el evento?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Esta acción marcará el evento como finalizado y {bordereau.objetivo?.activo ? "podrás asignar fondos al objetivo" : "registrará la distribución final"}.
              </p>
            </div>
          </div>

          {!showConfirmDialog ? (
            <Button
              onClick={() => setShowConfirmDialog(true)}
              size="lg"
              className="w-full"
              disabled={processing}
            >
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Finalizar Evento
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border-2 border-amber-200 dark:border-amber-800">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  ¿Estás seguro?
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
                  Esta acción no se puede deshacer. El evento quedará marcado como finalizado.
                </p>

                {bordereau.objetivo && bordereau.objetivo.activo ? (
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleFinalizarEvento(true)}
                      size="lg"
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={processing}
                    >
                      {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <Target className="h-4 w-4 mr-2" />
                      Finalizar y Asignar ${bordereau.distribucion.bayer.montoFinal.toLocaleString("es-AR")} al Objetivo
                    </Button>
                    <Button
                      onClick={() => handleFinalizarEvento(false)}
                      size="lg"
                      variant="outline"
                      className="w-full"
                      disabled={processing}
                    >
                      {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Finalizar sin Asignar al Objetivo
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleFinalizarEvento(false)}
                    size="lg"
                    className="w-full"
                    disabled={processing}
                  >
                    {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Confirmar Finalización
                  </Button>
                )}

                <Button
                  onClick={() => setShowConfirmDialog(false)}
                  variant="ghost"
                  className="w-full mt-2"
                  disabled={processing}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
