-- AlterTable
ALTER TABLE "Promocion" ADD COLUMN "codigo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Promocion_codigo_key" ON "Promocion"("codigo");

-- CreateIndex
CREATE INDEX "Promocion_codigo_idx" ON "Promocion"("codigo");

-- AddForeignKey
ALTER TABLE "Promocion" ADD CONSTRAINT "Promocion_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
