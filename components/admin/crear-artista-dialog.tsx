'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { GenerarConIAButton } from './generar-con-ia-button'
import slugify from 'slugify'

type CrearArtistaDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onArtistaCreado: (artista: { id: string; nombre: string }) => void
}

export function CrearArtistaDialog({
  open,
  onOpenChange,
  onArtistaCreado,
}: CrearArtistaDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    nombre: '',
    ciudad: '',
    bio: '',
    linkInstagram: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const slug = slugify(formData.nombre, { lower: true, strict: true })

      const res = await fetch('/api/admin/artistas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          slug,
          ciudad: formData.ciudad,
          provincia: '',
          pais: 'Argentina',
          esLocal: true,
          bio: formData.bio || `${formData.nombre} - ${formData.ciudad}`,
          linkInstagram: formData.linkInstagram,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al crear artista')
      }

      const artista = await res.json()

      // Notificar al padre que se creó el artista
      onArtistaCreado(artista)

      // Limpiar formulario y cerrar
      setFormData({ nombre: '', ciudad: '', bio: '', linkInstagram: '' })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ nombre: '', ciudad: '', bio: '', linkInstagram: '' })
    setError('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Artista</DialogTitle>
          <DialogDescription>
            Crea un artista rápidamente. Podrás editar más detalles después.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Ej: Los Piojos"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ciudad">
                Ciudad <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ciudad"
                value={formData.ciudad}
                onChange={(e) =>
                  setFormData({ ...formData, ciudad: e.target.value })
                }
                placeholder="Ej: Buenos Aires"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio">Bio (opcional)</Label>
                <GenerarConIAButton
                  tipo="bio"
                  nombreArtista={formData.nombre}
                  ciudad={formData.ciudad}
                  onTextoGenerado={(texto) =>
                    setFormData({ ...formData, bio: texto })
                  }
                  size="sm"
                  variant="secondary"
                />
              </div>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Breve descripción del artista..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkInstagram">Instagram (opcional)</Label>
              <Input
                id="linkInstagram"
                type="url"
                value={formData.linkInstagram}
                onChange={(e) =>
                  setFormData({ ...formData, linkInstagram: e.target.value })
                }
                placeholder="https://instagram.com/artista"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Artista
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
