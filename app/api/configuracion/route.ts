import { NextResponse } from 'next/server'
import { getConfig } from '@/lib/config'

export const dynamic = 'force-dynamic'

/**
 * GET /api/configuracion
 * Obtiene la configuración pública del sitio
 * No incluye datos sensibles como tokens de Mercado Pago
 */
export async function GET() {
  try {
    const config = await getConfig()

    // Omitir campos sensibles
    const { mercadoPagoAccessToken, mercadoPagoPublicKey, ...publicConfig } = config

    return NextResponse.json(publicConfig)
  } catch (error) {
    console.error('Error al obtener configuración:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}
