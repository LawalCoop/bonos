import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Music, MapPin, ExternalLink } from "lucide-react";
import Image from "next/image";

async function getArtistas() {
  return prisma.artista.findMany({
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
}

export default async function AdminArtistasPage() {
  const artistas = await getArtistas();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Artistas
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona los artistas del catálogo
          </p>
        </div>
        <Link href="/admin/artistas/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Artista
          </Button>
        </Link>
      </div>

      {artistas.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Music className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay artistas
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Comienza agregando artistas al catálogo
            </p>
            <Link href="/admin/artistas/nuevo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Artista
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {artistas.map((artista) => (
            <Card key={artista.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {artista.foto && (
                      <div className="relative w-full h-32 mb-3 rounded-md overflow-hidden bg-gray-100">
                        <Image
                          src={artista.foto}
                          alt={artista.nombre}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardTitle className="text-lg mb-1">
                      {artista.nombre}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="h-3 w-3" />
                      {artista.ciudad}
                      {artista.esLocal && (
                        <Badge variant="secondary" className="ml-2">
                          Local
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {artista.bio}
                </p>

                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{artista._count.eventos} eventos</span>
                  <span>{artista._count.seguidores} seguidores</span>
                </div>

                {/* Social Links */}
                <div className="flex gap-2 pt-2">
                  {artista.linkInstagram && (
                    <a
                      href={artista.linkInstagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {artista.linkSpotify && (
                    <a
                      href={artista.linkSpotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>

                <Link href={`/admin/artistas/${artista.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Editar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
