import { prisma } from "@/lib/prisma";
import { ArtistaForm } from "@/components/admin/artista-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

async function getArtista(artistaId: string) {
  return prisma.artista.findUnique({
    where: { id: artistaId },
  });
}

export default async function EditArtistaPage({
  params,
}: {
  params: { artistaId: string };
}) {
  const artista = await getArtista(params.artistaId);

  if (!artista) {
    notFound();
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Editar Artista
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {artista.nombre}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Artista</CardTitle>
        </CardHeader>
        <CardContent>
          <ArtistaForm artista={artista} />
        </CardContent>
      </Card>
    </div>
  );
}
