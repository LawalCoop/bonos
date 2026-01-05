import { getConfig } from '@/lib/config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfigForm } from '@/components/admin/config-form'

export default async function AdminConfigPage() {
  const config = await getConfig()

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Configuración del Sitio
        </h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
          Personaliza el nombre, logo, colores y datos de contacto del sitio
        </p>
      </div>

      <Card>
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="text-base md:text-lg">Configuración General</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <ConfigForm config={config} />
        </CardContent>
      </Card>
    </div>
  )
}
