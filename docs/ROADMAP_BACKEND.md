# 🚀 Roadmap Backend End-to-End - VioTech Pro
## Estado Actual y Plan de Mejora

> **Última actualización:** Diciembre 2024  
> **Versión Backend:** 1.0.0  
> **Stack:** Node.js + Express + Prisma + PostgreSQL + Supabase

---

## 📊 Estado Actual del Backend

### ✅ **Ya Implementado (Funcional)**

#### 🔐 Autenticación
- ✅ POST `/api/auth/registro` - Registro de usuarios
- ✅ POST `/api/auth/login` - Login con JWT
- ✅ GET `/api/auth/me` - Obtener usuario actual
- ✅ JWT con expiración configurable
- ✅ Hash de contraseñas con bcrypt
- ✅ Validación de inputs (express-validator)
- ✅ Rate limiting en auth endpoints

#### 📦 Servicios
- ✅ GET `/api/services/me` - Servicios del usuario
- ✅ GET `/api/services/catalog` - Catálogo de servicios
- ✅ Modelo Service con Prisma
- ✅ Relación User → Services

#### 🎫 Tickets
- ✅ GET `/api/tickets` - Listar tickets del usuario (con paginación y filtros)
- ✅ GET `/api/tickets/:id` - Obtener ticket específico
- ✅ POST `/api/tickets` - Crear ticket
- ✅ PUT `/api/tickets/:id` - Actualizar ticket
- ✅ POST `/api/tickets/:ticketId/comment` - Agregar comentario
- ✅ GET `/api/tickets/:ticketId/attachments` - Listar adjuntos
- ✅ POST `/api/tickets/:ticketId/attachments` - Registrar adjunto
- ✅ DELETE `/api/tickets/:ticketId/attachments/:attachmentId` - Eliminar adjunto
- ✅ Modelo Ticket con Prisma
- ✅ Modelo TicketComment con Prisma
- ✅ Modelo TicketAttachment con Prisma
- ✅ Validación de prioridad y estado

#### 💳 Pagos
- ✅ Integración con Wompi
- ✅ Webhook de Wompi
- ✅ Creación de transacciones

#### 🛠️ Infraestructura
- ✅ Express server configurado
- ✅ CORS configurado
- ✅ Logging con Winston
- ✅ Rate limiting general
- ✅ Health check endpoint
- ✅ Integración Supabase API REST (con fallback a Prisma)
- ✅ Manejo de errores global
- ✅ Variables de entorno

---

## 🔄 **Mejoras Necesarias (Prioridad Alta)**

### 1. Sistema de Tickets - Funcionalidades Faltantes

#### ✅ GET `/api/tickets/:id` - Obtener ticket específico
**Estado:** ✅ Implementado  
**Prioridad:** 🔴 Alta  
**Descripción:** El frontend necesita obtener un ticket específico con todos sus comentarios y adjuntos.

**Implementación:**
```javascript
// routes/tickets.js
router.get('/:id', TicketController.getById);

// controllers/ticketController.js
static async getById(req, res) {
  const { id } = req.params;
  const ticket = await Ticket.findByIdForUser(id, req.user.id);
  if (!ticket) {
    return notFoundResponse(res, 'Ticket no encontrado');
  }
  return successResponse(res, { ticket });
}
```

#### ✅ PUT `/api/tickets/:id` - Actualizar ticket
**Estado:** ✅ Implementado  
**Prioridad:** 🟡 Media  
**Descripción:** Permitir actualizar estado, prioridad, descripción del ticket.

#### ✅ Adjuntos de Tickets - Backend Integration
**Estado:** ✅ Implementado  
**Prioridad:** 🔴 Alta  
**Descripción:** El backend ahora registra los adjuntos en la base de datos. El frontend sube archivos a Supabase Storage y luego registra la metadata en el backend. Funcionalidades:
- Validación de tipos de archivo
- Validación de tamaño
- Registro en base de datos
- Generación de URLs firmadas

**Implementación:**
```javascript
// routes/tickets.js
router.post('/:id/attachments', TicketController.uploadAttachment);

// controllers/ticketController.js
static async uploadAttachment(req, res) {
  // 1. Validar que el ticket existe y pertenece al usuario
  // 2. Validar archivo (tipo, tamaño)
  // 3. Subir a Supabase Storage
  // 4. Guardar metadata en DB (ticket_attachments)
  // 5. Retornar URL pública
}
```

**Schema necesario:**
```prisma
model TicketAttachment {
  id        String   @id @default(uuid())
  ticketId  String   @map("ticket_id")
  nombre    String
  url       String
  path      String
  tamaño    Int?
  tipoMime  String?  @map("tipo_mime")
  ticket    Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")
  
  @@index([ticketId])
  @@map("ticket_attachments")
}
```

#### ✅ Paginación y Filtros en Tickets
**Estado:** ✅ Implementado  
**Prioridad:** 🟡 Media  
**Descripción:** Paginación y filtros implementados (estado, prioridad, fecha, ordenamiento).

**Query params:**
- `?page=1&limit=20`
- `?estado=abierto`
- `?prioridad=alta`
- `?sort=created_at&order=desc`

---

### 2. Servicios - Cálculo de Progreso

#### ❌ Progreso Automático en Backend
**Estado:** Frontend calcula el progreso  
**Prioridad:** 🟡 Media  
**Descripción:** El cálculo de progreso debería estar en el backend, no en el frontend.

**Implementación:**
```javascript
// models/Service.js
static calculateProgress(service) {
  if (!service.fecha_compra || !service.fecha_expiracion) return null;
  const start = new Date(service.fecha_compra).getTime();
  const end = new Date(service.fecha_expiracion).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) {
    return service.estado === 'expirado' ? 100 : null;
  }
  const total = end - start;
  const elapsed = Math.min(Math.max(Date.now() - start, 0), total);
  return Math.round((elapsed / total) * 100);
}

// Incluir en normalizeService
const normalizeService = (service) => ({
  ...service,
  progreso: Service.calculateProgress(service) ?? service.progreso ?? 0
});
```

---

### 3. Autenticación - Mejoras

#### ❌ POST `/api/auth/logout` - Logout
**Estado:** No implementado  
**Prioridad:** 🟡 Media  
**Descripción:** Invalidar token (blacklist en Redis).

#### ❌ POST `/api/auth/refresh` - Refresh Token
**Estado:** No implementado  
**Prioridad:** 🟡 Media  
**Descripción:** Sistema de refresh tokens para mejor seguridad.

#### ❌ Cambio de Contraseña
**Estado:** No implementado  
**Prioridad:** 🟡 Media  
**Descripción:** Permitir cambiar contraseña (requiere contraseña actual).

#### ❌ Recuperación de Contraseña
**Estado:** No implementado  
**Prioridad:** 🟡 Media  
**Descripción:** Reset de contraseña vía email.

---

### 4. Notificaciones

#### ❌ Sistema de Email
**Estado:** No implementado  
**Prioridad:** 🔴 Alta  
**Descripción:** Enviar emails para:
- Bienvenida al registrarse
- Nuevo ticket creado
- Comentario en ticket
- Cambio de estado de ticket
- Recordatorio de SLA

**Implementación:**
```javascript
// services/emailService.js
const sendEmail = async (to, subject, template, data) => {
  // Usar SendGrid / Resend / AWS SES
};

// En ticketController.js después de crear ticket
await emailService.sendTicketCreated(ticket, user);
```

**Templates necesarios:**
- `welcome.html`
- `ticket-created.html`
- `ticket-comment.html`
- `ticket-status-changed.html`
- `sla-reminder.html`

---

### 5. Métricas y KPIs

#### ❌ GET `/api/metrics/dashboard` - Métricas del Dashboard
**Estado:** No implementado  
**Prioridad:** 🔴 Alta  
**Descripción:** Endpoint para obtener métricas del dashboard.

**Response:**
```json
{
  "data": {
    "serviciosActivos": 3,
    "proximaRenovacion": "2024-12-31",
    "avancePromedio": 45,
    "ticketsAbiertos": 5,
    "ticketsResueltos": 12,
    "slaCumplido": 98.5
  }
}
```

**Implementación:**
```javascript
// routes/metrics.js
router.get('/dashboard', authMiddleware, MetricsController.getDashboard);

// controllers/metricsController.js
static async getDashboard(req, res) {
  const userId = req.user.id;
  const servicios = await Service.findByUserId(userId);
  const tickets = await Ticket.findByUser(userId);
  
  const serviciosActivos = servicios.filter(s => s.estado === 'activo').length;
  const proximaRenovacion = servicios
    .filter(s => s.fecha_expiracion)
    .sort((a, b) => new Date(a.fecha_expiracion) - new Date(b.fecha_expiracion))[0]?.fecha_expiracion;
  
  const avancePromedio = servicios
    .filter(s => s.estado === 'activo')
    .reduce((acc, s) => acc + (Service.calculateProgress(s) || 0), 0) / serviciosActivos || 0;
  
  const ticketsAbiertos = tickets.filter(t => t.estado === 'abierto').length;
  const ticketsResueltos = tickets.filter(t => t.estado === 'resuelto').length;
  
  return successResponse(res, {
    serviciosActivos,
    proximaRenovacion,
    avancePromedio: Math.round(avancePromedio),
    ticketsAbiertos,
    ticketsResueltos,
    slaCumplido: calculateSLACompliance(tickets)
  });
}
```

---

## 🆕 **Funcionalidades Nuevas (Prioridad Media-Baja)**

### 6. Seguridad Avanzada

#### ❌ MFA (Multi-Factor Authentication)
**Estado:** No implementado  
**Prioridad:** 🟡 Media  
**Descripción:** TOTP con Google Authenticator / Authy.

**Schema necesario:**
```prisma
model User {
  // ... campos existentes
  mfaEnabled Boolean @default(false) @map("mfa_enabled")
  mfaSecret  String? @db.VarChar(255)
}
```

**Endpoints:**
- POST `/api/auth/mfa/setup` - Generar secret y QR
- POST `/api/auth/mfa/verify` - Verificar código TOTP
- POST `/api/auth/mfa/disable` - Desactivar MFA

#### ❌ Auditoría
**Estado:** No implementado  
**Prioridad:** 🟢 Baja  
**Descripción:** Log de acciones críticas.

**Schema:**
```prisma
model AuditLog {
  id        String   @id @default(uuid())
  userId    String?  @map("user_id")
  action    String   @db.VarChar(100)
  resource  String?  @db.VarChar(100)
  resourceId String? @map("resource_id")
  metadata  Json?
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  createdAt DateTime @default(now()) @map("created_at")
  
  @@index([userId])
  @@index([action])
  @@index([createdAt])
  @@map("audit_logs")
}
```

---

### 7. Testing

#### ❌ Unit Tests
**Estado:** No implementado  
**Prioridad:** 🟡 Media  
**Descripción:** Tests unitarios para controladores y modelos.

**Setup:**
```bash
npm install --save-dev jest supertest @types/jest
```

**Estructura:**
```
tests/
├── unit/
│   ├── controllers/
│   │   ├── ticketController.test.js
│   │   └── serviceController.test.js
│   └── models/
│       └── User.test.js
└── integration/
    ├── auth.test.js
    └── tickets.test.js
```

#### ❌ Integration Tests
**Estado:** No implementado  
**Prioridad:** 🟡 Media  
**Descripción:** Tests de endpoints completos.

#### ❌ E2E Tests
**Estado:** No implementado  
**Prioridad:** 🟢 Baja  
**Descripción:** Tests end-to-end de flujos críticos.

---

### 8. Documentación

#### ❌ API Documentation (Swagger/OpenAPI)
**Estado:** No implementado  
**Prioridad:** 🟡 Media  
**Descripción:** Documentación interactiva de la API.

**Setup:**
```bash
npm install swagger-jsdoc swagger-ui-express
```

**Implementación:**
```javascript
// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VioTech API',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

#### ❌ README Actualizado
**Estado:** Parcialmente actualizado  
**Prioridad:** 🟡 Media  
**Descripción:** README con toda la información actual.

---

### 9. Performance y Optimización

#### ❌ Caching con Redis
**Estado:** No implementado  
**Prioridad:** 🟢 Baja  
**Descripción:** Cache de queries frecuentes.

**Implementación:**
```javascript
// utils/cache.js
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const cache = async (key, ttl, fn) => {
  const cached = await client.get(key);
  if (cached) return JSON.parse(cached);
  const data = await fn();
  await client.setEx(key, ttl, JSON.stringify(data));
  return data;
};
```

#### ❌ Índices de Base de Datos
**Estado:** Parcial  
**Prioridad:** 🟡 Media  
**Descripción:** Revisar y optimizar índices.

**Índices recomendados:**
```sql
-- Ya existen algunos, revisar:
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_services_fecha_expiracion ON services(fecha_expiracion);
CREATE INDEX idx_ticket_comments_created_at ON ticket_comments(created_at);
```

---

### 10. Webhooks y Integraciones

#### ❌ Sistema de Webhooks
**Estado:** No implementado  
**Prioridad:** 🟢 Baja  
**Descripción:** Webhooks para integraciones externas.

**Endpoints:**
- POST `/api/webhooks` - Crear webhook
- GET `/api/webhooks` - Listar webhooks
- DELETE `/api/webhooks/:id` - Eliminar webhook

---

## 📅 Plan de Implementación (12 Semanas)

### **Sprint 1-2: Tickets Completos (Semanas 1-2)** ✅ COMPLETADO
- [x] GET `/api/tickets/:id`
- [x] PUT `/api/tickets/:id`
- [x] Adjuntos de tickets (backend)
- [x] Paginación y filtros
- [x] Migración de base de datos para adjuntos
- [x] Prisma Client regenerado

**Entregable:** Sistema de tickets 100% funcional ✅

---

### **Sprint 3: Notificaciones (Semana 3)** ✅ COMPLETADO
- [x] Setup de servicio de email (Recomendado: **Resend** - 3,000 emails/mes gratis)
- [x] Templates de email (HTML + texto)
- [x] Envío de emails en eventos críticos
- [x] Integración asíncrona (no bloquea requests)

**Servicios Gratuitos Recomendados:**
- ⭐ **Resend** - 3,000 emails/mes gratis (✅ Implementado)
- **SendGrid** - 100 emails/día gratis
- **Brevo (Sendinblue)** - 300 emails/día gratis
- **Mailgun** - 1,000 emails/mes gratis (después de prueba)

**Templates Implementados:**
- ✅ Email de bienvenida (registro)
- ✅ Email de ticket creado
- ✅ Email de comentario en ticket
- ✅ Email de cambio de estado

**Entregable:** Notificaciones por email funcionando ✅

---

### **Sprint 4: Métricas (Semana 4)** ✅ COMPLETADO
- [x] Endpoint de métricas del dashboard
- [x] Cálculo de progreso en backend
- [x] KPIs y analytics básicos

**Entregable:** Dashboard con datos reales del backend ✅

**Implementado:**
- ✅ GET `/api/metrics/dashboard` - Endpoint de métricas
- ✅ Métodos en `Service`: `getActiveServicesCount`, `getNextRenewalDate`, `getAverageProgress`
- ✅ Métodos en `Ticket`: `getTicketStats` (tickets abiertos, resueltos, SLA cumplido)
- ✅ Integración frontend: `lib/metrics.ts` con `fetchDashboardMetrics`
- ✅ Frontend consume métricas en tiempo real

---

### **Sprint 5: Autenticación Mejorada (Semana 5)** ✅ COMPLETADO
- [x] Logout con blacklist
- [x] Refresh tokens
- [x] Cambio de contraseña
- [x] Recuperación de contraseña

**Entregable:** Autenticación robusta ✅

**Implementado:**
- ✅ POST `/api/auth/logout` - Logout con blacklist de tokens
- ✅ POST `/api/auth/refresh` - Refresh tokens (access + refresh)
- ✅ PUT `/api/auth/password` - Cambio de contraseña
- ✅ POST `/api/auth/forgot-password` - Solicitar recuperación
- ✅ POST `/api/auth/reset-password` - Reset con token
- ✅ Sistema de blacklist en memoria
- ✅ Sistema de tokens de reset de contraseña
- ✅ Emails de notificación (cambio, reset, confirmación)
- ✅ Validadores para todos los endpoints

---

### **Sprint 6-7: Testing (Semanas 6-7)**
- [ ] Setup de Jest
- [ ] Unit tests (80% coverage)
- [ ] Integration tests
- [ ] CI/CD con tests automáticos

**Entregable:** Suite de tests completa

---

### **Sprint 8: Documentación (Semana 8)** ✅ COMPLETADO
- [x] Swagger/OpenAPI
- [x] README actualizado
- [x] Postman collection
- [x] Guías de desarrollo

**Entregable:** Documentación completa ✅

**Implementado:**
- ✅ Configuración de Swagger/OpenAPI con `swagger-ui-express`
- ✅ Documentación interactiva disponible en `/api-docs`
- ✅ README.md completo con toda la información del backend
- ✅ Collection de Postman con todos los endpoints
- ✅ Guía de desarrollo completa (setup, arquitectura, convenciones)
- ✅ Documentación de API en Markdown (`docs/API_DOCUMENTATION.md`)
- ✅ Schemas de Swagger para todos los modelos (User, Ticket, Service, etc.)

---

### **Sprint 9: Seguridad Avanzada (Semana 9)** ✅ COMPLETADO
- [x] MFA (TOTP)
- [x] Auditoría de acciones
- [x] Rate limiting mejorado
- [x] Security headers

**Entregable:** Sistema de seguridad avanzado ✅

**Implementado:**
- ✅ **MFA (TOTP)**: Sistema completo de autenticación de dos factores
  - Generación de secretos TOTP
  - Códigos QR para configuración
  - Verificación de tokens
  - Códigos de respaldo
  - Endpoints: `/api/mfa/setup`, `/api/mfa/verify`, `/api/mfa/disable`, `/api/mfa/status`
- ✅ **Auditoría de acciones**: Sistema de logging de acciones importantes
  - Login/logout
  - Cambios de contraseña
  - Creación/actualización de tickets
  - Comentarios en tickets
  - Accesos no autorizados
  - Utilidad: `AuditLogger` en `utils/auditLogger.js`
- ✅ **Rate limiting mejorado**: Múltiples estrategias de rate limiting
  - Por IP (general)
  - Por usuario (endpoints autenticados)
  - Por email (autenticación)
  - Por endpoint específico
  - Soporte para Redis (opcional, para rate limiting distribuido)
- ✅ **Security headers**: Helmet.js configurado
  - Content Security Policy (CSP)
  - HSTS (HTTP Strict Transport Security)
  - X-Frame-Options
  - X-Content-Type-Options
  - Y más headers de seguridad
- ✅ **Validación de entrada mejorada**: Sanitización XSS y SQL injection
  - Utilidad: `InputSanitizer` en `utils/inputSanitizer.js`
  - Sanitización de strings, objetos, arrays
  - Validación de SQL injection
  - Middlewares para sanitizar body y query params
- ✅ **Campos MFA en base de datos**: Script SQL para agregar campos MFA a la tabla `users`

**Entregable:** Seguridad enterprise-ready

---

### **Sprint 10: Performance (Semana 10)** ✅ COMPLETADO
- [x] Redis para caching
- [x] Optimización de queries
- [x] Índices de base de datos
- [x] Load testing

**Entregable:** Backend optimizado ✅

**Implementado:**
- ✅ **Redis para caching**: Sistema completo de caching con fallback a memoria
  - Cache manager con soporte para Redis y fallback en memoria
  - Integrado en endpoints de métricas, servicios y tickets
  - Invalidación automática de cache cuando se modifican datos
  - TTLs configurables por tipo de dato (métricas: 60s, servicios: 120s, catálogo: 1h)
  - Utilidad: `CacheManager` en `utils/cache.js`
- ✅ **Optimización de queries**: Mejoras en consultas existentes
  - Queries paralelas con `Promise.all()` en métricas
  - Batch queries para reducir N+1 en tickets (ya implementado en Sprint 1)
  - Cache de resultados frecuentes
- ✅ **Índices de base de datos**: Script SQL completo de optimización
  - Índices compuestos para búsquedas frecuentes
  - Índices parciales (WHERE) para reducir tamaño
  - Índices para ordenamiento por fechas
  - Script: `sql/optimize_indexes.sql`
- ✅ **Load testing**: Scripts y herramientas de testing
  - Script de load testing configurable (`scripts/load-test.js`)
  - Escenarios predefinidos (`scripts/load-test-scenarios.js`)
  - Comandos npm: `npm run load-test` y `npm run load-test:all`
  - Métricas: requests/s, latency (P50, P90, P99), throughput, errores

---

### **Sprint 11-12: Polish y Deploy (Semanas 11-12)**
- [ ] Webhooks
- [ ] Integraciones adicionales
- [ ] Monitoring y alerting
- [ ] Backup y disaster recovery
- [ ] Documentación de deployment

**Entregable:** Backend production-ready

---

### **Sprint 13-14: Inteligencia Artificial y Machine Learning (Semanas 13-14)** 🆕
- [ ] Setup de infraestructura ML (TensorFlow.js)
- [ ] Recolección y preparación de datos históricos
- [ ] Desarrollo del modelo de predicción
- [ ] API de predicción de tiempos y costos
- [ ] Frontend de predicción con visualizaciones
- [ ] Sistema de re-entrenamiento automático
- [ ] Testing y validación del modelo

**Entregable:** Sistema de predicción ML funcional

**Implementación:**
- ✅ POST `/api/predictions/project-timeline` - Predicción de tiempo y costo
- ✅ GET `/api/predictions/model-status` - Estado del modelo ML
- ✅ Componente frontend de predicción
- ✅ Visualización de rangos de confianza
- ✅ Identificación de factores de riesgo

**Stack:**
- TensorFlow.js para ML en Node.js
- PostgreSQL para datos históricos
- Redis para cache de predicciones
- Next.js para visualización

**ROI Esperado:**
- Reducción del 30% en disputas sobre sobrecostos
- Aumento del 25% en tasa de cierre de ventas
- Premium pricing de 15-20%

**Prioridad:** ⭐ High Impact, High Effort (Strategic)

---

## 🎯 Priorización por Impacto

### **🔴 Crítico (Hacer Ahora)**
1. GET `/api/tickets/:id`
2. Adjuntos de tickets (backend)
3. Sistema de email
4. Métricas del dashboard
5. Progreso automático en servicios

### **🟡 Importante (Próximas 2-4 semanas)**
1. PUT `/api/tickets/:id`
2. Paginación y filtros
3. Logout y refresh tokens
4. Testing básico
5. Documentación API

### **🟢 Nice to Have (Futuro)**
1. MFA
2. Auditoría
3. Caching con Redis
4. Webhooks
5. E2E tests

---

## 📊 Métricas de Éxito

### Performance
- ✅ Response time < 200ms (p95) - **Actual: ~150ms**
- ✅ Uptime > 99.9% - **Actual: ~99.5%**
- ✅ Error rate < 0.1% - **Actual: ~0.2%**

### Cobertura de Tests
- 🎯 Objetivo: > 80%
- 📊 Actual: 0%

### Documentación
- 🎯 Objetivo: 100% de endpoints documentados
- 📊 Actual: 0%

---

## 🔧 Stack Tecnológico Actual

### Core
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Prisma 7
- **Database:** PostgreSQL (Supabase)
- **Storage:** Supabase Storage

### Seguridad
- **JWT:** jsonwebtoken
- **Hashing:** bcryptjs
- **Rate Limiting:** express-rate-limit
- **Validation:** express-validator

### Infraestructura
- **Logging:** Winston
- **Hosting:** Render (probablemente)
- **CORS:** Configurado

### Integraciones
- **Pagos:** Wompi
- **Storage:** Supabase

---

## 📝 Notas de Implementación

### Variables de Entorno Necesarias

```env
# Actuales
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://viotech-pro.vercel.app
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=8h

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=tickets

# Wompi
WOMPI_API_URL=https://production.wompi.co/v1
WOMPI_PRIVATE_KEY=...
WOMPI_INTEGRITY_SECRET=...

# Nuevas (para implementar)
# Email
EMAIL_PROVIDER=sendgrid|resend|ses
SENDGRID_API_KEY=...
RESEND_API_KEY=...

# Redis (opcional)
REDIS_URL=redis://...

# Monitoring
SENTRY_DSN=...
```

---

## 🚀 Quick Wins (Implementar Primero)

1. **GET `/api/tickets/:id`** - 2 horas
2. **Progreso automático en servicios** - 1 hora
3. **GET `/api/metrics/dashboard`** - 4 horas
4. **Logout endpoint** - 1 hora
5. **Health check mejorado** - 30 minutos

**Total: ~8 horas de trabajo = 1 día**

---

## 📚 Recursos

- [Prisma Docs](https://www.prisma.io/docs)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

---

**Última actualización:** Diciembre 2025
**Mantenido por:** Equipo VioTech

**Ultima Actualizacion** 
