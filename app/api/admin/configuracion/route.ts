import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { getConfig, invalidateConfigCache } from '@/lib/config'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/configuracion
 * Obtiene la configuración completa (incluye datos sensibles)
 * Solo para admins
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.rol || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const config = await getConfig()

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error al obtener configuración:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/configuracion
 * Actualiza la configuración del sitio
 * Solo para admins
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.rol || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    console.log('📝 Datos recibidos:', body)

    // Obtener la configuración actual
    const currentConfig = await getConfig()
    console.log('🔍 Config actual ID:', currentConfig.id)

    // Filtrar solo los campos actualizables (excluir id, createdAt, updatedAt)
    const { id, createdAt, updatedAt, ...updateData } = body
    console.log('✏️ Datos a actualizar:', updateData)

    // Actualizar la configuración
    const updatedConfig = await prisma.configuracion.update({
      where: { id: currentConfig.id },
      data: updateData,
    })

    // Invalidar caché
    invalidateConfigCache()

    console.log('✅ Configuración actualizada correctamente')
    return NextResponse.json(updatedConfig)
  } catch (error) {
    console.error('❌ Error al actualizar configuración:', error)
    console.error('Error completo:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: 'Error al actualizar configuración', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
