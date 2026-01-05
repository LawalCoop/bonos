# Plan: Plataforma Cooperativa Multi-Espacio

**Proyecto:** Bonos La Bayer → Red Cooperativa de Espacios Culturales
**Fecha:** 2025-11-24
**Versión:** 1.0

---

## Resumen Ejecutivo

Transformar el sistema actual (single-tenant para "La Bayer") en una **red cooperativa multi-espacio** donde espacios culturales, artistas, productoras y público colaboran en una plataforma común.

---

## Actores del Sistema

### 1. **Público**
- Compra bonos para eventos
- Participa en votaciones y propuestas comunitarias
- Puede tener membresías cooperativas

### 2. **Artistas**
- Tienen usuario y pueden loguearse
- Dashboard con ventas en tiempo real
- Acceso a bordereauxs de cada evento
- Vista de su "gira" (detección automática)
- Historial completo de presentaciones

### 3. **Productoras**
- Representan a múltiples artistas (roster)
- Dashboard consolidado de todos sus artistas
- Ven ventas y bordereauxs de todo su roster
- Gestión del roster

### 4. **Espacios Culturales**
- Gestión autónoma de sus eventos
- Panel de administración propio
- Equipo de colaboradores con roles
- Configuración independiente

### 5. **Super Admin**
- Vista global de toda la red
- Puede ver todos los espacios
- Gestión de la plataforma

---

## Arquitectura de Base de Datos

### Modelos Nuevos

#### `Espacio`
```prisma
model Espacio {
  id          String   @id @default(cuid())
  nombre      String
  slug        String   @unique
  descripcion String?  @db.Text

  // Ubicación
  direccion   String
  ciudad      String
  provincia   String?
  pais        String   @default("Argentina")
  latitud     Float?   // Para mapa
  longitud    Float?   // Para mapa
  codigoPostal String?

  // Contacto
  telefono    String?
  email       String
  whatsapp    String?

  // Media
  logo        String?
  imagenPortada String?

  // Redes sociales
  instagram   String?
  facebook    String?
  twitter     String?
  youtube     String?

  // Configuración
  tipo        String   @default("INDEPENDIENTE")
  esActivo    Boolean  @default(true)
  esPublico   Boolean  @default(true) // Visible en mapa

  // Financiero
  cbu         String?
  alias       String?
  cuit        String?
  mercadoPagoAccessToken String?
  mercadoPagoPublicKey   String?

  // Relaciones
  eventos        Evento[]
  miembros       EspacioMiembro[]
  organizaciones Organizacion[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### `EspacioMiembro`
```prisma
model EspacioMiembro {
  id         String   @id @default(cuid())
  espacioId  String
  espacio    Espacio  @relation(fields: [espacioId], references: [id])

  userId     String
  usuario    User     @relation(fields: [userId], references: [id])

  rol        String   @default("COLABORADOR") // ADMIN, COLABORADOR, PRODUCTOR
  permisos   Json?    // Permisos granulares

  createdAt  DateTime @default(now())

  @@unique([espacioId, userId])
}
```

#### `Productora`
```prisma
model Productora {
  id          String   @id @default(cuid())
  nombre      String
  slug        String   @unique
  descripcion String?  @db.Text

  // Contacto
  email       String   @unique
  telefono    String?
  whatsapp    String?

  // Media
  logo        String?

  // Redes sociales
  instagram   String?
  facebook    String?
  linkWeb     String?

  // Relaciones
  artistas    Artista[]
  miembros    ProductoraMiembro[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### `ProductoraMiembro`
```prisma
model ProductoraMiembro {
  id           String     @id @default(cuid())
  productoraId String
  productora   Productora @relation(fields: [productoraId], references: [id])

  userId       String
  usuario      User       @relation(fields: [userId], references: [id])

  rol          String     @default("COLABORADOR") // ADMIN, COLABORADOR

  createdAt    DateTime   @default(now())

  @@unique([productoraId, userId])
}
```

#### `DashboardArtista`
```prisma
model DashboardArtista {
  id                    String   @id @default(cuid())
  artistaId             String
  artista               Artista  @relation(fields: [artistaId], references: [id])

  eventoId              String   @unique
  evento                Evento   @relation(fields: [eventoId], references: [id])

  // Ventas en tiempo real (cache)
  bonosVendidos         Int      @default(0)
  capacidadTotal        Int
  porcentajeVendido     Float    @default(0)
  totalRecaudado        Float    @default(0)

  // Finanzas del artista
  porcentajeArtista     Float
  montoEstimadoBruto    Float    @default(0)
  gastosCompartidos     Float    @default(0)
  montoEstimadoNeto     Float    @default(0)

  // Estado del pago
  liquidado             Boolean  @default(false)
  montoLiquidado        Float?
  fechaLiquidacion      DateTime?

  ultimaActualizacion   DateTime @default(now())

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

#### `Membresia`
```prisma
model Membresia {
  id            String   @id @default(cuid())

  usuarioId     String
  usuario       User     @relation(fields: [usuarioId], references: [id])

  espacioId     String?
  espacio       Espacio? @relation(fields: [espacioId], references: [id])

  tipo          String   // MENSUAL, ANUAL, VITALICIA
  nivel         String   @default("BASICA") // BASICA, PREMIUM, VIP
  estado        String   @default("ACTIVA") // ACTIVA, PAUSADA, CANCELADA

  fechaInicio   DateTime
  fechaFin      DateTime?

  monto         Float
  frecuencia    String?  // MENSUAL, ANUAL, UNICA

  beneficios    Json?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

#### `InteraccionComunidad` + `VotoComunidad`
```prisma
model InteraccionComunidad {
  id            String   @id @default(cuid())

  tipo          String   // VOTACION, PROPUESTA, ENCUESTA

  eventoId      String?
  evento        Evento?  @relation(fields: [eventoId], references: [id])

  espacioId     String?
  espacio       Espacio? @relation(fields: [espacioId], references: [id])

  titulo        String?
  descripcion   String   @db.Text
  opciones      Json?

  votos         VotoComunidad[]

  estado        String   @default("ACTIVA") // ACTIVA, CERRADA
  fechaCierre   DateTime?

  creadoPor     String   // User ID

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model VotoComunidad {
  id                   String   @id @default(cuid())
  interaccionId        String
  interaccion          InteraccionComunidad @relation(fields: [interaccionId], references: [id])

  usuarioId            String
  usuario              User     @relation(fields: [usuarioId], references: [id])

  opcionSeleccionada   String?
  comentario           String?  @db.Text

  createdAt            DateTime @default(now())

  @@unique([interaccionId, usuarioId])
}
```

### Modelos Modificados

#### `Artista`
```prisma
model Artista {
  // ... campos actuales ...

  // NUEVO: Relación con User
  userId      String?  @unique
  usuario     User?    @relation(fields: [userId], references: [id])

  // NUEVO: Productora
  productoraId String?
  productora   Productora? @relation(fields: [productoraId], references: [id])

  // NUEVO: Info adicional
  email       String?  @unique
  tipoArtista String   @default("MUSICO")
  generos     String[]
  verificado  Boolean  @default(false)

  // NUEVA Relación
  dashboards  DashboardArtista[]

  // ... resto de campos ...
}
```

#### `User`
```prisma
model User {
  // ... campos actuales ...

  // MODIFICAR: nuevos roles
  rol           String    @default("USER")
  // USER, ARTISTA, PRODUCTORA, ADMIN, SUPER_ADMIN

  // NUEVAS Relaciones
  perfilArtista      Artista?  @relation("ArtistaUsuario")
  espaciosMiembro    EspacioMiembro[]
  productorasMiembro ProductoraMiembro[]
  membresias         Membresia[]
  votosComunidad     VotoComunidad[]

  // ... resto de campos ...
}
```

#### `Evento`
```prisma
model Evento {
  // ... campos actuales ...

  // NUEVO: Multi-tenancy
  espacioId   String
  espacio     Espacio  @relation(fields: [espacioId], references: [id])

  // NUEVO: Geolocalización (opcional, override del espacio)
  latitud     Float?
  longitud    Float?

  // NUEVA Relación
  dashboardsArtista DashboardArtista[]
  interacciones     InteraccionComunidad[]

  // ... resto de campos ...

  @@index([espacioId])
}
```

#### `Organizacion`
```prisma
model Organizacion {
  // ... campos actuales ...

  // NUEVO: Asociación a espacio específico
  espacioId   String?
  espacio     Espacio? @relation(fields: [espacioId], references: [id])

  // ... resto de campos ...
}
```

### Modelos Eliminados

- ❌ **NO** se crea modelo `Gira` (detección automática)
- ❌ **NO** se crea modelo `InvitacionEspacio` (no necesario)

---

## Sistema de Roles y Permisos

```
USER (público general)
├── Comprar bonos
├── Votar en comunidad
├── Tener membresías
└── Ver eventos públicos

ARTISTA (artista con cuenta)
├── Todos los permisos de USER
├── Ver dashboard de ventas propias
├── Ver bordereauxs propios
├── Ver "gira" automática
├── Editar perfil de artista
└── Historial de presentaciones

PRODUCTORA (productora con cuenta)
├── Todos los permisos de USER
├── Ver dashboard consolidado del roster
├── Ver ventas de todos sus artistas
├── Ver bordereauxs de sus artistas
└── Gestionar roster

COLABORADOR (miembro de espacio)
├── Todos los permisos de USER
├── Gestionar eventos del espacio
├── Ver reportes del espacio
└── Validar entradas

ADMIN (administrador de espacio)
├── Todos los permisos de COLABORADOR
├── Gestionar miembros del espacio
├── Gestionar configuración del espacio
├── Ver finanzas del espacio
└── Gestionar organizaciones del espacio

SUPER_ADMIN (administrador de plataforma)
├── Todos los permisos
├── Ver todos los espacios
├── Crear espacios nuevos
├── Ver métricas globales
└── Gestionar toda la red
```

---

## Detección Automática de Giras

### Algoritmo

Una "gira" se detecta automáticamente cuando:
- Mismo artista
- Múltiples espacios (≥2)
- Eventos en un período ≤ 60 días

### Implementación

```typescript
async function detectarGirasArtista(artistaId: string) {
  const eventos = await prisma.evento.findMany({
    where: {
      artistas: { some: { artistaId } },
      fecha: {
        gte: new Date(),
        lte: addDays(new Date(), 90) // Próximos 3 meses
      }
    },
    include: {
      espacio: {
        select: { nombre: true, slug: true, ciudad: true, latitud: true, longitud: true }
      }
    },
    orderBy: { fecha: 'asc' }
  })

  // Agrupar eventos cercanos en el tiempo
  const giras: Gira[] = []
  let giraActual: Evento[] = []

  for (const evento of eventos) {
    if (giraActual.length === 0) {
      giraActual.push(evento)
    } else {
      const ultimoEvento = giraActual[giraActual.length - 1]
      const diasDiferencia = differenceInDays(evento.fecha, ultimoEvento.fecha)

      if (diasDiferencia <= 60) {
        giraActual.push(evento)
      } else {
        // Si la gira actual tiene 2+ eventos en diferentes espacios, es una gira
        if (giraActual.length >= 2) {
          const espaciosUnicos = new Set(giraActual.map(e => e.espacioId))
          if (espaciosUnicos.size >= 2) {
            giras.push({
              eventos: giraActual,
              fechaInicio: giraActual[0].fecha,
              fechaFin: giraActual[giraActual.length - 1].fecha,
              espacios: espaciosUnicos.size
            })
          }
        }
        giraActual = [evento]
      }
    }
  }

  // Procesar última gira
  if (giraActual.length >= 2) {
    const espaciosUnicos = new Set(giraActual.map(e => e.espacioId))
    if (espaciosUnicos.size >= 2) {
      giras.push({
        eventos: giraActual,
        fechaInicio: giraActual[0].fecha,
        fechaFin: giraActual[giraActual.length - 1].fecha,
        espacios: espaciosUnicos.size
      })
    }
  }

  return giras
}
```

### Vista en Dashboard

El dashboard del artista mostrará:
- **Próximas fechas**: Lista de eventos ordenados por fecha
- **Giras detectadas**: Eventos agrupados automáticamente
- **Vista de mapa**: Gira visualizada en mapa geográfico
- **Ventas por fecha**: Comparativa de ventas entre espacios

---

## Fases de Implementación

### 📦 Fase 1: Multi-Tenancy (4-6 semanas)

**Objetivo**: Permitir múltiples espacios autónomos en la red

#### Semana 1: Migración de Base de Datos
- [ ] Crear modelo `Espacio`
- [ ] Crear modelo `EspacioMiembro`
- [ ] Agregar `espacioId` a `Evento`
- [ ] Agregar `espacioId` a `Organizacion`
- [ ] Script de migración: crear espacio "La Bayer" inicial
- [ ] Asociar todos los eventos existentes al espacio La Bayer
- [ ] Convertir admins actuales en `EspacioMiembro`
- [ ] Crear índices necesarios

#### Semana 2: Backend - APIs de Espacios
- [ ] `GET /api/espacios` - Listar espacios públicos
- [ ] `GET /api/espacios/[slug]` - Detalle de espacio
- [ ] `POST /api/admin/espacios` - Crear espacio (super admin only)
- [ ] `PUT /api/admin/espacios/[id]` - Editar espacio
- [ ] `DELETE /api/admin/espacios/[id]` - Eliminar espacio
- [ ] `GET /api/admin/espacios/[id]/stats` - Estadísticas
- [ ] Middleware para scope por espacio

#### Semana 3-4: Modificar Sistema de Eventos
- [ ] Actualizar todas las queries de eventos para filtrar por `espacioId`
- [ ] Modificar formulario de eventos para incluir espacio
- [ ] Actualizar endpoints de eventos para scope por espacio
- [ ] Modificar dashboard admin para filtrar por espacio
- [ ] Actualizar sistema de descuentos para scope por espacio
- [ ] Actualizar promociones para scope por espacio

#### Semana 5: Frontend - Espacios
- [ ] Header con selector de espacio actual
- [ ] Persistencia del espacio seleccionado (localStorage)
- [ ] Página `/espacios` - Listado de espacios
- [ ] Página `/espacios/[slug]` - Página individual de espacio
- [ ] Filtro de eventos por espacio en listado público
- [ ] Página `/admin/espacios` - Gestión de espacios (super admin)
- [ ] Página `/admin/espacios/nuevo` - Crear espacio

#### Semana 6: Sistema de Permisos
- [ ] Middleware `requireEspacioAccess(espacioId)`
- [ ] Helper `canManageEvent(user, evento)`
- [ ] Helper `canViewBordereau(user, evento)`
- [ ] Página `/admin/espacios/[id]/miembros` - Gestión de equipo
- [ ] Tests de isolation multi-tenant

**Entregables**:
✅ Múltiples espacios pueden coexistir
✅ Cada espacio gestiona sus eventos
✅ Panel admin filtrado por espacio
✅ Listado público de espacios
✅ Sistema de permisos funcionando

---

### 🎸 Fase 2: Artistas y Productoras (4-5 semanas)

**Objetivo**: Artistas y productoras con dashboard completo

#### Semana 1: Migración de Base de Datos
- [ ] Crear modelo `Productora`
- [ ] Crear modelo `ProductoraMiembro`
- [ ] Crear modelo `DashboardArtista`
- [ ] Agregar `userId` a `Artista`
- [ ] Agregar `productoraId` a `Artista`
- [ ] Agregar rol `ARTISTA` y `PRODUCTORA` a enum
- [ ] Script para artistas existentes

#### Semana 2: Backend - Sistema de Autenticación
- [ ] Flujo de registro de artista
- [ ] Flujo de registro de productora
- [ ] Vincular usuario existente con perfil artista
- [ ] Middleware `requireArtista()`
- [ ] Middleware `requireProductora()`
- [ ] Endpoint para solicitar vinculación artista-productora

#### Semana 3: Backend - APIs Artista
- [ ] `GET /api/artista/eventos` - Eventos del artista
- [ ] `GET /api/artista/eventos/proximos` - Eventos próximos (con giras)
- [ ] `GET /api/artista/eventos/[id]/ventas` - Ventas en tiempo real
- [ ] `GET /api/artista/eventos/[id]/bordereau` - Bordereau del evento
- [ ] `GET /api/artista/stats` - Estadísticas generales
- [ ] `GET /api/artista/giras` - Giras detectadas automáticamente
- [ ] `PUT /api/artista/perfil` - Actualizar perfil
- [ ] Job para actualizar `DashboardArtista` periódicamente

#### Semana 3: Backend - APIs Productora
- [ ] `GET /api/productora/artistas` - Roster de artistas
- [ ] `GET /api/productora/eventos` - Todos los eventos del roster
- [ ] `GET /api/productora/eventos/[id]/ventas` - Ventas consolidadas
- [ ] `GET /api/productora/stats` - Estadísticas consolidadas
- [ ] `POST /api/productora/artistas/invitar` - Invitar artista al roster
- [ ] `PUT /api/productora/perfil` - Actualizar perfil

#### Semana 4: Frontend - Dashboard Artista
- [ ] Layout `/artista/dashboard`
- [ ] Página principal con resumen
- [ ] Sección "Mi Gira" - Eventos agrupados automáticamente
- [ ] Página `/artista/eventos` - Todos los eventos
- [ ] Página `/artista/eventos/[id]` - Detalle con ventas tiempo real
- [ ] Página `/artista/eventos/[id]/bordereau` - Bordereau completo
- [ ] Página `/artista/historial` - Historial de eventos
- [ ] Página `/artista/perfil` - Editar perfil
- [ ] Componente con gráficos de ventas (recharts)

#### Semana 5: Frontend - Dashboard Productora
- [ ] Layout `/productora/dashboard`
- [ ] Página principal con resumen consolidado
- [ ] Página `/productora/roster` - Gestión de artistas
- [ ] Página `/productora/eventos` - Todos los eventos
- [ ] Página `/productora/stats` - Estadísticas consolidadas
- [ ] Componente comparativa entre artistas
- [ ] Página `/productora/perfil` - Editar perfil

#### Notificaciones
- [ ] Email al artista cuando se crea evento con él
- [ ] Email cuando se alcanza 50%, 75%, 100% de ventas
- [ ] Email cuando se realiza liquidación
- [ ] Email a productora con resumen semanal

**Entregables**:
✅ Artistas pueden crear usuario
✅ Dashboard con ventas en tiempo real
✅ Vista automática de "gira"
✅ Bordereau individual por evento
✅ Productoras ven roster completo
✅ Dashboard consolidado de productora

---

### 🗺️ Fase 3: Geolocalización y Mapa (2 semanas)

**Objetivo**: Visualizar eventos de la red en un mapa interactivo

#### Semana 1: Backend - Geolocalización
- [ ] Agregar `latitud`, `longitud` a `Espacio`
- [ ] Agregar `latitud`, `longitud` a `Evento` (opcional)
- [ ] Integrar API de geocodificación (Nominatim/OpenStreetMap)
- [ ] `POST /api/admin/espacios/[id]/geocode` - Obtener coordenadas
- [ ] Script para geocodificar espacios existentes
- [ ] `GET /api/mapa/eventos` - Eventos con coordenadas
- [ ] `GET /api/mapa/espacios` - Espacios con coordenadas
- [ ] `GET /api/mapa/artistas/[id]/gira` - Eventos de gira en mapa

#### Semana 2: Frontend - Mapa
- [ ] Integrar Leaflet + OpenStreetMap
- [ ] Página `/mapa` - Mapa general de la red
- [ ] Markers clickeables con info del evento
- [ ] Clusters de markers para muchos eventos
- [ ] Filtros: fechas, géneros, espacios, distancia
- [ ] Página `/mapa/artistas/[id]` - Gira del artista en mapa
- [ ] Vista de línea temporal + mapa para giras
- [ ] Geolocalización del usuario (opcional)

**Entregables**:
✅ Mapa interactivo de la red
✅ Visualización de giras en mapa
✅ Filtros geográficos y temporales
✅ Espacios geocodificados

---

### 🤝 Fase 4: Comunidad y Membresías (3-4 semanas)

**Objetivo**: Participación comunitaria y sistema de membresías

#### Semana 1: Backend - Membresías
- [ ] Crear modelo `Membresia`
- [ ] `POST /api/membresias/crear` - Crear membresía
- [ ] `GET /api/membresias/usuario` - Membresías del usuario
- [ ] `PUT /api/membresias/[id]/cancelar` - Cancelar membresía
- [ ] `PUT /api/membresias/[id]/pausar` - Pausar membresía
- [ ] Integración con Mercado Pago para pagos recurrentes
- [ ] Job para verificar vencimientos
- [ ] Email de confirmación de membresía
- [ ] Email de recordatorio de renovación

#### Semana 2: Backend - Interacciones Comunitarias
- [ ] Crear modelos `InteraccionComunidad` y `VotoComunidad`
- [ ] `POST /api/comunidad/votaciones` - Crear votación
- [ ] `POST /api/comunidad/propuestas` - Crear propuesta
- [ ] `POST /api/comunidad/encuestas` - Crear encuesta
- [ ] `POST /api/comunidad/[id]/votar` - Votar
- [ ] `GET /api/comunidad/espacios/[id]` - Actividad del espacio
- [ ] `GET /api/comunidad/activas` - Interacciones activas
- [ ] `PUT /api/comunidad/[id]/cerrar` - Cerrar votación

#### Semana 3: Frontend - Membresías
- [ ] Página `/membresias` - Planes disponibles
- [ ] Modal de suscripción con checkout
- [ ] Página `/perfil/membresias` - Gestión de membresías
- [ ] Badge de membresía en perfil de usuario
- [ ] Indicador visual en eventos (descuentos por membresía)

#### Semana 4: Frontend - Comunidad
- [ ] Página `/comunidad` - Feed de actividad comunitaria
- [ ] Página `/comunidad/votaciones` - Votaciones activas
- [ ] Página `/comunidad/propuestas` - Propuestas abiertas
- [ ] Componente de votación inline
- [ ] Sistema de badges por participación
- [ ] Dashboard de participación comunitaria

**Entregables**:
✅ Sistema de membresías funcional
✅ Pagos recurrentes integrados
✅ Votaciones y propuestas comunitarias
✅ Dashboard de participación
✅ Beneficios automáticos para miembros

---

## Consideraciones Técnicas

### Multi-Tenancy

**Enfoque**: Multi-tenancy a nivel de aplicación (shared database)

**Ventajas**:
- Más económico (una sola base de datos)
- Más fácil de mantener
- Permite consultas cross-tenant (mapa, red)
- Mejor para esta etapa del proyecto

**Implementación**:
```typescript
// Middleware para scope de espacio
export async function getEspacioActual(req: Request): Promise<string | null> {
  // Opción 1: Por subdominio
  const host = req.headers.get('host')
  if (host?.includes('.')) {
    const subdomain = host.split('.')[0]
    return subdomain
  }

  // Opción 2: Por query param
  const url = new URL(req.url)
  return url.searchParams.get('espacio')

  // Opción 3: Por header
  return req.headers.get('x-espacio-id')
}
```

### Seguridad

**Validaciones Críticas**:
1. Siempre verificar que el usuario tiene acceso al espacio
2. Artista solo puede ver su información
3. Productora solo puede ver sus artistas
4. Bordereauxs solo visibles para artista/productora/admin del espacio

```typescript
export async function canViewBordereau(
  userId: string,
  eventoId: string
): Promise<boolean> {
  const evento = await prisma.evento.findUnique({
    where: { id: eventoId },
    include: {
      artistas: {
        include: {
          artista: {
            select: {
              userId: true,
              productoraId: true,
              productora: {
                include: {
                  miembros: { where: { userId } }
                }
              }
            }
          }
        }
      },
      espacio: {
        include: {
          miembros: { where: { userId } }
        }
      }
    }
  })

  const isArtista = evento?.artistas.some(ea => ea.artista.userId === userId)
  const isProductora = evento?.artistas.some(ea =>
    ea.artista.productora?.miembros.some(m => m.userId === userId)
  )
  const isEspacioAdmin = evento?.espacio.miembros.some(m => m.userId === userId)

  return isArtista || isProductora || isEspacioAdmin
}
```

### Performance

**Optimizaciones Necesarias**:
1. Índices compuestos con `espacioId`
2. Cache de dashboard de artista con Redis
3. Paginación en listados
4. Clustering de markers en mapa
5. Query optimization con `include` selectivo

```typescript
// Ejemplo de query optimizado
const eventos = await prisma.evento.findMany({
  where: { espacioId: { in: espaciosIds } },
  select: {
    id: true,
    nombre: true,
    fecha: true,
    espacio: {
      select: { nombre: true, slug: true, ciudad: true }
    },
    artistas: {
      take: 3,
      select: {
        artista: {
          select: { nombre: true, slug: true }
        }
      }
    },
    _count: {
      select: { bonos: { where: { estado: 'PAGADO' } } }
    }
  },
  orderBy: { fecha: 'asc' },
  take: 20
})
```

### Testing

**Tests Críticos**:
- Multi-tenant isolation (espacio A no ve datos de espacio B)
- Permisos de artista/productora
- Detección automática de giras
- Cálculo de bordereau por espacio
- Geolocalización
- Sistema de votaciones

---

## Estimaciones

### Tiempo Total

| Fase | Duración | Complejidad | Riesgo |
|------|----------|-------------|--------|
| Fase 1: Multi-tenancy | 4-6 semanas | Alta | Alto |
| Fase 2: Artistas/Productoras | 4-5 semanas | Media | Medio |
| Fase 3: Geolocalización | 2 semanas | Baja | Bajo |
| Fase 4: Comunidad | 3-4 semanas | Media | Medio |
| **TOTAL** | **13-17 semanas** | **3-4 meses** | |

### Recursos

**Desarrollador Full-Time**: 3-4 meses
**Equipo de 2 Desarrolladores**: 2-2.5 meses

### Costos de Infraestructura

- **Base de Datos**: PostgreSQL en Neon - $0-25/mes
- **Hosting**: Vercel Pro - $20/mes (si escala)
- **Maps**: OpenStreetMap - $0 (gratis)
- **Redis Cache** (opcional): Upstash - $0-10/mes
- **Email**: Resend - $20-50/mes

**Total estimado**: $40-100/mes

---

## Estrategia de Implementación Recomendada

### Opción 1: MVP en 2.5 meses
**Fases**: 1 + 2 + 3

**Resultado**:
- Red multi-espacio funcional
- Dashboard de artistas y productoras
- Mapa de la red
- **Sin** sistema de comunidad/membresías

**Valor**: Permite onboarding inmediato de espacios, artistas y productoras

### Opción 2: Implementación Completa en 4 meses
**Fases**: 1 + 2 + 3 + 4

**Resultado**: Plataforma cooperativa completa

**Valor**: Sistema completo con participación comunitaria

---

## Migración de Datos Actuales

### Script de Migración

```typescript
async function migrateToMultiTenant() {
  console.log('🔄 Iniciando migración a multi-tenant...')

  // 1. Crear espacio "La Bayer" desde configuración actual
  const config = await prisma.configuracion.findFirst()

  const labayer = await prisma.espacio.create({
    data: {
      nombre: config.nombreSitio,
      slug: 'la-bayer',
      descripcion: config.descripcion,
      direccion: config.direccion,
      ciudad: config.ciudad,
      provincia: config.provincia,
      pais: config.pais,
      email: config.email,
      telefono: config.telefono,
      whatsapp: config.whatsapp,
      instagram: config.instagram,
      facebook: config.facebook,
      logo: config.logoUrl,
      mercadoPagoAccessToken: config.mercadoPagoAccessToken,
      mercadoPagoPublicKey: config.mercadoPagoPublicKey,
      cbu: config.cbu,
      alias: config.alias,
      cuit: config.cuit,
    }
  })

  console.log('✅ Espacio La Bayer creado:', labayer.id)

  // 2. Asociar todos los eventos existentes al espacio La Bayer
  const { count } = await prisma.evento.updateMany({
    data: { espacioId: labayer.id }
  })

  console.log(`✅ ${count} eventos asociados a La Bayer`)

  // 3. Convertir admins actuales en miembros del espacio
  const admins = await prisma.user.findMany({
    where: { rol: { in: ['ADMIN', 'SUPER_ADMIN'] } }
  })

  for (const admin of admins) {
    await prisma.espacioMiembro.create({
      data: {
        espacioId: labayer.id,
        userId: admin.id,
        rol: admin.rol === 'SUPER_ADMIN' ? 'ADMIN' : 'COLABORADOR'
      }
    })
  }

  console.log(`✅ ${admins.length} admins convertidos en miembros`)

  // 4. Asociar organizaciones al espacio
  await prisma.organizacion.updateMany({
    data: { espacioId: labayer.id }
  })

  console.log('✅ Organizaciones asociadas a La Bayer')
  console.log('🎉 Migración completada exitosamente')
}
```

---

## Riesgos y Mitigaciones

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Migración rompe sistema actual | Alto | Media | Tests exhaustivos, rollback plan, backup de DB |
| Performance con muchos espacios | Medio | Alta | Índices, cache, paginación, monitoring |
| Complejidad de permisos multi-rol | Alto | Media | Tests unitarios, roles bien definidos, documentación |
| Geocodificación incorrecta | Bajo | Media | Validación manual en UI, corrección fácil |
| Detección de giras imprecisa | Medio | Media | Parámetros ajustables, feedback de artistas |

---

## Próximos Pasos

1. ✅ **Validar plan** con stakeholders
2. **Decidir estrategia**: MVP (2.5 meses) vs Completo (4 meses)
3. **Preparar entorno** de desarrollo/staging
4. **Comenzar Fase 1**: Multi-tenancy
5. **Setup de tests** desde el inicio
6. **Comunicación continua** con usuarios/espacios interesados

---

## Conclusión

Este plan transforma el sistema actual de "Bonos La Bayer" en una **plataforma cooperativa multi-espacio** completa, manteniendo la base sólida existente y agregando las funcionalidades necesarias para:

✅ Múltiples espacios autónomos en una red
✅ Artistas con visibilidad completa de sus ventas y finanzas
✅ Productoras con gestión de roster
✅ Detección automática de giras
✅ Visualización geográfica de la red
✅ Participación comunitaria activa

La arquitectura propuesta es **escalable, mantenible y segura**, con un plan de implementación claro por fases que permite entregar valor incremental.

---

**Última actualización**: 2025-11-24
**Versión**: 1.0
**Estado**: Pendiente de aprobación
