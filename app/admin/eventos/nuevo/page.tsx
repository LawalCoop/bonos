import { EventoForm } from "@/components/admin/evento-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getArtistas() {
  return prisma.artista.findMany({
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });
}

async function getObjetivosActivos() {
  return prisma.objetivoAmpliacion.findMany({
    where: {
      activo: true,
    },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      montoActual: true,
      montoObjetivo: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });
}

export default async function NuevoEventoPage() {
  const [artistas, objetivos] = await Promise.all([
    getArtistas(),
    getObjetivosActivos(),
  ]);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Nuevo Evento
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Crea un nuevo evento para La Bayer
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <EventoForm artistas={artistas} objetivos={objetivos} />
        </CardContent>
      </Card>
    </div>
  );
}
