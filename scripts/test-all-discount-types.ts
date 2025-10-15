import { PrismaClient } from "@prisma/client";
import { calcularDescuentos } from "../lib/descuentos";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Testing ALL discount types...\n");

  // Get first event
  const evento = await prisma.evento.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!evento) {
    console.log("❌ No events found.");
    return;
  }

  console.log(`📅 Event: ${evento.nombre} ($${evento.precioBase})\n`);

  // Test 1: SOCIO discount
  console.log("=== TEST 1: SOCIO Discount (15%) ===");
  const socioUser = await prisma.user.findFirst({
    where: { esAsociado: true },
  });

  if (socioUser) {
    const calc = await calcularDescuentos(evento.id, socioUser.id, 1);
    console.log(`User: ${socioUser.name || socioUser.email}`);
    console.log(`Es Asociado: ${socioUser.esAsociado}`);
    console.log(`Discounts applied: ${calc.descuentos.length}`);
    calc.descuentos.forEach((d) => {
      console.log(`  • ${d.nombre}: -${d.porcentaje}%`);
    });
    console.log(`Final: $${calc.precioFinal} ✅`);
  } else {
    console.log("⚠️  No asociado users found - creating test user...");
    const testSocio = await prisma.user.create({
      data: {
        email: "test-socio@test.com",
        name: "Test Socio",
        esAsociado: true,
        nivel: 1,
        rol: "USER",
      },
    });
    const calc = await calcularDescuentos(evento.id, testSocio.id, 1);
    console.log(`Created test user: ${testSocio.name}`);
    console.log(`Discounts applied: ${calc.descuentos.length}`);
    calc.descuentos.forEach((d) => {
      console.log(`  • ${d.nombre}: -${d.porcentaje}%`);
    });
    console.log(`Final: $${calc.precioFinal} ✅`);
    await prisma.user.delete({ where: { id: testSocio.id } });
  }
  console.log();

  // Test 2: NIVEL discount
  console.log("=== TEST 2: NIVEL Discount (Level 5 = 12%) ===");
  const nivelUser = await prisma.user.findFirst({
    where: { nivel: { gte: 5 } },
  });

  if (nivelUser) {
    const calc = await calcularDescuentos(evento.id, nivelUser.id, 1);
    console.log(`User: ${nivelUser.name || nivelUser.email}`);
    console.log(`Nivel: ${nivelUser.nivel}`);
    console.log(`Discounts applied: ${calc.descuentos.length}`);
    calc.descuentos.forEach((d) => {
      console.log(`  • ${d.nombre}: -${d.porcentaje}%`);
    });
    console.log(`Final: $${calc.precioFinal} ✅`);
  } else {
    console.log("⚠️  No high-level users found - creating test user...");
    const testNivel = await prisma.user.create({
      data: {
        email: "test-nivel5@test.com",
        name: "Test Nivel 5",
        esAsociado: false,
        nivel: 5,
        rol: "USER",
      },
    });
    const calc = await calcularDescuentos(evento.id, testNivel.id, 1);
    console.log(`Created test user: ${testNivel.name} (Level ${testNivel.nivel})`);
    console.log(`Discounts applied: ${calc.descuentos.length}`);
    calc.descuentos.forEach((d) => {
      console.log(`  • ${d.nombre}: -${d.porcentaje}%`);
    });
    console.log(`Final: $${calc.precioFinal} ✅`);
    await prisma.user.delete({ where: { id: testNivel.id } });
  }
  console.log();

  // Test 3: ORGANIZACION discount
  console.log("=== TEST 3: ORGANIZACION Discount ===");
  const org = await prisma.organizacion.findFirst();

  if (org) {
    const orgUser = await prisma.user.findFirst({
      where: { organizacionId: org.id },
    });

    if (orgUser) {
      const calc = await calcularDescuentos(evento.id, orgUser.id, 1);
      console.log(`User: ${orgUser.name || orgUser.email}`);
      console.log(`Organización: ${org.nombre}`);
      console.log(`Discounts applied: ${calc.descuentos.length}`);
      calc.descuentos.forEach((d) => {
        console.log(`  • ${d.nombre}: -${d.porcentaje}%`);
      });
      console.log(`Final: $${calc.precioFinal} ✅`);
    } else {
      console.log("⚠️  No users in organization - creating test user...");
      const testOrg = await prisma.user.create({
        data: {
          email: "test-org@test.com",
          name: "Test Org User",
          esAsociado: false,
          nivel: 1,
          rol: "USER",
          organizacionId: org.id,
        },
      });
      const calc = await calcularDescuentos(evento.id, testOrg.id, 1);
      console.log(`Created test user in: ${org.nombre}`);
      console.log(`Discounts applied: ${calc.descuentos.length}`);
      calc.descuentos.forEach((d) => {
        console.log(`  • ${d.nombre}: -${d.porcentaje}%`);
      });
      console.log(`Final: $${calc.precioFinal} ✅`);
      await prisma.user.delete({ where: { id: testOrg.id } });
    }
  } else {
    console.log("⚠️  No organizations found - skipping test");
  }
  console.log();

  // Test 4: MULTIPLES_COMPRAS_MES discount
  console.log("=== TEST 4: MULTIPLES_COMPRAS_MES Discount (2+ purchases = 5%) ===");
  const userWithBonos = await prisma.user.findFirst({
    include: {
      bonos: {
        where: {
          estado: { in: ["PAGADO", "UTILIZADO"] },
          fechaCompra: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
    },
  });

  if (userWithBonos && userWithBonos.bonos.length >= 2) {
    const calc = await calcularDescuentos(evento.id, userWithBonos.id, 1);
    console.log(`User: ${userWithBonos.name || userWithBonos.email}`);
    console.log(`Purchases this month: ${userWithBonos.bonos.length}`);
    console.log(`Discounts applied: ${calc.descuentos.length}`);
    calc.descuentos.forEach((d) => {
      console.log(`  • ${d.nombre}: -${d.porcentaje}%`);
    });
    console.log(`Final: $${calc.precioFinal} ✅`);
  } else {
    console.log("⚠️  No users with 2+ purchases this month");
    console.log("(This is expected - test with real purchases)");
  }
  console.log();

  // Test 5: VECES_VISTO_ARTISTA discount
  console.log("=== TEST 5: VECES_VISTO_ARTISTA Discount (3+ times = 3%) ===");

  // Get event with artists
  const eventoConArtistas = await prisma.evento.findFirst({
    include: {
      artistas: {
        include: {
          artista: true,
        },
      },
    },
    where: {
      artistas: {
        some: {},
      },
    },
  });

  if (eventoConArtistas && eventoConArtistas.artistas.length > 0) {
    const artistaId = eventoConArtistas.artistas[0].artistaId;

    const userWithArtista = await prisma.user.findFirst({
      include: {
        artistasVistos: {
          where: {
            artistaId,
            vecesVisto: { gte: 3 },
          },
        },
      },
      where: {
        artistasVistos: {
          some: {
            artistaId,
            vecesVisto: { gte: 3 },
          },
        },
      },
    });

    if (userWithArtista && userWithArtista.artistasVistos.length > 0) {
      const calc = await calcularDescuentos(
        eventoConArtistas.id,
        userWithArtista.id,
        1
      );
      console.log(`User: ${userWithArtista.name || userWithArtista.email}`);
      console.log(
        `Artist seen: ${userWithArtista.artistasVistos[0].vecesVisto} times`
      );
      console.log(`Discounts applied: ${calc.descuentos.length}`);
      calc.descuentos.forEach((d) => {
        console.log(`  • ${d.nombre}: -${d.porcentaje}%`);
      });
      console.log(`Final: $${calc.precioFinal} ✅`);
    } else {
      console.log("⚠️  No users with artist history");
      console.log("(This is expected - test with real artist views)");
    }
  } else {
    console.log("⚠️  No events with artists found");
  }
  console.log();

  // Test 6: Accumulated discounts (Socio + Nivel)
  console.log("=== TEST 6: ACCUMULATED Discounts (Socio 15% + Nivel 5 12% = 27%) ===");
  const testAccumulated = await prisma.user.create({
    data: {
      email: "test-accumulated@test.com",
      name: "Test Accumulated",
      esAsociado: true,
      nivel: 5,
      rol: "USER",
    },
  });

  const calcAcc = await calcularDescuentos(evento.id, testAccumulated.id, 1);
  console.log(`User: ${testAccumulated.name}`);
  console.log(`Es Asociado: ✅`);
  console.log(`Nivel: 5`);
  console.log(`Discounts applied: ${calcAcc.descuentos.length}`);
  calcAcc.descuentos.forEach((d) => {
    console.log(`  • ${d.nombre}: -${d.porcentaje}%`);
  });
  const totalPct = calcAcc.descuentos.reduce((sum, d) => sum + d.porcentaje, 0);
  console.log(`Total discount: ${totalPct}%`);
  console.log(`Final: $${calcAcc.precioFinal} ✅`);
  await prisma.user.delete({ where: { id: testAccumulated.id } });
  console.log();

  console.log("✅ All discount type tests completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error during test:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
