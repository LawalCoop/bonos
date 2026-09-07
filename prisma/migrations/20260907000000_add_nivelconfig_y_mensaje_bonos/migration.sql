-- Reconcilia el drift generado por `prisma db push`.
-- Estos objetos ya existen en Neon (produccion) pero no en ninguna DB
-- creada desde `prisma migrate deploy`. Por eso todo es IF NOT EXISTS:
-- la migracion es segura de aplicar en ambas.

-- AlterTable
ALTER TABLE "Evento" ADD COLUMN IF NOT EXISTS "mensajeBonos" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "NivelConfig" (
    "id" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "puntos" INTEGER NOT NULL,
    "descuento" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NivelConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "NivelConfig_nivel_key" ON "NivelConfig"("nivel");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "NivelConfig_nivel_idx" ON "NivelConfig"("nivel");
