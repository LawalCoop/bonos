import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Ticket, DollarSign, QrCode, Plus, Filter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EventoBonosList } from "@/components/admin/eventos-bonos-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BonosFilter } from "@/components/admin/bonos-filter";

async function getBonos(searchQuery?: string, estadoFilter?: string) {
  const searchCondition = searchQuery
    ? {
        OR: [
          { codigo: { contains: searchQuery, mode: "insensitive" as const } },
          {
            usuario: {
              OR: [
                { email: { contains: searchQuery, mode: "insensitive" as const } },
                { name: { contains: searchQuery, mode: "insensitive" as const } },
              ],
            },
          },
          {
            evento: {
              nombre: { contains: searchQuery, mode: "insensitive" as const },
            },
          },
        ],
      }
    : {};

  const estadoCondition = estadoFilter && estadoFilter !== "TODOS"
    ? { estado: estadoFilter }
    : {};

  const where = {
    ...searchCondition,
    ...estadoCondition,
  };

  const bonos = await prisma.bono.findMany({
    where,
    include: {
      evento: {
        select: {
          id: true,
          nombre: true,
          fecha: true,
          slug: true,
          horaInicio: true,
          ubicacion: true,
        },
      },
      usuario: {
        select: {
          name: true,
          nombre: true,
          email: true,
        },
      },
    },
    orderBy: {
      fechaCompra: "desc",
    },
    take: 200,
  });

  // Agrupar por evento y ordenar eventos por proximidad
  const now = new Date();
  const bonosPorEvento = bonos.reduce((acc, bono) => {
    const eventoId = bono.evento.id;
    if (!acc[eventoId]) {
      acc[eventoId] = {
        evento: bono.evento,
        bonos: [],
      };
    }
    acc[eventoId].bonos.push(bono);
    return acc;
  }, {} as Record<string, { evento: any; bonos: any[] }>);

  // Convertir a array y ordenar por fecha de evento (próximos primero)
  const eventosOrdenados = Object.values(bonosPorEvento).sort((a, b) => {
    const fechaA = new Date(a.evento.fecha).getTime();
    const fechaB = new Date(b.evento.fecha).getTime();
    const nowTime = now.getTime();

    // Eventos futuros primero (ordenados de más cercano a más lejano)
    const esFuturoA = fechaA >= nowTime;
    const esFuturoB = fechaB >= nowTime;

    if (esFuturoA && !esFuturoB) return -1;
    if (!esFuturoA && esFuturoB) return 1;

    // Ambos futuros o ambos pasados: ordenar por proximidad
    if (esFuturoA && esFuturoB) {
      return fechaA - fechaB; // Más cercano primero
    } else {
      return fechaB - fechaA; // Más reciente primero (para eventos pasados)
    }
  });

  return eventosOrdenados;
}

async function getStats() {
  const [totalBonos, bonosPagados, bonosUtilizados, totalRecaudado] =
    await Promise.all([
      prisma.bono.count(),
      prisma.bono.count({ where: { estado: "PAGADO" } }),
      prisma.bono.count({ where: { estado: "UTILIZADO" } }),
      prisma.bono.aggregate({
        where: { estado: { in: ["PAGADO", "UTILIZADO"] } },
        _sum: { precioFinal: true },
      }),
    ]);

  return {
    totalBonos,
    bonosPagados,
    bonosUtilizados,
    totalRecaudado: totalRecaudado._sum.precioFinal || 0,
  };
}

export default async function AdminBonosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const { q, estado } = await searchParams;
  const [eventosBonos, stats] = await Promise.all([
    getBonos(q, estado),
    getStats(),
  ]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Bonos
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
            Administra todos los bonos vendidos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/admin/bonos/nuevo" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Crear Bono
            </Button>
          </Link>
          <Link href="/admin/ingreso" className="flex-1 sm:flex-none">
            <Button className="w-full sm:w-auto">
              <QrCode className="h-4 w-4 mr-2" />
              Modalidad Ingreso
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Bonos
            </CardTitle>
            <Ticket className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="text-xl md:text-2xl font-bold">{stats.totalBonos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
              Pagados
            </CardTitle>
            <Ticket className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="text-xl md:text-2xl font-bold text-green-600">
              {stats.bonosPagados}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
              Utilizados
            </CardTitle>
            <Ticket className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="text-xl md:text-2xl font-bold">{stats.bonosUtilizados}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
              Recaudado
            </CardTitle>
            <DollarSign className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="text-xl md:text-2xl font-bold text-emerald-600">
              ${stats.totalRecaudado.toLocaleString("es-AR")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Filter className="h-4 w-4 md:h-5 md:w-5" />
            Buscar y Filtrar Bonos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <BonosFilter
            defaultSearch={q}
            defaultEstado={estado}
          />
        </CardContent>
      </Card>

      {/* Lista de Bonos Agrupados por Evento */}
      <EventoBonosList eventosBonos={eventosBonos} searchQuery={q} />
    </div>
  );
}
