/*
  Warnings:

  - You are about to drop the column `puntosMinimos` on the `Descuento` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Descuento" DROP COLUMN "puntosMinimos",
ADD COLUMN     "comprasMesMinimo" INTEGER,
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "organizacionId" TEXT,
ADD COLUMN     "vecesVistoMinimo" INTEGER;

-- AddForeignKey
ALTER TABLE "Descuento" ADD CONSTRAINT "Descuento_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
