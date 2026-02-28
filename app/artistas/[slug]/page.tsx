import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Music,
  MapPin,
  Globe,
  Calendar,
  Heart,
  Instagram,
  ExternalLink
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiSpotify, SiBandcamp, SiYoutube } from "react-icons/si";

async function getArtista(slug: string) {
  const artista = await prisma.artista.findUnique({
    where: { slug },
    include: {
      eventos: {
        include: {
          evento: {
            select: {
              id: true,
              nombre: true,
              slug: true,
              fecha: true,
              ubicacion: true,
              estado: true,
              imagenPrincipal: true,
              horaInicio: true,
            },
          },
        },
        orderBy: {
          evento: {
            fecha: "desc",
          },
        },
      },
      _count: {
        select: {
          seguidores: true,
        },
      },
    },
  });

  return artista;
}

export default async function ArtistaDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const artista = await getArtista(slug);

  if (!artista) {
    notFound();
  }

  // Separar eventos pasados y futuros
  const now = new Date();
  const eventosFuturos = artista.eventos.filter(
    (ea) => new Date(ea.evento.fecha) >= now && ea.evento.estado !== "CANCELADO"
  );
  const eventosPasados = artista.eventos.filter(
    (ea) => new Date(ea.evento.fecha) < now || ea.evento.estado === "FINALIZADO"
  );

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header con foto y info principal */}
        <Card>
          <CardContent className="p-0">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Foto del artista */}
              <div className="relative w-full h-96 md:h-auto md:col-span-1 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900">
                {artista.foto ? (
                  <Image
                    src={artista.foto}
                    alt={artista.nombre}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Music className="h-24 w-24 text-purple-300 dark:text-purple-700" />
                  </div>
                )}
              </div>

              {/* Información principal */}
              <div className="md:col-span-2 p-6 space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h1 className="text-4xl font-bold">{artista.nombre}</h1>
                    {artista.esLocal && (
                      <Badge variant="secondary" className="ml-2">
                        Local
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {artista.ciudad}
                      {artista.provincia && `, ${artista.provincia}`}, {artista.pais}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {artista.bio}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">{artista.eventos.length}</p>
                      <p className="text-sm text-muted-foreground">eventos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">{artista._count.seguidores}</p>
                      <p className="text-sm text-muted-foreground">seguidores</p>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="flex flex-wrap gap-2">
                  {artista.linkInstagram && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={artista.linkInstagram}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="h-4 w-4 mr-2" />
                        Instagram
                      </a>
                    </Button>
                  )}
                  {artista.linkSpotify && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={artista.linkSpotify}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <SiSpotify className="h-4 w-4 mr-2" />
                        Spotify
                      </a>
                    </Button>
                  )}
                  {artista.linkBandcamp && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={artista.linkBandcamp}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <SiBandcamp className="h-4 w-4 mr-2" />
                        Bandcamp
                      </a>
                    </Button>
                  )}
                  {artista.linkYoutube && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={artista.linkYoutube}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <SiYoutube className="h-4 w-4 mr-2" />
                        YouTube
                      </a>
                    </Button>
                  )}
                  {artista.linkWeb && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={artista.linkWeb}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Sitio web
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Próximos eventos */}
        {eventosFuturos.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Próximos eventos</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {eventosFuturos.map((ea) => (
                <Link key={ea.evento.id} href={`/eventos/${ea.evento.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow h-full">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-3 gap-4">
                        {/* Foto del evento */}
                        <div className="relative h-32 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900">
                          {ea.evento.imagenPrincipal ? (
                            <Image
                              src={ea.evento.imagenPrincipal}
                              alt={ea.evento.nombre}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Calendar className="h-8 w-8 text-purple-300 dark:text-purple-700" />
                            </div>
                          )}
                        </div>

                        {/* Info del evento */}
                        <div className="col-span-2 p-4">
                          <h3 className="font-semibold mb-2">{ea.evento.nombre}</h3>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(ea.evento.fecha).toLocaleDateString("es-AR", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>{ea.evento.ubicacion}</span>
                            </div>
                          </div>
                          {ea.rol && (
                            <Badge variant="outline" className="mt-2">
                              {ea.rol}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Eventos pasados */}
        {eventosPasados.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Eventos pasados</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventosPasados.map((ea) => (
                <Link key={ea.evento.id} href={`/eventos/${ea.evento.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{ea.evento.nombre}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(ea.evento.fecha).toLocaleDateString("es-AR", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        {ea.rol && (
                          <Badge variant="outline" className="mt-2">
                            {ea.rol}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Si no tiene eventos */}
        {artista.eventos.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                Este artista todavía no tiene eventos registrados
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
