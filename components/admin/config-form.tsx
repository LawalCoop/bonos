'use client'

import { useState } from 'react'
import { Configuracion } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, MapPin, Mail, Palette, CreditCard, Instagram, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

type ConfigFormProps = {
  config: Configuracion
}

export function ConfigForm({ config }: ConfigFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState(config)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (field: keyof Configuracion, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Error al actualizar')

      setMessage('Configuración actualizada correctamente')
      router.refresh()
    } catch (error) {
      setMessage('Error al actualizar la configuración')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
          <TabsTrigger value="general" className="text-xs md:text-sm">
            <Settings className="w-4 h-4 mr-1" />
            General
          </TabsTrigger>
          <TabsTrigger value="ubicacion" className="text-xs md:text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            Ubicación
          </TabsTrigger>
          <TabsTrigger value="contacto" className="text-xs md:text-sm">
            <Mail className="w-4 h-4 mr-1" />
            Contacto
          </TabsTrigger>
          <TabsTrigger value="redes" className="text-xs md:text-sm">
            <Instagram className="w-4 h-4 mr-1" />
            Redes
          </TabsTrigger>
          <TabsTrigger value="personalizar" className="text-xs md:text-sm">
            <Palette className="w-4 h-4 mr-1" />
            Estilo
          </TabsTrigger>
          <TabsTrigger value="pagos" className="text-xs md:text-sm">
            <CreditCard className="w-4 h-4 mr-1" />
            Pagos
          </TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="space-y-4">
          <div>
            <Label htmlFor="nombreSitio">Nombre del Sitio *</Label>
            <Input
              id="nombreSitio"
              value={formData.nombreSitio}
              onChange={(e) => handleChange('nombreSitio', e.target.value)}
              placeholder="Biblioteca Popular Osvaldo Bayer"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Nombre completo que aparecerá en el sitio</p>
          </div>

          <div>
            <Label htmlFor="nombreCorto">Nombre Corto *</Label>
            <Input
              id="nombreCorto"
              value={formData.nombreCorto}
              onChange={(e) => handleChange('nombreCorto', e.target.value)}
              placeholder="La Bayer"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Nombre abreviado para espacios reducidos</p>
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion || ''}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Espacio cultural dedicado a la música y las artes..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="sobreNosotros">Sobre Nosotros</Label>
            <Textarea
              id="sobreNosotros"
              value={formData.sobreNosotros || ''}
              onChange={(e) => handleChange('sobreNosotros', e.target.value)}
              placeholder="Historia y misión de la organización..."
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor="logoUrl">URL del Logo</Label>
            <Input
              id="logoUrl"
              type="url"
              value={formData.logoUrl || ''}
              onChange={(e) => handleChange('logoUrl', e.target.value)}
              placeholder="https://ejemplo.com/logo.png"
            />
          </div>

          <div>
            <Label htmlFor="faviconUrl">URL del Favicon</Label>
            <Input
              id="faviconUrl"
              type="url"
              value={formData.faviconUrl || ''}
              onChange={(e) => handleChange('faviconUrl', e.target.value)}
              placeholder="https://ejemplo.com/favicon.ico"
            />
          </div>

          <div>
            <Label htmlFor="imagenDefault">Imagen por Defecto (Redes Sociales)</Label>
            <Input
              id="imagenDefault"
              type="url"
              value={formData.imagenDefault || ''}
              onChange={(e) => handleChange('imagenDefault', e.target.value)}
              placeholder="https://ejemplo.com/og-image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">Imagen que aparecerá al compartir en redes (1200x630px recomendado)</p>
          </div>
        </TabsContent>

        {/* Ubicación */}
        <TabsContent value="ubicacion" className="space-y-4">
          <div>
            <Label htmlFor="direccion">Dirección *</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              placeholder="Av. Juan B. Justo 6050"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ciudad">Ciudad *</Label>
              <Input
                id="ciudad"
                value={formData.ciudad}
                onChange={(e) => handleChange('ciudad', e.target.value)}
                placeholder="Buenos Aires"
                required
              />
            </div>

            <div>
              <Label htmlFor="provincia">Provincia *</Label>
              <Input
                id="provincia"
                value={formData.provincia}
                onChange={(e) => handleChange('provincia', e.target.value)}
                placeholder="CABA"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pais">País *</Label>
              <Input
                id="pais"
                value={formData.pais}
                onChange={(e) => handleChange('pais', e.target.value)}
                placeholder="Argentina"
                required
              />
            </div>

            <div>
              <Label htmlFor="codigoPostal">Código Postal</Label>
              <Input
                id="codigoPostal"
                value={formData.codigoPostal || ''}
                onChange={(e) => handleChange('codigoPostal', e.target.value)}
                placeholder="C1407"
              />
            </div>
          </div>
        </TabsContent>

        {/* Contacto */}
        <TabsContent value="contacto" className="space-y-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="hola@labayer.org"
              required
            />
          </div>

          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              type="tel"
              value={formData.telefono || ''}
              onChange={(e) => handleChange('telefono', e.target.value)}
              placeholder="+54 11 1234-5678"
            />
          </div>

          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp || ''}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              placeholder="5491112345678"
            />
            <p className="text-xs text-gray-500 mt-1">Número con código de país sin espacios ni signos</p>
          </div>
        </TabsContent>

        {/* Redes Sociales */}
        <TabsContent value="redes" className="space-y-4">
          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={formData.instagram || ''}
              onChange={(e) => handleChange('instagram', e.target.value)}
              placeholder="https://instagram.com/labayer"
            />
          </div>

          <div>
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              value={formData.facebook || ''}
              onChange={(e) => handleChange('facebook', e.target.value)}
              placeholder="https://facebook.com/labayer"
            />
          </div>

          <div>
            <Label htmlFor="twitter">Twitter / X</Label>
            <Input
              id="twitter"
              value={formData.twitter || ''}
              onChange={(e) => handleChange('twitter', e.target.value)}
              placeholder="https://twitter.com/labayer"
            />
          </div>

          <div>
            <Label htmlFor="youtube">YouTube</Label>
            <Input
              id="youtube"
              value={formData.youtube || ''}
              onChange={(e) => handleChange('youtube', e.target.value)}
              placeholder="https://youtube.com/@labayer"
            />
          </div>

          <div>
            <Label htmlFor="tiktok">TikTok</Label>
            <Input
              id="tiktok"
              value={formData.tiktok || ''}
              onChange={(e) => handleChange('tiktok', e.target.value)}
              placeholder="https://tiktok.com/@labayer"
            />
          </div>
        </TabsContent>

        {/* Personalización */}
        <TabsContent value="personalizar" className="space-y-4">
          <div>
            <Label htmlFor="colorPrimario">Color Primario</Label>
            <div className="flex gap-2">
              <Input
                id="colorPrimario"
                type="color"
                value={formData.colorPrimario || '#000000'}
                onChange={(e) => handleChange('colorPrimario', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={formData.colorPrimario || '#000000'}
                onChange={(e) => handleChange('colorPrimario', e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="colorSecundario">Color Secundario</Label>
            <div className="flex gap-2">
              <Input
                id="colorSecundario"
                type="color"
                value={formData.colorSecundario || '#ffffff'}
                onChange={(e) => handleChange('colorSecundario', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={formData.colorSecundario || '#ffffff'}
                onChange={(e) => handleChange('colorSecundario', e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="metaTitle">Meta Título (SEO)</Label>
            <Input
              id="metaTitle"
              value={formData.metaTitle || ''}
              onChange={(e) => handleChange('metaTitle', e.target.value)}
              placeholder="La Bayer Experimental - Eventos culturales"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">Máximo 60 caracteres</p>
          </div>

          <div>
            <Label htmlFor="metaDescription">Meta Descripción (SEO)</Label>
            <Textarea
              id="metaDescription"
              value={formData.metaDescription || ''}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
              placeholder="Espacio cultural dedicado a la música y las artes..."
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">Máximo 160 caracteres</p>
          </div>

          <div>
            <Label htmlFor="metaKeywords">Meta Keywords (SEO)</Label>
            <Input
              id="metaKeywords"
              value={formData.metaKeywords || ''}
              onChange={(e) => handleChange('metaKeywords', e.target.value)}
              placeholder="música, eventos, cultura, Buenos Aires"
            />
          </div>

          <div>
            <Label htmlFor="terminosUrl">URL de Términos y Condiciones</Label>
            <Input
              id="terminosUrl"
              type="url"
              value={formData.terminosUrl || ''}
              onChange={(e) => handleChange('terminosUrl', e.target.value)}
              placeholder="https://labayer.org/terminos"
            />
          </div>

          <div>
            <Label htmlFor="privacidadUrl">URL de Política de Privacidad</Label>
            <Input
              id="privacidadUrl"
              type="url"
              value={formData.privacidadUrl || ''}
              onChange={(e) => handleChange('privacidadUrl', e.target.value)}
              placeholder="https://labayer.org/privacidad"
            />
          </div>
        </TabsContent>

        {/* Pagos */}
        <TabsContent value="pagos" className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Importante:</strong> Los datos de Mercado Pago configurados aquí tienen prioridad sobre las variables de entorno. Deja estos campos vacíos si prefieres usar las variables de entorno.
            </p>
          </div>

          <div>
            <Label htmlFor="mercadoPagoAccessToken">Mercado Pago Access Token</Label>
            <Input
              id="mercadoPagoAccessToken"
              type="password"
              value={formData.mercadoPagoAccessToken || ''}
              onChange={(e) => handleChange('mercadoPagoAccessToken', e.target.value)}
              placeholder="APP_USR-..."
            />
            <p className="text-xs text-gray-500 mt-1">Token privado para procesar pagos</p>
          </div>

          <div>
            <Label htmlFor="mercadoPagoPublicKey">Mercado Pago Public Key</Label>
            <Input
              id="mercadoPagoPublicKey"
              value={formData.mercadoPagoPublicKey || ''}
              onChange={(e) => handleChange('mercadoPagoPublicKey', e.target.value)}
              placeholder="APP_USR-..."
            />
            <p className="text-xs text-gray-500 mt-1">Clave pública para el checkout</p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-4">Datos Bancarios</h3>

            <div>
              <Label htmlFor="cbu">CBU</Label>
              <Input
                id="cbu"
                value={formData.cbu || ''}
                onChange={(e) => handleChange('cbu', e.target.value)}
                placeholder="0000003100010000000000"
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="alias">Alias</Label>
              <Input
                id="alias"
                value={formData.alias || ''}
                onChange={(e) => handleChange('alias', e.target.value)}
                placeholder="labayer.mp"
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="cuit">CUIT</Label>
              <Input
                id="cuit"
                value={formData.cuit || ''}
                onChange={(e) => handleChange('cuit', e.target.value)}
                placeholder="20-12345678-9"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('Error')
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-green-50 text-green-800 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </form>
  )
}
