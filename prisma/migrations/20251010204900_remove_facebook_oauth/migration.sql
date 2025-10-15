/*
  Warnings:

  - You are about to drop the column `facebookId` on the `Usuario` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Usuario_facebookId_key";

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "facebookId";
