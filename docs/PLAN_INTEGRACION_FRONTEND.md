# 📋 Plan de Integración Frontend: Servicios y Pagos Wompi

**Fecha:** Diciembre 2024  
**Prioridad:** 🔴 **ALTA** - Funcionalidades core faltantes

---

## 🔍 Análisis del Estado Actual

### ✅ Backend Completo
- ✅ `GET /api/services/me` - Servicios del usuario
- ✅ `GET /api/services/catalog` - Catálogo de servicios
- ✅ `POST /api/payments/prepare-widget` - Preparar Wompi Widget
- ✅ `POST /api/payments/create-transaction` - Crear transacción (legacy)
- ✅ `POST /api/payments/wompi-webhook` - Webhook de Wompi

### ❌ Frontend Incompleto
- ⚠️ Dashboard muestra servicios básicos (solo lectura)
- ❌ **NO hay página de servicios completa**
- ❌ **NO hay catálogo de servicios para comprar**
- ❌ **NO hay integración con Wompi Widget**
- ❌ **NO hay checkout de pagos**
- ❌ **NO hay páginas de éxito/error de pago**
- ❌ **NO hay utilidades de API para servicios/pagos**

---

## 🎯 Objetivos

1. **Completar integración de Servicios**
   - Página dedicada de servicios
   - Catálogo para comprar nuevos servicios
   - Gestión completa (ver detalles, renovar, etc.)

2. **Completar integración de Pagos Wompi**
   - Checkout con Wompi Widget
   - Páginas de éxito/error
   - Manejo de estados de pago

---

## 📅 Plan de Implementación

### **Sprint Frontend: Servicios y Pagos (2-3 semanas)**

#### **Semana 1: Servicios**

**Día 1-2: Utilidades de API**
- [ ] Crear `lib/services.ts` con funciones para servicios
- [ ] Crear `lib/payments.ts` con funciones para pagos
- [ ] Tipos TypeScript para servicios y pagos

**Día 3-4: Página de Servicios**
- [ ] Crear `app/services/page.tsx`
- [ ] Lista de servicios del usuario
- [ ] Filtros y búsqueda
- [ ] Detalles de cada servicio
- [ ] Acciones (renovar, ver detalles, etc.)

**Día 5: Catálogo de Servicios**
- [ ] Crear `app/services/catalog/page.tsx`
- [ ] Mostrar planes disponibles
- [ ] Botón "Comprar" que lleva a checkout

#### **Semana 2: Pagos Wompi**

**Día 1-2: Integración Wompi Widget**
- [ ] Instalar dependencias de Wompi
- [ ] Crear componente `CheckoutModal` o página
- [ ] Integrar Wompi Widget
- [ ] Manejo de estados de pago

**Día 3: Páginas de Resultado**
- [ ] Crear `app/payment/success/page.tsx`
- [ ] Crear `app/payment/error/page.tsx`
- [ ] Manejo de query params (transaction_id, reference)

**Día 4-5: Testing y Refinamiento**
- [ ] Testing de flujo completo
- [ ] Manejo de errores
- [ ] UX/UI refinements

---

## 📁 Estructura de Archivos a Crear

```
viotech-pro/
├── app/
│   ├── services/
│   │   ├── page.tsx              # Lista de servicios del usuario
│   │   └── catalog/
│   │       └── page.tsx          # Catálogo para comprar
│   └── payment/
│       ├── success/
│       │   └── page.tsx          # Página de éxito
│       └── error/
│           └── page.tsx          # Página de error
├── lib/
│   ├── services.ts                # API utilities para servicios
│   └── payments.ts                # API utilities para pagos
└── components/
    ├── ServiceCard.tsx            # Card mejorado de servicio
    ├── ServiceDetailsModal.tsx    # Modal de detalles
    ├── CheckoutModal.tsx          # Modal de checkout Wompi
    └── CatalogCard.tsx            # Card de plan en catálogo
```

---

## 🔧 Implementación Detallada

### 1. Utilidades de API

#### `lib/services.ts`
```typescript
import { buildApiUrl } from './api';
import { getAccessToken } from './auth';

export interface Service {
  id: string;
  nombre: string;
  tipo: string;
  estado: 'activo' | 'expirado' | 'pendiente';
  fecha_compra?: string | null;
  fecha_expiracion?: string | null;
  precio?: number | null;
  detalles?: any;
  transaccion_id_wompi?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServicePlan {
  id: string;
  nombre: string;
  tipo: string;
  precio: number;
  currency: string;
  durationDays: number;
  features: string[];
}

export async function fetchUserServices(): Promise<Service[]> {
  const token = getAccessToken();
  if (!token) throw new Error('No autenticado');

  const response = await fetch(buildApiUrl('/services/me'), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-store',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener servicios');
  }

  const data = await response.json();
  return data.data || [];
}

export async function fetchServiceCatalog(): Promise<ServicePlan[]> {
  const response = await fetch(buildApiUrl('/services/catalog'), {
    headers: {
      'Cache-Control': 'no-store',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener catálogo');
  }

  const data = await response.json();
  return data.data || [];
}
```

#### `lib/payments.ts`
```typescript
import { buildApiUrl } from './api';
import { getAccessToken } from './auth';

export interface WompiWidgetData {
  publicKey: string;
  currency: string;
  amountInCents: number;
  reference: string;
  signature: string;
  customerEmail: string;
  customerFullName: string;
  serviceId: string;
  redirectUrl: string;
  plan: {
    id: string;
    nombre: string;
    precio: number;
  };
}

export async function prepareWompiWidget(planId: string): Promise<WompiWidgetData> {
  const token = getAccessToken();
  if (!token) throw new Error('No autenticado');

  const response = await fetch(buildApiUrl('/payments/prepare-widget'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ planId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || 'Error al preparar pago');
  }

  const data = await response.json();
  return data.data;
}
```

### 2. Página de Servicios

#### `app/services/page.tsx`
- Lista completa de servicios del usuario
- Filtros por estado (activo, expirado, pendiente)
- Búsqueda por nombre
- Cards con detalles completos
- Acciones: Ver detalles, Renovar, etc.

### 3. Catálogo de Servicios

#### `app/services/catalog/page.tsx`
- Grid de planes disponibles
- Cards con precio, features, duración
- Botón "Comprar" que abre checkout
- Comparación de planes

### 4. Integración Wompi Widget

#### Componente `CheckoutModal.tsx`
- Cargar script de Wompi
- Inicializar widget con datos del backend
- Manejar callbacks de éxito/error
- Redirigir a páginas de resultado

### 5. Páginas de Resultado

#### `app/payment/success/page.tsx`
- Mostrar confirmación de pago
- Detalles de la transacción
- Link a servicio activado
- Botón para ir a servicios

#### `app/payment/error/page.tsx`
- Mostrar error de pago
- Mensaje amigable
- Opciones para reintentar
- Link a soporte

---

## 🚀 Priorización

### 🔴 **CRÍTICO (Hacer Primero)**
1. Utilidades de API (`lib/services.ts`, `lib/payments.ts`)
2. Integración Wompi Widget (checkout funcional)
3. Páginas de resultado (success/error)

### 🟡 **IMPORTANTE (Siguiente)**
4. Página de servicios completa
5. Catálogo de servicios

### 🟢 **NICE TO HAVE (Después)**
6. Mejoras en dashboard
7. Renovación automática
8. Notificaciones de expiración

---

## 📝 Checklist de Implementación

### Fase 1: Fundación (Día 1-2)
- [ ] Crear `lib/services.ts`
- [ ] Crear `lib/payments.ts`
- [ ] Definir tipos TypeScript
- [ ] Testing de funciones de API

### Fase 2: Servicios (Día 3-5)
- [ ] Crear `app/services/page.tsx`
- [ ] Crear `app/services/catalog/page.tsx`
- [ ] Componente `ServiceCard` mejorado
- [ ] Componente `CatalogCard`
- [ ] Integración con API

### Fase 3: Pagos (Día 6-8)
- [ ] Instalar Wompi SDK
- [ ] Crear `CheckoutModal` component
- [ ] Integrar Wompi Widget
- [ ] Crear `app/payment/success/page.tsx`
- [ ] Crear `app/payment/error/page.tsx`
- [ ] Testing de flujo completo

### Fase 4: Refinamiento (Día 9-10)
- [ ] Manejo de errores robusto
- [ ] Loading states
- [ ] UX improvements
- [ ] Testing end-to-end

---

## 🎨 Consideraciones de UX

### Servicios
- Mostrar estado visual claro (activo = verde, expirado = rojo, pendiente = amarillo)
- Progreso visual de tiempo restante
- Acciones contextuales según estado
- Filtros y búsqueda intuitivos

### Pagos
- Checkout modal o página dedicada
- Loading states claros
- Confirmación antes de pagar
- Feedback inmediato de éxito/error
- Redirección automática después de pago

---

## 🔗 Integración con Wompi

### Opción Recomendada: Wompi Widget

```typescript
// Cargar script de Wompi
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://checkout.wompi.co/widget.js';
  script.async = true;
  document.body.appendChild(script);

  return () => {
    document.body.removeChild(script);
  };
}, []);

// Inicializar widget
const openWompiWidget = async (planId: string) => {
  const widgetData = await prepareWompiWidget(planId);
  
  // @ts-ignore - Wompi global
  window.WompiWidget({
    publicKey: widgetData.publicKey,
    currency: widgetData.currency,
    amountInCents: widgetData.amountInCents,
    reference: widgetData.reference,
    signature: widgetData.signature,
    customerEmail: widgetData.customerEmail,
    customerFullName: widgetData.customerFullName,
    redirectUrl: widgetData.redirectUrl,
    onSuccess: (transaction) => {
      // Redirigir a success page
      router.push(`/payment/success?reference=${widgetData.reference}`);
    },
    onError: (error) => {
      // Redirigir a error page
      router.push(`/payment/error?message=${encodeURIComponent(error.message)}`);
    }
  });
};
```

---

## ✅ Criterios de Éxito

1. **Funcionalidad**
   - ✅ Usuario puede ver todos sus servicios
   - ✅ Usuario puede ver catálogo de servicios
   - ✅ Usuario puede comprar servicio con Wompi
   - ✅ Pago se procesa correctamente
   - ✅ Servicio se activa después de pago

2. **UX**
   - ✅ Flujo intuitivo y claro
   - ✅ Feedback visual en cada paso
   - ✅ Manejo de errores amigable
   - ✅ Loading states apropiados

3. **Técnico**
   - ✅ Integración completa con backend
   - ✅ Manejo de errores robusto
   - ✅ TypeScript sin errores
   - ✅ Responsive design

---

**Tiempo Estimado:** 2-3 semanas  
**Prioridad:** 🔴 **ALTA**  
**Estado:** ⏸️ Pendiente de implementación

