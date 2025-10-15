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

  // Crear eventos pasados
  const eventosPasados = [
    {
      nombre: "Noche de Jazz Experimental",
      fecha: new Date(2024, 8, 15), // Septiembre 15, 2024
      descripcion: "Una noche mágica con los mejores exponentes del jazz experimental argentino",
      horaInicio: "21:00",
      capacidad: 80,
    },
    {
      nombre: "Folklore Fusión",
      fecha: new Date(2024, 9, 10), // Octubre 10, 2024
      descripcion: "Encuentro de folklore y música electrónica",
      horaInicio: "20:30",
      capacidad: 100,
    },
    {
      nombre: "Rock Independiente Showcase",
      fecha: new Date(2024, 10, 5), // Noviembre 5, 2024
      descripcion: "Las mejores bandas indie de la escena local",
      horaInicio: "22:00",
      capacidad: 120,
    },
    {
      nombre: "Acústico a la Luz de las Velas",
      fecha: new Date(2024, 11, 20), // Diciembre 20, 2024
      descripcion: "Sesión acústica íntima en La Bayer",
      horaInicio: "19:30",
      capacidad: 60,
    },
    {
      nombre: "Año Nuevo en La Bayer",
      fecha: new Date(2024, 11, 31), // Diciembre 31, 2024
      descripcion: "Despedimos el año con música en vivo",
      horaInicio: "23:00",
      capacidad: 150,
    },
  ];

  const eventosCreados = [];

  for (const eventoData of eventosPasados) {
    const slug = eventoData.nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const evento = await prisma.evento.create({
      data: {
        nombre: eventoData.nombre,
        slug: `${slug}-${eventoData.fecha.getFullYear()}-${eventoData.fecha.getMonth() + 1}`,
        descripcion: eventoData.descripcion,
        fecha: eventoData.fecha,
        horaInicio: eventoData.horaInicio,
        ubicacion: "La Bayer Experimental",
        capacidad: eventoData.capacidad,
        precioBase: 15000,
        imagenPrincipal: "/images/default-event.jpg",
        estado: "PASADO",
      },
    });

    console.log(`✓ Evento creado: ${evento.nombre} - ${evento.fecha.toLocaleDateString()}`);
    eventosCreados.push(evento);
  }

  // Ahora crear bonos para cada evento
  console.log("\n🎫 Creando bonos históricos...\n");

  for (const evento of eventosCreados) {
    // Crear 1-3 bonos por evento
    const cantidadBonos = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < cantidadBonos; i++) {
      const codigo = `HIST-${evento.id}-${usuario.id}-${Date.now()}-${i}`;
      const qrCode = await QRCode.toDataURL(codigo);

      // Fecha de compra: 3-14 días antes del evento
      const diasAntes = Math.floor(Math.random() * 12) + 3;
      const fechaCompra = new Date(evento.fecha);
      fechaCompra.setDate(fechaCompra.getDate() - diasAntes);

      // Fecha de utilización: día del evento
      const fechaUtilizacion = new Date(evento.fecha);
      const horaEvento = evento.horaInicio ? parseInt(evento.horaInicio.split(":")[0]) : 20;
      fechaUtilizacion.setHours(horaEvento);
      fechaUtilizacion.setMinutes(Math.floor(Math.random() * 30)); // Variar minutos

      const bono = await prisma.bono.create({
        data: {
          codigo,
          qrCode,
          eventoId: evento.id,
          usuarioId: usuario.id,
          precioFinal: evento.precioBase * 0.85, // Con 15% de descuento de nivel
          descuentosAplicados: {
            descuentos: [
              {
                tipo: "NIVEL",
                nombre: "Nivel 4: Habitué",
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

      console.log(`  ✓ Bono para ${evento.nombre}: ${codigo} - $${bono.precioFinal}`);
    }
  }

  // Actualizar puntos del usuario
  const totalEventos = eventosCreados.length;
  const puntosNuevos = totalEventos * 100;

  const usuarioActualizado = await prisma.user.update({
    where: { id: usuario.id },
    data: {
      puntos: {
        increment: puntosNuevos,
      },
    },
  });

  console.log(`\n✨ Total de puntos del usuario: ${usuarioActualizado.puntos}`);
  console.log(`\n✅ ¡${eventosCreados.length} eventos pasados y bonos históricos creados exitosamente!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
