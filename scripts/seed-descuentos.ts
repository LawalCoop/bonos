import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding descuentos iniciales...");

  // 1. Descuento por ser Socio (15%)
  await prisma.descuento.upsert({
    where: { id: "socio-base" },
    update: {},
    create: {
      id: "socio-base",
      nombre: "Socie de La Bayer",
      descripcion: "Descuento por ser socio/asociado de la biblioteca",
      tipo: "SOCIO",
      porcentaje: 15,
      esAcumulable: true,
      prioridad: 1,
      activo: true,
    },
  });

  console.log("✅ Descuento Socio creado");

  // 2. Descuentos por Nivel
  const nivelesDescuentos = [
    { nivel: 2, porcentaje: 5, nombre: "Explorando" },
    { nivel: 3, porcentaje: 8, nombre: "De la Casa" },
    { nivel: 4, porcentaje: 10, nombre: "Entusiasta" },
    { nivel: 5, porcentaje: 12, nombre: "Incondicional" },
    { nivel: 6, porcentaje: 15, nombre: "Pilar" },
    { nivel: 7, porcentaje: 18, nombre: "Referente" },
    { nivel: 8, porcentaje: 20, nombre: "Guardián" },
  ];

  for (const nivel of nivelesDescuentos) {
    await prisma.descuento.upsert({
      where: { id: `nivel-${nivel.nivel}` },
      update: {},
      create: {
        id: `nivel-${nivel.nivel}`,
        nombre: `Descuento Nivel ${nivel.nivel} (${nivel.nombre})`,
        descripcion: `Descuento por alcanzar el nivel ${nivel.nivel}`,
        tipo: "NIVEL",
        porcentaje: nivel.porcentaje,
        nivelMinimo: nivel.nivel,
        esAcumulable: true,
        prioridad: 2,
        activo: true,
      },
    });
  }

  console.log(`✅ ${nivelesDescuentos.length} descuentos por nivel creados`);

  // 3. Descuentos por Veces Visto Artista
  const vecesVistoDescuentos = [
    { veces: 3, porcentaje: 3 },
    { veces: 5, porcentaje: 5 },
    { veces: 10, porcentaje: 8 },
  ];

  for (const vv of vecesVistoDescuentos) {
    await prisma.descuento.upsert({
      where: { id: `veces-visto-${vv.veces}` },
      update: {},
      create: {
        id: `veces-visto-${vv.veces}`,
        nombre: `Fan del artista (${vv.veces}+ veces)`,
        descripcion: `Descuento por haber visto al artista ${vv.veces} o más veces`,
        tipo: "VECES_VISTO_ARTISTA",
        porcentaje: vv.porcentaje,
        vecesVistoMinimo: vv.veces,
        esAcumulable: true,
        prioridad: 3,
        activo: true,
      },
    });
  }

  console.log(
    `✅ ${vecesVistoDescuentos.length} descuentos por veces visto creados`
  );

  // 4. Descuento por Múltiples Compras en el Mes
  await prisma.descuento.upsert({
    where: { id: "multiples-compras-mes" },
    update: {},
    create: {
      id: "multiples-compras-mes",
      nombre: "Múltiples Compras en el Mes",
      descripcion:
        "Descuento por comprar 2 o más bonos en el mismo mes calendario",
      tipo: "MULTIPLES_COMPRAS_MES",
      porcentaje: 5,
      comprasMesMinimo: 2,
      esAcumulable: true,
      prioridad: 4,
      activo: true,
    },
  });

  console.log("✅ Descuento múltiples compras creado");

  // 5. Descuentos por Organización (si ya existen organizaciones)
  const organizaciones = await prisma.organizacion.findMany();

  for (const org of organizaciones) {
    await prisma.descuento.upsert({
      where: { id: `org-${org.id}` },
      update: {},
      create: {
        id: `org-${org.id}`,
        nombre: `${org.nombre}`,
        descripcion: `Descuento por pertenecer a ${org.nombre}`,
        tipo: "ORGANIZACION",
        porcentaje: org.descuentoPorcentaje,
        organizacionId: org.id,
        esAcumulable: true,
        prioridad: 2,
        activo: org.activo,
      },
    });
  }

  if (organizaciones.length > 0) {
    console.log(
      `✅ ${organizaciones.length} descuentos por organización creados`
    );
  }

  console.log("✨ Seeding completado!");
}

main()
  .catch((e) => {
    console.error("❌ Error al hacer seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
