# 🔐 Variables de Entorno - Frontend VioTech Pro

**Última actualización:** Noviembre 2025  
**Archivo:** `.env.local`

---

## 📋 Variables Requeridas (Obligatorias)

### **1. Backend API**
```env
# URL del backend (sin /api al final, se agrega automáticamente)
NEXT_PUBLIC_BACKEND_API_URL=https://viotech-main.onrender.com
```

**Usado en:**
- `lib/apiClient.ts`
- `lib/auth.ts`
- `lib/api.ts`
- `components/common/AITicketAssistant.tsx`
- `app/api/predictions/project-timeline/route.ts`

**Nota:** Si no está definida, usa `http://localhost:3000/api` como fallback.

---

### **2. Supabase (Storage para archivos)**
```env
# URL de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Clave pública (anon key) de Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Bucket de storage (opcional, default: "tickets")
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=tickets
# O alternativamente (sin NEXT_PUBLIC_):
SUPABASE_STORAGE_BUCKET=tickets
```

**Usado en:**
- `lib/storage/uploadTicketAttachment.ts`

**Nota:** `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` tiene prioridad sobre `SUPABASE_STORAGE_BUCKET`.

---

## ⚙️ Variables Opcionales (Recomendadas)

### **3. Sentry (Error Tracking & Monitoring)**
```env
# DSN de Sentry para error tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@o4507467686985728.ingest.us.sentry.io/xxxxx

# Entorno (development, staging, production)
NEXT_PUBLIC_ENVIRONMENT=development

# Versión de la app (para release tracking)
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**Usado en:**
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `lib/hooks/useWebVitals.ts`

**Nota:** Si `NEXT_PUBLIC_SENTRY_DSN` no está definida, Sentry se desactiva automáticamente.

---

### **4. Google Analytics 4**
```env
# Measurement ID de Google Analytics 4
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Usado en:**
- `components/common/AnalyticsProvider.tsx`

**Nota:** Si no está definida, GA4 no se inicializa.

---

### **5. WebSockets (Notificaciones en Tiempo Real)**
```env
# URL del servidor WebSocket
NEXT_PUBLIC_WS_URL=wss://viotech-main.onrender.com
```

**Usado en:**
- `lib/hooks/useRealtimeNotifications.ts`
- `lib/hooks/useProjectAlerts.ts`

**Nota:** Si no está definida, usa `wss://viotech-main.onrender.com` como fallback.

---

### **6. Push Notifications (PWA)**
```env
# Clave pública VAPID para push notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Usado en:**
- `lib/hooks/usePushNotifications.ts`

**Nota:** Si no está definida, las push notifications no funcionarán. Se obtiene del backend si no está configurada.

---

### **7. Logging**
```env
# Nivel de logging (debug, info, warn, error)
NEXT_PUBLIC_LOG_LEVEL=info
```

**Usado en:**
- `lib/logger.ts`

**Valores posibles:** `debug`, `info`, `warn`, `error`  
**Default:** `info`

---

## 🧪 Variables de Testing (Solo para E2E)

### **8. Playwright (Testing)**
```env
# URL base para tests E2E
PLAYWRIGHT_BASE_URL=http://localhost:3000

# Credenciales de test (opcional)
TEST_PARTNER_EMAIL=partner@test.viotech.com
TEST_PARTNER_PASSWORD=TestPassword123!
TEST_USER_EMAIL=user@test.viotech.com
TEST_USER_PASSWORD=TestPassword123!
```

**Usado en:**
- `playwright.config.ts`
- `tests/e2e/fixtures/test-data.ts`

**Nota:** Solo necesarias para ejecutar tests E2E.

---

## 📝 Template Completo de `.env.local`

```env
# ============================================
# BACKEND API (OBLIGATORIO)
# ============================================
NEXT_PUBLIC_BACKEND_API_URL=https://viotech-main.onrender.com

# ============================================
# SUPABASE (OBLIGATORIO para uploads)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=tickets

# ============================================
# SENTRY (RECOMENDADO)
# ============================================
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@o4507467686985728.ingest.us.sentry.io/xxxxx
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_APP_VERSION=1.0.0

# ============================================
# GOOGLE ANALYTICS 4 (OPCIONAL)
# ============================================
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# ============================================
# WEBSOCKETS (OPCIONAL - para notificaciones realtime)
# ============================================
NEXT_PUBLIC_WS_URL=wss://viotech-main.onrender.com

# ============================================
# PUSH NOTIFICATIONS (OPCIONAL - PWA)
# ============================================
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# LOGGING (OPCIONAL)
# ============================================
NEXT_PUBLIC_LOG_LEVEL=info

# ============================================
# TESTING (Solo para E2E)
# ============================================
# PLAYWRIGHT_BASE_URL=http://localhost:3000
# TEST_PARTNER_EMAIL=partner@test.viotech.com
# TEST_PARTNER_PASSWORD=TestPassword123!
# TEST_USER_EMAIL=user@test.viotech.com
# TEST_USER_PASSWORD=TestPassword123!
```

---

## ✅ Checklist de Variables

### **Mínimas Requeridas (para funcionamiento básico):**
- [x] `NEXT_PUBLIC_BACKEND_API_URL`
- [x] `NEXT_PUBLIC_SUPABASE_URL`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **Recomendadas (para producción):**
- [ ] `NEXT_PUBLIC_SENTRY_DSN`
- [ ] `NEXT_PUBLIC_ENVIRONMENT`
- [ ] `NEXT_PUBLIC_APP_VERSION`
- [ ] `NEXT_PUBLIC_WS_URL`
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

### **Opcionales (mejoras):**
- [ ] `NEXT_PUBLIC_GA4_MEASUREMENT_ID`
- [ ] `NEXT_PUBLIC_LOG_LEVEL`

---

## 🔍 Cómo Verificar Variables Faltantes

### **1. Revisar el archivo `.env.local`:**
```bash
# Ver todas las variables NEXT_PUBLIC_
cat .env.local | grep NEXT_PUBLIC_
```

### **2. Verificar en el código:**
```bash
# Buscar todas las referencias a process.env
grep -r "process.env.NEXT_PUBLIC_" --include="*.ts" --include="*.tsx" .
```

### **3. Verificar en runtime:**
Abre la consola del navegador y ejecuta:
```javascript
// Ver todas las variables NEXT_PUBLIC_ disponibles
Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_'))
```

---

## ⚠️ Notas Importantes

1. **Prefijo `NEXT_PUBLIC_`:** Todas las variables que se usan en el cliente (browser) deben tener este prefijo. Sin él, Next.js no las expone al cliente.

2. **Variables sin `NEXT_PUBLIC_`:** Solo están disponibles en el servidor (API routes, server components).

3. **Seguridad:** Nunca expongas:
   - Claves privadas de APIs
   - Tokens de autenticación
   - Secretos de base de datos
   - Variables con información sensible

4. **Fallbacks:** Muchas variables tienen valores por defecto, pero es mejor definirlas explícitamente.

5. **`.env.local` vs `.env`:** 
   - `.env.local` es para desarrollo local (no se commitea)
   - `.env` puede committearse si no tiene secretos
   - `.env.production` para producción en Vercel/Render

---

## 🚀 Variables por Entorno

### **Desarrollo:**
```env
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_BACKEND_API_URL=https://viotech-dev.onrender.com
```

### **Staging:**
```env
NEXT_PUBLIC_ENVIRONMENT=staging
NEXT_PUBLIC_BACKEND_API_URL=https://viotech-staging.onrender.com
```

### **Producción:**
```env
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_BACKEND_API_URL=https://viotech-main.onrender.com
```

---

---

## 🚫 Deshabilitar Rate Limiting para Desarrollo Local

El rate limiting está configurado en el **backend** (usando `express-rate-limit`). Para deshabilitarlo en desarrollo local:

### **Opción 1: Variable de Entorno en el Backend (Recomendado)**

En el backend, agrega una variable de entorno para deshabilitar el rate limiting:

```env
# En el backend (.env o .env.local)
DISABLE_RATE_LIMIT=true
NODE_ENV=development
```

Luego, en el código del backend donde se configura `express-rate-limit`, agrega:

```javascript
// En el backend (ejemplo)
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.DISABLE_RATE_LIMIT === 'true' ? 0 : 100, // 0 = deshabilitado
  message: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

// O simplemente no aplicar el middleware si está deshabilitado:
if (process.env.DISABLE_RATE_LIMIT !== 'true') {
  app.use('/api/', limiter);
}
```

### **Opción 2: Configuración por Entorno**

En el backend, configura diferentes límites según el entorno:

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 0 : 100, // Deshabilitado en dev
  // ... resto de la configuración
});
```

### **Opción 3: Whitelist de IPs Locales**

Permitir que las IPs locales no tengan límite:

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => {
    // Saltar rate limiting para localhost
    return req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
  },
  // ... resto de la configuración
});
```

### **Verificación**

Después de aplicar los cambios en el backend:

1. Reinicia el servidor backend
2. Ejecuta los tests E2E: `npm run test:e2e:client`
3. Verifica que no aparezcan errores 429 en los logs del backend

---

**Documento generado:** Noviembre 2025

