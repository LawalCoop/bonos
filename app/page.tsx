import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EventoCard } from "@/components/evento-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Users, Heart, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { calcularDescuentos } from "@/lib/descuentos";
import { differenceInDays } from "date-fns";

export const revalidate = 60; // Revalidar cada 60 segundos

async function getProximosEventos() {
  // Obtener fecha de inicio del día en UTC
  const now = new Date();
  const hoy = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

  const eventos = await prisma.evento.findMany({
    where: {
      estado: "PROGRAMADO",
      fecha: {
        gte: hoy,
      },
    },
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
        take: 1, // Solo la mejor
      },
    },
    orderBy: {
      fecha: "asc",
    },
    take: 6,
  });

  return eventos;
}

async function getObjetivoActivo() {
  const objetivo = await prisma.objetivoAmpliacion.findFirst({
    where: {
      activo: true,
      estado: "ACTIVO",
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

  if (!objetivo) return null;

  // Usar cantidadPersonas del modelo (actualizado al cerrar eventos)
  return {
    ...objetivo,
    contributores: objetivo.cantidadPersonas,
  };
}

export default async function Home() {
  const eventos = await getProximosEventos();
  const objetivo = await getObjetivoActivo();
  const session = await getServerSession(authOptions);

  // Calcular días faltantes para el objetivo
  const diasFaltantes = objetivo?.fechaObjetivo
    ? differenceInDays(new Date(objetivo.fechaObjetivo), new Date())
    : null;

  // Calcular descuentos para cada evento si hay sesión
  const eventosConDescuentos = await Promise.all(
    eventos.map(async (evento) => {
      if (session?.user?.id) {
        const calculo = await calcularDescuentos(evento.id, session.user.id, 1);
        return {
          ...evento,
          descuentos: calculo.descuentos,
          precioFinal: calculo.precioFinal,
          totalDescuento: calculo.totalDescuento,
        };
      }
      return evento;
    })
  );

  return (
    <div className="flex flex-col gap-8 md:gap-16 py-6 md:py-12">
      {/* Hero Section */}
      <section className="container px-4">
        <div className="flex flex-col items-center text-center space-y-4 md:space-y-6 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight font-poppins">
            <span className="text-primary">Bayer Experimental</span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground px-4">
            Ciclo cultural gestado en la Biblioteca Popular Osvaldo Bayer.
          </p>
          <p className="text-sm md:text-base text-muted-foreground px-4">
            Sacá tus bonos contribución para los próximos eventos y apoyá la cultura autogestiva.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto px-4">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/eventos">
                Ver todos los eventos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/sobre-nosotres">Conocé más</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Objetivo Colectivo */}
      {objetivo && (
        <section className="container px-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 md:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
                <div className="rounded-lg bg-primary/10 p-2.5 md:p-3 self-start">
                  <Target className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold">{objetivo.nombre}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {objetivo.descripcion}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs md:text-sm">
                      <span className="font-medium">Progreso</span>
                      <span className="text-muted-foreground">
                        ${objetivo.montoActual.toLocaleString("es-AR")} / ${objetivo.montoObjetivo.toLocaleString("es-AR")}
                      </span>
                    </div>
                    <div className="h-2.5 md:h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${Math.min((objetivo.montoActual / objetivo.montoObjetivo) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {((objetivo.montoActual / objetivo.montoObjetivo) * 100).toFixed(1)}% completado
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        {objetivo.contributores > 0 && (
                          <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
                            <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span>{objetivo.contributores} personas</span>
                          </div>
                        )}
                        {diasFaltantes !== null && diasFaltantes >= 0 && (
                          <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span>
                              {diasFaltantes === 0
                                ? "Hoy es el día"
                                : `${diasFaltantes} día${diasFaltantes === 1 ? '' : 's'}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 mt-3 md:mt-4 p-2.5 md:p-3 bg-primary/5 rounded-lg">
                    <Heart className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Cada bono contribución que comprás ayuda a construir este espacio de forma colectiva.
                      Tu aporte se divide entre artistas, gastos operativos y este objetivo.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Próximos Eventos */}
      <section className="container px-4 space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Próximos eventos</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
              Sacá tus bonos contribución y vení a disfrutar
            </p>
          </div>
          <Button variant="outline" asChild className="hidden md:flex flex-shrink-0">
            <Link href="/eventos">
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {eventosConDescuentos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {eventosConDescuentos.map((evento) => (
              <EventoCard key={evento.id} evento={evento} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 md:p-12 text-center">
              <p className="text-sm md:text-base text-muted-foreground">
                No hay eventos programados por el momento.
                <br />
                Seguinos en redes para estar al tanto de las novedades.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center md:hidden">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/eventos">
              Ver todos los eventos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
