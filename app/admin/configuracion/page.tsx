import { getConfig } from '@/lib/config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfigForm } from '@/components/admin/config-form'
import { NivelesConfig } from '@/components/admin/niveles-config'
import { Zap } from 'lucide-react'

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

      <Card>
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Sistema de Niveles
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Configura los niveles de gamificación y sus descuentos asociados
          </p>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <NivelesConfig />
        </CardContent>
      </Card>
    </div>
  )
}
