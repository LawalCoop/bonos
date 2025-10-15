import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin, DollarSign, Users, FileText, AlertTriangle, CheckCircle, ShoppingCart } from "lucide-react";

async function getEventos() {
  const eventos = await prisma.evento.findMany({
    orderBy: {
      fecha: "desc",
    },
    include: {
      _count: {
        select: {
          artistas: true,
        },
      },
      bonos: {
        select: {
          precioFinal: true,
          estado: true,
        },
      },
      ventasExternas: {
        select: {
          precio: true,
          cantidad: true,
        },
      },
    },
  });

  // Calcular total recaudado y bonos pagados/utilizados para cada evento (incluyendo ventas externas)
  return eventos.map((evento) => {
    const bonosPagados = evento.bonos.filter(
      (bono) => bono.estado === "PAGADO" || bono.estado === "UTILIZADO"
    );
    const totalBonosVendidos = bonosPagados.length;
    const totalVentasExternas = evento.ventasExternas.reduce((sum, venta) => sum + venta.cantidad, 0);
    const recaudadoBonos = bonosPagados.reduce((sum, bono) => sum + bono.precioFinal, 0);
    const recaudadoVentasExternas = evento.ventasExternas.reduce((sum, venta) => sum + (venta.precio * venta.cantidad), 0);

    return {
      ...evento,
      bonosVendidos: totalBonosVendidos + totalVentasExternas,
      totalRecaudado: recaudadoBonos + recaudadoVentasExternas,
    };
  });
}

export default async function AdminEventosPage() {
  const eventos = await getEventos();

  // Identify events that need closure (past date, not finalized, and older than 3 days)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const eventosSinCerrar = eventos.filter(
    (evento) =>
      evento.estado !== "FINALIZADO" &&
      evento.estado !== "CANCELADO" &&
      new Date(evento.fecha) < threeDaysAgo &&
      evento.bonosVendidos > 0 // Only show warning if there were sales
  );

  const getEstadoBadge = (evento: any) => {
    if (evento.estado === "CANCELADO") {
      return <Badge variant="destructive">Cancelado</Badge>;
    }
    if (evento.estado === "FINALIZADO") {
      return <Badge variant="secondary">Finalizado</Badge>;
    }
    if (new Date(evento.fecha) < new Date()) {
      return <Badge variant="secondary">Pasado</Badge>;
    }
    return <Badge className="bg-green-600">Activo</Badge>;
  };

  const necesitaCierre = (evento: any) => {
    return (
      evento.estado !== "FINALIZADO" &&
      evento.estado !== "CANCELADO" &&
      new Date(evento.fecha) < threeDaysAgo &&
      evento.bonosVendidos > 0
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Eventos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona los eventos de La Bayer
          </p>
        </div>
        <Link href="/admin/eventos/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Evento
          </Button>
        </Link>
      </div>

      {/* Warning for events that need closure */}
      {eventosSinCerrar.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  {eventosSinCerrar.length} evento{eventosSinCerrar.length > 1 ? "s" : ""} pendiente{eventosSinCerrar.length > 1 ? "s" : ""} de cierre
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                  Los siguientes eventos ya pasaron y tienen ventas registradas. Es necesario cerrarlos para finalizar la distribución de fondos.
                </p>
                <div className="space-y-2">
                  {eventosSinCerrar.map((evento) => (
                    <div
                      key={evento.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-amber-900 rounded border border-amber-200 dark:border-amber-800"
                    >
                      <div>
                        <p className="font-medium text-amber-900 dark:text-amber-100">
                          {evento.nombre}
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          {new Date(evento.fecha).toLocaleDateString("es-AR")} · {evento.bonosVendidos} bonos vendidos · ${evento.totalRecaudado.toLocaleString()} recaudado
                        </p>
                      </div>
                      <Link href={`/admin/eventos/${evento.id}/cierre`}>
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Cerrar Evento
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {eventos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay eventos
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Comienza creando tu primer evento
            </p>
            <Link href="/admin/eventos/nuevo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Evento
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {eventos.map((evento) => (
            <Card key={evento.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{evento.nombre}</CardTitle>
                      {getEstadoBadge(evento)}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(evento.fecha).toLocaleDateString("es-AR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        - {evento.horaInicio} hs
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {evento.ubicacion}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {necesitaCierre(evento) && (
                      <Link href={`/admin/eventos/${evento.id}/cierre`}>
                        <Button variant="default" size="sm" className="bg-amber-600 hover:bg-amber-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Cerrar
                        </Button>
                      </Link>
                    )}
                    <Link href={`/admin/eventos/${evento.id}/ventas-externas`}>
                      <Button variant="outline" size="sm">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Ventas Externas
                      </Button>
                    </Link>
                    <Link href={`/admin/eventos/${evento.id}/bordereau`}>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Bordereau
                      </Button>
                    </Link>
                    <Link href={`/admin/eventos/${evento.id}`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Precio Base
                    </div>
                    <div className="text-lg font-medium flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {evento.precioBase.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Bonos Vendidos
                    </div>
                    <div className="text-lg font-medium flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {evento.bonosVendidos}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Recaudado
                    </div>
                    <div className="text-lg font-medium text-green-600">
                      ${evento.totalRecaudado.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Artistas
                    </div>
                    <div className="text-lg font-medium">
                      {evento._count.artistas}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
