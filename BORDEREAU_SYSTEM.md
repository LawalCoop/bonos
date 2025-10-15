# Sistema de Bordereau - Gestión Financiera de Eventos

## Resumen

Sistema completo para gestionar la distribución de ingresos entre artistas/productores y La Bayer, incluyendo gastos compartidos y exclusivos, con generación automática de bordereaux detallados.

## Características Principales

### 1. Configuración de Distribución por Evento

Cada evento puede tener una configuración personalizada de distribución de ingresos:

- **% Artista/Productor**: Porcentaje de los ingresos netos que va al artista
- **% La Bayer**: Porcentaje de los ingresos netos que va a La Bayer
- **Default**: 70% artista / 30% Bayer (configurable por evento)

### 2. Gestión de Gastos

#### Tipos de Gastos:

**Gastos Compartidos:**
- Se restan ANTES de aplicar la distribución de porcentajes
- Se dividen según porcentaje configurado (ej: 50%/50%, 60%/40%, etc.)
- Ejemplos: Sonidista, técnico de luces, alquiler de equipo
- Campos:
  - Concepto
  - Monto
  - % que paga el artista
  - % que paga La Bayer
  - Proveedor (opcional)
  - Estado de pago

**Gastos Exclusivos de La Bayer:**
- Se restan solo de la parte de La Bayer
- No afectan la parte del artista
- Ejemplos: Costos administrativos, publicidad propia, limpieza
- Campos:
  - Concepto
  - Monto
  - Descripción (opcional)
  - Proveedor (opcional)
  - Estado de pago

### 3. Cálculo del Bordereau

El sistema calcula automáticamente:

```
1. Total Recaudado (suma de todos los bonos pagados)
2. Total Gastos Compartidos
3. Ingresos Netos = Total Recaudado - Gastos Compartidos
4. Distribución:
   - Monto Artista = Ingresos Netos × % Artista
   - Monto Bayer = Ingresos Netos × % Bayer
5. Montos Finales:
   - Final Artista = Monto Artista - Parte Gastos Compartidos Artista
   - Final Bayer = Monto Bayer - Parte Gastos Compartidos Bayer - Gastos Exclusivos
```

### 4. Información Incluida en el Bordereau

#### Datos del Evento
- Nombre, fecha, ubicación
- Artistas participantes y sus roles
- Capacidad y porcentaje de ocupación

#### Análisis de Ventas
- Total de bonos vendidos
- Total recaudado
- Precio base y precio promedio pagado
- Distribución por precio (cuántos pagaron cada precio)

#### Descuentos Aplicados
- Desglose por tipo de descuento
- Cantidad de aplicaciones
- Total descontado por tipo
- Promedio de descuento

#### Gastos Detallados
- **Gastos Compartidos:**
  - Concepto y monto total
  - Parte que paga el artista
  - Parte que paga La Bayer
  - Estado de pago
  - Proveedor

- **Gastos Exclusivos Bayer:**
  - Concepto y monto
  - Descripción
  - Estado de pago
  - Proveedor

#### Distribución Final
- Porcentajes acordados
- Ingresos netos (después de gastos compartidos)
- Monto para artista (con desglose)
- Monto para La Bayer (con desglose)
- **Montos finales a pagar**

## Uso del Sistema

### 1. Crear/Editar Evento

Al crear o editar un evento, configurar:

1. Datos básicos del evento
2. **Distribución de Ingresos:**
   - % Artista/Productor (default: 70%)
   - % La Bayer (default: 30%)
   - Los porcentajes deben sumar 100%

### 2. Agregar Gastos del Evento

Desde `/admin/eventos/[id]/bordereau` o mediante la API:

**Agregar Gasto Compartido:**
```json
POST /api/admin/eventos/[eventoId]/gastos
{
  "concepto": "Sonidista",
  "monto": 30000,
  "esCompartido": true,
  "porcentajeArtista": 50,
  "porcentajeBayer": 50,
  "proveedor": "Juan Pérez",
  "pagado": false
}
```

**Agregar Gasto Exclusivo Bayer:**
```json
POST /api/admin/eventos/[eventoId]/gastos
{
  "concepto": "Publicidad en redes",
  "monto": 15000,
  "esCompartido": false,
  "descripcion": "Campaña en Instagram y Facebook",
  "proveedor": "Agencia Digital",
  "pagado": true
}
```

### 3. Ver Bordereau

1. Ir a la lista de eventos: `/admin/eventos`
2. Click en el botón "Bordereau" del evento deseado
3. El sistema calcula y muestra automáticamente:
   - Resumen de ventas
   - Distribución por precio
   - Descuentos aplicados
   - Gastos detallados
   - **Distribución final con montos a pagar**

### 4. Descargar PDF

*Funcionalidad próximamente disponible*

Click en "Descargar PDF" para generar un documento profesional con toda la información del bordereau.

## APIs Disponibles

### Bordereau

```
GET /api/admin/eventos/[eventoId]/bordereau
```

Calcula y retorna el bordereau completo del evento con toda la información financiera.

**Respuesta:**
```typescript
{
  evento: {
    nombre: string;
    fecha: string;
    ubicacion: string;
    capacidad: number;
  };
  artistas: Array<{nombre: string; rol: string}>;
  ventas: {
    totalBonos: number;
    totalRecaudado: number;
    precioPromedio: number;
    porcentajeOcupacion: number;
  };
  distribucionPrecios: Array<{
    precio: number;
    cantidad: number;
    porcentaje: number;
  }>;
  descuentos: {
    totalDescuentos: number;
    detalles: Array<...>;
  };
  gastos: {
    total: number;
    compartidos: {...};
    noCompartidos: {...};
  };
  distribucion: {
    porcentajes: {artista: number; bayer: number};
    ingresosNetos: number;
    artista: {
      montoIngresos: number;
      gastosCompartidos: number;
      montoFinal: number;
    };
    bayer: {
      montoIngresos: number;
      gastosCompartidos: number;
      gastosExclusivos: number;
      montoFinal: number;
    };
  };
}
```

### Gastos

#### Listar gastos del evento
```
GET /api/admin/eventos/[eventoId]/gastos
```

#### Crear gasto
```
POST /api/admin/eventos/[eventoId]/gastos
Body: {
  concepto: string;
  monto: number;
  esCompartido: boolean;
  porcentajeArtista?: number;  // Si esCompartido=true
  porcentajeBayer?: number;    // Si esCompartido=true
  descripcion?: string;
  proveedor?: string;
  pagado?: boolean;
}
```

#### Actualizar gasto
```
PUT /api/admin/eventos/[eventoId]/gastos/[gastoId]
Body: {campos a actualizar}
```

#### Eliminar gasto
```
DELETE /api/admin/eventos/[eventoId]/gastos/[gastoId]
```

#### Marcar como pagado/no pagado
```
PATCH /api/admin/eventos/[eventoId]/gastos/[gastoId]
```

## Modelos de Datos

### Evento (campos financieros)
```prisma
model Evento {
  // ... otros campos ...

  // Distribución de ingresos
  porcentajeArtista Float @default(70)
  porcentajeBayer   Float @default(30)

  // Tracking
  costoArtistas     Float   @default(0)
  gastosProduccion  Float   @default(0)
  totalRecaudado    Float   @default(0)
  utilidad          Float   @default(0)
  artistasCobrado   Boolean @default(false)
  fechaPagoArtistas DateTime?

  // Relaciones
  gastos GastoEvento[]
}
```

### GastoEvento
```prisma
model GastoEvento {
  id        String @id @default(cuid())
  eventoId  String
  evento    Evento @relation(...)

  concepto    String
  descripcion String?
  monto       Float

  // Gastos compartidos
  esCompartido      Boolean @default(false)
  porcentajeArtista Float?  @default(50)
  porcentajeBayer   Float?  @default(50)

  // Metadata
  proveedor String?
  pagado    Boolean @default(false)
  fechaPago DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Ejemplo Práctico

### Escenario: Concierto de Rock

**Configuración del Evento:**
- Precio base: $15,000
- Capacidad: 100 personas
- Distribución: 65% artista / 35% Bayer

**Ventas:**
- 80 bonos vendidos
- Total recaudado: $1,050,000
  - 50 bonos a $15,000 (precio completo)
  - 20 bonos a $12,750 (con descuento socio 15%)
  - 10 bonos a $13,200 (con descuento nivel 12%)

**Gastos Compartidos:**
- Sonidista: $30,000 (50%/50%)
- Técnico de luces: $25,000 (60% artista / 40% Bayer)

**Gastos Exclusivos Bayer:**
- Publicidad: $20,000
- Limpieza: $5,000

**Cálculo:**

1. **Total Recaudado:** $1,050,000

2. **Gastos Compartidos:**
   - Sonidista artista: $15,000
   - Sonidista Bayer: $15,000
   - Luces artista: $15,000
   - Luces Bayer: $10,000
   - **Total compartidos artista:** $30,000
   - **Total compartidos Bayer:** $25,000

3. **Ingresos Netos:** $1,050,000 - $55,000 = $995,000

4. **Distribución:**
   - Artista (65%): $646,750
   - Bayer (35%): $348,250

5. **Montos Finales:**
   - **Artista:** $646,750 - $30,000 = **$616,750**
   - **Bayer:** $348,250 - $25,000 - $25,000 = **$298,250**

## Próximas Funcionalidades

- [ ] Generación de PDF del bordereau
- [ ] Envío por email del bordereau al artista
- [ ] Histórico de bordereaux
- [ ] Comparativas entre eventos
- [ ] Dashboard financiero general
- [ ] Exportación a Excel

## Archivos del Sistema

### Base de Datos
- `prisma/schema.prisma` - Modelos Evento y GastoEvento
- `prisma/migrations/*` - Migración de campos

### APIs
- `app/api/admin/eventos/[eventoId]/bordereau/route.ts` - Cálculo bordereau
- `app/api/admin/eventos/[eventoId]/gastos/route.ts` - CRUD gastos (lista/crear)
- `app/api/admin/eventos/[eventoId]/gastos/[gastoId]/route.ts` - CRUD individual

### UI
- `app/admin/eventos/[eventoId]/bordereau/page.tsx` - Vista del bordereau
- `app/admin/eventos/page.tsx` - Lista con botón bordereau
- `components/admin/evento-form.tsx` - Formulario con campos de distribución

## Notas Importantes

1. **Los porcentajes artista + Bayer deben sumar siempre 100%**
2. **Los gastos compartidos se restan ANTES de la distribución**
3. **Los gastos exclusivos solo se restan de la parte de Bayer**
4. **El bordereau solo considera bonos con estado PAGADO o UTILIZADO**
5. **Los descuentos ya están reflejados en el precio final del bono**

## Soporte

Para consultas sobre el sistema de bordereau, contactar al equipo de desarrollo.
