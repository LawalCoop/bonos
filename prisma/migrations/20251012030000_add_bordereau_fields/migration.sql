-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "porcentajeArtista" DOUBLE PRECISION NOT NULL DEFAULT 70,
ADD COLUMN     "porcentajeBayer" DOUBLE PRECISION NOT NULL DEFAULT 30;

-- CreateTable
CREATE TABLE "GastoEvento" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "descripcion" TEXT,
    "monto" DOUBLE PRECISION NOT NULL,
    "esCompartido" BOOLEAN NOT NULL DEFAULT false,
    "porcentajeArtista" DOUBLE PRECISION DEFAULT 50,
    "porcentajeBayer" DOUBLE PRECISION DEFAULT 50,
    "proveedor" TEXT,
    "pagado" BOOLEAN NOT NULL DEFAULT false,
    "fechaPago" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GastoEvento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GastoEvento_eventoId_idx" ON "GastoEvento"("eventoId");

-- AddForeignKey
ALTER TABLE "GastoEvento" ADD CONSTRAINT "GastoEvento_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
