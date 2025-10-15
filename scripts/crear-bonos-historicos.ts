import { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";

const prisma = new PrismaClient();

async function main() {
  const email = "hernan.gigena@lawal.com.ar";

  // Buscar usuario
  const usuario = await prisma.user.findUnique({
    where: { email },
  });

  if (!usuario) {
    console.error("Usuario no encontrado");
    return;
  }

  console.log("Usuario encontrado:", usuario.name, usuario.email);

  // Buscar eventos pasados
  const eventosPasados = await prisma.evento.findMany({
    where: {
      fecha: {
        lt: new Date(),
      },
    },
    orderBy: {
      fecha: "desc",
    },
    take: 5,
  });

  console.log(`\nEncontrados ${eventosPasados.length} eventos pasados`);

  if (eventosPasados.length === 0) {
    console.log("No hay eventos pasados para crear bonos históricos");
    return;
  }

  // Crear bonos utilizados para cada evento pasado
  for (const evento of eventosPasados) {
    console.log(`\nCreando bonos para: ${evento.nombre} (${evento.fecha.toLocaleDateString()})`);

    // Crear 1-3 bonos por evento (varía para que se vea más realista)
    const cantidadBonos = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < cantidadBonos; i++) {
      const codigo = `HIST-${evento.id}-${usuario.id}-${Date.now()}-${i}`;
      const qrCode = await QRCode.toDataURL(codigo);

      // Fecha de compra: 1-7 días antes del evento
      const diasAntes = Math.floor(Math.random() * 7) + 1;
      const fechaCompra = new Date(evento.fecha);
      fechaCompra.setDate(fechaCompra.getDate() - diasAntes);

      // Fecha de utilización: día del evento
      const fechaUtilizacion = new Date(evento.fecha);
      fechaUtilizacion.setHours(evento.horaInicio ? parseInt(evento.horaInicio.split(":")[0]) : 20);

      const bono = await prisma.bono.create({
        data: {
          codigo,
          qrCode,
          eventoId: evento.id,
          usuarioId: usuario.id,
          precioFinal: evento.precioBase * 0.85, // Con 15% de descuento
          descuentosAplicados: {
            descuentos: [
              {
                tipo: "NIVEL",
                nombre: `Nivel ${Math.min(Math.floor(Math.random() * 4) + 1, 8)}: Fan`,
                porcentaje: 15,
                monto: evento.precioBase * 0.15,
              },
            ],
          },
          estado: "UTILIZADO",
          fechaCompra,
          fechaUtilizacion,
        },
      });

      console.log(`  ✓ Bono creado: ${bono.codigo} - $${bono.precioFinal}`);
    }
  }

  // Actualizar puntos del usuario (100 puntos por evento asistido)
  const totalEventosAsistidos = eventosPasados.length;
  const puntosNuevos = totalEventosAsistidos * 100;

  await prisma.user.update({
    where: { id: usuario.id },
    data: {
      puntos: {
        increment: puntosNuevos,
      },
    },
  });

  console.log(`\n✨ ${puntosNuevos} puntos agregados al usuario`);
  console.log(`\n✅ Bonos históricos creados exitosamente!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
