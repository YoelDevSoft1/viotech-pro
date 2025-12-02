# 🔧 Auditoría DevOps y Plan de Mejoras - VioTech Pro 2025

> **Fecha**: Enero 2025  
> **Alcance**: Frontend Next.js 16 + Backend Render.com + Supabase  
> **Objetivo**: Identificar mejoras críticas en despliegue, observabilidad, performance y seguridad

---

## 1. Contexto y Objetivo

### Estado Actual del Sistema

**Frontend:**
- Next.js 16 (App Router) + React 19
- Desplegado en Netlify (configurado) / Vercel (recomendado)
- TypeScript 5 strict mode
- Security headers configurados (CSP, X-Frame-Options, etc.)

**Backend:**
- Node.js/Express en Render.com (`https://viotech-main.onrender.com`)
- Cold starts de ~30 segundos (timeout configurado)
- PostgreSQL 16 en Supabase
- Storage en Supabase

**Observabilidad Actual:**
- ✅ Security headers implementados
- ✅ Health check endpoint existe (`/health`)
- ✅ Página de health en admin (`/admin/health`)
- ❌ No hay integración de Sentry en frontend
- ❌ No hay logs estructurados en frontend
- ❌ No hay métricas de performance en producción
- ❌ No hay CI/CD automatizado

**Seguridad:**
- ✅ CSP configurado
- ✅ CORS (backend)
- ✅ JWT con refresh automático
- ⚠️ Variables de entorno no documentadas completamente
- ❌ No hay rate limiting en frontend
- ❌ No hay monitoreo de intentos de acceso fallidos

### Objetivos de la Auditoría

1. **Mejorar observabilidad**: Logs estructurados, métricas y alertas
2. **Automatizar despliegues**: CI/CD pipelines completos
3. **Optimizar performance**: Reducir cold starts, mejorar caching
4. **Reforzar seguridad**: Rate limiting, monitoreo de seguridad
5. **Documentar operaciones**: Runbooks y procedimientos de recuperación

---

## 2. Arquitectura de Despliegue Propuesta

### Estado Actual vs Propuesto

| Aspecto | Actual | Propuesto | Prioridad |
|---------|--------|-----------|-----------|
| **CI/CD** | Manual / Netlify build | GitHub Actions completo | 🔴 Alta |
| **Frontend Hosting** | Netlify | Vercel (mejor Next.js) | 🟡 Media |
| **Entornos** | Solo producción | Dev + Staging + Prod | 🔴 Alta |
| **Variables de Entorno** | Manuales | Gestión centralizada | 🔴 Alta |
| **Build Optimization** | Básico | Optimizaciones Next.js | 🟡 Media |
| **Health Checks** | Manual | Automatizados + Alertas | 🟡 Media |

### Arquitectura de Entornos

```
┌─────────────────────────────────────────────────────────────┐
│                        CI/CD Pipeline                        │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   BRANCH     │   │   BRANCH     │   │   BRANCH     │
│   develop    │   │   staging    │   │   main       │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ ENVIRONMENT  │   │ ENVIRONMENT  │   │ ENVIRONMENT  │
│    DEV       │   │   STAGING    │   │ PRODUCTION   │
│              │   │              │   │              │
│ Vercel Dev   │   │ Vercel Stage │   │ Vercel Prod  │
│ Render Dev   │   │ Render Stage │   │ Render Prod  │
│ Supabase Dev │   │ Supabase Dev │   │ Supabase Prod│
└──────────────┘   └──────────────┘   └──────────────┘
```

### Configuración de Variables de Entorno por Entorno

**Desarrollo:**
```env
NEXT_PUBLIC_BACKEND_API_URL=https://viotech-dev.onrender.com
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_DSN=... (dev project)
```

**Staging:**
```env
NEXT_PUBLIC_BACKEND_API_URL=https://viotech-staging.onrender.com
NEXT_PUBLIC_ENVIRONMENT=staging
NEXT_PUBLIC_SENTRY_DSN=... (staging project)
```

**Producción:**
```env
NEXT_PUBLIC_BACKEND_API_URL=https://viotech-main.onrender.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_SENTRY_DSN=... (prod project)
```

---

## 3. Observabilidad

### 3.1 Logs Estructurados

**Estado Actual:**
- ❌ No hay logging estructurado en frontend
- ✅ Backend usa Winston (asumido)

**Propuesta:**

#### Implementar Logger Frontend con Pino

```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
  browser: {
    asObject: true,
    transmit: {
      level: 'info',
      send: async (level, logEvent) => {
        // Enviar logs críticos al backend para centralización
        if (level >= 40) { // error y fatal
          await fetch('/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logEvent)
          }).catch(() => {}); // Fallar silenciosamente
        }
      }
    }
  }
});
```

**Niveles de Log:**
- `error` (50): Errores de aplicación, fallos de API críticos
- `warn` (40): Advertencias, tokens expirados, timeouts
- `info` (30): Eventos de negocio (login, pago iniciado, ticket creado)
- `debug` (20): Flujos de datos, estados de componentes
- `trace` (10): Solo desarrollo

**Qué Loguear:**

| Evento | Nivel | Información Requerida |
|--------|-------|----------------------|
| Error de API | `error` | URL, método, status, error message, user ID |
| Token expirado | `warn` | User ID, refresh intent |
| Login exitoso | `info` | User ID, rol, timestamp |
| Pago iniciado | `info` | User ID, monto, servicio, payment ID |
| Error de renderizado | `error` | Component, error stack, user agent |
| Timeout de backend | `warn` | Endpoint, timeout duration |

### 3.2 Integración Sentry

**Estado Actual:**
- ❌ No configurado en frontend
- ✅ Mencionado en docs pero no implementado

**Implementación Propuesta:**

```typescript
// lib/sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || "development",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  beforeSend(event, hint) {
    // Filtrar errores conocidos/no críticos
    const error = hint.originalException;
    if (error?.message?.includes('ENDPOINT_NOT_IMPLEMENTED')) {
      return null; // No enviar a Sentry
    }
    return event;
  },
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

**Configuración en `next.config.ts`:**

```typescript
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  // ... configuración actual
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: "viotech-solutions",
  project: "viotech-pro-frontend",
});
```

**Agrupación de Issues en Sentry:**
- Por tipo de error (API, render, autenticación)
- Por ruta afectada (`/client/tickets`, `/admin/users`)
- Por usuario afectado (opcional, solo admins)

### 3.3 Métricas y KPIs Técnicos

**Métricas Clave a Monitorear:**

| Métrica | Target | Alerta Si |
|---------|--------|-----------|
| **Frontend** |
| First Contentful Paint (FCP) | < 1s | > 2s |
| Time to Interactive (TTI) | < 2s | > 3s |
| Cumulative Layout Shift (CLS) | < 0.1 | > 0.25 |
| Error Rate (JS errors) | < 0.1% | > 1% |
| API Error Rate (5xx) | < 0.5% | > 2% |
| **Backend** |
| Response Time (p50) | < 500ms | > 1s |
| Response Time (p95) | < 2s | > 5s |
| Cold Start Duration | < 30s | > 60s |
| Database Query Time | < 200ms | > 500ms |
| **Business** |
| Login Success Rate | > 99% | < 95% |
| Payment Success Rate | > 98% | < 95% |
| Ticket Creation Success | > 99% | < 97% |

**Dashboard Propuesto (Grafana/DataDog/Vercel Analytics):**

```
┌─────────────────────────────────────────────────┐
│        VioTech Pro - Production Dashboard       │
├─────────────────────────────────────────────────┤
│  📊 Uptime: 99.9%  │  🔴 Errors: 12  │  ⚡ P95: 1.2s │
├─────────────────────────────────────────────────┤
│  [Gráfico: Request Rate (24h)]                  │
│  [Gráfico: Error Rate por Tipo]                 │
│  [Gráfico: Response Time (p50, p95, p99)]       │
│  [Tabla: Top 10 Endpoints más Lentos]           │
│  [Tabla: Errores Recientes]                     │
└─────────────────────────────────────────────────┘
```

### 3.4 Health Checks Automatizados

**Estado Actual:**
- ✅ Endpoint `/health` existe
- ✅ Página manual en `/admin/health`
- ❌ No hay alertas automáticas

**Mejoras Propuestas:**

1. **Health Check Endpoint Mejorado:**

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    frontend: { status: 'ok', timestamp: new Date().toISOString() },
    backend: await checkBackend(),
    database: await checkDatabase(),
    storage: await checkStorage(),
  };
  
  const allHealthy = Object.values(checks).every(c => c.status === 'ok');
  
  return Response.json({
    status: allHealthy ? 'healthy' : 'degraded',
    checks,
    version: process.env.NEXT_PUBLIC_APP_VERSION,
  }, { status: allHealthy ? 200 : 503 });
}
```

2. **Alertas Automáticas (UptimeRobot/Cronitor):**
   - Verificar `/api/health` cada 5 minutos
   - Alerta si status != 200 o si respuesta tarda > 10s
   - Notificar vía email/Slack/PagerDuty

3. **Health Check Status Badge:**
   - Mostrar en página de admin
   - Actualización automática cada 30s

---

## 4. Performance & Seguridad

### 4.1 Optimizaciones de Performance

#### Frontend

**Problemas Identificados:**
- ⚠️ Cold starts de Render pueden causar timeouts
- ⚠️ No hay optimización de imágenes más allá de Next.js Image
- ⚠️ No hay cache de respuestas API en frontend
- ⚠️ Bundle size no optimizado

**Soluciones Propuestas:**

1. **Caching de Respuestas API con React Query:**
   - Ya implementado parcialmente
   - Mejorar `staleTime` según tipo de dato:
     ```typescript
     // Datos casi estáticos (servicios, usuarios)
     staleTime: 1000 * 60 * 30, // 30 min
     
     // Datos dinámicos (tickets, métricas)
     staleTime: 1000 * 60 * 5, // 5 min
     
     // Datos en tiempo real (notificaciones)
     staleTime: 0, // Siempre fresco
     ```

2. **Optimización de Bundle:**
   ```bash
   # Analizar bundle size
   npm run build -- --analyze
   ```
   - Lazy load componentes pesados (charts, calendar)
   - Code splitting por ruta

3. **Image Optimization:**
   - ✅ Ya configurado con Next.js Image
   - Agregar `priority` solo en imágenes críticas (above-fold)
   - Usar `loading="lazy"` para imágenes below-fold

4. **Service Worker para Offline:**
   - ✅ Ya existe `service-worker.js`
   - Mejorar cache strategy para assets estáticos

#### Backend (Recomendaciones para Backend Team)

**Cold Starts en Render:**
- **Problema**: Render "duerme" servicios gratuitos después de inactividad
- **Soluciones:**
  1. Upgrade a plan pagado (siempre activo)
  2. Implementar "wake-up" ping cada 5 minutos (UptimeRobot)
  3. Usar Render Background Workers para mantener caliente

**Optimizaciones de Base de Datos:**
- Indexar columnas frecuentes: `user_id`, `organization_id`, `created_at`
- Usar connection pooling (Supabase ya lo maneja)
- Implementar query caching para métricas del dashboard

**Caching:**
- Redis para:
  - Sesiones de usuario
  - Catálogo de servicios (cache 1 hora)
  - Métricas de dashboard (cache 5 minutos)

### 4.2 Seguridad Operacional

#### Mejoras de Seguridad Frontend

**Problemas Identificados:**
- ✅ CSP configurado
- ✅ Security headers presentes
- ❌ No hay rate limiting en frontend
- ❌ No hay protección CSRF explícita
- ⚠️ Tokens en localStorage (vulnerable a XSS)

**Soluciones Propuestas:**

1. **Rate Limiting (Backend):**
   - Ya debe estar implementado (express-rate-limit)
   - Verificar límites:
     - Login: 5 intentos / 15 min
     - API general: 100 requests / min por IP
     - Pagos: 10 requests / min por usuario

2. **Protección CSRF:**
   - Next.js ya protege automáticamente con SameSite cookies
   - Verificar que todas las mutations usen métodos seguros

3. **Mejora de Almacenamiento de Tokens:**
   ```typescript
   // Evaluar migrar a httpOnly cookies (requiere cambios en backend)
   // Por ahora, mantener localStorage pero:
   // - Validar tokens en cada request
   // - Limpiar tokens inválidos automáticamente
   // - Implementar "secure" flag si HTTPS
   ```

4. **Content Security Policy (CSP) - Mejoras:**
   ```typescript
   // next.config.ts - Agregar nonce para scripts inline críticos
   const cspHeader = `
     default-src 'self';
     script-src 'self' 'unsafe-inline' 'unsafe-eval' ${trustedDomains};
     // ... resto de política
   `;
   ```

5. **Monitoreo de Seguridad:**
   - Alertar en Sentry si:
     - Múltiples 401 desde misma IP
     - Intentos de acceso a rutas protegidas sin auth
     - Errores de validación de tokens frecuentes

#### Backups y Recuperación

**Estrategia de Backups Propuesta:**

| Recurso | Frecuencia | Retención | Ubicación |
|---------|------------|-----------|-----------|
| **Base de Datos (Supabase)** | Diario automático | 30 días | Supabase Cloud |
| **Storage (Supabase)** | Semanal | 7 días | Supabase Cloud |
| **Código (Git)** | Continuo | Ilimitado | GitHub |
| **Variables de Entorno** | Manual | Ilimitado | 1Password/Vault |

**Plan de Recuperación ante Desastres (DR):**

1. **Escenario: Base de Datos Corrupta**
   - Restaurar desde backup más reciente de Supabase
   - Tiempo estimado: 15-30 minutos
   - RPO (Recovery Point Objective): 24 horas
   - RTO (Recovery Time Objective): 1 hora

2. **Escenario: Backend Caído**
   - Failover a instancia secundaria (si existe)
   - O restaurar desde último deploy
   - Tiempo estimado: 5-10 minutos
   - RTO: 30 minutos

3. **Escenario: Frontend Comprometido**
   - Rollback a versión anterior en Vercel
   - Tiempo estimado: 2-5 minutos
   - RTO: 10 minutos

**Documentación Requerida:**
- Runbook de recuperación paso a paso
- Contactos de emergencia (devops, backend, supabase)
- Procedimientos de comunicación con usuarios

---

## 5. Checklist de Tareas Accionables

### 🔴 Prioridad Alta (Sprint 1-2)

#### CI/CD y Automatización

- [ ] **Configurar GitHub Actions para CI/CD**
  - [ ] Crear `.github/workflows/ci.yml` para tests y lint
  - [ ] Crear `.github/workflows/deploy-staging.yml` (deploy en push a `staging`)
  - [ ] Crear `.github/workflows/deploy-production.yml` (deploy en merge a `main`)
  - [ ] Configurar secrets en GitHub (Sentry DSN, tokens de deploy)
  - [ ] Agregar status checks requeridos antes de merge

- [ ] **Configurar Entornos Separados**
  - [ ] Crear proyecto Vercel para staging
  - [ ] Crear proyecto Vercel para production
  - [ ] Configurar variables de entorno por entorno
  - [ ] Documentar proceso de promoción de código (dev → staging → prod)

#### Observabilidad

- [ ] **Integrar Sentry**
  - [ ] Instalar `@sentry/nextjs`
  - [ ] Configurar `lib/sentry.ts`
  - [ ] Configurar `next.config.ts` con Sentry plugin
  - [ ] Crear proyectos en Sentry para dev/staging/prod
  - [ ] Agregar variables de entorno `NEXT_PUBLIC_SENTRY_DSN`

- [ ] **Implementar Logger Estructurado**
  - [ ] Instalar `pino` o `winston` para browser
  - [ ] Crear `lib/logger.ts` con niveles y formateo
  - [ ] Reemplazar `console.log/error` por logger
  - [ ] Configurar envío de errores críticos al backend

- [ ] **Health Checks Automatizados**
  - [ ] Crear endpoint `/api/health` mejorado
  - [ ] Configurar UptimeRobot/Cronitor para monitoreo
  - [ ] Configurar alertas (email/Slack) si health check falla

#### Seguridad

- [ ] **Documentar Variables de Entorno**
  - [ ] Crear `.env.example` con todas las variables requeridas
  - [ ] Documentar en `docs/ENVIRONMENT_VARIABLES.md`
  - [ ] Verificar que todas estén configuradas en Vercel

- [ ] **Mejorar Manejo de Secretos**
  - [ ] Mover todos los secretos a variables de entorno (no hardcodeados)
  - [ ] Verificar que `.env*` esté en `.gitignore`
  - [ ] Configurar rotación de tokens JWT (si aplica)

### 🟡 Prioridad Media (Sprint 3-4)

#### Performance

- [ ] **Optimizar Caching**
  - [ ] Revisar y ajustar `staleTime` en todos los hooks de React Query
  - [ ] Implementar cache de respuestas API en service worker
  - [ ] Configurar headers de cache para assets estáticos

- [ ] **Analizar Bundle Size**
  - [ ] Ejecutar `npm run build -- --analyze`
  - [ ] Identificar y lazy-load componentes pesados
  - [ ] Optimizar imports (tree-shaking)

- [ ] **Mejorar Service Worker**
  - [ ] Implementar estrategias de cache para diferentes tipos de recursos
  - [ ] Agregar notificaciones de actualización de app

#### Métricas y Dashboards

- [ ] **Configurar Métricas de Performance**
  - [ ] Integrar Vercel Analytics o Google Analytics 4
  - [ ] Configurar Core Web Vitals tracking
  - [ ] Crear dashboard básico de métricas

- [ ] **Documentar KPIs**
  - [ ] Crear `docs/METRICS.md` con definición de KPIs
  - [ ] Establecer SLAs por métrica
  - [ ] Configurar alertas en Sentry/Vercel para métricas fuera de SLA

#### Seguridad

- [ ] **Rate Limiting Frontend**
  - [ ] Implementar rate limiting para acciones críticas (pagos, login)
  - [ ] Mostrar mensajes amigables cuando se alcanza el límite

- [ ] **Auditoría de Seguridad**
  - [ ] Revisar todas las rutas protegidas
  - [ ] Verificar validación de roles en frontend y backend
  - [ ] Revisar manejo de datos sensibles (tokens, PII)

### 🟢 Prioridad Baja (Sprint 5+)

#### Documentación

- [ ] **Crear Runbooks**
  - [ ] `docs/RUNBOOK_INCIDENT_RESPONSE.md`
  - [ ] `docs/RUNBOOK_DEPLOYMENT.md`
  - [ ] `docs/RUNBOOK_BACKUP_RESTORE.md`

- [ ] **Documentar Arquitectura**
  - [ ] Actualizar `docs/ARCHITECTURE.md` con diagramas de despliegue
  - [ ] Documentar flujo de datos frontend → backend
  - [ ] Crear diagrama de componentes y sus dependencias

#### Optimizaciones Avanzadas

- [ ] **Implementar CDN**
  - [ ] Configurar CDN para assets estáticos (Vercel ya lo hace)
  - [ ] Optimizar entrega de imágenes (Next.js Image + CDN)

- [ ] **Optimizar Base de Datos (Backend)**
  - [ ] Revisar índices en tablas frecuentes
  - [ ] Implementar query optimization
  - [ ] Configurar connection pooling

---

## 6. Riesgos y Consideraciones

### Riesgos Identificados

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| **Cold Starts de Render** | Alto | Alta | Upgrade a plan pagado o wake-up pings |
| **Pérdida de Datos** | Crítico | Baja | Backups automáticos configurados |
| **Token Comprometido** | Alto | Media | Rotación de tokens, monitoreo de accesos |
| **Deploy Roto** | Alto | Media | Tests antes de deploy, rollback rápido |
| **Sobre Costos** | Medio | Baja | Monitoreo de uso, alertas de costos |

### Consideraciones de Costo

**Estimación Mensual (Post-Mejoras):**

- **Vercel Pro**: $20/mes (mejor para Next.js)
- **Render Paid**: $25/mes (evitar cold starts)
- **Sentry Team**: $26/mes (hasta 50k eventos)
- **UptimeRobot**: Gratis (hasta 50 monitores)
- **Supabase Pro**: Ya configurado
- **Total Adicional**: ~$70/mes

**ROI Esperado:**
- Reducción de tiempo de debugging: -40%
- Reducción de incidentes no detectados: -60%
- Mejora en tiempo de recuperación: -50%

---

## 7. Próximos Pasos Inmediatos

1. **Esta Semana:**
   - [ ] Revisar y aprobar este plan con el equipo
   - [ ] Priorizar tareas según impacto de negocio
   - [ ] Asignar responsables por tarea

2. **Sprint Actual:**
   - [ ] Configurar Sentry (2-3 horas)
   - [ ] Crear `.env.example` (30 min)
   - [ ] Configurar GitHub Actions básico (4-5 horas)

3. **Próximo Sprint:**
   - [ ] Completar CI/CD pipeline
   - [ ] Implementar logger estructurado
   - [ ] Configurar health checks automatizados

---

## 8. Referencias y Recursos

### Documentación Interna
- [Arquitectura Frontend](./ARCHITECTURE.md)
- [Stack Tecnológico](./STACK_TECNOLOGICO_COMPLETO.md)
- [Roadmap Estratégico](./VIOTECH_ROADMAP_STRATEGICO_2025.md)

### Recursos Externos
- [Next.js Deployment Best Practices](https://nextjs.org/docs/deployment)
- [Sentry Next.js Setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Render Documentation](https://render.com/docs)

---

**Última actualización**: Enero 2025  
**Próxima revisión**: Marzo 2025

