import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EventoCard } from "@/components/evento-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Users, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { calcularDescuentos } from "@/lib/descuentos";

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
    <div className="flex flex-col gap-16 py-12">
      {/* Hero Section */}
      <section className="container">
        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Bienvenide a{" "}
            <span className="text-primary">La Bayer Experimental</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Espacio cultural de la Biblioteca Popular Osvaldo Bayer.
            Sacá tus bonos para los próximos eventos y apoyá la cultura autogestiva.
          </p>
          <div className="flex gap-4">
            <Button size="lg" asChild>
              <Link href="/eventos">
                Ver todos los eventos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sobre-nosotres">Conocé más</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Objetivo de Ampliación */}
      {objetivo && (
        <section className="container">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold">{objetivo.nombre}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {objetivo.descripcion}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Progreso</span>
                      <span className="text-muted-foreground">
                        ${objetivo.montoActual.toLocaleString()} / ${objetivo.montoObjetivo.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${Math.min(objetivo.porcentaje, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {objetivo.porcentaje.toFixed(1)}% completado
                      </p>
                      {objetivo.contributores > 0 && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{objetivo.contributores} personas aportando</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 mt-4 p-3 bg-primary/5 rounded-lg">
                    <Heart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Cada entrada que comprás ayuda a construir este espacio de forma colectiva.
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
      <section className="container space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Próximos eventos</h2>
            <p className="text-muted-foreground mt-2">
              Sacá tus bonos y vení a disfrutar de la mejor cultura autogestiva
            </p>
          </div>
          <Button variant="outline" asChild className="hidden md:flex">
            <Link href="/eventos">
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {eventosConDescuentos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosConDescuentos.map((evento) => (
              <EventoCard key={evento.id} evento={evento} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No hay eventos programados por el momento.
                <br />
                Seguinos en redes para estar al tanto de las novedades.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center md:hidden">
          <Button variant="outline" asChild>
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
