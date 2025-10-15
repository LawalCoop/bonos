import { ArtistaForm } from "@/components/admin/artista-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NuevoArtistaPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Nuevo Artista
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Agrega un nuevo artista al catálogo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Artista</CardTitle>
        </CardHeader>
        <CardContent>
          <ArtistaForm />
        </CardContent>
      </Card>
    </div>
  );
}
