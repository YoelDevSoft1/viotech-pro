# 🚀 GUÍA COMPLETA BACKEND - SISTEMA TOP TIER DE GESTIÓN DE TICKETS

## 📑 Índice
1. Arquitectura General
2. Stack Tecnológico Recomendado
3. Diseño de Base de Datos
4. Estructura de Carpetas
5. Endpoints API REST Completos
6. Sistemas de Autenticación
7. Reglas de Automatización
8. Implementación de SLA
9. Sistema de Notificaciones
10. Integraciones y Webhooks
11. Caching y Performance
12. Seguridad
13. Escalabilidad
14. Monitoreo y Logging

---

## 1. 🏗️ ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENTE FRONTEND                      │
│                   (React/Vue + Socket.io)                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    API GATEWAY / Load Balancer              │
│              (NGINX/Kong con SSL/TLS Certificate)          │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌──────▼───────┐  ┌─────▼──────────┐
│ MICROSERVICIO│  │ MICROSERVICIO│  │ MICROSERVICIO  │
│   TICKETS    │  │   USUARIOS   │  │  NOTIFICACIONES│
│ (Node.js)    │  │ (Node.js)    │  │   (Node.js)    │
└───────┬──────┘  └──────┬───────┘  └─────┬──────────┘
        │                 │                 │
┌───────▼─────────────────▼─────────────────▼───────┐
│           SHARED SERVICES                         │
│  ┌──────────────┐    ┌──────────────┐             │
│  │  Auth/JWT    │    │  IA/ML       │             │
│  │  Service     │    │  Service     │             │
│  └──────────────┘    └──────────────┘             │
└──────────────────────────┬──────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐   ┌──────▼────────┐   ┌────▼─────────┐
│  PostgreSQL  │   │    Redis      │   │ Elasticsearch│
│  (Primaria)  │   │   (Sessions)  │   │  (Full-text) │
└──────────────┘   └───────────────┘   └──────────────┘
        │
        └─────── Message Queue (RabbitMQ/Kafka) ───────┐
                                                        │
                            ┌───────────────────────────┘
                            │
        ┌───────────────────┼──────────────────┐
        │                   │                  │
┌───────▼──────┐   ┌───────▼────────┐  ┌─────▼─────────┐
│  Workers/    │   │  Email Service │  │  SMS/Webhook  │
│  Cron Jobs   │   │  (Sendgrid)    │  │  Service      │
└──────────────┘   └────────────────┘  └───────────────┘
```

**Flujo de una solicitud:**
1. Cliente hace request → API Gateway
2. API Gateway rutea a microservicio específico
3. Microservicio consulta Redis (cache)
4. Si no hay cache → consulta PostgreSQL
5. Respuesta se almacena en Redis (TTL)
6. Se emite evento a RabbitMQ si es necesario
7. Worker procesa evento (notificaciones, IA, etc)
8. Respuesta vuelve al cliente

---

## 2. 📦 STACK TECNOLÓGICO RECOMENDADO

### Backend
```yaml
# Runtime & Framework
Language: Node.js 20 LTS
Framework: Express.js / NestJS
Type checking: TypeScript

# Database
Primary: PostgreSQL 16
Cache: Redis 7
Search: Elasticsearch 8
File Storage: AWS S3 / MinIO

# Message Queue
Queue: RabbitMQ / Apache Kafka
Job Processing: Bull / Bee-Queue

# Authentication
JWT: jsonwebtoken
OAuth2: passport.js + Google/Microsoft strategies
Rate Limiting: express-rate-limit

# AI/ML
NLP: spaCy / Natural Language Processing
ML Framework: TensorFlow.js
Categorization: scikit-learn (Python sidecar)

# Monitoring & Logging
Logging: Winston / Bunyan
Monitoring: Prometheus + Grafana
Error Tracking: Sentry
APM: New Relic / DataDog

# Testing
Unit: Jest
Integration: Supertest
E2E: Cypress / Playwright
Load: Artillery / K6

# Deployment
Containerization: Docker
Orchestration: Kubernetes (K8s)
CI/CD: GitHub Actions / GitLab CI
```

---

## 3. 🗄️ DISEÑO DE BASE DE DATOS

### Diagrama ER Completo

```
USUARIOS (users)
├─ id (PK, UUID)
├─ email (UNIQUE)
├─ nombre
├─ rol (ENUM: admin, agent, user, vip_user)
├─ departamento_id (FK)
├─ habilidades (ARRAY de strings)
├─ estado (active, inactive, on_leave)
├─ disponibilidad (online, away, offline)
├─ carga_actual (int, tickets asignados)
├─ created_at
└─ updated_at

DEPARTAMENTOS (departments)
├─ id (PK, UUID)
├─ nombre
├─ descripcion
├─ sla_default (horas)
└─ email_notificacion

TICKETS (tickets)
├─ id (PK, UUID)
├─ numero_ticket (UNIQUE, auto-increment)
├─ usuario_id (FK) [quien reporta]
├─ agente_asignado_id (FK) [quién resuelve]
├─ departamento_id (FK)
├─ categoria (ENUM)
├─ subcategoria (ENUM)
├─ titulo
├─ descripcion
├─ prioridad (P1, P2, P3, P4)
├─ urgencia (Crítica, Alta, Normal, Baja)
├─ impacto (Crítico, Alto, Medio, Bajo)
├─ estado (NUEVO, EN_PROGRESO, EN_ESPERA, RESUELTO, CERRADO, REABIERTO)
├─ sla_tiempo_respuesta (minutos)
├─ sla_tiempo_resolucion (horas)
├─ tiempo_creacion
├─ tiempo_respuesta (cuando agente responde)
├─ tiempo_resolucion (cuando se marca como resuelto)
├─ tiempo_cierre (cuando se cierra)
├─ fuente (portal_web, email, api, chat, whatsapp)
├─ tags (ARRAY)
├─ duplicado_de (FK, nullable)
├─ solucion_aplicada (texto)
├─ satisfaccion_nps (1-10, nullable)
├─ retroalimentacion (texto)
├─ cerrado_por_inactividad (boolean)
└─ metadata (JSONB) [campos personalizados]

COMENTARIOS_TICKET (ticket_comments)
├─ id (PK, UUID)
├─ ticket_id (FK)
├─ usuario_id (FK)
├─ contenido
├─ es_privado (boolean)
├─ menciona_usuarios (ARRAY)
├─ adjuntos (ARRAY de URLs)
├─ sentiment_score (float, -1 a 1) [IA]
├─ created_at
└─ updated_at

ADJUNTOS (attachments)
├─ id (PK, UUID)
├─ ticket_id (FK)
├─ comentario_id (FK, nullable)
├─ nombre_archivo
├─ url_s3
├─ tipo_mime
├─ tamaño (bytes)
├─ uploaded_by (FK)
└─ created_at

BASE_CONOCIMIENTOS (knowledge_base_articles)
├─ id (PK, UUID)
├─ titulo
├─ contenido (markdown)
├─ categoria_id (FK)
├─ etiquetas (ARRAY)
├─ relevancia (float) [score para búsqueda]
├─ vistas (int)
├─ votos_utiles (int)
├─ votos_no_utiles (int)
├─ autor_id (FK)
├─ estado (draft, published, archived)
└─ updated_at

REGLAS_AUTOMATIZACION (automation_rules)
├─ id (PK, UUID)
├─ nombre
├─ descripcion
├─ condiciones (JSONB)
├─ acciones (JSONB)
├─ habilitada (boolean)
├─ orden_ejecucion (int)
├─ creada_por (FK)
└─ updated_at

PLANTILLAS_RESPUESTA (response_templates)
├─ id (PK, UUID)
├─ nombre
├─ categoria
├─ contenido
├─ variables_disponibles (ARRAY)
├─ creada_por (FK)
└─ updated_at

NOTIFICACIONES (notifications)
├─ id (PK, UUID)
├─ usuario_id (FK)
├─ ticket_id (FK, nullable)
├─ tipo (email, sms, push, in_app)
├─ asunto
├─ contenido
├─ enviado_en
├─ leido_en (nullable)
├─ estado (pending, sent, failed)
└─ error_mensaje (nullable)

HISTORIAL_SLA (sla_history)
├─ id (PK, UUID)
├─ ticket_id (FK)
├─ evento (respuesta, resolucion, cierre)
├─ tiempo_permitido (minutos)
├─ tiempo_actual (minutos)
├─ estado_cumplimiento (cumplido, incumplido, en_riesgo)
└─ timestamp

AUDITORIA (audit_logs)
├─ id (PK, UUID)
├─ usuario_id (FK)
├─ accion (CREATE, UPDATE, DELETE)
├─ entidad (tickets, users, etc)
├─ entidad_id (UUID)
├─ cambios_antes (JSONB)
├─ cambios_despues (JSONB)
└─ timestamp
```

### Scripts SQL (PostgreSQL)

```sql
-- Crear extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsqueda full-text

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'user', 'vip_user');
CREATE TYPE ticket_status AS ENUM ('NUEVO', 'EN_PROGRESO', 'EN_ESPERA', 'RESUELTO', 'CERRADO', 'REABIERTO');
CREATE TYPE ticket_priority AS ENUM ('P1', 'P2', 'P3', 'P4');
CREATE TYPE ticket_urgency AS ENUM ('Crítica', 'Alta', 'Normal', 'Baja');
CREATE TYPE ticket_impact AS ENUM ('Crítico', 'Alto', 'Medio', 'Bajo');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'on_leave');
CREATE TYPE notification_type AS ENUM ('email', 'sms', 'push', 'in_app');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');

-- Tabla Usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol user_role DEFAULT 'user',
    departamento_id UUID,
    habilidades TEXT[] DEFAULT '{}',
    estado user_status DEFAULT 'active',
    disponibilidad VARCHAR(50) DEFAULT 'offline',
    carga_actual INT DEFAULT 0,
    ultimo_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL
);

-- Tabla Departamentos
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    sla_default INT DEFAULT 240, -- en minutos (4 horas)
    email_notificacion VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Tickets
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_ticket SERIAL UNIQUE NOT NULL,
    usuario_id UUID NOT NULL REFERENCES users(id),
    agente_asignado_id UUID REFERENCES users(id),
    departamento_id UUID NOT NULL REFERENCES departments(id),
    categoria VARCHAR(100) NOT NULL,
    subcategoria VARCHAR(100),
    titulo VARCHAR(500) NOT NULL,
    descripcion TEXT NOT NULL,
    prioridad ticket_priority DEFAULT 'P3',
    urgencia ticket_urgency DEFAULT 'Normal',
    impacto ticket_impact DEFAULT 'Medio',
    estado ticket_status DEFAULT 'NUEVO',
    sla_tiempo_respuesta INT, -- en minutos
    sla_tiempo_resolucion INT, -- en horas
    tiempo_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tiempo_respuesta TIMESTAMPTZ NULL,
    tiempo_resolucion TIMESTAMPTZ NULL,
    tiempo_cierre TIMESTAMPTZ NULL,
    fuente VARCHAR(50) DEFAULT 'portal_web',
    tags TEXT[] DEFAULT '{}',
    duplicado_de UUID REFERENCES tickets(id),
    solucion_aplicada TEXT,
    satisfaccion_nps INT,
    retroalimentacion TEXT,
    cerrado_por_inactividad BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL
);

-- Tabla Comentarios
CREATE TABLE ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES users(id),
    contenido TEXT NOT NULL,
    es_privado BOOLEAN DEFAULT FALSE,
    menciona_usuarios TEXT[] DEFAULT '{}',
    adjuntos TEXT[] DEFAULT '{}',
    sentiment_score FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Adjuntos
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    comentario_id UUID REFERENCES ticket_comments(id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    url_s3 VARCHAR(500) NOT NULL,
    tipo_mime VARCHAR(100),
    tamaño INT,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Base de Conocimientos
CREATE TABLE knowledge_base_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(500) NOT NULL,
    contenido TEXT NOT NULL,
    categoria VARCHAR(100),
    etiquetas TEXT[] DEFAULT '{}',
    relevancia FLOAT DEFAULT 0,
    vistas INT DEFAULT 0,
    votos_utiles INT DEFAULT 0,
    votos_no_utiles INT DEFAULT 0,
    autor_id UUID NOT NULL REFERENCES users(id),
    estado VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Reglas de Automatización
CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    condiciones JSONB NOT NULL,
    acciones JSONB NOT NULL,
    habilitada BOOLEAN DEFAULT TRUE,
    orden_ejecucion INT DEFAULT 0,
    creada_por UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Plantillas de Respuesta
CREATE TABLE response_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    contenido TEXT NOT NULL,
    variables_disponibles TEXT[] DEFAULT '{}',
    creada_por UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Notificaciones
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    tipo notification_type,
    asunto VARCHAR(500),
    contenido TEXT,
    enviado_en TIMESTAMPTZ,
    leido_en TIMESTAMPTZ NULL,
    estado notification_status DEFAULT 'pending',
    error_mensaje TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Historial SLA
CREATE TABLE sla_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    evento VARCHAR(50),
    tiempo_permitido INT,
    tiempo_actual INT,
    estado_cumplimiento VARCHAR(50),
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Auditoría
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES users(id),
    accion VARCHAR(50),
    entidad VARCHAR(100),
    entidad_id UUID,
    cambios_antes JSONB,
    cambios_despues JSONB,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES
CREATE INDEX idx_tickets_usuario ON tickets(usuario_id);
CREATE INDEX idx_tickets_agente ON tickets(agente_asignado_id);
CREATE INDEX idx_tickets_estado ON tickets(estado);
CREATE INDEX idx_tickets_prioridad ON tickets(prioridad);
CREATE INDEX idx_tickets_departamento ON tickets(departamento_id);
CREATE INDEX idx_tickets_numero ON tickets(numero_ticket);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rol ON users(rol);
CREATE INDEX idx_users_departamento ON users(departamento_id);

CREATE INDEX idx_comments_ticket ON ticket_comments(ticket_id);
CREATE INDEX idx_comments_usuario ON ticket_comments(usuario_id);

CREATE INDEX idx_kb_titulo ON knowledge_base_articles USING GIN(to_tsvector('spanish', titulo));
CREATE INDEX idx_kb_contenido ON knowledge_base_articles USING GIN(to_tsvector('spanish', contenido));

CREATE INDEX idx_notifications_usuario ON notifications(usuario_id);
CREATE INDEX idx_notifications_ticket ON notifications(ticket_id);

-- VISTAS
CREATE VIEW view_tickets_sla_vencidos AS
SELECT 
    t.id,
    t.numero_ticket,
    t.titulo,
    t.agente_asignado_id,
    t.prioridad,
    t.tiempo_creacion,
    CURRENT_TIMESTAMP - t.tiempo_creacion as tiempo_transcurrido,
    t.sla_tiempo_resolucion,
    (t.sla_tiempo_resolucion * INTERVAL '1 hour') - (CURRENT_TIMESTAMP - t.tiempo_creacion) as tiempo_restante
FROM tickets
WHERE t.estado != 'CERRADO'
    AND (CURRENT_TIMESTAMP - t.tiempo_creacion) > (t.sla_tiempo_resolucion * INTERVAL '1 hour');

CREATE VIEW view_agentes_carga AS
SELECT 
    u.id,
    u.nombre,
    COUNT(t.id) as tickets_asignados,
    AVG(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - t.tiempo_creacion))/3600) as tiempo_promedio_horas
FROM users u
LEFT JOIN tickets t ON u.id = t.agente_asignado_id AND t.estado != 'CERRADO'
WHERE u.rol = 'agent'
GROUP BY u.id;
```

---

## 4. 📁 ESTRUCTURA DE CARPETAS

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts       # Configuración PostgreSQL
│   │   ├── redis.ts          # Configuración Redis
│   │   ├── elasticsearch.ts  # Configuración Elasticsearch
│   │   ├── queue.ts          # Configuración RabbitMQ/Kafka
│   │   └── constants.ts      # Constantes globales
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.middleware.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── auth.routes.ts
│   │   │
│   │   ├── tickets/
│   │   │   ├── tickets.controller.ts
│   │   │   ├── tickets.service.ts
│   │   │   ├── tickets.repository.ts
│   │   │   ├── tickets.validation.ts
│   │   │   ├── tickets.routes.ts
│   │   │   └── ticket-comments.controller.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   └── users.routes.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── sms.service.ts
│   │   │   ├── push.service.ts
│   │   │   └── notification.queue.ts
│   │   │
│   │   ├── automation/
│   │   │   ├── automation.service.ts
│   │   │   ├── automation.rules.ts
│   │   │   ├── automation.worker.ts
│   │   │   └── automation.repository.ts
│   │   │
│   │   ├── sla/
│   │   │   ├── sla.service.ts
│   │   │   ├── sla.calculator.ts
│   │   │   └── sla.alerts.ts
│   │   │
│   │   ├── ai/
│   │   │   ├── categorization.service.ts
│   │   │   ├── sentiment-analysis.service.ts
│   │   │   ├── duplicate-detection.service.ts
│   │   │   └── ai.queue.ts
│   │   │
│   │   ├── knowledge-base/
│   │   │   ├── kb.controller.ts
│   │   │   ├── kb.service.ts
│   │   │   └── kb.search.service.ts
│   │   │
│   │   └── reports/
│   │       ├── reports.controller.ts
│   │       ├── reports.service.ts
│   │       └── analytics.service.ts
│   │
│   ├── shared/
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error-handler.ts
│   │   │   ├── request-logger.ts
│   │   │   └── rate-limiter.ts
│   │   │
│   │   ├── guards/
│   │   │   ├── jwt.guard.ts
│   │   │   ├── role.guard.ts
│   │   │   └── permission.guard.ts
│   │   │
│   │   ├── decorators/
│   │   │   ├── auth.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   │
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   │
│   │   ├── exceptions/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── custom-exceptions.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── validators.ts
│   │   │   ├── formatters.ts
│   │   │   ├── logger.ts
│   │   │   └── helpers.ts
│   │   │
│   │   ├── types/
│   │   │   ├── ticket.types.ts
│   │   │   ├── user.types.ts
│   │   │   └── common.types.ts
│   │   │
│   │   └── services/
│   │       ├── cache.service.ts
│   │       ├── email.service.ts
│   │       ├── s3.service.ts
│   │       └── webhook.service.ts
│   │
│   ├── migrations/
│   │   ├── 001_create_users_table.ts
│   │   ├── 002_create_tickets_table.ts
│   │   └── ...
│   │
│   ├── seeds/
│   │   ├── seed-users.ts
│   │   ├── seed-departments.ts
│   │   └── seed-automation-rules.ts
│   │
│   ├── app.ts              # Express app setup
│   ├── server.ts           # Server entry point
│   └── main.ts             # Main entry point
│
├── tests/
│   ├── unit/
│   │   ├── tickets.service.test.ts
│   │   ├── auth.service.test.ts
│   │   └── ...
│   ├── integration/
│   │   ├── tickets.api.test.ts
│   │   └── ...
│   └── e2e/
│       └── tickets.e2e.test.ts
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── docs/
│   ├── API.md              # API Documentation
│   ├── ARCHITECTURE.md     # Architecture docs
│   └── DATABASE.md         # Database schema docs
│
├── .env.example
├── .env.development
├── .env.production
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

---

## 5. 🔌 ENDPOINTS API REST COMPLETOS

### 5.1 AUTENTICACIÓN

```
POST   /api/v1/auth/register              [Public]
POST   /api/v1/auth/login                 [Public]
POST   /api/v1/auth/refresh-token         [Auth]
POST   /api/v1/auth/logout                [Auth]
POST   /api/v1/auth/forgot-password       [Public]
POST   /api/v1/auth/reset-password        [Public]
GET    /api/v1/auth/verify-email/:token   [Public]
GET    /api/v1/auth/me                    [Auth]
PUT    /api/v1/auth/update-profile        [Auth]
PUT    /api/v1/auth/change-password       [Auth]
```

### 5.2 TICKETS

```
POST   /api/v1/tickets                    [Auth] - Crear ticket
GET    /api/v1/tickets                    [Auth] - Listar todos (paginated)
GET    /api/v1/tickets/:id                [Auth] - Obtener ticket específico
PUT    /api/v1/tickets/:id                [Auth] - Actualizar ticket
DELETE /api/v1/tickets/:id                [Admin] - Eliminar ticket
PATCH  /api/v1/tickets/:id/status         [Auth] - Cambiar estado
PATCH  /api/v1/tickets/:id/assign         [Agent] - Asignar agente
PATCH  /api/v1/tickets/:id/priority       [Auth] - Cambiar prioridad
PATCH  /api/v1/tickets/:id/close          [Auth] - Cerrar ticket
POST   /api/v1/tickets/:id/comment        [Auth] - Agregar comentario
GET    /api/v1/tickets/:id/comments       [Auth] - Listar comentarios
POST   /api/v1/tickets/:id/attachment     [Auth] - Cargar adjunto
GET    /api/v1/tickets/search             [Auth] - Búsqueda full-text
GET    /api/v1/tickets/suggest-kb/:id     [Auth] - Sugerir KB articles
POST   /api/v1/tickets/:id/rate           [Auth] - Calificar ticket (NPS)
POST   /api/v1/tickets/bulk-assign        [Agent] - Asignar múltiples
POST   /api/v1/tickets/bulk-status        [Admin] - Cambiar estado múltiples
GET    /api/v1/tickets/stats              [Auth] - Estadísticas personales
```

### 5.3 USUARIOS

```
GET    /api/v1/users                      [Admin] - Listar usuarios
GET    /api/v1/users/:id                  [Auth] - Obtener usuario
POST   /api/v1/users                      [Admin] - Crear usuario
PUT    /api/v1/users/:id                  [Admin] - Actualizar usuario
DELETE /api/v1/users/:id                  [Admin] - Eliminar usuario
PATCH  /api/v1/users/:id/role             [Admin] - Cambiar rol
PATCH  /api/v1/users/:id/availability     [Auth] - Cambiar disponibilidad
GET    /api/v1/users/agents/available     [Auth] - Listar agentes disponibles
GET    /api/v1/users/:id/workload         [Admin] - Ver carga de trabajo
POST   /api/v1/users/bulk-assign-skills   [Admin] - Asignar habilidades múltiples
```

### 5.4 DEPARTAMENTOS

```
GET    /api/v1/departments                [Auth] - Listar departamentos
GET    /api/v1/departments/:id            [Auth] - Obtener departamento
POST   /api/v1/departments                [Admin] - Crear departamento
PUT    /api/v1/departments/:id            [Admin] - Actualizar
DELETE /api/v1/departments/:id            [Admin] - Eliminar
GET    /api/v1/departments/:id/stats      [Admin] - Estadísticas
```

### 5.5 BASE DE CONOCIMIENTOS

```
GET    /api/v1/kb                         [Public] - Listar artículos
GET    /api/v1/kb/:id                     [Public] - Obtener artículo
POST   /api/v1/kb                         [Agent] - Crear artículo
PUT    /api/v1/kb/:id                     [Agent] - Actualizar artículo
DELETE /api/v1/kb/:id                     [Admin] - Eliminar artículo
GET    /api/v1/kb/search                  [Public] - Búsqueda KB
POST   /api/v1/kb/:id/vote                [Public] - Votar utilidad
GET    /api/v1/kb/categories              [Public] - Listar categorías
```

### 5.6 AUTOMATIZACIÓN

```
GET    /api/v1/automation/rules           [Admin] - Listar reglas
GET    /api/v1/automation/rules/:id       [Admin] - Obtener regla
POST   /api/v1/automation/rules           [Admin] - Crear regla
PUT    /api/v1/automation/rules/:id       [Admin] - Actualizar regla
DELETE /api/v1/automation/rules/:id       [Admin] - Eliminar regla
PATCH  /api/v1/automation/rules/:id/toggle [Admin] - Habilitar/Deshabilitar
POST   /api/v1/automation/test            [Admin] - Probar regla
GET    /api/v1/automation/templates       [Auth] - Listar plantillas respuesta
POST   /api/v1/automation/templates       [Agent] - Crear plantilla
```

### 5.7 SLA Y ALERTAS

```
GET    /api/v1/sla/breaches               [Admin] - SLAs incumplidos
GET    /api/v1/sla/breaches/:ticket_id    [Auth] - SLA ticket específico
GET    /api/v1/sla/stats                  [Admin] - Estadísticas SLA
POST   /api/v1/sla/policies               [Admin] - Crear política SLA
GET    /api/v1/sla/policies               [Admin] - Listar políticas
```

### 5.8 REPORTES Y ANALYTICS

```
GET    /api/v1/reports/dashboard          [Auth] - Dashboard principal
GET    /api/v1/reports/agents             [Admin] - Reporte agentes
GET    /api/v1/reports/tickets            [Admin] - Reporte tickets
GET    /api/v1/reports/satisfaction       [Admin] - CSAT/NPS reports
GET    /api/v1/reports/performance        [Admin] - KPIs performance
GET    /api/v1/reports/export/:format     [Admin] - Exportar (PDF/CSV/Excel)
POST   /api/v1/reports/schedule           [Admin] - Programar reporte
```

### 5.9 INTEGRACIONES Y WEBHOOKS

```
POST   /api/v1/webhooks/email-incoming    [System] - Procesar email entrante
POST   /api/v1/webhooks/sms-reply         [System] - Procesar SMS reply
POST   /api/v1/webhooks/:provider/callback [System] - OAuth callback
GET    /api/v1/integrations               [Admin] - Listar integraciones
POST   /api/v1/integrations/:provider     [Admin] - Conectar integración
DELETE /api/v1/integrations/:provider     [Admin] - Desconectar
```

### 5.10 NOTIFICACIONES (WebSocket)

```
WS    /api/v1/notifications/ws            [Auth] - WebSocket notificaciones
GET    /api/v1/notifications              [Auth] - Historial notificaciones
PATCH  /api/v1/notifications/:id/read     [Auth] - Marcar como leído
DELETE /api/v1/notifications/:id          [Auth] - Eliminar notificación
```

---

## 6. 🔐 SISTEMAS DE AUTENTICACIÓN

### JWT + Refresh Token Strategy

```typescript
// src/modules/auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      rol: payload.rol,
    };
  }
}

// src/modules/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async register(email: string, password: string, nombre: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email,
      password_hash: hashedPassword,
      nombre,
      rol: 'user',
    });
    return this.generateTokens(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user);
  }

  generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.REFRESH_TOKEN_SECRET,
    });

    return { accessToken, refreshToken, user };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
      const user = await this.usersService.findById(payload.sub);
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
```

---

## 7. 🤖 REGLAS DE AUTOMATIZACIÓN

```typescript
// src/modules/automation/automation.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomationRule } from './automation.entity';
import { Ticket } from '../tickets/ticket.entity';

@Injectable()
export class AutomationService {
  constructor(
    @InjectRepository(AutomationRule)
    private automationRepo: Repository<AutomationRule>,
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
  ) {}

  async executeRules(ticket: Ticket) {
    const rules = await this.automationRepo.find({ where: { habilitada: true } });

    for (const rule of rules.sort((a, b) => a.orden_ejecucion - b.orden_ejecucion)) {
      if (this.evaluateConditions(rule.condiciones, ticket)) {
        await this.executeActions(rule.acciones, ticket);
      }
    }
  }

  private evaluateConditions(condiciones: any, ticket: Ticket): boolean {
    const { field, operator, value } = condiciones;

    switch (operator) {
      case 'equals':
        return ticket[field] === value;
      case 'contains':
        return String(ticket[field]).includes(value);
      case 'greater_than':
        return ticket[field] > value;
      case 'less_than':
        return ticket[field] < value;
      case 'in_array':
        return value.includes(ticket[field]);
      default:
        return false;
    }
  }

  private async executeActions(acciones: any, ticket: Ticket) {
    for (const action of acciones) {
      switch (action.type) {
        case 'assign_priority':
          ticket.prioridad = action.priority;
          break;

        case 'assign_agent':
          ticket.agente_asignado_id = action.agent_id;
          ticket.estado = 'EN_PROGRESO';
          break;

        case 'send_notification':
          await this.sendNotification(ticket, action.message);
          break;

        case 'add_tag':
          ticket.tags = [...(ticket.tags || []), action.tag];
          break;

        case 'create_incident':
          await this.createIncident(ticket);
          break;

        case 'auto_resolve':
          ticket.estado = 'RESUELTO';
          ticket.solucion_aplicada = action.solution;
          break;

        case 'escalate':
          await this.escalateTicket(ticket, action.level);
          break;

        case 'close_automatically':
          ticket.estado = 'CERRADO';
          ticket.cerrado_por_inactividad = true;
          break;
      }
    }

    await this.ticketRepo.save(ticket);
  }

  private async sendNotification(ticket: Ticket, message: string) {
    // Lógica de notificaciones
  }

  private async createIncident(ticket: Ticket) {
    // Crear incident en sistema externo (Pagerduty, etc)
  }

  private async escalateTicket(ticket: Ticket, level: number) {
    // Escalar a nivel superior
  }
}

// Ejemplos de reglas predefinidas:

const PREDEFINED_RULES = [
  {
    nombre: 'P1 inmediato → Notificar manager',
    condiciones: { field: 'prioridad', operator: 'equals', value: 'P1' },
    acciones: [
      { type: 'send_notification', target: 'manager', message: '🔴 Ticket crítico recibido' },
      { type: 'create_incident' },
    ],
  },
  {
    nombre: 'Patrón: "contraseña" → Auto-categorizar',
    condiciones: { field: 'descripcion', operator: 'contains', value: 'contraseña' },
    acciones: [
      { type: 'assign_priority', priority: 'P3' },
      { type: 'add_tag', tag: 'password_reset' },
    ],
  },
  {
    nombre: 'Usuario VIP → Prioridad +1',
    condiciones: { field: 'usuario_vip', operator: 'equals', value: true },
    acciones: [
      { type: 'assign_priority', priority: 'P1' },
      { type: 'assign_agent', agent_id: 'SENIOR_AGENT_ID' },
    ],
  },
  {
    nombre: 'SLA próximo a vencer → Alerta',
    condiciones: { field: 'sla_minutos_restantes', operator: 'less_than', value: 30 },
    acciones: [
      { type: 'send_notification', target: 'agent', message: '⚠️ SLA vence en 30 min' },
    ],
  },
  {
    nombre: 'Ticket sin respuesta 24h → Cerrar',
    condiciones: { field: 'horas_sin_actividad', operator: 'greater_than', value: 24 },
    acciones: [
      { type: 'close_automatically' },
      { type: 'send_notification', message: 'Cerrado por inactividad' },
    ],
  },
];
```

---

## 8. 📊 IMPLEMENTACIÓN DE SLA

```typescript
// src/modules/sla/sla.calculator.ts

import { Injectable } from '@nestjs/common';
import { Ticket } from '../tickets/ticket.entity';
import moment from 'moment-timezone';

@Injectable()
export class SLACalculator {
  calculateSLA(ticket: Ticket) {
    const createdAt = moment(ticket.tiempo_creacion);
    const now = moment();

    // Calcular tiempo de respuesta
    if (!ticket.tiempo_respuesta) {
      const responseTimeTarget = ticket.sla_tiempo_respuesta; // minutos
      const responseDeadline = createdAt.clone().add(responseTimeTarget, 'minutes');
      const responseRemaining = responseDeadline.diff(now, 'minutes');

      ticket.sla_estado_respuesta = responseRemaining < 0 ? 'INCUMPLIDO' : 'EN_RIESGO';
      ticket.sla_minutos_restantes_respuesta = Math.max(0, responseRemaining);
    }

    // Calcular tiempo de resolución
    if (ticket.estado !== 'CERRADO') {
      const resolutionTimeTarget = ticket.sla_tiempo_resolucion * 60; // convertir a minutos
      const resolutionDeadline = createdAt.clone().add(resolutionTimeTarget, 'minutes');
      const resolutionRemaining = resolutionDeadline.diff(now, 'minutes');

      ticket.sla_estado_resolucion = resolutionRemaining < 0 ? 'INCUMPLIDO' : 'EN_RIESGO';
      ticket.sla_minutos_restantes_resolucion = Math.max(0, resolutionRemaining);
    }

    return {
      respuesta: {
        estado: ticket.sla_estado_respuesta,
        minutos_restantes: ticket.sla_minutos_restantes_respuesta,
      },
      resolucion: {
        estado: ticket.sla_estado_resolucion,
        minutos_restantes: ticket.sla_minutos_restantes_resolucion,
      },
    };
  }

  getSLAStatus(ticket: Ticket): 'OK' | 'EN_RIESGO' | 'INCUMPLIDO' {
    const slaRes = ticket.sla_estado_resolucion;
    const slaResp = ticket.sla_estado_respuesta;

    if (slaRes === 'INCUMPLIDO' || slaResp === 'INCUMPLIDO') return 'INCUMPLIDO';
    if (slaRes === 'EN_RIESGO' || slaResp === 'EN_RIESGO') return 'EN_RIESGO';
    return 'OK';
  }

  calculateSLACompliance(tickets: Ticket[]): number {
    const compliant = tickets.filter(
      t => this.getSLAStatus(t) === 'OK' || (t.estado === 'CERRADO' && t.sla_estado_resolucion === 'OK')
    ).length;

    return (compliant / tickets.length) * 100;
  }
}
```

---

## 9. 🔔 SISTEMA DE NOTIFICACIONES

```typescript
// src/modules/notifications/notifications.service.ts

import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { PushService } from './push.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    private emailService: EmailService,
    private smsService: SmsService,
    private pushService: PushService,
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async notifyTicketCreated(ticket: any, user: any) {
    const mensaje = `Ticket #${ticket.numero_ticket} creado: ${ticket.titulo}`;

    await this.sendMultiChannel(user, {
      asunto: 'Nuevo Ticket',
      contenido: mensaje,
      tipo_canales: ['in_app', 'email'],
      datos: { ticket_id: ticket.id },
    });
  }

  async notifyTicketAssigned(ticket: any, agent: any) {
    const mensaje = `Te han asignado el ticket #${ticket.numero_ticket}`;

    await this.sendMultiChannel(agent, {
      asunto: 'Ticket Asignado',
      contenido: mensaje,
      tipo_canales: ['in_app', 'email', 'push'],
      prioridad: ticket.prioridad,
      datos: { ticket_id: ticket.id },
    });
  }

  async notifySLAWarning(ticket: any, agent: any) {
    const minRestantes = ticket.sla_minutos_restantes_resolucion;
    const mensaje = `⚠️ SLA del ticket #${ticket.numero_ticket} vence en ${minRestantes} minutos`;

    await this.sendMultiChannel(agent, {
      asunto: 'Alerta SLA',
      contenido: mensaje,
      tipo_canales: ['in_app', 'push', 'email'],
      urgente: true,
      datos: { ticket_id: ticket.id },
    });
  }

  async sendMultiChannel(user: any, config: any) {
    const canales = config.tipo_canales || ['in_app', 'email'];
    const tasks = [];

    for (const canal of canales) {
      switch (canal) {
        case 'email':
          tasks.push(
            this.emailService.send({
              destinatario: user.email,
              asunto: config.asunto,
              contenido: config.contenido,
              template: 'ticket-notification',
            })
          );
          break;

        case 'sms':
          tasks.push(
            this.smsService.send({
              numero: user.telefono,
              mensaje: config.contenido,
            })
          );
          break;

        case 'push':
          tasks.push(
            this.pushService.send({
              usuario_id: user.id,
              titulo: config.asunto,
              mensaje: config.contenido,
              datos: config.datos,
            })
          );
          break;

        case 'in_app':
          tasks.push(
            this.notificationRepo.save({
              usuario_id: user.id,
              asunto: config.asunto,
              contenido: config.contenido,
              tipo: 'in_app',
              leido_en: null,
              estado: 'pending',
            })
          );
          break;
      }
    }

    return await Promise.all(tasks);
  }
}

// src/modules/notifications/email.service.ts

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // O Sendgrid, AWS SES, etc
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(config: any) {
    try {
      const result = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: config.destinatario,
        subject: config.asunto,
        html: await this.renderTemplate(config.template, config),
      });

      console.log('Email enviado:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error enviando email:', error);
      throw error;
    }
  }

  private async renderTemplate(template: string, data: any): Promise<string> {
    // Renderizar template HTML con datos
    const templates = {
      'ticket-notification': `
        <h2>Notificación de Ticket</h2>
        <p>${data.contenido}</p>
        <a href="${process.env.FRONTEND_URL}/tickets/${data.datos.ticket_id}">Ver Ticket</a>
      `,
    };

    return templates[template] || data.contenido;
  }
}

// src/modules/notifications/push.service.ts

import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class PushService {
  constructor() {
    // Inicializar Firebase Admin
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS)),
      });
    }
  }

  async send(config: any) {
    const mensaje = {
      notification: {
        title: config.titulo,
        body: config.mensaje,
      },
      data: config.datos,
    };

    // Obtener token del usuario
    const token = await this.getDeviceToken(config.usuario_id);

    if (token) {
      return await admin.messaging().send({
        token,
        ...mensaje,
      });
    }
  }

  private async getDeviceToken(usuario_id: string): Promise<string> {
    // Obtener de base de datos o cache
    return null;
  }
}
```

---

## 10. 🔗 INTEGRACIONES Y WEBHOOKS

```typescript
// src/modules/integrations/email-webhook.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { TicketsService } from '../tickets/tickets.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private ticketsService: TicketsService) {}

  @Post('email-incoming')
  async handleIncomingEmail(@Body() data: any) {
    /**
     * Estructura esperada del webhook de Sendgrid/Mailgun:
     * {
     *   from: "usuario@example.com",
     *   to: "soporte@tudominio.com",
     *   subject: "Mi problema",
     *   text: "Descripción del problema",
     *   attachments: [...]
     * }
     */

    const { from, to, subject, text, attachments } = data;

    // Buscar o crear usuario
    let usuario = await this.findOrCreateUserByEmail(from);

    // Detectar si es una respuesta a un ticket existente
    const ticketMatch = subject.match(/#(\d+)/);
    let ticket;

    if (ticketMatch) {
      const numeroTicket = parseInt(ticketMatch[1]);
      ticket = await this.ticketsService.findByNumber(numeroTicket);

      if (ticket) {
        // Agregar como comentario al ticket existente
        await this.ticketsService.addComment(ticket.id, {
          usuario_id: usuario.id,
          contenido: text,
          es_privado: false,
          fuente: 'email',
        });

        // Cambiar estado a EN_PROGRESO si estaba en espera
        if (ticket.estado === 'EN_ESPERA') {
          ticket.estado = 'EN_PROGRESO';
          await this.ticketsService.update(ticket.id, ticket);
        }

        return { status: 'actualizado', ticket_id: ticket.id };
      }
    }

    // Crear nuevo ticket
    const nuevoTicket = await this.ticketsService.create({
      usuario_id: usuario.id,
      titulo: subject,
      descripcion: text,
      fuente: 'email',
      adjuntos: attachments || [],
    });

    return { status: 'creado', ticket_id: nuevoTicket.id };
  }

  private async findOrCreateUserByEmail(email: string) {
    // Lógica para encontrar o crear usuario
  }
}

// src/modules/integrations/slack-integration.service.ts

import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SlackIntegrationService {
  async notifyTicketCreated(ticket: any) {
    const mensaje = {
      text: `Nuevo ticket #${ticket.numero_ticket}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🎫 *Nuevo Ticket*\n#${ticket.numero_ticket} - ${ticket.titulo}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Prioridad:*\n${ticket.prioridad}`,
            },
            {
              type: 'mrkdwn',
              text: `*Usuario:*\n${ticket.usuario_nombre}`,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Ver Ticket',
              },
              url: `${process.env.FRONTEND_URL}/tickets/${ticket.id}`,
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Asignarme',
              },
              action_id: 'assign_to_me',
              value: ticket.id,
            },
          ],
        },
      ],
    };

    await axios.post(process.env.SLACK_WEBHOOK_URL, mensaje);
  }

  async handleSlackAction(payload: any) {
    const { type, user, actions, trigger_id } = payload;

    if (type === 'block_actions') {
      const action = actions[0];
      
      if (action.action_id === 'assign_to_me') {
        // Asignar ticket al usuario de Slack
        const ticket_id = action.value;
        const slack_user_id = user.id;

        // Mapear slack_user_id a user_id del sistema
        const agent = await this.mapSlackUserToAgent(slack_user_id);
        
        // Asignar ticket
        await this.ticketsService.assign(ticket_id, agent.id);

        // Confirmar en Slack
        await axios.post(payload.response_url, {
          text: `✅ Ticket asignado a ti`,
          replace_original: false,
        });
      }
    }
  }

  private async mapSlackUserToAgent(slack_user_id: string) {
    // Buscar agent mapeado a slack_user_id
  }
}

// src/modules/integrations/teams-integration.service.ts

// Similarmente para Microsoft Teams
```

---

## 11. 💾 CACHING Y PERFORMANCE

```typescript
// src/shared/services/cache.service.ts

import { Injectable } from '@nestjs/common';
import * as Redis from 'redis';

@Injectable()
export class CacheService {
  private client: Redis.RedisClient;

  constructor() {
    this.client = Redis.createClient({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    });
  }

  async get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, data) => {
        if (err) reject(err);
        resolve(data ? JSON.parse(data) : null);
      });
    });
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.setex(
        key,
        ttl,
        JSON.stringify(value),
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }

  async del(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  async invalidatePattern(pattern: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.keys(pattern, (err, keys) => {
        if (err) reject(err);
        if (keys && keys.length > 0) {
          this.client.del(...keys, () => resolve());
        } else {
          resolve();
        }
      });
    });
  }
}

// Estrategia de caching para endpoints:

// GET /api/v1/tickets
// Cache key: tickets:user:{userId}:page:{page}
// TTL: 5 minutos

// GET /api/v1/knowledge-base
// Cache key: kb:page:{page}
// TTL: 1 hora

// POST /api/v1/tickets (crear nuevo)
// Invalidar: tickets:user:{userId}:* (todos los caches del usuario)

// Ejemplo en servicio:

@Injectable()
export class TicketsService {
  constructor(
    private cacheService: CacheService,
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
  ) {}

  async getTickets(userId: string, page: number = 1): Promise<any> {
    const cacheKey = `tickets:user:${userId}:page:${page}`;
    
    // Intentar obtener del cache
    let tickets = await this.cacheService.get(cacheKey);
    
    if (!tickets) {
      // Si no está en cache, consultar BD
      tickets = await this.ticketRepo.find({
        where: { usuario_id: userId },
        skip: (page - 1) * 20,
        take: 20,
      });

      // Guardar en cache por 5 minutos
      await this.cacheService.set(cacheKey, tickets, 300);
    }

    return tickets;
  }

  async createTicket(data: any): Promise<Ticket> {
    const ticket = await this.ticketRepo.save(data);

    // Invalidar todos los caches de tickets del usuario
    await this.cacheService.invalidatePattern(`tickets:user:${data.usuario_id}:*`);

    return ticket;
  }
}
```

---

## 12. 🔒 SEGURIDAD

```typescript
// src/shared/middlewares/security.middleware.ts

import { NestMiddleware, Injectable } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import * as mongoSanitize from 'xss-clean';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Helmet: headers seguridad
    helmet()(req, res, () => {});

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // máximo 100 requests por IP
      message: 'Demasiadas solicitudes, intenta más tarde',
    });

    limiter(req, res, () => {});

    // Sanitizar entrada
    mongoSanitize()(req, res, () => {});

    // CORS
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Prevenir CSRF
    res.setHeader('X-CSRF-Token', this.generateCsrfToken());

    next();
  }

  private generateCsrfToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }
}

// app.module.ts

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SecurityMiddleware } from './shared/middlewares/security.middleware';

@Module({
  imports: [
    // ... imports
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*');
  }
}
```

---

## 13. 📈 ESCALABILIDAD

```yaml
# docker-compose.yml - Desarrollo

version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: tickets_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  rabbitmq:
    image: rabbitmq:3-management
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    ports:
      - "5672:5672"
      - "15672:15672"

  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=tickets_db
      - REDIS_HOST=redis
      - ELASTICSEARCH_HOST=elasticsearch
      - RABBITMQ_URL=amqp://admin:${RABBITMQ_PASSWORD}@rabbitmq:5672
    depends_on:
      - postgres
      - redis
      - elasticsearch
      - rabbitmq
    volumes:
      - ./src:/app/src

volumes:
  postgres_data:
  elasticsearch_data:

# Para producción: Kubernetes deployment
# kubectl apply -f k8s/deployment.yaml
```

---

## 14. 📊 MONITOREO Y LOGGING

```typescript
// src/shared/utils/logger.ts

import * as Winston from 'winston';

const logger = Winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: Winston.format.json(),
  defaultMeta: { service: 'ticket-system' },
  transports: [
    new Winston.transports.File({ filename: 'error.log', level: 'error' }),
    new Winston.transports.File({ filename: 'combined.log' }),
    new Winston.transports.Console({
      format: Winston.format.simple(),
    }),
  ],
});

export default logger;

// Uso:
logger.info('Ticket creado', { ticket_id: '123', usuario_id: '456' });
logger.error('Error al asignar ticket', { error: e.message });

// Monitoreo con Prometheus

import { Counter, Histogram, register } from 'prom-client';

const ticketsCreated = new Counter({
  name: 'tickets_created_total',
  help: 'Total de tickets creados',
  labelNames: ['categoria', 'prioridad'],
});

const ticketResolutionTime = new Histogram({
  name: 'ticket_resolution_time_seconds',
  help: 'Tiempo de resolución en segundos',
  buckets: [300, 900, 1800, 3600, 7200], // 5min, 15min, 30min, 1h, 2h
});

const agentWorkload = new Gauge({
  name: 'agent_current_workload',
  help: 'Carga actual de cada agente',
  labelNames: ['agent_id'],
});

// Endpoint para Prometheus:
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});
```

---

## ✅ CHECKLIST DE DESARROLLO BACKEND

- [ ] Base de datos PostgreSQL diseñada y optimizada
- [ ] Autenticación JWT + Refresh tokens implementada
- [ ] Todos los endpoints API REST creados y documentados
- [ ] Sistema de automatización de reglas funcional
- [ ] Cálculo de SLA e implementado
- [ ] Sistema de notificaciones multi-canal
- [ ] Caching con Redis implementado
- [ ] Búsqueda full-text con Elasticsearch
- [ ] Integración con sistemas externos (Slack, Teams, Email)
- [ ] Queue/Workers con RabbitMQ
- [ ] Seguridad (CORS, Rate limiting, Input sanitization)
- [ ] Logging y monitoreo (Winston, Prometheus)
- [ ] Tests unitarios > 80% cobertura
- [ ] Tests de integración para endpoints críticos
- [ ] Documentación OpenAPI/Swagger
- [ ] Docker y docker-compose configurados
- [ ] CI/CD pipeline (GitHub Actions/GitLab CI)
- [ ] Secrets management (.env)
- [ ] Backup strategy para DB
- [ ] Deployment en staging y producción

---

**Próximo paso:** Comienza con el setup de PostgreSQL y la creación de migrations. Luego implementa autenticación y endpoints de tickets.
