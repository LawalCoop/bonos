const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n=== EVENTOS CON SUS ARTISTAS ===\n');

  const eventos = await prisma.evento.findMany({
    include: {
      artistas: {
        include: {
          artista: true
        },
        orderBy: {
          orden: 'asc'
        }
      }
    },
    orderBy: {
      fecha: 'desc'
    },
    take: 5
  });

  for (const evento of eventos) {
    console.log(`📅 ${evento.nombre} (ID: ${evento.id})`);
    console.log(`   Fecha: ${evento.fecha}`);
    if (evento.artistas.length === 0) {
      console.log(`   ⚠️  SIN ARTISTAS ASIGNADOS`);
    } else {
      console.log(`   Artistas:`);
      for (const ea of evento.artistas) {
        console.log(`      ${ea.orden}. ${ea.artista.nombre} - ${ea.rol}`);
      }
    }
    console.log('');
  }

  console.log('\n=== REGISTROS EN EventoArtista ===\n');
  const eventoArtistas = await prisma.eventoArtista.findMany({
    include: {
      artista: true,
      evento: {
        select: {
          nombre: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  });

  for (const ea of eventoArtistas) {
    console.log(`🎤 ${ea.artista.nombre} → ${ea.evento.nombre}`);
    console.log(`   Orden: ${ea.orden}, Rol: ${ea.rol}`);
    console.log(`   Created: ${ea.createdAt}`);
    console.log('');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
