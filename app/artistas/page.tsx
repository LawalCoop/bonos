import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, MapPin, Calendar, Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getArtistas() {
  const artistas = await prisma.artista.findMany({
    orderBy: {
      nombre: "asc",
    },
    include: {
      _count: {
        select: {
          eventos: true,
          seguidores: true,
        },
      },
    },
  });

  return artistas;
}

export default async function ArtistasPage() {
  const artistas = await getArtistas();

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Artistas</h1>
          <p className="text-xl text-muted-foreground">
            Conocé a los artistas que participan en La Bayer
          </p>
        </div>

        {artistas.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                No hay artistas registrados todavía
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artistas.map((artista) => (
              <Link key={artista.id} href={`/artistas/${artista.slug}`}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-0">
                    {/* Foto del artista */}
                    <div className="relative w-full h-64 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900">
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
                          <Music className="h-16 w-16 text-purple-300 dark:text-purple-700" />
                        </div>
                      )}
                    </div>

                    {/* Información del artista */}
                    <div className="p-6 space-y-3">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{artista.nombre}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {artista.ciudad}
                            {artista.provincia && `, ${artista.provincia}`}
                          </span>
                          {artista.esLocal && (
                            <Badge variant="secondary" className="ml-2">
                              Local
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Bio preview */}
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {artista.bio}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 pt-2 border-t">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{artista._count.eventos} eventos</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Heart className="h-4 w-4" />
                          <span>{artista._count.seguidores} seguidores</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
