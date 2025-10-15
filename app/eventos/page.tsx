import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EventoCard } from "@/components/evento-card";
import { Card, CardContent } from "@/components/ui/card";
import { calcularDescuentos } from "@/lib/descuentos";

export const metadata = {
  title: "Eventos - La Bayer Experimental",
  description: "Todos los eventos culturales de la Biblioteca Popular Osvaldo Bayer",
};

export const revalidate = 60;

async function getEventos() {
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
  });

  return eventos;
}

export default async function EventosPage() {
  const eventos = await getEventos();
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
    <div className="container py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Próximos eventos</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Descubrí todos los eventos culturales de La Bayer Experimental
          </p>
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
      </div>
    </div>
  );
}
