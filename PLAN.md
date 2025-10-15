# Plan de Desarrollo - Sistema de Bonos La Bayer Experimental

## Estado del Proyecto: 70% Completado ✅

---

## ✅ FASE 1: Setup Inicial (100%)
- [x] Configuración Next.js 14 + TypeScript + Tailwind
- [x] Estructura de carpetas app router
- [x] Base de datos PostgreSQL (Neon)
- [x] Schema Prisma con 17 tablas
- [x] NextAuth.js con Google OAuth
- [x] Sistema de roles (USER, ADMIN, SUPER_ADMIN)
- [x] Mercado Pago configurado
- [x] Resend para emails
- [x] shadcn/ui components

---

## ✅ FASE 2: Frontend Público (85%)

### Completado:
- [x] Layout principal con Header y Footer
- [x] Home page con grid de eventos
- [x] Listado de eventos con filtros
- [x] Página individual de evento con artistas
- [x] Flow de compra de bonos
- [x] Cálculo de descuentos en tiempo real
- [x] Integración con Mercado Pago
- [x] Páginas de resultado de pago (éxito/error/pendiente)
- [x] **Mis Bonos** - Vista de tickets comprados con QR codes

### Pendiente:
- [ ] Botones de compartir (WhatsApp, copy link)
- [ ] Bottom sheet mobile para compra
- [ ] Listado público de artistas
- [ ] Página individual de artista

**Progreso: 85%**

---

## ✅ FASE 3: Backend + Pagos (100%)

### Completado:
- [x] API de eventos (GET público)
- [x] **Sistema de descuentos stackable** con límite 50%:
  - Socie (15%)
  - Organizaciones/Mutuales (configurable)
  - Nivel (5-20%)
  - Fan de artista (3-8%)
  - Múltiples compras (5%)
- [x] API cálculo de descuentos por usuario
- [x] Creación de preferencia Mercado Pago
- [x] **Webhook de pagos** que:
  - Verifica pago aprobado
  - Genera códigos únicos
  - Crea QR codes con librería qrcode
  - Envía email con React Email
  - Actualiza totales del evento
- [x] Generación de QR codes (base64 DataURL)
- [x] **Email delivery con Resend**:
  - Template React Email profesional
  - QR code embebido
  - Detalles del evento
  - Breakdown de descuentos

**Progreso: 100%**

---

## ✅ FASE 4: Niveles + Tracking (20%)

### Completado:
- [x] Otorgar 10 puntos al validar entrada
- [x] Campo nivel/puntos en User model
- [x] Mostrar nivel y puntos en header dropdown

### Pendiente:
- [ ] Perfil de usuario completo (/perfil)
  - Editar datos personales
  - Ver nivel y puntos actuales
  - Progreso al siguiente nivel
  - Estadísticas personales
- [ ] Historial de eventos asistidos
- [ ] Tracking de artistas vistos (UsuarioArtista)
- [ ] Cálculo automático de nivel según puntos
- [ ] Email de notificación al subir de nivel
- [ ] Sistema de badges/logros

**Progreso: 20%**

---

## ⏸️ FASE 5: Notificaciones (0%)

### Pendiente:
- [ ] CRUD de notificaciones (admin)
- [ ] Sistema de envío de emails masivos
- [ ] Notificaciones por nivel de usuario
- [ ] Notificaciones a asistentes de evento
- [ ] Email de recordatorio pre-evento (24hs antes)
- [ ] Notificaciones de cambios/cancelaciones
- [ ] Bell icon en header con contador
- [ ] Página de notificaciones del usuario
- [ ] Marcar como leídas

**Progreso: 0%**

---

## ✅ FASE 6: Admin Panel (100%)

### Completado:
- [x] **Sistema de autenticación admin**:
  - Campo `rol` en User model
  - Helpers requireAdmin() / requireSuperAdmin()
  - Script `npm run make-admin <email>`
- [x] **Layout admin** con sidebar de navegación
- [x] **Dashboard** con estadísticas:
  - Eventos activos/totales
  - Bonos vendidos/totales
  - Total recaudado
  - Usuarios, artistas
  - Eventos del mes
  - Listado de eventos recientes
- [x] **CRUD Eventos** (/admin/eventos):
  - Listado con stats (bonos, recaudado, artistas)
  - Crear/Editar con formulario completo
  - Estados: Programado/Cancelado/Finalizado
  - No eliminar si tiene bonos (solo cancelar)
- [x] **CRUD Artistas** (/admin/artistas):
  - Grid de tarjetas con fotos
  - Crear/Editar con bio y redes
  - Links: Instagram, Spotify, Bandcamp, YouTube, Web
  - No eliminar si tiene eventos
- [x] **CRUD Organizaciones** (/admin/organizaciones):
  - Gestión inline con formulario
  - Configurar descuento porcentual
  - Contador de usuarios asociados
- [x] **CRUD Objetivos** (/admin/objetivos):
  - Gestión inline
  - Barra de progreso visual
  - Estados: Activo/Pausado/Completado
  - Prioridad y fechas
- [x] Gestión de bonos (validación)
- [x] Gestión de usuarios (pendiente interfaz)

**Progreso: 100%**

---

## ✅ FASE 7: Scanner PWA (100%)

### Completado:
- [x] **API de validación** (/api/admin/bonos/validar):
  - Verifica estado del bono
  - Marca como UTILIZADO
  - Otorga 10 puntos al usuario
  - Guarda fechaUtilizacion
  - Previene doble validación
- [x] **Página Scanner QR** (/admin/scanner):
  - Integración html5-qrcode
  - Escaneo con cámara del dispositivo
  - Feedback visual (verde/rojo/amarillo)
  - Muestra info del evento y usuario
  - Detección de bonos ya usados
  - Botón "Escanear Siguiente"
- [x] Acceso desde admin sidebar
- [x] Solo accesible para rol ADMIN

### Pendiente (Mejoras):
- [ ] PWA manifest para instalar en móvil
- [ ] Service worker para offline
- [ ] Sonidos de feedback (success/error)
- [ ] Modo oscuro optimizado
- [ ] Historial de validaciones en sesión
- [ ] Estadísticas de entrada en tiempo real

**Progreso: 100% (Funcional - Mejoras opcionales)**

---

## ⏸️ FASE 8: Deploy (0%)

### Pendiente:
- [ ] Configurar Vercel
- [ ] Variables de entorno en producción
- [ ] Dominio personalizado
- [ ] SSL/HTTPS
- [ ] Configurar webhooks de Mercado Pago en producción
- [ ] Configurar callbacks de Google OAuth
- [ ] Email domain verification (Resend)
- [ ] Backup strategy para PostgreSQL
- [ ] Monitoring y logs (Sentry/LogRocket)
- [ ] Performance optimization
- [ ] SEO básico

**Progreso: 0%**

---

## Funcionalidades Core Listas ✅

### 🎫 Flujo Completo de Compra:
1. Usuario ve evento → Click "Sacar Bono"
2. Selecciona cantidad (1-10)
3. Ve descuentos aplicados en tiempo real
4. Click "Pagar con Mercado Pago"
5. Completa pago en MP
6. **Webhook recibe confirmación**
7. **Sistema genera bonos con QR**
8. **Email enviado con tickets**
9. Usuario ve bonos en "Mis Bonos"
10. QR mostrado para validar en evento

### 🔍 Validación en Evento:
1. Staff abre /admin/scanner
2. Escanea QR del asistente
3. Sistema valida en tiempo real
4. ✅ Verde = Acceso permitido (otorga puntos)
5. ❌ Rojo = Bono inválido
6. ⚠️ Amarillo = Ya utilizado (muestra cuándo)

### 📊 Panel Admin Completo:
- Dashboard con métricas en vivo
- Gestión completa de eventos y artistas
- Configuración de descuentos (organizaciones)
- Objetivos con barras de progreso
- Scanner QR integrado

---

## Próximos Pasos Sugeridos

### Alta Prioridad:
1. **Interfaz de Usuarios** en admin (ver/editar/eliminar)
2. **Asignar artistas a eventos** (falta UI en admin)
3. **Perfil de usuario** completo en frontend
4. **Listado público de artistas**

### Media Prioridad:
5. Sistema de notificaciones completo
6. Emails de recordatorio de eventos
7. Estadísticas avanzadas en dashboard
8. PWA features para scanner

### Baja Prioridad:
9. Botones de compartir eventos
10. Bottom sheet mobile
11. Badges y logros de gamificación
12. Deploy a producción

---

## Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Autenticación**: NextAuth.js
- **Pagos**: Mercado Pago SDK
- **Email**: Resend + React Email
- **QR Codes**: qrcode (generación) + html5-qrcode (scanner)
- **UI**: shadcn/ui + Tailwind CSS
- **Iconos**: Lucide React
- **Validación**: Zod (si se agrega)

---

## Comandos Útiles

```bash
# Development
npm run dev                    # Servidor desarrollo
npm run build                  # Build producción
npm run start                  # Servidor producción

# Database
npx prisma studio              # Ver/editar datos
npx prisma migrate dev         # Nueva migración
npx prisma generate            # Regenerar cliente

# Admin
npm run make-admin <email>     # Convertir usuario en admin
```

---

**Última actualización**: 10 de Octubre, 2025
**Estado**: Sistema funcional con flujo completo de compra, pago, validación y administración
