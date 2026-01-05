'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'

type GenerarConIAButtonProps = {
  tipo: 'bio' | 'descripcion_evento'
  nombreArtista: string
  ciudad?: string
  contextoEspacio?: {
    nombre: string
    descripcion: string
    ciudad: string
    tipo?: string
  }
  onTextoGenerado: (texto: string) => void
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  disabled?: boolean
}

export function GenerarConIAButton({
  tipo,
  nombreArtista,
  ciudad,
  contextoEspacio,
  onTextoGenerado,
  variant = 'outline',
  size = 'default',
  disabled = false,
}: GenerarConIAButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerar = async () => {
    if (!nombreArtista.trim()) {
      setError('Primero ingresa el nombre del artista')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/ai/generar-texto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          nombreArtista,
          ciudad,
          contextoEspacio,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al generar texto')
      }

      const { texto } = await res.json()
      onTextoGenerado(texto)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      console.error('Error al generar con IA:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleGenerar}
        disabled={loading || disabled || !nombreArtista.trim()}
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generar con IA
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
