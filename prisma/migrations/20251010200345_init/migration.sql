-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT,
    "telefono" TEXT,
    "avatar" TEXT,
    "emailVerified" TIMESTAMP(3),
    "googleId" TEXT,
    "facebookId" TEXT,
    "authProvider" TEXT NOT NULL DEFAULT 'EMAIL',
    "esAsociado" BOOLEAN NOT NULL DEFAULT false,
    "fechaAsociado" TIMESTAMP(3),
    "mutualId" TEXT,
    "puntos" INTEGER NOT NULL DEFAULT 0,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "notificacionesEmail" BOOLEAN NOT NULL DEFAULT true,
    "notificacionesEventos" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "precioBase" DOUBLE PRECISION NOT NULL,
    "esFechaEspecial" BOOLEAN NOT NULL DEFAULT false,
    "motivoFechaEspecial" TEXT,
    "precioEspecial" DOUBLE PRECISION,
    "imagenPrincipal" TEXT NOT NULL,
    "galeria" TEXT[],
    "videoYoutubeId" TEXT,
    "costoArtistas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gastosProduccion" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRecaudado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "utilidad" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "artistasCobrado" BOOLEAN NOT NULL DEFAULT false,
    "fechaPagoArtistas" TIMESTAMP(3),
    "notas" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PROGRAMADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artista" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "provincia" TEXT,
    "pais" TEXT NOT NULL DEFAULT 'Argentina',
    "esLocal" BOOLEAN NOT NULL DEFAULT false,
    "foto" TEXT,
    "linkInstagram" TEXT,
    "linkSpotify" TEXT,
    "linkBandcamp" TEXT,
    "linkWeb" TEXT,
    "linkYoutube" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoArtista" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "artistaId" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 1,
    "rol" TEXT,

    CONSTRAINT "EventoArtista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bono" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "precioFinal" DOUBLE PRECISION NOT NULL,
    "descuentosAplicados" JSONB NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "fechaCompra" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaUtilizacion" TIMESTAMP(3),
    "pagoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bono_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "mercadoPagoId" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDING',
    "metodoPago" TEXT,
    "metadata" JSONB,
    "usuarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mutual" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descuentoPorcentaje" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mutual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Descuento" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "porcentaje" DOUBLE PRECISION NOT NULL,
    "esAcumulable" BOOLEAN NOT NULL DEFAULT true,
    "prioridad" INTEGER NOT NULL DEFAULT 0,
    "puntosMinimos" INTEGER,
    "nivelMinimo" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Descuento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promocion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "esAcumulable" BOOLEAN NOT NULL DEFAULT false,
    "prioridad" INTEGER NOT NULL DEFAULT 0,
    "requiereAuth" BOOLEAN NOT NULL DEFAULT true,
    "puntosMinimos" INTEGER,
    "nivelMinimo" INTEGER,
    "eventoId" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promocion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioArtista" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "artistaId" TEXT NOT NULL,
    "vecesVisto" INTEGER NOT NULL DEFAULT 0,
    "primeraVez" TIMESTAMP(3) NOT NULL,
    "ultimaVez" TIMESTAMP(3) NOT NULL,
    "esFavorito" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsuarioArtista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "eventoId" TEXT,
    "paraAsistentes" BOOLEAN NOT NULL DEFAULT false,
    "paraTodos" BOOLEAN NOT NULL DEFAULT false,
    "paraAsociados" BOOLEAN NOT NULL DEFAULT false,
    "paraNivel" INTEGER,
    "enviadaPorEmail" BOOLEAN NOT NULL DEFAULT false,
    "fechaEnvioEmail" TIMESTAMP(3),
    "creadaPor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificacionUsuario" (
    "id" TEXT NOT NULL,
    "notificacionId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fechaLeida" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificacionUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObjetivoAmpliacion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "montoObjetivo" DOUBLE PRECISION NOT NULL,
    "montoActual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "porcentaje" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaObjetivo" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "prioridad" INTEGER NOT NULL DEFAULT 0,
    "icono" TEXT,
    "imagen" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObjetivoAmpliacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoObjetivo" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "objetivoId" TEXT NOT NULL,
    "montoAsignado" DOUBLE PRECISION NOT NULL,
    "porcentaje" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoObjetivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_googleId_key" ON "Usuario"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_facebookId_key" ON "Usuario"("facebookId");

-- CreateIndex
CREATE INDEX "Usuario_email_idx" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_nivel_idx" ON "Usuario"("nivel");

-- CreateIndex
CREATE UNIQUE INDEX "Evento_slug_key" ON "Evento"("slug");

-- CreateIndex
CREATE INDEX "Evento_slug_idx" ON "Evento"("slug");

-- CreateIndex
CREATE INDEX "Evento_fecha_idx" ON "Evento"("fecha");

-- CreateIndex
CREATE INDEX "Evento_estado_idx" ON "Evento"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "Artista_slug_key" ON "Artista"("slug");

-- CreateIndex
CREATE INDEX "Artista_slug_idx" ON "Artista"("slug");

-- CreateIndex
CREATE INDEX "EventoArtista_eventoId_idx" ON "EventoArtista"("eventoId");

-- CreateIndex
CREATE INDEX "EventoArtista_artistaId_idx" ON "EventoArtista"("artistaId");

-- CreateIndex
CREATE UNIQUE INDEX "EventoArtista_eventoId_artistaId_key" ON "EventoArtista"("eventoId", "artistaId");

-- CreateIndex
CREATE UNIQUE INDEX "Bono_codigo_key" ON "Bono"("codigo");

-- CreateIndex
CREATE INDEX "Bono_codigo_idx" ON "Bono"("codigo");

-- CreateIndex
CREATE INDEX "Bono_eventoId_idx" ON "Bono"("eventoId");

-- CreateIndex
CREATE INDEX "Bono_usuarioId_idx" ON "Bono"("usuarioId");

-- CreateIndex
CREATE INDEX "Bono_estado_idx" ON "Bono"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_mercadoPagoId_key" ON "Pago"("mercadoPagoId");

-- CreateIndex
CREATE INDEX "Pago_mercadoPagoId_idx" ON "Pago"("mercadoPagoId");

-- CreateIndex
CREATE INDEX "Pago_estado_idx" ON "Pago"("estado");

-- CreateIndex
CREATE INDEX "Promocion_eventoId_idx" ON "Promocion"("eventoId");

-- CreateIndex
CREATE INDEX "Promocion_activo_idx" ON "Promocion"("activo");

-- CreateIndex
CREATE INDEX "UsuarioArtista_usuarioId_idx" ON "UsuarioArtista"("usuarioId");

-- CreateIndex
CREATE INDEX "UsuarioArtista_artistaId_idx" ON "UsuarioArtista"("artistaId");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioArtista_usuarioId_artistaId_key" ON "UsuarioArtista"("usuarioId", "artistaId");

-- CreateIndex
CREATE INDEX "Notificacion_eventoId_idx" ON "Notificacion"("eventoId");

-- CreateIndex
CREATE INDEX "Notificacion_createdAt_idx" ON "Notificacion"("createdAt");

-- CreateIndex
CREATE INDEX "NotificacionUsuario_usuarioId_idx" ON "NotificacionUsuario"("usuarioId");

-- CreateIndex
CREATE INDEX "NotificacionUsuario_leida_idx" ON "NotificacionUsuario"("leida");

-- CreateIndex
CREATE UNIQUE INDEX "NotificacionUsuario_notificacionId_usuarioId_key" ON "NotificacionUsuario"("notificacionId", "usuarioId");

-- CreateIndex
CREATE INDEX "EventoObjetivo_eventoId_idx" ON "EventoObjetivo"("eventoId");

-- CreateIndex
CREATE INDEX "EventoObjetivo_objetivoId_idx" ON "EventoObjetivo"("objetivoId");

-- CreateIndex
CREATE UNIQUE INDEX "EventoObjetivo_eventoId_objetivoId_key" ON "EventoObjetivo"("eventoId", "objetivoId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_mutualId_fkey" FOREIGN KEY ("mutualId") REFERENCES "Mutual"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoArtista" ADD CONSTRAINT "EventoArtista_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoArtista" ADD CONSTRAINT "EventoArtista_artistaId_fkey" FOREIGN KEY ("artistaId") REFERENCES "Artista"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bono" ADD CONSTRAINT "Bono_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bono" ADD CONSTRAINT "Bono_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bono" ADD CONSTRAINT "Bono_pagoId_fkey" FOREIGN KEY ("pagoId") REFERENCES "Pago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioArtista" ADD CONSTRAINT "UsuarioArtista_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioArtista" ADD CONSTRAINT "UsuarioArtista_artistaId_fkey" FOREIGN KEY ("artistaId") REFERENCES "Artista"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacionUsuario" ADD CONSTRAINT "NotificacionUsuario_notificacionId_fkey" FOREIGN KEY ("notificacionId") REFERENCES "Notificacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacionUsuario" ADD CONSTRAINT "NotificacionUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoObjetivo" ADD CONSTRAINT "EventoObjetivo_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoObjetivo" ADD CONSTRAINT "EventoObjetivo_objetivoId_fkey" FOREIGN KEY ("objetivoId") REFERENCES "ObjetivoAmpliacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
