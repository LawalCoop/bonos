import { PrismaClient } from "@prisma/client";
import { NIVELES_DEFAULT } from "../lib/niveles";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding niveles...");
  for (const [nivel, info] of Object.entries(NIVELES_DEFAULT)) {
    await prisma.nivelConfig.upsert({
      where: { nivel: Number(nivel) },
      update: { nombre: info.nombre, icono: info.icono, puntos: info.puntos, descuento: info.descuento },
      create: { nivel: Number(nivel), nombre: info.nombre, icono: info.icono, puntos: info.puntos, descuento: info.descuento },
    });
    console.log(`✅ Nivel ${nivel}: ${info.icono} ${info.nombre} (${info.puntos} pts, ${info.descuento}%)`);
  }
  console.log("✨ Seed completado");
}

main().finally(() => prisma.$disconnect());
