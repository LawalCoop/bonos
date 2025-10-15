import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Uso: npm run make-admin <email>");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`Usuario con email ${email} no encontrado`);
      process.exit(1);
    }

    const updated = await prisma.user.update({
      where: { email },
      data: {
        rol: "ADMIN",
      },
    });

    console.log(`✅ Usuario ${updated.email} actualizado a ADMIN`);
    console.log(`Nombre: ${updated.name || updated.nombre}`);
    console.log(`Rol: ${updated.rol}`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
