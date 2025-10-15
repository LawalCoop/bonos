import { prisma } from "@/lib/prisma";
import { OrganizacionesList } from "@/components/admin/organizaciones-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getOrganizaciones() {
  return prisma.organizacion.findMany({
    orderBy: {
      nombre: "asc",
    },
    include: {
      _count: {
        select: {
          usuarios: true,
        },
      },
    },
  });
}

export default async function AdminOrganizacionesPage() {
  const organizaciones = await getOrganizaciones();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Organizaciones y Mutuales
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Gestiona las organizaciones con descuentos especiales
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Organizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <OrganizacionesList organizaciones={organizaciones} />
        </CardContent>
      </Card>
    </div>
  );
}
