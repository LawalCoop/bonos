import { prisma } from '@/lib/prisma'
import { Configuracion } from '@prisma/client'

// Cache de configuración en memoria para reducir llamadas a DB
let cachedConfig: Configuracion | null = null
let cacheTime: number = 0
const CACHE_DURATION = 60 * 1000 // 60 segundos

/**
 * Obtiene la configuración del sitio
 * Usa caché en memoria para mejorar performance
 */
export async function getConfig(): Promise<Configuracion> {
  const now = Date.now()

  // Si hay caché válido, retornarlo
  if (cachedConfig && (now - cacheTime) < CACHE_DURATION) {
    return cachedConfig
  }

  // Buscar configuración en la DB
  let config = await prisma.configuracion.findFirst()

  // Si no existe, crear una con valores por defecto
  if (!config) {
    config = await prisma.configuracion.create({
      data: {
        nombreSitio: 'La Bayer Experimental',
        nombreCorto: 'La Bayer',
        direccion: 'Av. Juan B. Justo 6050',
        ciudad: 'Buenos Aires',
        provincia: 'CABA',
        pais: 'Argentina',
        email: 'hola@labayer.org',
      },
    })
  }

  // Actualizar caché
  cachedConfig = config
  cacheTime = now

  return config
}

/**
 * Invalida el caché de configuración
 * Llamar después de actualizar la configuración
 */
export function invalidateConfigCache() {
  cachedConfig = null
  cacheTime = 0
}

/**
 * Obtiene el access token de Mercado Pago desde la configuración o ENV
 */
export async function getMercadoPagoAccessToken(): Promise<string> {
  const config = await getConfig()
  return config.mercadoPagoAccessToken || process.env.MERCADOPAGO_ACCESS_TOKEN || ''
}

/**
 * Obtiene la public key de Mercado Pago desde la configuración o ENV
 */
export async function getMercadoPagoPublicKey(): Promise<string> {
  const config = await getConfig()
  return config.mercadoPagoPublicKey || process.env.MERCADOPAGO_PUBLIC_KEY || ''
}
