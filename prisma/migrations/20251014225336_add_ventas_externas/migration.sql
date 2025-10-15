-- CreateTable
CREATE TABLE "VentaExterna" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "precio" DOUBLE PRECISION NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "vendidoPor" TEXT,
    "utilizado" BOOLEAN NOT NULL DEFAULT false,
    "fechaUtilizacion" TIMESTAMP(3),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VentaExterna_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VentaExterna_eventoId_idx" ON "VentaExterna"("eventoId");

-- CreateIndex
CREATE INDEX "VentaExterna_apellido_idx" ON "VentaExterna"("apellido");

-- CreateIndex
CREATE INDEX "VentaExterna_dni_idx" ON "VentaExterna"("dni");

-- AddForeignKey
ALTER TABLE "VentaExterna" ADD CONSTRAINT "VentaExterna_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
