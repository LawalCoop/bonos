import { prisma } from "@/lib/prisma";
import { ObjetivosList } from "@/components/admin/objetivos-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Users, Calendar } from "lucide-react";

async function getObjetivos() {
  return prisma.objetivoAmpliacion.findMany({
    include: {
      eventos: {
        include: {
          evento: {
            select: {
              id: true,
              nombre: true,
              fecha: true,
            },
          },
        },
      },
    },
    orderBy: {
      prioridad: "desc",
    },
  });
}

async function getStats() {
  const objetivoActivo = await prisma.objetivoAmpliacion.findFirst({
    where: {
      estado: "ACTIVO",
      activo: true,
    },
    include: {
      eventos: {
        select: { eventoId: true },
      },
    },
    orderBy: {
      prioridad: "desc",
    },
  });

  if (!objetivoActivo) {
    return {
      contributores: 0,
      eventosAportando: 0,
      promedioEvento: 0,
    };
  }

  const eventosIds = objetivoActivo.eventos.map(e => e.eventoId);

  const contributores = eventosIds.length > 0
    ? await prisma.bono.groupBy({
        by: ['usuarioId'],
        where: {
          eventoId: { in: eventosIds },
          estado: { in: ['PAGADO', 'UTILIZADO'] },
          usuarioId: { not: null },
        },
      })
    : [];

  const promedioEvento = eventosIds.length > 0
    ? objetivoActivo.montoActual / eventosIds.length
    : 0;

  return {
    contributores: contributores.length,
    eventosAportando: eventosIds.length,
    promedioEvento,
  };
}

export default async function AdminObjetivosPage() {
  const [objetivos, stats] = await Promise.all([getObjetivos(), getStats()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Objetivos de Ampliación
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Gestiona los objetivos para la ampliación de la biblioteca
        </p>
      </div>

      {/* Stats del objetivo activo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Contributores
            </CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contributores}</div>
            <p className="text-xs text-gray-500 mt-1">
              personas aportando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Eventos Aportando
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.eventosAportando}</div>
            <p className="text-xs text-gray-500 mt-1">
              eventos contribuyendo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Promedio por Evento
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(stats.promedioEvento).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              por evento realizado
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Objetivos</CardTitle>
        </CardHeader>
        <CardContent>
          <ObjetivosList objetivos={objetivos} />
        </CardContent>
      </Card>
    </div>
  );
}
