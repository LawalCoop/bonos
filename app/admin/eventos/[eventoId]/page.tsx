import { prisma } from "@/lib/prisma";
import { EventoForm } from "@/components/admin/evento-form";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Percent } from "lucide-react";
import Link from "next/link";

async function getEvento(eventoId: string) {
  return prisma.evento.findUnique({
    where: { id: eventoId },
    include: {
      artistas: true,
      promociones: {
        orderBy: {
          prioridad: "desc",
        },
      },
      objetivos: {
        include: {
          objetivo: true,
        },
      },
    },
  });
}

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

export default async function EditEventoPage({
  params,
}: {
  params: { eventoId: string };
}) {
  const [evento, artistas, objetivos] = await Promise.all([
    getEvento(params.eventoId),
    getArtistas(),
    getObjetivosActivos(),
  ]);

  if (!evento) {
    notFound();
  }

  const promocionesActivas = evento.promociones?.filter((p) => p.activo) || [];

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Editar Evento
        </h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">{evento.nombre}</p>
      </div>

      {/* Promociones Section */}
      {evento.promociones && evento.promociones.length > 0 && (
        <Card>
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Percent className="h-4 w-4 md:h-5 md:w-5" />
              Promociones del Evento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="space-y-2 md:space-y-3">
              {evento.promociones.map((promo) => (
                <div
                  key={promo.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-2 md:p-3 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm md:text-base truncate">{promo.nombre}</p>
                    <p className="text-xs md:text-sm text-gray-500 truncate">{promo.descripcion}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {promo.tipo === "2x1" && (
                      <Badge className="bg-purple-600">2x1</Badge>
                    )}
                    {promo.tipo === "PORCENTAJE" && (
                      <Badge className="bg-blue-600">{promo.valor}% OFF</Badge>
                    )}
                    {promo.tipo === "MONTO_FIJO" && (
                      <Badge className="bg-green-600">${promo.valor} OFF</Badge>
                    )}
                    {promo.activo ? (
                      <Badge className="bg-green-600">Activa</Badge>
                    ) : (
                      <Badge variant="secondary">Inactiva</Badge>
                    )}
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Link
                  href="/admin/promociones"
                  className="text-xs md:text-sm text-blue-600 hover:underline"
                >
                  Ver todas las promociones →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <EventoForm evento={evento} artistas={artistas} objetivos={objetivos} eventoId={params.eventoId} />
    </div>
  );
}
