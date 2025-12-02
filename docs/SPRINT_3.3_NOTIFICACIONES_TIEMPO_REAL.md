# 🚀 Sprint 3.3: Notificaciones en Tiempo Real - Diseño Arquitectónico

**Versión:** 1.0.0  
**Fecha:** Diciembre 2024  
**Objetivo:** Implementar sistema completo de notificaciones en tiempo real con múltiples canales

---

## 📊 Estado Actual

### ✅ **Lo que ya tenemos**

1. **WebSocket Hook** (`lib/hooks/useRealtimeNotifications.ts`)
   - ✅ Conexión WebSocket con reconexión automática
   - ✅ Actualización de cache de React Query
   - ✅ Eventos personalizados para componentes

2. **Hooks de Notificaciones** (`lib/hooks/useNotifications.ts`)
   - ✅ `useNotifications()` - Listar notificaciones
   - ✅ `useNotificationStats()` - Estadísticas
   - ✅ `useMarkNotificationAsRead()` - Marcar como leída
   - ✅ `useMarkAllNotificationsAsRead()` - Marcar todas como leídas
   - ✅ `useDeleteNotification()` - Eliminar notificación
   - ✅ `useDeleteAllReadNotifications()` - Eliminar leídas

3. **Componentes UI**
   - ✅ `NotificationCenter.tsx` - Dropdown de notificaciones
   - ✅ Páginas completas en `/admin/notifications` y `/internal/notifications`
   - ✅ Integrado en header (`header-content.tsx`)

4. **Preferencias Básicas** (`components/customization/UserPreferences.tsx`)
   - ✅ Toggle email notifications
   - ✅ Toggle push notifications
   - ✅ Toggle in-app notifications

5. **Tipos TypeScript** (`lib/types/notifications.ts`)
   - ✅ `Notification` interface
   - ✅ `NotificationType` enum
   - ✅ `NotificationPreferences` interface
   - ✅ `NotificationStats` interface

### ❌ **Lo que falta**

1. **Preferencias Granulares por Tipo**
   - ❌ Configurar notificaciones por tipo (ticket_created, project_updated, etc.)
   - ❌ Preferencias por canal (email, push, in-app) por tipo

2. **Notificaciones Push (PWA)**
   - ❌ Service Worker para push notifications
   - ❌ Solicitud de permisos
   - ❌ Manejo de notificaciones push en background

3. **Email Digests**
   - ❌ Configuración de frecuencia (diario, semanal)
   - ❌ Resumen de notificaciones no leídas
   - ❌ Template de email

4. **Mejoras UX**
   - ❌ Toasts para notificaciones nuevas
   - ❌ Sonidos opcionales
   - ❌ Badge animado
   - ❌ Página de notificaciones para clientes

5. **Integraciones Externas**
   - ❌ Slack integration (futuro)
   - ❌ Teams integration (futuro)

---

## 🏗️ Arquitectura de la Solución

### **1. Capa de Datos (Backend)**

```
Backend debe exponer:
- GET /api/notifications/preferences - Obtener preferencias
- PUT /api/notifications/preferences - Actualizar preferencias
- POST /api/notifications/preferences/test - Enviar notificación de prueba
- POST /api/notifications/push/subscribe - Suscribirse a push notifications
- DELETE /api/notifications/push/unsubscribe - Desuscribirse
- GET /api/notifications/digest - Obtener resumen para email digest
```

**Modelo de Preferencias Granulares:**
```typescript
interface NotificationPreferencesGranular {
  // Preferencias globales
  email: boolean;
  push: boolean;
  inApp: boolean;
  digest: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'never';
    time?: string; // HH:mm formato
  };
  
  // Preferencias por tipo
  byType: {
    [key in NotificationType]: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
  };
  
  // Preferencias adicionales
  sound: boolean;
  desktop: boolean; // Notificaciones de escritorio
}
```

### **2. Capa de Hooks (Frontend)**

**Nuevos hooks a crear:**

```typescript
// lib/hooks/useNotificationPreferences.ts
export function useNotificationPreferences()
export function useUpdateNotificationPreferences()
export function useTestNotification()

// lib/hooks/usePushNotifications.ts
export function usePushNotificationSubscription()
export function useRequestPushPermission()
export function usePushNotificationStatus()
```

### **3. Capa de Componentes (Frontend)**

**Componentes nuevos:**

```
components/notifications/
├── NotificationPreferences.tsx      # Panel de preferencias granular
├── NotificationPreferencesDialog.tsx # Dialog para editar preferencias
├── PushNotificationPrompt.tsx        # Prompt para solicitar permisos push
├── NotificationToast.tsx            # Toast personalizado para notificaciones
├── NotificationSound.tsx             # Componente para sonidos (opcional)
└── NotificationBadge.tsx             # Badge animado mejorado
```

**Páginas nuevas:**

```
app/(client)/client/notifications/
└── page.tsx                          # Página de notificaciones para clientes
```

### **4. Service Worker (PWA)**

```
public/
├── service-worker.js                  # Service Worker principal
└── firebase-messaging-sw.js          # (Opcional) Firebase Cloud Messaging
```

---

## 📋 Plan de Implementación por Roles

### **FRONTEND_NEXT_REACT_TS**

#### **Fase 1: Preferencias Granulares (MVP)**

1. **Extender tipos TypeScript**
   - [ ] Actualizar `lib/types/notifications.ts` con `NotificationPreferencesGranular`
   - [ ] Agregar tipos para digest y push subscription

2. **Crear hooks de preferencias**
   - [ ] `lib/hooks/useNotificationPreferences.ts`
     - `useNotificationPreferences()` - Obtener preferencias
     - `useUpdateNotificationPreferences()` - Actualizar preferencias
     - `useTestNotification()` - Enviar notificación de prueba

3. **Componente de preferencias granular**
   - [ ] `components/notifications/NotificationPreferences.tsx`
     - Tabs por categoría (Global, Tickets, Proyectos, Sistema)
     - Toggles por tipo y canal
     - Preview de configuración

4. **Integrar en UserPreferences**
   - [ ] Reemplazar preferencias básicas con componente granular
   - [ ] Agregar sección de digest
   - [ ] Agregar sección de sonidos

#### **Fase 2: Notificaciones Push (PWA)**

1. **Service Worker**
   - [ ] `public/service-worker.js`
     - Registro de service worker
     - Manejo de push notifications
     - Manejo de clicks en notificaciones

2. **Hooks de Push Notifications**
   - [ ] `lib/hooks/usePushNotifications.ts`
     - `useRequestPushPermission()` - Solicitar permisos
     - `usePushNotificationSubscription()` - Suscribirse/desuscribirse
     - `usePushNotificationStatus()` - Estado de suscripción

3. **Componente de Prompt**
   - [ ] `components/notifications/PushNotificationPrompt.tsx`
     - Dialog para solicitar permisos
     - Explicación de beneficios
     - Manejo de permisos denegados

4. **Integración**
   - [ ] Actualizar `components/common/ServiceWorkerRegister.tsx`
   - [ ] Agregar prompt en onboarding o settings
   - [ ] Manejar notificaciones push recibidas

#### **Fase 3: Mejoras UX**

1. **Toasts para notificaciones**
   - [ ] `components/notifications/NotificationToast.tsx`
     - Toast personalizado con acción
     - Auto-dismiss configurable
     - Click para abrir notificación

2. **Sonidos opcionales**
   - [ ] `components/notifications/NotificationSound.tsx`
     - Reproducir sonido cuando llega notificación
     - Respetar preferencia de usuario
     - Sonidos diferentes por tipo (opcional)

3. **Badge animado**
   - [ ] Mejorar `NotificationCenter.tsx`
     - Animación cuando llega nueva notificación
     - Pulse effect
     - Contador animado

4. **Página de notificaciones para clientes**
   - [ ] `app/(client)/client/notifications/page.tsx`
     - Similar a admin/internal pero para clientes
     - Agregar ruta en sidebar de clientes

#### **Fase 4: Email Digests (Backend Required)**

1. **UI de configuración**
   - [ ] Agregar sección de digest en preferencias
   - [ ] Selector de frecuencia (diario, semanal, nunca)
   - [ ] Selector de hora (para diario)

2. **Preview de digest**
   - [ ] Componente para mostrar cómo se verá el digest
   - [ ] Lista de notificaciones que se incluirán

---

### **BACKEND_EXPRESS_SUPABASE**

#### **Endpoints Requeridos**

1. **Preferencias Granulares**
   ```
   GET    /api/notifications/preferences
   PUT    /api/notifications/preferences
   POST   /api/notifications/preferences/test
   ```

2. **Push Notifications**
   ```
   POST   /api/notifications/push/subscribe
   DELETE /api/notifications/push/unsubscribe
   GET    /api/notifications/push/status
   ```

3. **Email Digests**
   ```
   GET    /api/notifications/digest/preview
   POST   /api/notifications/digest/send-now
   ```

#### **Modelo de Base de Datos**

```sql
-- Tabla de preferencias de notificaciones
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email BOOLEAN DEFAULT true,
  push BOOLEAN DEFAULT false,
  in_app BOOLEAN DEFAULT true,
  digest_enabled BOOLEAN DEFAULT false,
  digest_frequency VARCHAR(20) DEFAULT 'never', -- 'daily', 'weekly', 'never'
  digest_time TIME, -- Para daily
  sound_enabled BOOLEAN DEFAULT false,
  desktop_enabled BOOLEAN DEFAULT true,
  by_type JSONB DEFAULT '{}', -- Preferencias por tipo
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabla de suscripciones push
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);
```

---

### **DEVOPS_OBSERVABILITY**

1. **Configuración de Push Notifications**
   - [ ] Configurar VAPID keys para Web Push
   - [ ] Configurar Firebase Cloud Messaging (opcional)
   - [ ] Documentar proceso de generación de keys

2. **Monitoreo**
   - [ ] Métricas de notificaciones enviadas
   - [ ] Tasa de entrega de push notifications
   - [ ] Errores en WebSocket

---

### **UX_PRODUCT**

1. **Diseño de Preferencias**
   - [ ] Wireframes de preferencias granular
   - [ ] Diseño de prompt de push notifications
   - [ ] Diseño de toast de notificaciones

2. **Flujos de Usuario**
   - [ ] Flujo de configuración inicial
   - [ ] Flujo de solicitud de permisos push
   - [ ] Flujo de digest email

---

### **DOCS_KNOWLEDGE**

1. **Documentación**
   - [ ] Guía de configuración de preferencias
   - [ ] Documentación de push notifications
   - [ ] Guía de email digests

---

## 🎯 Prioridades

### **MVP (Sprint 3.3 v0)**
1. ✅ Preferencias granulares por tipo
2. ✅ Mejoras UX (toasts, badge animado)
3. ✅ Página de notificaciones para clientes

### **v1 (Sprint 3.3 v1)**
1. ✅ Notificaciones push (PWA)
2. ✅ Sonidos opcionales

### **v2 (Futuro)**
1. ⏳ Email digests
2. ⏳ Integración Slack/Teams

---

## 🔒 Consideraciones de Seguridad

1. **Push Notifications**
   - Validar VAPID keys en backend
   - Verificar permisos antes de suscribir
   - Encriptar datos sensibles en payload

2. **Preferencias**
   - Validar que usuario solo modifique sus propias preferencias
   - Sanitizar input de preferencias

3. **WebSocket**
   - Autenticación mediante token
   - Rate limiting por usuario
   - Validar origen de mensajes

---

## 📊 Métricas de Éxito

1. **Engagement**
   - Tasa de apertura de notificaciones
   - Tiempo promedio de respuesta
   - Tasa de suscripción a push notifications

2. **Performance**
   - Latencia de entrega de notificaciones
   - Tasa de éxito de WebSocket
   - Tasa de entrega de push notifications

3. **UX**
   - Satisfacción con sistema de notificaciones
   - Tasa de configuración de preferencias
   - Tasa de desactivación de notificaciones

---

## 🚀 Próximos Pasos

1. **Revisar y aprobar diseño**
2. **Implementar MVP (Fase 1)**
3. **Testing y feedback**
4. **Implementar v1 (Fase 2)**
5. **Documentación final**

---

**Documento creado:** Diciembre 2024  
**Última actualización:** Diciembre 2024  
**Versión:** 1.0.0

