# Plan: Modalidad Ingreso (ex-Scanner)

## ✅ Completado

### 1. Base de Datos
- ✅ Modelo `Promocion` actualizado con:
  - Relación con `Evento`
  - Campo `codigo` opcional
  - Índices para performance
- ✅ Migración aplicada

## 🎯 Pendiente

### 2. Renombrar Scanner → Modalidad Ingreso

**Archivos a cambiar:**
- `/app/admin/scanner/page.tsx` → renombrar carpeta a `/app/admin/ingreso/`
- Actualizar títulos y textos en la UI
- Actualizar navegación en layout/menú

**Cambios de UI:**
- Título: "Modalidad Ingreso"
- Subtítulo: "Validación de entradas y venta en puerta"

### 3. Selector de Evento

**Agregar antes del scanner:**
- Dropdown con eventos del día/próximos
- Filtro de eventos PROGRAMADOS/PUBLICADOS
- Mostrar evento seleccionado en la UI
- Validar que el bono sea para ese evento

**Nueva prop en validación:**
```typescript
await fetch("/api/admin/bonos/validar", {
  body: JSON.stringify({
    codigo,
    eventoId // Validar que coincida
  })
})
```

### 4. Venta Rápida en Puerta

**Nuevo componente: `VentaRapida`**

Estado inicial:
- Botón "Vender Entrada"
- Modal con:
  - Cantidad de bonos (default: 1)
  - Mostrar precio con descuentos aplicables
  - Campo de email/teléfono (opcional)
  - Generar link de pago MercadoPago
  - QR code para pagar
  - Webhook para confirmar y entregar QR de entrada

**Flujo:**
1. Admin: clic en "Vender Entrada"
2. Sistema: crea preferencia MP con descuentos activos del evento
3. Muestra QR de pago
4. Cliente paga
5. Webhook confirma → genera bono → muestra QR de entrada
6. Cliente puede entrar inmediatamente

**API a crear:**
- `POST /api/admin/eventos/[eventoId]/venta-rapida`
  - Crea preferencia MP
  - Aplica promociones activas del evento
  - Retorna link de pago y QR

- Webhook ya existe, solo verificar que marque el bono como PAGADO

### 5. Admin UI para Promociones

**Nueva página:** `/app/admin/promociones/page.tsx`

Features:
- Lista de promociones
- Crear/Editar promoción:
  - Nombre
  - Tipo: 2x1, PORCENTAJE, MONTO_FIJO
  - Valor
  - Evento (opcional - si es null aplica a todos)
  - Fechas inicio/fin
  - Código (opcional)
  - Requiere autenticación (checkbox)
  - Activo (toggle)

**Desde página de evento:**
- Sección "Promociones del Evento"
- Lista de promociones activas
- Toggle rápido para activar/desactivar
- Link a crear promoción nueva

### 6. Lógica de Aplicación de Promociones

**Actualizar:** `/app/api/compra/route.ts` y venta rápida

```typescript
// Obtener promociones activas
const promociones = await prisma.promocion.findMany({
  where: {
    activo: true,
    fechaInicio: { lte: now },
    fechaFin: { gte: now },
    OR: [
      { eventoId: evento.id },
      { eventoId: null } // Promociones globales
    ]
  },
  orderBy: { prioridad: 'desc' }
});

// Aplicar promociones compatibles con auth
if (!session && promo.requiereAuth) continue;

// Calcular descuento final
```

## 📋 Orden de Implementación Sugerido

1. **Admin UI para Promociones** (1-2 horas)
   - CRUD completo
   - Integración con eventos

2. **Selector de Evento en Scanner** (30 min)
   - Dropdown simple
   - Validación con eventoId

3. **Venta Rápida** (2-3 horas)
   - Componente modal
   - API de venta rápida
   - Integración con MP
   - Testing del flujo completo

4. **Aplicación de Promociones** (1 hora)
   - Actualizar lógica de compra
   - Testing con diferentes escenarios

5. **Renombrado y Polish** (30 min)
   - Cambiar nombres
   - Mejorar textos
   - Testing final

## 🔍 Testing Scenarios

1. **Promoción global sin auth**: Cualquiera puede usar
2. **Promoción de evento con auth**: Solo usuarios logueados
3. **Promoción con código**: Solo con código específico
4. **2x1**: Compra 2, paga 1
5. **Porcentaje**: 30% OFF
6. **Venta en puerta**: Sin login, con promoción activa
7. **Validación**: Bono del evento correcto vs evento incorrecto

## 💡 Mejoras Futuras (Opcional)

- Estadísticas en tiempo real de entradas escaneadas
- Notificación sonora diferente por tipo de usuario (nivel, socio, etc.)
- Modo offline para scanner (sync después)
- Historial de scans del día
- Exportar lista de asistentes
