# Guía de Deployment en Vercel

## Pre-requisitos

Antes de deployar en Vercel, asegurate de tener:

1. Una cuenta en [Vercel](https://vercel.com)
2. Base de datos PostgreSQL configurada (recomendado: [Neon](https://neon.tech) o [Supabase](https://supabase.com))
3. Credenciales de servicios externos:
   - Google OAuth (Client ID y Secret)
   - Facebook OAuth (App ID y Secret)
   - Mercado Pago (Access Token y Public Key)
   - Resend (API Key para emails)

## Pasos para el Deployment

### 1. Preparar la Base de Datos

Si usas **Neon** o **Supabase**:
- Creá una nueva base de datos PostgreSQL
- Copiá el connection string (debe incluir `?sslmode=require`)

### 2. Conectar tu Repositorio a Vercel

**Opción A: Desde el Dashboard de Vercel**
1. Andá a [vercel.com/new](https://vercel.com/new)
2. Importá tu repositorio de Git (GitHub, GitLab, o Bitbucket)
3. Seguí el wizard de configuración

**Opción B: Usando Vercel CLI**
```bash
# Instalar Vercel CLI globalmente
npm i -g vercel

# Login a Vercel
vercel login

# Deployar desde la raíz del proyecto
vercel
```

### 3. Configurar Variables de Entorno

En el dashboard de Vercel (Project Settings > Environment Variables), agregá todas las variables del archivo `.env.example`:

#### Base de Datos
```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

#### NextAuth
```
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=generar-con-openssl-rand-base64-32
```

Para generar un NEXTAUTH_SECRET seguro:
```bash
openssl rand -base64 32
```

#### Google OAuth
```
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

**Importante:** En la [Google Cloud Console](https://console.cloud.google.com/), agregá estas URLs autorizadas:
- Authorized JavaScript origins: `https://tu-dominio.vercel.app`
- Authorized redirect URIs: `https://tu-dominio.vercel.app/api/auth/callback/google`

#### Facebook OAuth
```
FACEBOOK_CLIENT_ID=tu-facebook-app-id
FACEBOOK_CLIENT_SECRET=tu-facebook-app-secret
```

**Importante:** En [Facebook Developers](https://developers.facebook.com/), agregá:
- Valid OAuth Redirect URIs: `https://tu-dominio.vercel.app/api/auth/callback/facebook`

#### Mercado Pago
```
MERCADOPAGO_ACCESS_TOKEN=tu-mercadopago-access-token
MERCADOPAGO_PUBLIC_KEY=tu-mercadopago-public-key
```

**Importante:** En tu cuenta de [Mercado Pago](https://www.mercadopago.com.ar/developers/panel):
- Configurá la URL de webhook: `https://tu-dominio.vercel.app/api/pagos/webhook`
- Activá las notificaciones para eventos de pago

#### Resend (Emails)
```
RESEND_API_KEY=tu-resend-api-key
RESEND_FROM_EMAIL=hola@labayer.org
```

**Importante:** En [Resend](https://resend.com), verificá el dominio `labayer.org` o usá uno de tus dominios verificados.

#### URLs Públicas
```
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

### 4. Ejecutar Migraciones de Prisma

Después del primer deployment, necesitás ejecutar las migraciones de la base de datos:

**Desde tu máquina local:**
```bash
# Asegurate de tener la DATABASE_URL de producción en tu .env
npx prisma migrate deploy
```

**O desde Vercel CLI:**
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

### 5. Crear el Primer Usuario Admin

Una vez deployada la app, podés crear tu primer usuario admin:

1. Registrate en la aplicación usando Google o Facebook
2. En Vercel Dashboard, andá a la terminal del proyecto o usá Vercel CLI
3. Ejecutá el script de make-admin con el email que usaste:

```bash
# Usando Vercel CLI
vercel env pull
npm run make-admin
# Ingresá el email cuando te lo pida
```

Alternativamente, podés ejecutar el script localmente con la DATABASE_URL de producción.

### 6. Verificar el Deployment

1. Visitá tu URL de Vercel
2. Verificá que podés hacer login con Google/Facebook
3. Probá crear un evento de prueba (con tu usuario admin)
4. Probá el flujo completo de compra

## Configuración de Dominio Personalizado

Si querés usar `labayer.org` en vez del dominio de Vercel:

1. En Vercel Dashboard > Project Settings > Domains
2. Agregá tu dominio personalizado
3. Configurá los DNS según las instrucciones de Vercel
4. Actualizá las variables de entorno:
   - `NEXTAUTH_URL`
   - `NEXT_PUBLIC_APP_URL`
5. Actualizá los callbacks en Google, Facebook, y Mercado Pago

## Solución de Problemas Comunes

### Error de Prisma Client
Si ves errores de Prisma Client, verificá que:
- El script `postinstall` esté en package.json
- Las migraciones se hayan ejecutado correctamente

### Error de OAuth
Si el login con Google/Facebook falla:
- Verificá que las URLs de callback estén correctamente configuradas
- Revisá que `NEXTAUTH_URL` apunte a tu dominio de producción

### Webhook de Mercado Pago no funciona
- Verificá que la URL del webhook esté configurada en Mercado Pago
- Revisá los logs en Vercel para ver si las notificaciones están llegando

### Emails no se envían
- Verificá que el dominio esté verificado en Resend
- Revisá la `RESEND_API_KEY` y `RESEND_FROM_EMAIL`

## Comandos Útiles

```bash
# Ver logs en tiempo real
vercel logs

# Pull de variables de entorno
vercel env pull

# Deployar a producción
vercel --prod

# Deployar a preview
vercel
```

## Mantenimiento

### Actualizar la Base de Datos

Cuando agregues nuevas migraciones:

```bash
# 1. Crear la migración localmente
npx prisma migrate dev --name nombre_de_la_migracion

# 2. Deployar a producción
vercel env pull .env.production
npx prisma migrate deploy
```

### Monitoreo

- Logs: Vercel Dashboard > Deployments > Functions
- Analytics: Vercel Analytics (gratis con plan hobby)
- Base de datos: Neon/Supabase dashboard

## Notas de Seguridad

- ✅ Nunca commitees el archivo `.env` (está en .gitignore)
- ✅ Rotá las secrets regularmente
- ✅ Usá diferentes credenciales para desarrollo y producción
- ✅ Mantené las dependencias actualizadas

## Soporte

Si encontrás problemas:
1. Revisá los logs en Vercel
2. Verificá las variables de entorno
3. Consultá la [documentación de Vercel](https://vercel.com/docs)
4. Revisá la [documentación de Next.js 14](https://nextjs.org/docs)
