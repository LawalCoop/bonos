import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Users, Clock, Share2, Music } from "lucide-react";
import { calcularDescuentos } from "@/lib/descuentos";
import { obtenerDescuentosPotenciales } from "@/lib/descuentos-potenciales";
import { DescuentosGamificado } from "@/components/descuentos-gamificado";
import { PrecioDesglose } from "@/components/precio-desglose";
import { DistribucionDinero } from "@/components/distribucion-dinero";
import { ObjetivoColectivo } from "@/components/objetivo-colectivo";

interface EventoPageProps {
  params: {
    slug: string;
  };
}

async function getEvento(slug: string) {
  const evento = await prisma.evento.findUnique({
    where: { slug },
    include: {
      artistas: {
        include: {
          artista: true,
        },
        orderBy: {
          orden: "asc",
        },
      },
      promociones: {
        where: {
          activo: true,
          fechaInicio: { lte: new Date() },
          fechaFin: { gte: new Date() },
          requiereAuth: false,
          codigo: null, // Solo promociones automáticas
        },
        orderBy: {
          prioridad: "desc",
        },
      },
    },
  });

  return evento;
}

export async function generateMetadata({ params }: EventoPageProps) {
  const evento = await getEvento(params.slug);

  if (!evento) {
    return {
      title: "Evento no encontrado",
    };
  }

  return {
    title: `${evento.nombre} - La Bayer Experimental`,
    description: evento.descripcion.slice(0, 160),
    openGraph: {
      title: evento.nombre,
      description: evento.descripcion.slice(0, 160),
      images: [evento.imagenPrincipal],
    },
  };
}

export default async function EventoPage({ params }: EventoPageProps) {
  const evento = await getEvento(params.slug);

  if (!evento) {
    notFound();
  }

  const precio = evento.esFechaEspecial && evento.precioEspecial
    ? evento.precioEspecial
    : evento.precioBase;

  // Obtener promociones globales también
  const promocionesGlobales = await prisma.promocion.findMany({
    where: {
      activo: true,
      fechaInicio: { lte: new Date() },
      fechaFin: { gte: new Date() },
      requiereAuth: false,
      codigo: null,
      eventoId: null, // Global
    },
    orderBy: {
      prioridad: "desc",
    },
  });

  const todasPromos = [...(evento.promociones || []), ...promocionesGlobales]
    .sort((a, b) => b.prioridad - a.prioridad);

  const promocionActiva = todasPromos[0]; // La de mayor prioridad

  // Obtener sesión y descuentos del usuario
  const session = await getServerSession(authOptions);
  let descuentosUsuario = null;
  let descuentosPotenciales: any[] = [];
  let precioConDescuentos = precio;
  let totalDescuentoPorcentaje = 0;

  if (session?.user?.id) {
    const calculo = await calcularDescuentos(evento.id, session.user.id, 1);
    descuentosUsuario = calculo.descuentos;
    descuentosPotenciales = await obtenerDescuentosPotenciales(session.user.id);
    precioConDescuentos = calculo.precioFinal;
    totalDescuentoPorcentaje = calculo.descuentos.reduce((sum, d) => sum + d.porcentaje, 0);
  }

  // Calcular precio con promoción
  let precioConPromocion = null;
  let descuentoPromocion = 0; // Porcentaje equivalente de descuento

  if (promocionActiva) {
    if (promocionActiva.tipo === "2x1") {
      // Para 2x1: comprás 2, pagás 1 = 50% descuento
      precioConPromocion = precio; // Precio unitario se mantiene
      descuentoPromocion = 50; // Equivalente a 50% de descuento
    } else if (promocionActiva.tipo === "PORCENTAJE") {
      precioConPromocion = precio * (1 - promocionActiva.valor / 100);
      descuentoPromocion = promocionActiva.valor;
    } else if (promocionActiva.tipo === "MONTO_FIJO") {
      precioConPromocion = precio - promocionActiva.valor;
      descuentoPromocion = (promocionActiva.valor / precio) * 100;
    }
  }

  // Determinar qué es mejor: promoción o descuentos del usuario
  let usarPromocion = false;
  if (promocionActiva && session?.user?.id && descuentosUsuario && descuentosUsuario.length > 0) {
    // Comparar descuentos
    usarPromocion = descuentoPromocion > totalDescuentoPorcentaje;
  } else if (promocionActiva) {
    // Solo hay promoción
    usarPromocion = true;
  }

  const headliner = evento.artistas.find(a => a.rol === "Headliner") || evento.artistas[0];

  // Obtener objetivo activo
  const objetivoActivo = await prisma.objetivoAmpliacion.findFirst({
    where: {
      estado: "ACTIVO",
      activo: true,
    },
    orderBy: {
      prioridad: "desc",
    },
  });

  // Obtener la relación EventoObjetivo para este evento si existe
  let eventoObjetivo = null;
  if (objetivoActivo) {
    eventoObjetivo = await prisma.eventoObjetivo.findUnique({
      where: {
        eventoId_objetivoId: {
          eventoId: evento.id,
          objetivoId: objetivoActivo.id,
        },
      },
    });
  }

  // Usar cantidadPersonas del modelo (actualizado al cerrar eventos)
  const contributores = objetivoActivo?.cantidadPersonas || 0;

  return (
    <div className="container px-4 py-6 md:py-8">
      {/* Header con imagen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Imagen principal */}
        <div className="lg:col-span-2">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
            <Image
              src={evento.imagenPrincipal}
              alt={evento.nombre}
              fill
              className="object-cover"
              priority
            />
            {evento.esFechaEspecial && (
              <div className="absolute top-2 right-2 md:top-4 md:right-4">
                <Badge variant="destructive" className="text-xs md:text-base px-2 py-0.5 md:px-3 md:py-1">
                  {evento.motivoFechaEspecial || "Fecha especial"}
                </Badge>
              </div>
            )}
          </div>

          {/* Info del evento */}
          <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{evento.nombre}</h1>
              {headliner && (
                <p className="text-base md:text-xl text-muted-foreground mt-1 md:mt-2">
                  Con {headliner.artista.nombre}
                  {evento.artistas.length > 1 && ` y ${evento.artistas.length - 1} artista${evento.artistas.length > 2 ? 's' : ''} más`}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium">
                  {format(new Date(evento.fecha), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                <span>{evento.horaInicio} hs</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                <span>{evento.ubicacion}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                <span>Capacidad: {evento.capacidad} personas</span>
              </div>
            </div>

            <Separator />

            {/* Descripción */}
            <div className="prose prose-sm md:prose-neutral dark:prose-invert max-w-none">
              <h2 className="text-xl md:text-2xl font-bold">Sobre el evento</h2>
              <p className="whitespace-pre-line text-sm md:text-base">{evento.descripcion}</p>
            </div>

            {/* Video de YouTube */}
            {evento.videoYoutubeId && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Adelanto</h2>
                  <div className="aspect-video w-full">
                    <iframe
                      src={`https://www.youtube.com/embed/${evento.videoYoutubeId}`}
                      title="Video del evento"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Artistas - solo mostrar si hay artistas asignados */}
            {evento.artistas && evento.artistas.length > 0 && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2">
                    <Music className="h-5 w-5 md:h-6 md:w-6" />
                    Les artistas
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {evento.artistas.map(({ artista, rol }) => (
                      <Card key={artista.id}>
                        <CardContent className="p-3 md:p-4">
                          <div className="flex items-start gap-3 md:gap-4">
                            {artista.foto && (
                              <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden flex-shrink-0">
                                <Image
                                  src={artista.foto}
                                  alt={artista.nombre}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/artistas/${artista.slug}`}
                                className="font-bold text-base md:text-lg hover:text-primary transition-colors line-clamp-1"
                              >
                                {artista.nombre}
                              </Link>
                              {rol && (
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  {rol}
                                </Badge>
                              )}
                              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                                {artista.ciudad}, {artista.pais}
                                {artista.esLocal && " • Artista local"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Distribución del dinero */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Tu aporte construye comunidad</h2>
              <DistribucionDinero
                precioTotal={
                  usarPromocion && promocionActiva
                    ? promocionActiva.tipo === "2x1"
                      ? precio / 2
                      : precioConPromocion || precio
                    : session?.user?.id && descuentosUsuario && descuentosUsuario.length > 0
                    ? precioConDescuentos
                    : precio
                }
                porcentajeArtista={evento.porcentajeArtista}
                porcentajeBayer={evento.porcentajeBayer}
              />
            </div>

            {/* Objetivo colectivo */}
            {objetivoActivo && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Objetivo Colectivo</h2>
                  <ObjetivoColectivo
                    nombre={objetivoActivo.nombre}
                    descripcion={objetivoActivo.descripcion}
                    montoObjetivo={objetivoActivo.montoObjetivo}
                    montoActual={objetivoActivo.montoActual}
                    porcentaje={objetivoActivo.porcentaje}
                    fechaObjetivo={objetivoActivo.fechaObjetivo ? new Date(objetivoActivo.fechaObjetivo) : undefined}
                    icono={objetivoActivo.icono || undefined}
                    imagen={objetivoActivo.imagen || undefined}
                    contributores={contributores}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar con precio y compra */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-20">
            <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Sección de precio con desglose */}
              <PrecioDesglose
                precioBase={precio}
                precioFinal={
                  usarPromocion && promocionActiva
                    ? promocionActiva.tipo === "2x1"
                      ? precio / 2
                      : precioConPromocion || precio
                    : session?.user?.id && descuentosUsuario && descuentosUsuario.length > 0
                    ? precioConDescuentos
                    : precio
                }
                tipoDescuento={
                  usarPromocion && promocionActiva
                    ? "promocion"
                    : session?.user?.id && descuentosUsuario && descuentosUsuario.length > 0
                    ? "descuentos"
                    : "ninguno"
                }
                promocion={
                  usarPromocion && promocionActiva
                    ? {
                        nombre: promocionActiva.nombre,
                        tipo: promocionActiva.tipo,
                        valor: promocionActiva.valor,
                      }
                    : undefined
                }
                descuentos={descuentosUsuario || []}
                totalDescuentoPorcentaje={totalDescuentoPorcentaje}
              />

              <div className="space-y-2">
                <Button size="lg" className="w-full text-sm md:text-base" asChild>
                  <Link href={`/eventos/${evento.slug}/comprar`}>
                    Sacar bono
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full text-sm md:text-base">
                  <Share2 className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                  Compartir
                </Button>
              </div>

              <Separator />

              {session?.user?.id ? (
                descuentosUsuario && descuentosUsuario.length > 0 ? (
                  // Usuario tiene descuentos - siempre mostrar el desglose
                  <DescuentosGamificado
                    descuentosActuales={descuentosUsuario}
                    descuentosPotenciales={descuentosPotenciales}
                    totalDescuentoActual={totalDescuentoPorcentaje}
                    usuarioNivel={session.user.nivel}
                    usuarioPuntos={session.user.puntos}
                    precioBase={precio}
                    precioConPromocion={usarPromocion && precioConPromocion ? precioConPromocion : undefined}
                  />
                ) : (
                  <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                    <h3 className="font-bold">Desbloquea descuentos:</h3>
                    {descuentosPotenciales.length > 0 ? (
                      <DescuentosGamificado
                        descuentosActuales={[]}
                        descuentosPotenciales={descuentosPotenciales}
                        totalDescuentoActual={0}
                        usuarioNivel={session.user.nivel}
                        usuarioPuntos={session.user.puntos}
                        precioBase={precio}
                        precioConPromocion={undefined}
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        No tenés descuentos disponibles aún. ¡Seguí participando para desbloquearlos!
                      </p>
                    )}
                  </div>
                )
              ) : (
                <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                  <h3 className="font-bold">Descuentos disponibles:</h3>
                  <ul className="space-y-1.5 md:space-y-2 text-muted-foreground">
                    <li>• Socies de la biblioteca: 15%</li>
                    <li>• Mutuales y organizaciones: 10-12%</li>
                    <li>• Por nivel: hasta 20%</li>
                    <li>• Múltiples compras: 5%</li>
                  </ul>
                  <p className="text-xs">
                    ¡Creá tu cuenta para acceder a los descuentos!
                  </p>
                </div>
              )}

              <Separator />

              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1.5 md:mb-2">Sobre los bonos:</p>
                <p>
                  {evento.mensajeBonos || "Todo lo recaudado va para les artistas y para la ampliación de la biblioteca. Tu bono llegará por email con un código QR para el ingreso."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
