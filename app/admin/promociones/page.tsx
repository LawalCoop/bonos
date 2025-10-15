import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Percent, Plus } from "lucide-react";
import Link from "next/link";
import { PromocionesTable } from "@/components/admin/promociones-table";

async function getPromociones() {
  return prisma.promocion.findMany({
    include: {
      evento: {
        select: {
          nombre: true,
          fecha: true,
        },
      },
    },
    orderBy: [
      { activo: "desc" },
      { prioridad: "desc" },
      { fechaInicio: "desc" },
    ],
  });
}

async function getEventos() {
  return prisma.evento.findMany({
    where: {
      estado: {
        in: ["PROGRAMADO", "PUBLICADO"],
      },
    },
    orderBy: {
      fecha: "asc",
    },
    select: {
      id: true,
      nombre: true,
      fecha: true,
    },
  });
}

export default async function PromocionesPage() {
  const [promociones, eventos] = await Promise.all([
    getPromociones(),
    getEventos(),
  ]);

  const activeCount = promociones.filter((p) => p.activo).length;
  const globalCount = promociones.filter((p) => !p.eventoId).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Promociones
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona descuentos temporales y ofertas especiales
          </p>
        </div>
        <Link href="/admin/promociones/nueva">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Promoción
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Promociones
            </CardTitle>
            <Percent className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promociones.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Activas
            </CardTitle>
            <Percent className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Globales
            </CardTitle>
            <Percent className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {globalCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promociones Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Promociones</CardTitle>
        </CardHeader>
        <CardContent>
          <PromocionesTable promociones={promociones} eventos={eventos} />
        </CardContent>
      </Card>
    </div>
  );
}
