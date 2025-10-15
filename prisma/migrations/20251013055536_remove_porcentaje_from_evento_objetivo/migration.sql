/*
  Warnings:

  - You are about to drop the column `porcentaje` on the `EventoObjetivo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventoObjetivo" DROP COLUMN "porcentaje",
ALTER COLUMN "montoAsignado" SET DEFAULT 0;
