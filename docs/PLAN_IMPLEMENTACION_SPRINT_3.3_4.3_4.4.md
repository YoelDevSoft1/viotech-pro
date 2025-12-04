# 📋 Plan de Implementación - Sprints 3.3, 4.3 y 4.4

**Fecha:** Enero 2025  
**Estado:** Backend Completo ✅ - Frontend Pendiente  
**Sprints:** Push Notifications, Analytics, Customer Success

---

## 🎯 Contexto & Suposiciones

### Estado Actual

**Backend:** ✅ **100% Completo**
- Endpoints de Push Notifications implementados
- Endpoints de Analytics implementados  
- Endpoints de Customer Success implementados
- Documentación completa disponible

**Frontend:** ⚠️ **~40% Implementado**
- ✅ Service Worker con push notifications (`public/service-worker.js`)
- ✅ Hook `usePushNotifications` (pero endpoints incorrectos)
- ✅ Tipos TypeScript (`analytics.ts`, `customer-success.ts`)
- ✅ Hook `useHealthScore` (pero endpoints incorrectos)
- ❌ Servicios API faltantes
- ❌ Componentes UI faltantes
- ❌ Integración en páginas faltante
- ❌ Hook `useAnalytics` faltante

### Suposiciones

1. El backend está en producción y funcionando
2. Los endpoints documentados son los correctos
3. Se prioriza estabilidad sobre features nuevas
4. Se debe mantener compatibilidad con código existente

---

## 🏗️ Diseño & Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE SERVICIOS                         │
├─────────────────────────────────────────────────────────────┤
│  pushNotificationService.ts  →  /api/push/*                 │
│  analyticsService.ts         →  /api/analytics/*             │
│  healthScoreService.ts       →  /api/organizations/:id/health│
│                                /api/admin/customer-success/* │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE HOOKS                              │
├─────────────────────────────────────────────────────────────┤
│  usePushNotifications (corregir endpoints)                   │
│  useAnalytics (nuevo)                                        │
│  useHealthScore (corregir endpoints)                         │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE COMPONENTES                        │
├─────────────────────────────────────────────────────────────┤
│  PushNotificationToggle                                      │
│  HealthScoreCard                                             │
│  ChurnAlertsDashboard                                        │
│  AnalyticsProvider                                           │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PÁGINAS                            │
├─────────────────────────────────────────────────────────────┤
│  /client/settings/notifications  →  Push toggle             │
│  /admin/customer-success          →  Health scores + alerts  │
│  /admin/analytics                 →  Dashboard analytics    │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 Plan por Agente/Profesional

### 🎨 AGENTE_FRONTEND_NEXT_REACT_TS

#### **Sprint 3.3: Push Notifications**

| # | Tarea | Archivo | Prioridad | Estado |
|---|-------|---------|-----------|--------|
| 1 | **Corregir endpoints en usePushNotifications** | `lib/hooks/usePushNotifications.ts` | 🔴 Alta | ⚠️ Pendiente |
| 2 | **Crear servicio pushNotificationService** | `lib/services/pushNotificationService.ts` | 🔴 Alta | ❌ No existe |
| 3 | **Crear componente PushNotificationToggle** | `components/notifications/PushNotificationToggle.tsx` | 🔴 Alta | ❌ No existe |
| 4 | **Integrar en NotificationPreferences** | `components/notifications/NotificationPreferences.tsx` | 🟡 Media | ⚠️ Parcial |
| 5 | **Verificar Service Worker** | `public/service-worker.js` | 🟡 Media | ✅ Existe |

**Detalles Técnicos:**

1. **Corregir usePushNotifications.ts:**
   - Cambiar `/push/vapid-public-key` → `/push/vapid-key`
   - Cambiar `/push/subscribe` → `/push/subscribe` (POST con body `{ subscription: {...} }`)
   - Cambiar `/push/unsubscribe` → `/push/unsubscribe` (DELETE con body `{ endpoint: string }`)

2. **Crear pushNotificationService.ts:**
```typescript
// lib/services/pushNotificationService.ts
import { apiClient } from '@/lib/apiClient';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationService {
  async getVapidKey(): Promise<string> {
    const { data } = await apiClient.get('/push/vapid-key');
    return data.data.publicKey;
  }

  async subscribe(subscription: PushSubscriptionData) {
    const { data } = await apiClient.post('/push/subscribe', {
      subscription,
    });
    return data;
  }

  async unsubscribe(endpoint: string) {
    await apiClient.delete('/push/unsubscribe', {
      data: { endpoint },
    });
  }

  async getSubscriptions() {
    const { data } = await apiClient.get('/push/subscriptions');
    return data.data.subscriptions;
  }
}

export const pushNotificationService = new PushNotificationService();
```

3. **Crear PushNotificationToggle.tsx:**
   - Usar `usePushNotifications` hook
   - Mostrar estado (soportado/no soportado, suscrito/no suscrito)
   - Botón toggle para activar/desactivar
   - Manejo de errores con toasts

---

#### **Sprint 4.3: Analytics**

| # | Tarea | Archivo | Prioridad | Estado |
|---|-------|---------|-----------|--------|
| 1 | **Crear servicio analyticsService** | `lib/services/analyticsService.ts` | 🔴 Alta | ❌ No existe |
| 2 | **Crear hook useAnalytics** | `lib/hooks/useAnalytics.ts` | 🔴 Alta | ❌ No existe |
| 3 | **Crear AnalyticsProvider** | `components/analytics/AnalyticsProvider.tsx` | 🔴 Alta | ❌ No existe |
| 4 | **Integrar en root layout** | `app/layout.tsx` | 🔴 Alta | ❌ Pendiente |
| 5 | **Crear página admin/analytics** | `app/(ops-admin)/admin/analytics/page.tsx` | 🟡 Media | ❌ No existe |
| 6 | **Tracking en componentes clave** | Varios componentes | 🟡 Media | ❌ Pendiente |

**Detalles Técnicos:**

1. **Crear analyticsService.ts:**
```typescript
// lib/services/analyticsService.ts
import { apiClient } from '@/lib/apiClient';

interface AnalyticsEvent {
  eventType: string;
  eventName: string;
  properties?: Record<string, any>;
  sessionId?: string;
}

class AnalyticsService {
  private getSessionId(): string {
    if (typeof window === 'undefined') return '';
    const stored = sessionStorage.getItem('analytics_session_id');
    if (stored) return stored;
    const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', newId);
    return newId;
  }

  async trackEvent(event: AnalyticsEvent) {
    try {
      await apiClient.post('/analytics/events', {
        ...event,
        sessionId: event.sessionId || this.getSessionId(),
      });
    } catch (error) {
      // Silenciar errores para no interrumpir UX
      console.error('Analytics error:', error);
    }
  }

  async getSummary() {
    const { data } = await apiClient.get('/analytics/summary');
    return data.data;
  }
}

export const analyticsService = new AnalyticsService();
```

2. **Crear useAnalytics.ts:**
   - Track automático de page views
   - Función `trackEvent` para eventos custom
   - Integración con next-intl para locale
   - Detección de dispositivo

3. **Crear AnalyticsProvider.tsx:**
   - Wrapper que inicializa tracking
   - Maneja session ID
   - Proporciona contexto de analytics

---

#### **Sprint 4.4: Customer Success**

| # | Tarea | Archivo | Prioridad | Estado |
|---|-------|---------|-----------|--------|
| 1 | **Corregir endpoints en useHealthScore** | `lib/hooks/useHealthScore.ts` | 🔴 Alta | ⚠️ Pendiente |
| 2 | **Crear servicio healthScoreService** | `lib/services/healthScoreService.ts` | 🔴 Alta | ❌ No existe |
| 3 | **Crear componente HealthScoreCard** | `components/customer-success/HealthScoreCard.tsx` | 🔴 Alta | ❌ No existe |
| 4 | **Crear componente ChurnAlertsDashboard** | `components/customer-success/ChurnAlertsDashboard.tsx` | 🟡 Media | ❌ No existe |
| 5 | **Crear página admin/customer-success** | `app/(ops-admin)/admin/customer-success/page.tsx` | 🟡 Media | ❌ No existe |
| 6 | **Integrar HealthScoreCard en dashboard cliente** | `app/(client)/client/dashboard/page.tsx` | 🟢 Baja | ❌ Pendiente |

**Detalles Técnicos:**

1. **Corregir useHealthScore.ts:**
   - Cambiar `/customer-success/health-score/:id` → `/organizations/:id/health`
   - Cambiar `/customer-success/alerts` → `/admin/customer-success/alerts`
   - Ajustar tipos según respuesta del backend

2. **Crear healthScoreService.ts:**
```typescript
// lib/services/healthScoreService.ts
import { apiClient } from '@/lib/apiClient';

export interface HealthScore {
  id: string;
  organization_id: string;
  score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    activeUsers: number;
    activeProjects: number;
    ticketResponseTime: number;
    ticketResolutionRate: number;
    paymentStatus: number;
    engagement: number;
  };
  calculated_at: string;
  created_at: string;
}

export interface ChurnAlert {
  id: string;
  organization_id: string;
  score: number;
  risk_level: 'high' | 'critical';
  organization: {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
  };
  calculated_at: string;
}

class HealthScoreService {
  async getOrganizationHealth(organizationId: string): Promise<HealthScore | null> {
    try {
      const { data } = await apiClient.get(`/organizations/${organizationId}/health`);
      return data.data.healthScore;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }

  async getChurnAlerts(limit: number = 50): Promise<ChurnAlert[]> {
    const { data } = await apiClient.get('/admin/customer-success/alerts', {
      params: { limit },
    });
    return data.data.alerts;
  }
}

export const healthScoreService = new HealthScoreService();
```

3. **Crear HealthScoreCard.tsx:**
   - Mostrar score (0-100) con barra de progreso
   - Mostrar nivel de riesgo con badge colorizado
   - Mostrar factores desglosados
   - Gráfico de tendencia (opcional)

---

### ⚙️ AGENTE_BACKEND_EXPRESS_SUPABASE

**Estado:** ✅ **Completo** - No requiere acciones adicionales

**Notas:**
- Verificar que los endpoints documentados coincidan con la implementación real
- Si hay discrepancias, actualizar documentación o código

---

### 🧪 AGENTE_QA_AUTOMATION

#### **Testing E2E - Nuevas Features**

| # | Tarea | Archivo | Prioridad | Estado |
|---|-------|---------|-----------|--------|
| 1 | **Test: Push Notifications** | `tests/e2e/notifications/push.spec.ts` | 🟡 Media | ⚠️ Existe pero actualizar |
| 2 | **Test: Health Score** | `tests/e2e/customer-success/health-score.spec.ts` | 🟡 Media | ❌ No existe |
| 3 | **Test: Analytics Tracking** | `tests/e2e/analytics/tracking.spec.ts` | 🟢 Baja | ❌ No existe |

**Detalles:**

1. **Actualizar push.spec.ts:**
   - Verificar suscripción/desuscripción
   - Verificar que las notificaciones se reciben
   - Verificar permisos del navegador

2. **Crear health-score.spec.ts:**
   - Verificar que se muestra health score en dashboard cliente
   - Verificar que admin ve alertas de churn
   - Verificar permisos (cliente solo ve su org)

3. **Crear tracking.spec.ts:**
   - Verificar que los eventos se envían al backend
   - Verificar page views automáticos

---

### 🎯 AGENTE_UX_PRODUCT

#### **Revisión UX - Nuevas Features**

| # | Tarea | Descripción | Prioridad | Estado |
|---|-------|-------------|-----------|--------|
| 1 | **Diseño Push Permission Flow** | Cuándo y cómo pedir permisos | 🔴 Alta | ❌ Pendiente |
| 2 | **Diseño Health Score Card** | Visualización clara del score | 🟡 Media | ❌ Pendiente |
| 3 | **Diseño Churn Alerts** | Cómo mostrar alertas críticas | 🟡 Media | ❌ Pendiente |
| 4 | **Diseño Analytics Dashboard** | Qué métricas mostrar | 🟢 Baja | ❌ Pendiente |

**Recomendaciones:**

1. **Push Notifications:**
   - Pedir permiso después de que el usuario interactúe con la app (no al cargar)
   - Mostrar banner contextual explicando beneficios
   - Permitir activar desde settings sin forzar

2. **Health Score:**
   - Usar colores intuitivos (verde=bueno, rojo=crítico)
   - Mostrar tendencia (flecha arriba/abajo)
   - Tooltips explicando cada factor

3. **Churn Alerts:**
   - Priorizar por severidad
   - Acciones rápidas (contactar, crear ticket)
   - Filtros por tipo y estado

---

### 🚀 AGENTE_DEVOPS_OBSERVABILITY

#### **Configuración y Monitoreo**

| # | Tarea | Descripción | Prioridad | Estado |
|---|-------|-------------|-----------|--------|
| 1 | **Variables de entorno** | Verificar VAPID keys en producción | 🔴 Alta | ⚠️ Verificar |
| 2 | **Monitoring push delivery** | Métricas de entregas exitosas | 🟡 Media | ❌ Pendiente |
| 3 | **Error tracking** | Errores de analytics en Sentry | 🟡 Media | ❌ Pendiente |

**Acciones:**

1. Verificar que `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY` estén configuradas en producción
2. Agregar métricas de push delivery rate
3. Configurar alertas para errores críticos de analytics

---

### 📚 AGENTE_DOCS_KNOWLEDGE

#### **Documentación**

| # | Tarea | Archivo | Prioridad | Estado |
|---|-------|---------|-----------|--------|
| 1 | **Actualizar ROADMAP** | `docs/VIOTECH_ROADMAP_STRATEGICO_2025.md` | 🟡 Media | ⚠️ Pendiente |
| 2 | **Guía de uso Push** | `docs/frontend/PUSH_NOTIFICATIONS.md` | 🟢 Baja | ❌ No existe |
| 3 | **Guía de uso Analytics** | `docs/frontend/ANALYTICS.md` | 🟢 Baja | ❌ No existe |

---

## 📅 Prioridades y Orden de Ejecución

### **Iteración 1 (Días 1-2): Push Notifications**

```
Día 1:
├── Frontend: Corregir endpoints en usePushNotifications
├── Frontend: Crear pushNotificationService.ts
└── Frontend: Crear PushNotificationToggle.tsx

Día 2:
├── Frontend: Integrar en NotificationPreferences
├── QA: Actualizar tests E2E de push
└── UX: Revisar flow de permisos
```

### **Iteración 2 (Días 3-4): Analytics**

```
Día 3:
├── Frontend: Crear analyticsService.ts
├── Frontend: Crear hook useAnalytics
└── Frontend: Crear AnalyticsProvider

Día 4:
├── Frontend: Integrar en root layout
├── Frontend: Agregar tracking en componentes clave
└── Frontend: Crear página /admin/analytics
```

### **Iteración 3 (Días 5-6): Customer Success**

```
Día 5:
├── Frontend: Corregir endpoints en useHealthScore
├── Frontend: Crear healthScoreService.ts
└── Frontend: Crear HealthScoreCard.tsx

Día 6:
├── Frontend: Crear ChurnAlertsDashboard.tsx
├── Frontend: Crear página /admin/customer-success
└── QA: Crear tests E2E
```

---

## ⚠️ Riesgos & Recomendaciones

### **Riesgos Técnicos**

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Endpoints incorrectos | Media | Alto | Verificar con backend antes de implementar |
| Push permissions denegados | Alta | Medio | Pedir en momento contextual |
| Analytics bloqueado por ad-blockers | Alta | Bajo | Fallback silencioso |

### **Recomendaciones**

1. **Push Notifications:**
   - Implementar primero solo para eventos críticos (tickets asignados)
   - No forzar permisos al cargar la app

2. **Analytics:**
   - No bloquear UI si falla el tracking
   - Usar batching para reducir requests

3. **Customer Success:**
   - Empezar con visualización simple del score
   - Agregar gráficos de tendencia en iteración 2

---

## ✅ Checklist Final

### Push Notifications
- [ ] Endpoints corregidos en usePushNotifications
- [ ] Servicio pushNotificationService creado
- [ ] Componente PushNotificationToggle creado
- [ ] Integrado en NotificationPreferences
- [ ] Tests E2E actualizados

### Analytics
- [ ] Servicio analyticsService creado
- [ ] Hook useAnalytics creado
- [ ] AnalyticsProvider creado e integrado
- [ ] Página /admin/analytics creada
- [ ] Tracking en componentes clave

### Customer Success
- [ ] Endpoints corregidos en useHealthScore
- [ ] Servicio healthScoreService creado
- [ ] Componente HealthScoreCard creado
- [ ] Componente ChurnAlertsDashboard creado
- [ ] Página /admin/customer-success creada
- [ ] Tests E2E creados

---

**Última actualización:** Enero 2025  
**Mantenido por:** AGENTE_ORQUESTADOR_VIOTECH_PRO

