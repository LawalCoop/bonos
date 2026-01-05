'use client'

import { useEffect, useState } from 'react'
import { Configuracion } from '@prisma/client'

type PublicConfig = Omit<Configuracion, 'mercadoPagoAccessToken' | 'mercadoPagoPublicKey'>

export function useConfig() {
  const [config, setConfig] = useState<PublicConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/configuracion')
        if (!res.ok) throw new Error('Error al cargar configuración')
        const data = await res.json()
        setConfig(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return { config, loading, error }
}
