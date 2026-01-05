import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding configuración inicial...')

  // Verificar si ya existe configuración
  const existingConfig = await prisma.configuracion.findFirst()

  if (existingConfig) {
    console.log('⚠️  Ya existe una configuración. Actualizando...')
    const updated = await prisma.configuracion.update({
      where: { id: existingConfig.id },
      data: {
        nombreSitio: 'La Bayer Experimental',
        nombreCorto: 'La Bayer',
        descripcion: 'Espacio cultural de la Biblioteca Popular Osvaldo Bayer. Todo lo recaudado va para les artistas y la ampliación de la biblioteca.',
        direccion: 'Av. Juan B. Justo 6050',
        ciudad: 'Buenos Aires',
        provincia: 'CABA',
        pais: 'Argentina',
        email: 'hola@labayer.org',
      },
    })
    console.log('✅ Configuración actualizada:', updated.nombreSitio)
  } else {
    console.log('📝 Creando configuración inicial...')
    const created = await prisma.configuracion.create({
      data: {
        nombreSitio: 'La Bayer Experimental',
        nombreCorto: 'La Bayer',
        descripcion: 'Espacio cultural de la Biblioteca Popular Osvaldo Bayer. Todo lo recaudado va para les artistas y la ampliación de la biblioteca.',
        direccion: 'Av. Juan B. Justo 6050',
        ciudad: 'Buenos Aires',
        provincia: 'CABA',
        pais: 'Argentina',
        email: 'hola@labayer.org',
        colorPrimario: '#000000',
        colorSecundario: '#ffffff',
        sobreNosotros: 'La Bayer Experimental es el espacio cultural de la Biblioteca Popular Osvaldo Bayer, dedicado a promover la música, las artes y la cultura en la comunidad.',
      },
    })
    console.log('✅ Configuración creada:', created.nombreSitio)
  }

  console.log('✨ Seed completado')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
