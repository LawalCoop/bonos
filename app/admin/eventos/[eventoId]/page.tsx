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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Editar Evento
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{evento.nombre}</p>
      </div>

      {/* Promociones Section */}
      {evento.promociones && evento.promociones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Promociones del Evento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {evento.promociones.map((promo) => (
                <div
                  key={promo.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{promo.nombre}</p>
                      <p className="text-sm text-gray-500">{promo.descripcion}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                  className="text-sm text-blue-600 hover:underline"
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
