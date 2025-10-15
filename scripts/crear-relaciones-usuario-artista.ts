import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function crearRelacionesUsuarioArtista() {
  console.log('🎵 Iniciando creación de relaciones UsuarioArtista...\n');

  try {
    // Obtener todos los bonos PAGADO o UTILIZADO con usuario asignado
    const bonos = await prisma.bono.findMany({
      where: {
        estado: {
          in: ['PAGADO', 'UTILIZADO'],
        },
        usuarioId: {
          not: null,
        },
      },
      include: {
        evento: {
          include: {
            artistas: {
              select: {
                artistaId: true,
              },
            },
          },
        },
      },
      orderBy: {
        fechaCompra: 'asc',
      },
    });

    console.log(`📊 Encontrados ${bonos.length} bonos con usuario asignado\n`);

    // Agrupar bonos por usuario y evento para procesar una sola vez por combinación
    const combinaciones = new Map<string, { usuarioId: string; eventoId: string; artistas: string[]; fechaCompra: Date }>();

    for (const bono of bonos) {
      if (!bono.usuarioId || !bono.evento) continue;

      const key = `${bono.usuarioId}-${bono.eventoId}`;

      if (!combinaciones.has(key)) {
        combinaciones.set(key, {
          usuarioId: bono.usuarioId,
          eventoId: bono.eventoId,
          artistas: bono.evento.artistas.map(ea => ea.artistaId),
          fechaCompra: bono.fechaCompra,
        });
      }
    }

    console.log(`🔗 ${combinaciones.size} combinaciones únicas de usuario-evento a procesar\n`);

    let relacionesCreadas = 0;
    let relacionesActualizadas = 0;
    let errores = 0;

    // Procesar cada combinación
    for (const [key, { usuarioId, eventoId, artistas, fechaCompra }] of Array.from(combinaciones)) {
      console.log(`  Procesando: Usuario ${usuarioId.substring(0, 8)}... en Evento ${eventoId.substring(0, 8)}...`);

      for (const artistaId of artistas) {
        try {
          // Buscar si ya existe la relación
          const relacionExistente = await prisma.usuarioArtista.findFirst({
            where: {
              usuarioId,
              artistaId,
            },
          });

          if (relacionExistente) {
            // Actualizar: incrementar vecesVisto y actualizar fechas si es necesario
            await prisma.usuarioArtista.update({
              where: { id: relacionExistente.id },
              data: {
                vecesVisto: { increment: 1 },
                // Solo actualizar ultimaVez si esta compra es más reciente
                ...(fechaCompra > relacionExistente.ultimaVez ? { ultimaVez: fechaCompra } : {}),
                // Solo actualizar primeraVez si esta compra es más antigua
                ...(fechaCompra < relacionExistente.primeraVez ? { primeraVez: fechaCompra } : {}),
              },
            });
            relacionesActualizadas++;
            console.log(`    ✓ Actualizada relación con artista ${artistaId.substring(0, 8)}...`);
          } else {
            // Crear nueva relación
            await prisma.usuarioArtista.create({
              data: {
                usuarioId,
                artistaId,
                vecesVisto: 1,
                primeraVez: fechaCompra,
                ultimaVez: fechaCompra,
                esFavorito: false,
              },
            });
            relacionesCreadas++;
            console.log(`    ✓ Creada relación con artista ${artistaId.substring(0, 8)}...`);
          }
        } catch (error: any) {
          console.error(`    ✗ Error con artista ${artistaId}: ${error.message}`);
          errores++;
        }
      }
    }

    console.log('\n📈 Resumen:');
    console.log(`  ✅ Relaciones creadas: ${relacionesCreadas}`);
    console.log(`  🔄 Relaciones actualizadas: ${relacionesActualizadas}`);
    console.log(`  ❌ Errores: ${errores}`);
    console.log('\n✨ ¡Proceso completado!\n');

  } catch (error) {
    console.error('❌ Error fatal:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
crearRelacionesUsuarioArtista()
  .catch((error) => {
    console.error('Error ejecutando script:', error);
    process.exit(1);
  });
