import { PrismaClient } from "@prisma/client";
import { calcularDescuentos } from "../lib/descuentos";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Testing discount calculation system...\n");

  // Get first event (any status)
  const evento = await prisma.evento.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!evento) {
    console.log("❌ No events found. Please create an event first.");
    return;
  }

  console.log(`📅 Testing with event: ${evento.nombre}`);
  console.log(`💰 Base price: $${evento.precioBase}\n`);

  // Get first user
  const user = await prisma.user.findFirst({
    include: {
      organizacion: true,
    },
  });

  if (!user) {
    console.log("❌ No users found. Please create a user first.");
    return;
  }

  console.log(`👤 Testing with user: ${user.name || user.email}`);
  console.log(`   - Es Asociado: ${user.esAsociado ? "✅" : "❌"}`);
  console.log(`   - Nivel: ${user.nivel}`);
  console.log(`   - Organización: ${user.organizacion?.nombre || "Ninguna"}\n`);

  // Get all active discounts
  const descuentosActivos = await prisma.descuento.findMany({
    where: { activo: true },
    orderBy: { prioridad: "asc" },
  });

  console.log(`📊 Active discount rules: ${descuentosActivos.length}`);
  descuentosActivos.forEach((d) => {
    console.log(`   - ${d.nombre} (${d.tipo}): ${d.porcentaje}%`);
  });
  console.log();

  // Calculate discounts
  console.log("🔄 Calculating discounts...\n");
  const calculo = await calcularDescuentos(evento.id, user.id, 1);

  console.log("📈 RESULTS:");
  console.log(`   Base Price: $${calculo.precioBase}`);
  console.log(`   Applied Discounts: ${calculo.descuentos.length}`);

  if (calculo.descuentos.length > 0) {
    calculo.descuentos.forEach((d) => {
      console.log(`      • ${d.nombre}: -${d.porcentaje}% (-$${d.monto.toFixed(2)})`);
    });
  } else {
    console.log("      (No discounts applied)");
  }

  console.log(`   Total Discount: -$${calculo.totalDescuento.toFixed(2)}`);
  console.log(`   Final Price: $${calculo.precioFinal.toFixed(2)}`);
  console.log();

  // Test with 2 tickets
  console.log("🎫 Testing with 2 tickets...\n");
  const calculo2 = await calcularDescuentos(evento.id, user.id, 2);
  console.log(`   Base Price (x2): $${calculo2.precioBase * 2}`);
  console.log(`   Total Discount: -$${calculo2.totalDescuento.toFixed(2)}`);
  console.log(`   Final Price: $${calculo2.precioFinal.toFixed(2)}`);
  console.log();

  console.log("✅ Discount system test completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error during test:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
