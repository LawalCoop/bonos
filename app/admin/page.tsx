import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Ticket, Users, DollarSign, TrendingUp, Music, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

async function getDashboardStats() {
  const [
    totalEventos,
    eventosActivos,
    totalBonos,
    bonosVendidos,
    totalRecaudadoAggregate,
    totalUsuarios,
    totalArtistas,
    eventosMesActual,
  ] = await Promise.all([
    prisma.evento.count(),
    prisma.evento.count({
      where: {
        estado: "PROGRAMADO",
        fecha: {
          gte: new Date(),
        },
      },
    }),
    prisma.bono.count(),
    prisma.bono.count({
      where: {
        estado: {
          in: ["PAGADO", "UTILIZADO"],
        },
      },
    }),
    // Calcular total recaudado desde los bonos, no desde eventos
    prisma.bono.aggregate({
      where: {
        estado: {
          in: ["PAGADO", "UTILIZADO"],
        },
      },
      _sum: {
        precioFinal: true,
      },
    }),
    prisma.user.count(),
    prisma.artista.count(),
    prisma.evento.count({
      where: {
        fecha: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      },
    }),
  ]);

  return {
    totalEventos,
    eventosActivos,
    totalBonos,
    bonosVendidos,
    totalRecaudado: totalRecaudadoAggregate._sum.precioFinal || 0,
    totalUsuarios,
    totalArtistas,
    eventosMesActual,
  };
}

async function getRecentEvents() {
  const eventos = await prisma.evento.findMany({
    take: 5,
    orderBy: {
      fecha: "desc",
    },
    include: {
      _count: {
        select: {
          bonos: true,
        },
      },
      bonos: {
        where: {
          estado: {
            in: ["PAGADO", "UTILIZADO"],
          },
        },
        select: {
          precioFinal: true,
        },
      },
    },
  });

  // Calcular total recaudado para cada evento
  return eventos.map((evento) => ({
    ...evento,
    totalRecaudado: evento.bonos.reduce((sum, bono) => sum + bono.precioFinal, 0),
  }));
}

async function getObjetivoActivo() {
  const objetivo = await prisma.objetivoAmpliacion.findFirst({
    where: {
      activo: true,
      estado: "ACTIVO",
    },
    include: {
      eventos: {
        include: {
          evento: {
            select: {
              nombre: true,
            },
          },
        },
      },
    },
    orderBy: {
      prioridad: "desc",
    },
  });

  if (!objetivo) return null;

  // Calcular contributores únicos
  const eventosIds = objetivo.eventos.map((e) => e.eventoId);

  let contributores = 0;
  if (eventosIds.length > 0) {
    const result = await prisma.bono.groupBy({
      by: ["usuarioId"],
      where: {
        eventoId: { in: eventosIds },
        estado: { in: ["PAGADO", "UTILIZADO"] },
        usuarioId: { not: null },
      },
    });
    contributores = result.length;
  }

  return {
    ...objetivo,
    contributores,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const recentEvents = await getRecentEvents();
  const objetivoActivo = await getObjetivoActivo();

  const cards = [
    {
      title: "Eventos Activos",
      value: stats.eventosActivos,
      subtitle: `${stats.totalEventos} totales`,
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Bonos Vendidos",
      value: stats.bonosVendidos,
      subtitle: `${stats.totalBonos} totales`,
      icon: Ticket,
      color: "text-green-600",
    },
    {
      title: "Total Recaudado",
      value: `$${stats.totalRecaudado.toLocaleString()}`,
      subtitle: "Todo el tiempo",
      icon: DollarSign,
      color: "text-emerald-600",
    },
    {
      title: "Usuarios",
      value: stats.totalUsuarios,
      subtitle: "Registrados",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Artistas",
      value: stats.totalArtistas,
      subtitle: "En catálogo",
      icon: Music,
      color: "text-pink-600",
    },
    {
      title: "Eventos este mes",
      value: stats.eventosMesActual,
      subtitle: new Date().toLocaleDateString("es-AR", { month: "long" }),
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
          Resumen del sistema de bonos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 md:h-5 md:w-5 ${card.color} flex-shrink-0`} />
              </CardHeader>
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {card.subtitle}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Objetivo Activo */}
      {objetivoActivo && (
        <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="rounded-lg bg-primary/20 p-1.5 md:p-2">
                  <Target className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base md:text-xl">Objetivo Vigente</CardTitle>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Objetivo de recaudación activo
                  </p>
                </div>
              </div>
              <Badge className="bg-green-600 w-fit">Activo</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0 md:pt-0">
            <div>
              <h3 className="font-bold text-base md:text-lg text-gray-900 dark:text-white mb-2">
                {objetivoActivo.nombre}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {objetivoActivo.descripcion}
              </p>
            </div>

            <div className="grid gap-3 md:gap-4 grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Recaudado</p>
                <p className="text-lg md:text-2xl font-bold text-primary">
                  ${objetivoActivo.montoActual.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Objetivo</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                  ${objetivoActivo.montoObjetivo.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Progreso</p>
                <p className="text-lg md:text-2xl font-bold text-green-600">
                  {objetivoActivo.porcentaje.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Progress value={objetivoActivo.porcentaje} className="h-2.5 md:h-3" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs md:text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                  <span>{objetivoActivo.contributores} personas contribuyendo</span>
                </div>
                <div className="text-muted-foreground">
                  Faltan ${(objetivoActivo.montoObjetivo - objetivoActivo.montoActual).toLocaleString()}
                </div>
              </div>
            </div>

            {objetivoActivo.eventos.length > 0 && (
              <div className="pt-3 md:pt-4 border-t border-primary/20">
                <p className="text-xs text-muted-foreground mb-2">
                  Eventos asociados ({objetivoActivo.eventos.length}):
                </p>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {objetivoActivo.eventos.slice(0, 5).map((ev) => (
                    <Badge key={ev.eventoId} variant="outline" className="text-xs">
                      {ev.evento.nombre}
                    </Badge>
                  ))}
                  {objetivoActivo.eventos.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{objetivoActivo.eventos.length - 5} más
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {objetivoActivo.fechaObjetivo && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  Fecha objetivo:{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(objetivoActivo.fechaObjetivo).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Eventos Recientes</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <div className="space-y-3 md:space-y-4">
            {recentEvents.length === 0 ? (
              <p className="text-center text-sm md:text-base text-gray-500 dark:text-gray-400 py-8">
                No hay eventos todavía
              </p>
            ) : (
              recentEvents.map((evento) => (
                <div
                  key={evento.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 md:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm md:text-base text-gray-900 dark:text-white truncate">
                      {evento.nombre}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(evento.fecha).toLocaleDateString("es-AR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <div className="text-sm md:text-base font-medium text-gray-900 dark:text-white">
                      {evento._count.bonos} bonos
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      ${evento.totalRecaudado.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
