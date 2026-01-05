import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getConfig } from '@/lib/config'

export const dynamic = 'force-dynamic'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

type RequestBody = {
  tipo: 'bio' | 'descripcion_evento'
  nombreArtista: string
  ciudad?: string
  contextoEspacio?: {
    nombre: string
    descripcion: string
    ciudad: string
    tipo?: string
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json()
    const { tipo, nombreArtista, ciudad, contextoEspacio } = body

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY no configurada' },
        { status: 500 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    let prompt = ''

    if (tipo === 'bio') {
      // Bio de artista - objetiva con información real
      prompt = `Genera una biografía profesional para el artista o banda musical "${nombreArtista}"${ciudad ? ` de ${ciudad}` : ''}.

REGLAS CRÍTICAS - DEBES SEGUIRLAS ESTRICTAMENTE:
1. Si NO CONOCES al artista, escribe SOLAMENTE: "Artista de ${ciudad || 'la escena local'}. Información detallada próximamente."
2. Si CONOCES al artista, incluye SOLAMENTE información que sepas que es REAL:
   - Estilo y género musical verificable
   - Álbumes reales (SOLO si estás 100% seguro de los nombres)
   - Colaboraciones reales (SOLO si estás 100% seguro)
   - Logros verificables

PROHIBIDO ABSOLUTAMENTE:
- Inventar nombres de álbumes
- Inventar colaboraciones
- Inventar fechas o eventos
- Especular sobre discografía

Si tienes dudas sobre algún dato específico, NO lo incluyas.
Máximo 2 párrafos.

Responde SOLO con la biografía, sin comentarios adicionales.`
    } else {
      // Descripción de evento - con contexto del espacio
      // Normalizar campos entre contextoEspacio y getConfig()
      let espacioNombre: string
      let espacioDescripcion: string
      let espacioCiudad: string
      let espacioTipo: string | undefined

      if (contextoEspacio) {
        espacioNombre = contextoEspacio.nombre
        espacioDescripcion = contextoEspacio.descripcion
        espacioCiudad = contextoEspacio.ciudad
        espacioTipo = contextoEspacio.tipo
      } else {
        const config = await getConfig()
        espacioNombre = config.nombreSitio
        espacioDescripcion = config.descripcion || 'Espacio cultural independiente'
        espacioCiudad = config.ciudad
        espacioTipo = undefined
      }

      prompt = `Genera una descripción atractiva para un evento musical con "${nombreArtista}" en ${espacioNombre || 'el espacio cultural'}.

CONTEXTO DEL ESPACIO:
- Nombre: ${espacioNombre}
- Descripción: ${espacioDescripcion}
- Ciudad: ${espacioCiudad}
${espacioTipo ? `- Tipo: ${espacioTipo}` : ''}

REGLAS CRÍTICAS:
1. Si NO CONOCES al artista:
   - Escribe una descripción genérica sobre la experiencia musical en el espacio
   - NO inventes álbumes, colaboraciones o datos específicos del artista
   - Enfócate en la atmósfera y propuesta del espacio

2. Si CONOCES al artista:
   - Menciona SOLO datos reales verificables
   - Álbumes reales (SOLO si estás 100% seguro)
   - NO especules sobre su música si no la conoces

3. En ambos casos:
   - Explica por qué el evento encaja con la propuesta del espacio
   - Genera entusiasmo por la experiencia en vivo
   - Máximo 2 párrafos

Responde SOLO con la descripción del evento, sin comentarios adicionales.`
    }

    const result = await model.generateContent(prompt)
    const response = await result.response
    const texto = response.text()

    return NextResponse.json({ texto })
  } catch (error) {
    console.error('Error al generar texto con IA:', error)
    return NextResponse.json(
      {
        error: 'Error al generar texto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
