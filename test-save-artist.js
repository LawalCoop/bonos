const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Obtener el evento
  const evento = await prisma.evento.findFirst({
    orderBy: { fecha: 'desc' }
  });

  if (!evento) {
    console.log('No hay eventos');
    return;
  }

  console.log(`\nEvento encontrado: ${evento.nombre} (${evento.id})`);

  // Obtener un artista
  const artista = await prisma.artista.findFirst();

  if (!artista) {
    console.log('No hay artistas');
    return;
  }

  console.log(`Artista encontrado: ${artista.nombre} (${artista.id})`);

  // Eliminar artistas existentes del evento
  await prisma.eventoArtista.deleteMany({
    where: { eventoId: evento.id }
  });

  console.log('Artistas anteriores eliminados');

  // Crear nueva relación
  const eventoArtista = await prisma.eventoArtista.create({
    data: {
      eventoId: evento.id,
      artistaId: artista.id,
      orden: 1,
      rol: 'Headliner'
    }
  });

  console.log('Nueva relación creada:', eventoArtista);

  // Verificar
  const verificacion = await prisma.evento.findUnique({
    where: { id: evento.id },
    include: {
      artistas: {
        include: {
          artista: true
        }
      }
    }
  });

  console.log('\n✅ VERIFICACIÓN:');
  console.log(`Evento: ${verificacion.nombre}`);
  console.log(`Artistas asignados: ${verificacion.artistas.length}`);
  if (verificacion.artistas.length > 0) {
    verificacion.artistas.forEach(ea => {
      console.log(`  - ${ea.artista.nombre} (${ea.rol})`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
