"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Ticket,
  TrendingUp,
  Music,
  Calendar,
  Award,
  Edit2,
  Save,
  X,
  Loader2,
  Users,
  Building2,
  Clock,
  MapPin,
} from "lucide-react";
import { DescuentosGamificado } from "@/components/descuentos-gamificado";
import { redirect } from "next/navigation";
import Image from "next/image";

interface Organizacion {
  id: string;
  nombre: string;
  tipo: string | null;
  descuentoPorcentaje: number;
}

interface PerfilData {
  user: {
    id: string;
    name: string;
    nombre: string;
    email: string;
    image: string;
    puntos: number;
    esAsociado: boolean;
    fechaAsociado: Date | null;
    organizacionId: string | null;
    organizacion: Organizacion | null;
  };
  nivel: {
    actual: number;
    nombre: string;
    icono: string;
    descuento: number;
    siguiente: {
      nivel: number;
      nombre: string;
      icono: string;
      descuento: number;
    };
    puntosParaSiguienteNivel: number;
    progreso: number;
  };
  estadisticas: {
    totalBonos: number;
    eventosAsistidos: number;
    proximosEventos: number;
    bonosPendientes: number;
  };
  artistasFavoritos: Array<{
    artista: {
      id: string;
      nombre: string;
      ciudad: string;
      provincia: string | null;
      pais: string;
      foto: string | null;
    };
    vecesVisto: number;
  }>;
  proximosEventos: Array<any>;
  eventosAsistidos: Array<any>;
}

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [editandoAsociaciones, setEditandoAsociaciones] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardandoAsociaciones, setGuardandoAsociaciones] = useState(false);
  const [organizaciones, setOrganizaciones] = useState<Organizacion[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    nombre: "",
  });
  const [asociacionesData, setAsociacionesData] = useState({
    esAsociado: false,
    organizacionId: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/api/auth/signin?callbackUrl=/perfil");
    }

    if (status === "authenticated") {
      fetchPerfil();
      fetchOrganizaciones();
    }
  }, [status]);

  const fetchPerfil = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/perfil");
      const data = await res.json();

      if (res.ok) {
        setPerfil(data);
        setFormData({
          name: data.user.name || "",
          nombre: data.user.nombre || "",
        });
        setAsociacionesData({
          esAsociado: data.user.esAsociado || false,
          organizacionId: data.user.organizacionId || "",
        });
      }
    } catch (error) {
      console.error("Error fetching perfil:", error);
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

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      const res = await fetch("/api/user/actualizar", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchPerfil();
        setEditando(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarAsociaciones = async () => {
    try {
      setGuardandoAsociaciones(true);
      const res = await fetch("/api/user/actualizar", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(asociacionesData),
      });

      if (res.ok) {
        await fetchPerfil();
        setEditandoAsociaciones(false);
      }
    } catch (error) {
      console.error("Error updating associations:", error);
    } finally {
      setGuardandoAsociaciones(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Error al cargar el perfil</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Mi Perfil
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Tu información y estadísticas
        </p>
      </div>

      {/* Info Personal y Nivel */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              {!editando && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditando(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              {perfil.user.image && (
                <Image
                  src={perfil.user.image}
                  alt={perfil.user.name || "Usuario"}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="font-medium">{perfil.user.email}</p>
              </div>
            </div>

            {editando ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre para mostrar</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <Label htmlFor="nombre">Nombre alternativo</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    placeholder="Nombre alternativo"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="flex-1"
                  >
                    {guardando ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Guardar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditando(false);
                      setFormData({
                        name: perfil.user.name || "",
                        nombre: perfil.user.nombre || "",
                      });
                    }}
                    disabled={guardando}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nombre
                  </p>
                  <p className="font-medium">
                    {perfil.user.name || "Sin nombre"}
                  </p>
                </div>

                {perfil.user.nombre && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Nombre alternativo
                    </p>
                    <p className="font-medium">{perfil.user.nombre}</p>
                  </div>
                )}

                {perfil.user.esAsociado && (
                  <Badge className="bg-blue-600">Socie de La Bayer</Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nivel y Progreso con widget gamificado */}
        <DescuentosGamificado
          descuentosActuales={[]}
          descuentosPotenciales={[]}
          totalDescuentoActual={0}
          usuarioNivel={perfil.nivel.actual}
          usuarioPuntos={perfil.user.puntos}
          mostrarDesglose={false}
        />
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Bonos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {perfil.estadisticas.totalBonos}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Eventos Asistidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {perfil.estadisticas.eventosAsistidos}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {perfil.estadisticas.proximosEventos}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Bonos Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {perfil.estadisticas.bonosPendientes}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Membresías y Asociaciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Membresías y Asociaciones
            </CardTitle>
            {!editandoAsociaciones && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditandoAsociaciones(true)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editandoAsociaciones ? (
            <div className="space-y-6">
              {/* Socio de la biblioteca */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="esAsociado" className="text-base font-medium cursor-pointer">
                    Socie de La Bayer Experimental
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Los socies reciben un 15% de descuento en todos los eventos
                  </p>
                </div>
                <Switch
                  id="esAsociado"
                  checked={asociacionesData.esAsociado}
                  onCheckedChange={(checked) =>
                    setAsociacionesData({ ...asociacionesData, esAsociado: checked })
                  }
                />
              </div>

              {/* Organización */}
              <div className="space-y-2">
                <Label htmlFor="organizacionId">Organización o Mutual</Label>
                <Select
                  value={asociacionesData.organizacionId || "none"}
                  onValueChange={(value) =>
                    setAsociacionesData({
                      ...asociacionesData,
                      organizacionId: value === "none" ? "" : value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu organización" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna</SelectItem>
                    {organizaciones.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.nombre} {org.tipo && `(${org.tipo})`} - {org.descuentoPorcentaje}% descuento
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Si pertenecés a una organización o mutual, seleccionala para obtener descuentos adicionales
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleGuardarAsociaciones}
                  disabled={guardandoAsociaciones}
                  className="flex-1"
                >
                  {guardandoAsociaciones ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditandoAsociaciones(false);
                    setAsociacionesData({
                      esAsociado: perfil.user.esAsociado || false,
                      organizacionId: perfil.user.organizacionId || "",
                    });
                  }}
                  disabled={guardandoAsociaciones}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mostrar estado de socio */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">Socie de La Bayer</p>
                    <p className="text-sm text-muted-foreground">
                      {perfil.user.esAsociado ? "Activo - 15% de descuento" : "No activo"}
                    </p>
                  </div>
                </div>
                {perfil.user.esAsociado && (
                  <Badge className="bg-blue-600">Activo</Badge>
                )}
              </div>

              {/* Mostrar organización */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">Organización / Mutual</p>
                    <p className="text-sm text-muted-foreground">
                      {perfil.user.organizacion
                        ? `${perfil.user.organizacion.nombre} - ${perfil.user.organizacion.descuentoPorcentaje}% descuento`
                        : "Sin organización"}
                    </p>
                  </div>
                </div>
                {perfil.user.organizacion && (
                  <Badge className="bg-green-600">
                    {perfil.user.organizacion.descuentoPorcentaje}%
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Artistas Favoritos */}
      {perfil.artistasFavoritos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Tus Artistas Favoritos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {perfil.artistasFavoritos.map((fav) => (
                <div
                  key={fav.artista.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{fav.artista.nombre}</h4>
                    <Badge variant="outline">{fav.vecesVisto}x</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {fav.artista.ciudad}
                    {fav.artista.provincia && `, ${fav.artista.provincia}`}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximos Eventos */}
      {perfil.proximosEventos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {perfil.proximosEventos.map((grupo: any) => (
                <div
                  key={grupo.evento.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{grupo.evento.nombre}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(grupo.evento.fecha).toLocaleDateString(
                          "es-AR",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <Badge className="bg-green-600">Confirmado</Badge>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Cantidad de entradas
                        </p>
                        <p className="text-lg font-bold">{grupo.cantidad}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Total gastado
                        </p>
                        <p className="text-lg font-bold text-emerald-600">
                          ${grupo.totalGastado.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mi Historia - Línea de Tiempo */}
      {perfil.eventosAsistidos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Mi Historia en La Bayer
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Línea de tiempo de los conciertos a los que asististe
            </p>
          </CardHeader>
          <CardContent>
            {/* Timeline */}
            <div className="relative pl-8 space-y-6">
              {/* Línea vertical */}
              <div className="absolute left-2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600"></div>

              {perfil.eventosAsistidos.map((grupo: any, index: number) => {
                // Determinar el color del nodo basado en la posición
                const colors = [
                  "bg-blue-600",
                  "bg-purple-600",
                  "bg-pink-600",
                  "bg-green-600",
                  "bg-yellow-600",
                  "bg-red-600",
                ];
                const colorClass = colors[index % colors.length];

                return (
                  <div key={grupo.evento.id} className="relative">
                    {/* Nodo en la línea */}
                    <div
                      className={`absolute -left-6 top-2 w-4 h-4 rounded-full ${colorClass} border-4 border-white dark:border-gray-900 shadow-lg`}
                    ></div>

                    {/* Contenido */}
                    <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ml-2">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">
                            {grupo.evento.nombre}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(grupo.evento.fecha).toLocaleDateString(
                                "es-AR",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Ticket className="h-3 w-3" />
                          Asistido
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Entradas utilizadas
                            </p>
                            <p className="text-base font-semibold">
                              {grupo.cantidad}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Total gastado
                            </p>
                            <p className="text-base font-semibold text-emerald-600">
                              ${grupo.totalGastado.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          {grupo.bonos[0].fechaUtilizacion && (
                            <p>
                              Validado el{" "}
                              {new Date(
                                grupo.bonos[0].fechaUtilizacion
                              ).toLocaleDateString("es-AR")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumen al final */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total de eventos asistidos
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {perfil.eventosAsistidos.length}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total invertido en tu experiencia
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                    $
                    {perfil.eventosAsistidos
                      .reduce((sum: number, grupo: any) => sum + grupo.totalGastado, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
