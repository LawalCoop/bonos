# Bonos Bayer

Sistema de bonos y descuentos para La Bayer.

## Requisitos previos

- Node.js 18+
- npm
- [ngrok](https://ngrok.com/) (para desarrollo local con OAuth)

## Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd bonosBayer2

# Instalar dependencias
npm install
```

## Configuración

### 1. Variables de entorno

Copiar el archivo de ejemplo y completar los valores:

```bash
cp .env.example .env
```

Variables requeridas:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Conexión a PostgreSQL (Neon) |
| `NEXTAUTH_URL` | URL de la app (ngrok en dev) |
| `NEXTAUTH_SECRET` | Secret para NextAuth (generar con `openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Client Secret de Google OAuth |

Variables opcionales:

| Variable | Descripción |
|----------|-------------|
| `MERCADOPAGO_ACCESS_TOKEN` | Token de Mercado Pago |
| `MERCADOPAGO_PUBLIC_KEY` | Public Key de Mercado Pago |
| `RESEND_API_KEY` | API Key de Resend para emails |
| `GEMINI_API_KEY` | API Key de Google Gemini |

### 2. Base de datos

```bash
# Generar cliente de Prisma
npx prisma generate

# Aplicar migraciones
npx prisma db push

# (Opcional) Sembrar datos iniciales
npm run seed-config
npm run seed-descuentos
```

### 3. Levantar ngrok

ngrok es necesario para que Google OAuth funcione en desarrollo local.

```bash
# En una terminal separada, levantar ngrok
ngrok http 3000
```

Copiar la URL generada (ej: `https://xxxx-xxx-xxx.ngrok-free.app`) y actualizar:

1. En `.env`:
   ```
   NEXTAUTH_URL="https://tu-url.ngrok-free.app"
   NEXT_PUBLIC_APP_URL="https://tu-url.ngrok-free.app"
   ```

2. En [Google Cloud Console](https://console.cloud.google.com/):
   - Ir a APIs & Services > Credentials
   - Editar el OAuth 2.0 Client
   - Agregar la URL de ngrok a "Authorized redirect URIs":
     ```
     https://tu-url.ngrok-free.app/api/auth/callback/google
     ```

## Desarrollo

```bash
# Levantar el servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:3000` (o en tu URL de ngrok).

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Iniciar en producción |
| `npm run lint` | Ejecutar linter |
| `npm run make-admin` | Hacer admin a un usuario |
| `npm run seed-descuentos` | Sembrar descuentos |
| `npm run seed-config` | Sembrar configuración |

## Estructura del proyecto

```
├── app/                # App Router de Next.js
├── components/         # Componentes React
├── lib/               # Utilidades y configuración
├── prisma/            # Schema y migraciones
├── public/            # Assets estáticos
└── scripts/           # Scripts de utilidad
```
