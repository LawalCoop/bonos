"use client";

import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  XCircle,
  Scan,
  Loader2,
  AlertCircle,
  Calendar,
  Search,
  User,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VentaRapida } from "@/components/admin/venta-rapida";

interface Evento {
  id: string;
  nombre: string;
  fecha: string;
  estado: string;
}

interface ValidationResult {
  valid: boolean;
  message?: string;
  error?: string;
  tipo?: "bono" | "venta_externa";
  bono?: {
    codigo: string;
    estado: string;
    precioFinal: number;
    evento: {
      nombre: string;
      fecha: string;
      ubicacion: string;
    };
    usuario: {
      name: string;
      nombre: string;
      email: string;
      nivel: number;
    };
  };
  ventaExterna?: {
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
    precio: number;
    cantidad: number;
    vendidoPor?: string;
    utilizado: boolean;
    evento: {
      nombre: string;
      fecha: string;
      ubicacion: string;
    };
  };
  fechaUtilizacion?: string;
}

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [selectedEventoId, setSelectedEventoId] = useState<string>("");
  const [bonosStats, setBonosStats] = useState<{ ingresados: number; totalPagados: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    // Fetch eventos on mount
    fetch("/api/admin/eventos")
      .then((res) => res.json())
      .then((data) => {
        // Filter PROGRAMADOS and PUBLICADOS events
        const availableEventos = data.filter(
          (e: Evento) =>
            e.estado === "PROGRAMADO" || e.estado === "PUBLICADO"
        );
        setEventos(availableEventos);
        // Auto-select first event
        if (availableEventos.length > 0) {
          setSelectedEventoId(availableEventos[0].id);
        }
      })
      .catch((err) => {
        console.error("Error fetching eventos:", err);
      });
  }, []);

  // Fetch bonos stats when evento is selected or after validation
  const fetchBonosStats = () => {
    if (selectedEventoId) {
      fetch(`/api/admin/eventos/${selectedEventoId}/stats-ingreso`)
        .then((res) => res.json())
        .then((data) => setBonosStats(data))
        .catch((err) => console.error("Error fetching stats:", err));
    }
  };

  useEffect(() => {
    fetchBonosStats();
  }, [selectedEventoId]);

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear().catch(() => {
          // Ignore cleanup errors
        });
      }
    };
  }, [scanner]);

  const startScanner = async () => {
    console.log("Starting scanner...");
    setResult(null);
    setError(null);
    setScanning(true);

    // Esperar a que el DOM se actualice
    setTimeout(() => {
      try {
        console.log("Checking for qr-reader element...");
        const element = document.getElementById("qr-reader");

        if (!element) {
          throw new Error("Elemento qr-reader no encontrado en el DOM");
        }

        console.log("Element found, creating scanner...");

        const html5QrcodeScanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            rememberLastUsedCamera: true,
          },
          /* verbose= */ true
        );

        console.log("Scanner created, attempting to render...");

        html5QrcodeScanner.render(
          async (decodedText) => {
            console.log("QR Code detected:", decodedText);
            // Stop scanner
            await html5QrcodeScanner.clear().catch(() => {});
            setScanning(false);

            // Validate ticket
            await validateTicket(decodedText);
          },
          (errorMessage) => {
            // Ignore scanning errors, they're normal during scanning
            // console.log("Scan error (normal):", errorMessage);
          }
        );

        console.log("Scanner render initiated");
        setScanner(html5QrcodeScanner);
      } catch (err: any) {
        console.error("Error starting scanner:", err);
        setError(err.message || "Error al iniciar el escáner. Verifica los permisos de la cámara.");
        setScanning(false);
      }
    }, 100);
  };

  const validateTicket = async (codigo: string) => {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/bonos/validar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo,
          eventoId: selectedEventoId
        }),
      });

      const data = await res.json();
      setResult(data);

      // Update stats after validation
      fetchBonosStats();

      // Play sound feedback
      if (data.valid) {
        playSuccessSound();
      } else {
        playErrorSound();
      }
    } catch (error) {
      console.error("Error:", error);
      setResult({
        valid: false,
        error: "Error al validar el bono",
      });
      playErrorSound();
    } finally {
      setLoading(false);
    }
  };

  const playSuccessSound = () => {
    const audio = new Audio("/sounds/success.mp3");
    audio.play().catch(() => {
      /* Ignore if sound fails */
    });
  };

  const playErrorSound = () => {
    const audio = new Audio("/sounds/error.mp3");
    audio.play().catch(() => {
      /* Ignore if sound fails */
    });
  };

  const resetScanner = () => {
    setResult(null);
    setError(null);
    setScanning(false);
    setSearchQuery("");
    setSearchResults([]);
    if (scanner) {
      scanner.clear().catch(() => {});
      setScanner(null);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !selectedEventoId) return;

    setSearching(true);
    setSearchResults([]);

    try {
      const res = await fetch(`/api/admin/eventos/${selectedEventoId}/buscar-entrada?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();

      if (res.ok) {
        setSearchResults(data.resultados || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = async (codigo: string) => {
    setSearchResults([]);
    setSearchQuery("");
    await validateTicket(codigo);
  };

  return (
    <div className="fixed inset-0 lg:relative lg:inset-auto lg:max-w-2xl lg:mx-auto lg:space-y-6 lg:py-6 bg-white dark:bg-gray-950">
      {/* Header - Solo visible en desktop */}
      <div className="hidden lg:block px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Modalidad Ingreso
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Validación de entradas y venta en puerta
        </p>
      </div>

      <div className="h-full lg:h-auto lg:rounded-lg lg:border lg:shadow-sm bg-white dark:bg-gray-950 flex flex-col">
        {/* Header Mobile/Tablet - Sticky en mobile y tablet */}
        <div className="lg:hidden sticky top-0 z-10 bg-white dark:bg-gray-950 border-b px-6 py-5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Modalidad Ingreso
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
            Validación y venta en puerta
          </p>
        </div>

        <div className="flex-1 lg:flex-none p-6 lg:p-6 space-y-6 lg:space-y-4 overflow-auto">
          {/* Event Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg lg:text-base flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Seleccionar Evento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventos.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No hay eventos disponibles
                </p>
              ) : (
                <Select value={selectedEventoId} onValueChange={setSelectedEventoId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventos.map((evento) => (
                      <SelectItem key={evento.id} value={evento.id}>
                        {evento.nombre} - {new Date(evento.fecha).toLocaleDateString("es-AR")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedEventoId && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Los bonos serán validados para este evento específico
                </p>
              )}
            </CardContent>
          </Card>

          {/* Stats Counter */}
          {selectedEventoId && bonosStats && (
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
                      Progreso de Ingreso
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl lg:text-3xl font-bold text-blue-900 dark:text-blue-100">
                        {bonosStats.ingresados}
                      </span>
                      <span className="text-2xl lg:text-xl text-blue-600 dark:text-blue-400">
                        / {bonosStats.totalPagados}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {bonosStats.totalPagados - bonosStats.ingresados} personas faltantes
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {bonosStats.totalPagados > 0
                        ? Math.round((bonosStats.ingresados / bonosStats.totalPagados) * 100)
                        : 0}%
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      completado
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-300"
                    style={{
                      width: `${bonosStats.totalPagados > 0
                        ? (bonosStats.ingresados / bonosStats.totalPagados) * 100
                        : 0}%`
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Sale */}
          {selectedEventoId && (
            <VentaRapida
              eventoId={selectedEventoId}
              eventoNombre={eventos.find((e) => e.id === selectedEventoId)?.nombre || ""}
            />
          )}

          {/* Manual Search */}
          {selectedEventoId && !scanning && !result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-base flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Búsqueda Manual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500">
                  Busca por apellido, nombre o DNI (útil para ventas externas sin QR o si alguien olvidó su entrada)
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ej: García, Juan, 12345678..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || searching}
                    className="shrink-0"
                  >
                    {searching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Buscar
                      </>
                    )}
                  </Button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map((resultado) => (
                      <button
                        key={resultado.tipo === 'bono' ? resultado.bono.codigo : resultado.venta.id}
                        onClick={() => handleSelectSearchResult(resultado.tipo === 'bono' ? resultado.bono.codigo : resultado.venta.id)}
                        className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">
                              {resultado.tipo === 'bono'
                                ? `${resultado.bono.usuario?.nombre || resultado.bono.usuario?.name || 'Sin nombre'}`
                                : `${resultado.venta.apellido}, ${resultado.venta.nombre}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {resultado.tipo === 'bono'
                                ? `QR • ${resultado.bono.usuario?.email || 'Sin email'}`
                                : `SIN QR • DNI: ${resultado.venta.dni}`}
                            </p>
                            {resultado.tipo === 'venta' && resultado.venta.vendidoPor && (
                              <p className="text-xs text-gray-400">
                                Vendido por: {resultado.venta.vendidoPor}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <Badge variant={resultado.utilizado ? "secondary" : "default"}>
                              {resultado.utilizado ? "Ingresado" : "Pendiente"}
                            </Badge>
                            <p className="text-sm text-gray-500 mt-1">
                              ${resultado.tipo === 'bono' ? resultado.bono.precioFinal : resultado.venta.precio * resultado.venta.cantidad}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery && !searching && searchResults.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No se encontraron resultados para "{searchQuery}"
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-5">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 lg:h-5 lg:w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-lg lg:text-base font-medium text-red-900 dark:text-red-200">
                    Error al iniciar el escáner
                  </h4>
                  <p className="text-base lg:text-sm text-red-700 dark:text-red-300 mt-2">
                    {error}
                  </p>
                  <p className="text-sm lg:text-xs text-red-600 dark:text-red-400 mt-2">
                    Asegúrate de haber dado permisos de cámara al navegador.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!scanning && !result && !error && (
            <div className="text-center py-20 lg:py-12">
              <Scan className="h-32 w-32 lg:h-20 lg:w-20 mx-auto mb-8 lg:mb-6 text-gray-400" />
              <Button
                onClick={startScanner}
                size="lg"
                disabled={!selectedEventoId}
                className="h-16 lg:h-10 px-8 lg:px-4 text-xl lg:text-base font-semibold"
              >
                <Scan className="mr-3 lg:mr-2 h-7 w-7 lg:h-5 lg:w-5" />
                Iniciar Escáner
              </Button>
              {!selectedEventoId && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Selecciona un evento para continuar
                </p>
              )}
            </div>
          )}

          {!scanning && !result && error && (
            <div className="text-center py-20 lg:py-12">
              <Button
                onClick={startScanner}
                size="lg"
                variant="outline"
                className="h-16 lg:h-10 px-8 lg:px-4 text-xl lg:text-base font-semibold"
              >
                <Scan className="mr-3 lg:mr-2 h-7 w-7 lg:h-5 lg:w-5" />
                Intentar Nuevamente
              </Button>
            </div>
          )}

          {scanning && (
            <div className="space-y-6 lg:space-y-4">
              <div id="qr-reader" className="w-full min-h-[500px] lg:min-h-[300px]"></div>
              <Button
                variant="outline"
                onClick={resetScanner}
                className="w-full h-14 lg:h-10 text-lg lg:text-base font-semibold"
              >
                Cancelar
              </Button>
            </div>
          )}

          {loading && (
            <div className="text-center py-32 lg:py-20">
              <Loader2 className="h-32 w-32 lg:h-20 lg:w-20 mx-auto mb-6 lg:mb-4 animate-spin text-blue-600" />
              <p className="text-xl lg:text-lg text-gray-600 dark:text-gray-400 font-medium">
                Validando bono...
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-8 lg:space-y-6">
              {/* Success Result - Bono */}
              {result.valid && result.bono && (
                <div className="text-center py-10 lg:py-8 space-y-8 lg:space-y-6">
                  <CheckCircle2 className="h-40 w-40 lg:h-24 lg:w-24 mx-auto text-green-600" />
                  <div>
                    <h3 className="text-5xl lg:text-3xl font-bold text-green-600 mb-4 lg:mb-3">
                      ¡Bono Válido!
                    </h3>
                    <p className="text-2xl lg:text-lg text-gray-600 dark:text-gray-400">
                      {result.message}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 lg:p-6 space-y-6 lg:space-y-4 text-left">
                    <div>
                      <p className="text-lg lg:text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Evento
                      </p>
                      <p className="text-2xl lg:text-lg font-semibold">{result.bono.evento.nombre}</p>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 lg:pt-4">
                      <p className="text-lg lg:text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Asistente
                      </p>
                      <p className="text-2xl lg:text-lg font-semibold">
                        {result.bono.usuario?.name ||
                          result.bono.usuario?.nombre ||
                          "Sin nombre"}
                      </p>
                      <p className="text-lg lg:text-base text-gray-500 mt-1">
                        Nivel {result.bono.usuario?.nivel || 1}
                      </p>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 lg:pt-4">
                      <p className="text-lg lg:text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Precio Pagado
                      </p>
                      <p className="text-2xl lg:text-xl font-bold text-green-600">
                        ${result.bono.precioFinal.toLocaleString()}
                      </p>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 lg:pt-4">
                      <p className="text-lg lg:text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Código
                      </p>
                      <p className="font-mono text-lg lg:text-base">{result.bono.codigo}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Result - Venta Externa */}
              {result.valid && result.ventaExterna && (
                <div className="text-center py-10 lg:py-8 space-y-8 lg:space-y-6">
                  <CheckCircle2 className="h-40 w-40 lg:h-24 lg:w-24 mx-auto text-purple-600" />
                  <div>
                    <h3 className="text-5xl lg:text-3xl font-bold text-purple-600 mb-4 lg:mb-3">
                      ¡Entrada Válida!
                    </h3>
                    <p className="text-2xl lg:text-lg text-gray-600 dark:text-gray-400">
                      {result.message}
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-8 lg:p-6 space-y-6 lg:space-y-4 text-left border border-purple-200 dark:border-purple-800">
                    <div>
                      <p className="text-lg lg:text-sm text-purple-700 dark:text-purple-300 mb-2">
                        Evento
                      </p>
                      <p className="text-2xl lg:text-lg font-semibold">{result.ventaExterna.evento.nombre}</p>
                    </div>

                    <div className="border-t border-purple-200 dark:border-purple-700 pt-6 lg:pt-4">
                      <p className="text-lg lg:text-sm text-purple-700 dark:text-purple-300 mb-2">
                        Asistente
                      </p>
                      <p className="text-2xl lg:text-lg font-semibold">
                        {result.ventaExterna.apellido}, {result.ventaExterna.nombre}
                      </p>
                      <p className="text-lg lg:text-base text-gray-500 mt-1">
                        DNI: {result.ventaExterna.dni}
                      </p>
                    </div>

                    <div className="border-t border-purple-200 dark:border-purple-700 pt-6 lg:pt-4">
                      <p className="text-lg lg:text-sm text-purple-700 dark:text-purple-300 mb-2">
                        Precio Pagado
                      </p>
                      <p className="text-2xl lg:text-xl font-bold text-purple-600">
                        ${(result.ventaExterna.precio * result.ventaExterna.cantidad).toLocaleString()}
                      </p>
                      {result.ventaExterna.cantidad > 1 && (
                        <p className="text-sm text-gray-500 mt-1">
                          ${result.ventaExterna.precio} x {result.ventaExterna.cantidad} {result.ventaExterna.cantidad === 1 ? "entrada" : "entradas"}
                        </p>
                      )}
                    </div>

                    {result.ventaExterna.vendidoPor && (
                      <div className="border-t border-purple-200 dark:border-purple-700 pt-6 lg:pt-4">
                        <p className="text-lg lg:text-sm text-purple-700 dark:text-purple-300 mb-2">
                          Vendido Por
                        </p>
                        <p className="text-lg lg:text-base">{result.ventaExterna.vendidoPor}</p>
                      </div>
                    )}

                    <div className="border-t border-purple-200 dark:border-purple-700 pt-6 lg:pt-4">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        Venta Externa (Sin QR)
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Result */}
              {!result.valid && (
                <div className="text-center py-10 lg:py-8 space-y-8 lg:space-y-6">
                  {(result.bono?.estado === "UTILIZADO" || result.ventaExterna?.utilizado) ? (
                    <AlertCircle className="h-40 w-40 lg:h-24 lg:w-24 mx-auto text-yellow-600" />
                  ) : (
                    <XCircle className="h-40 w-40 lg:h-24 lg:w-24 mx-auto text-red-600" />
                  )}
                  <div>
                    <h3
                      className={`text-5xl lg:text-3xl font-bold mb-4 lg:mb-3 ${
                        (result.bono?.estado === "UTILIZADO" || result.ventaExterna?.utilizado)
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {(result.bono?.estado === "UTILIZADO" || result.ventaExterna?.utilizado)
                        ? "Entrada Ya Utilizada"
                        : "Entrada No Válida"}
                    </h3>
                    <p className="text-2xl lg:text-lg text-gray-600 dark:text-gray-400">
                      {result.error}
                    </p>
                  </div>

                  {result.bono && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 lg:p-6 space-y-5 lg:space-y-4 text-left">
                      <div>
                        <p className="text-lg lg:text-sm text-gray-500 dark:text-gray-400 mb-2">
                          Estado
                        </p>
                        <Badge variant="destructive" className="text-base lg:text-sm px-3 py-1">
                          {result.bono.estado}
                        </Badge>
                      </div>

                      {result.fechaUtilizacion && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-5 lg:pt-4">
                          <p className="text-lg lg:text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Utilizado
                          </p>
                          <p className="text-lg lg:text-base">
                            {new Date(result.fechaUtilizacion).toLocaleString(
                              "es-AR"
                            )}
                          </p>
                        </div>
                      )}

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-5 lg:pt-4">
                        <p className="text-lg lg:text-sm text-gray-500 dark:text-gray-400 mb-2">
                          Código
                        </p>
                        <p className="font-mono text-lg lg:text-base">{result.bono.codigo}</p>
                      </div>
                    </div>
                  )}

                  {result.ventaExterna && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-8 lg:p-6 space-y-5 lg:space-y-4 text-left border border-purple-200 dark:border-purple-800">
                      <div>
                        <p className="text-lg lg:text-sm text-purple-700 dark:text-purple-300 mb-2">
                          Asistente
                        </p>
                        <p className="text-lg font-semibold">
                          {result.ventaExterna.apellido}, {result.ventaExterna.nombre}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          DNI: {result.ventaExterna.dni}
                        </p>
                      </div>

                      {result.fechaUtilizacion && (
                        <div className="border-t border-purple-200 dark:border-purple-700 pt-5 lg:pt-4">
                          <p className="text-lg lg:text-sm text-purple-700 dark:text-purple-300 mb-2">
                            Utilizado
                          </p>
                          <p className="text-lg lg:text-base">
                            {new Date(result.fechaUtilizacion).toLocaleString(
                              "es-AR"
                            )}
                          </p>
                        </div>
                      )}

                      <div className="border-t border-purple-200 dark:border-purple-700 pt-5 lg:pt-4">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          Venta Externa (Sin QR)
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={resetScanner}
                className="w-full h-16 lg:h-12 text-xl lg:text-base font-semibold"
                size="lg"
              >
                Escanear Siguiente
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
