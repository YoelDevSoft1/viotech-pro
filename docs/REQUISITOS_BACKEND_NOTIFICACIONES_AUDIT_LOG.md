# Requisitos Backend: Notificaciones en Tiempo Real y Audit Log

## 📋 Resumen

Este documento describe los requisitos del backend para implementar:
1. **Sistema de Notificaciones en Tiempo Real** con WebSockets
2. **Sistema de Audit Log** (Historial de Cambios)

---

## 🔔 Sistema de Notificaciones

### Endpoints REST

#### 1. GET /api/notifications
Obtener todas las notificaciones del usuario autenticado.

**Autenticación:** Requerida (JWT)

**Query Parameters:**
- `limit` (number, opcional): Número de notificaciones a retornar (default: 50, max: 100)
- `offset` (number, opcional): Offset para paginación (default: 0)
- `read` (boolean, opcional): Filtrar por leídas/no leídas
- `type` (string, opcional): Filtrar por tipo de notificación

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "ticket_created",
      "title": "Nuevo ticket creado",
      "message": "Se ha creado el ticket #1234",
      "read": false,
      "readAt": null,
      "createdAt": "2024-12-01T10:00:00.000Z",
      "updatedAt": "2024-12-01T10:00:00.000Z",
      "metadata": {
        "ticketId": "uuid",
        "projectId": "uuid"
      },
      "actionUrl": "/internal/tickets/uuid"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### 2. GET /api/notifications/stats
Obtener estadísticas de notificaciones del usuario.

**Autenticación:** Requerida (JWT)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "unread": 12,
    "read": 138
  }
}
```

#### 3. PATCH /api/notifications/:id/read
Marcar una notificación como leída.

**Autenticación:** Requerida (JWT)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "read": true,
    "readAt": "2024-12-01T10:05:00.000Z"
  }
}
```

#### 4. PATCH /api/notifications/read-all
Marcar todas las notificaciones del usuario como leídas.

**Autenticación:** Requerida (JWT)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "marked": 12
  }
}
```

#### 5. DELETE /api/notifications/:id
Eliminar una notificación.

**Autenticación:** Requerida (JWT)

**Validación:** Solo el propietario puede eliminar su notificación.

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Notificación eliminada"
}
```

#### 6. DELETE /api/notifications/read
Eliminar todas las notificaciones leídas del usuario.

**Autenticación:** Requerida (JWT)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "deleted": 138
  }
}
```

---

### WebSocket: /ws/notifications

**Autenticación:** Token JWT como query parameter: `?token=<jwt_token>`

**Eventos del Servidor:**

#### 1. `notification` (broadcast)
Enviado cuando se crea una nueva notificación para el usuario conectado.

```json
{
  "type": "notification",
  "payload": {
    "id": "uuid",
    "userId": "uuid",
    "type": "ticket_created",
    "title": "Nuevo ticket creado",
    "message": "Se ha creado el ticket #1234",
    "read": false,
    "readAt": null,
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-01T10:00:00.000Z",
    "metadata": {
      "ticketId": "uuid",
      "projectId": "uuid"
    },
    "actionUrl": "/internal/tickets/uuid"
  }
}
```

**Eventos del Cliente:**
- No se requieren eventos del cliente para notificaciones (solo lectura)

---

### Modelo de Datos: Notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  metadata JSONB,
  action_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

---

### Lógica de Negocio

1. **Creación Automática de Notificaciones:**
   - Cuando se crea un ticket → notificar al asignado
   - Cuando se actualiza un ticket → notificar al asignado y creador
   - Cuando se asigna un ticket → notificar al nuevo asignado
   - Cuando se comenta un ticket → notificar a participantes
   - Cuando se crea un proyecto → notificar a miembros del equipo
   - Cuando se aprueba/rechaza un comentario → notificar al autor

2. **Preferencias de Usuario:**
   - Respetar las preferencias de notificación del usuario
   - Si el usuario desactivó notificaciones por email, no enviar email pero sí crear notificación en BD

3. **WebSocket:**
   - Mantener conexión activa mientras el usuario esté autenticado
   - Reconectar automáticamente si se pierde la conexión
   - Enviar notificaciones solo al usuario correspondiente (filtrado por `userId`)

---

## 📝 Sistema de Audit Log

### Endpoints REST

#### 1. GET /api/audit-log
Obtener historial de cambios con filtros.

**Autenticación:** Requerida (JWT)

**Permisos:** Solo usuarios con rol `admin` o `super_admin`

**Query Parameters:**
- `userId` (string, opcional): Filtrar por usuario
- `action` (string, opcional): Filtrar por acción (`create`, `update`, `delete`, etc.)
- `entityType` (string, opcional): Filtrar por tipo de entidad (`ticket`, `project`, `user`, etc.)
- `entityId` (string, opcional): Filtrar por ID de entidad específica
- `startDate` (string, opcional): Fecha de inicio (ISO 8601)
- `endDate` (string, opcional): Fecha de fin (ISO 8601)
- `search` (string, opcional): Búsqueda en descripción
- `limit` (number, opcional): Número de registros (default: 50, max: 200)
- `offset` (number, opcional): Offset para paginación

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "Juan Pérez",
      "userEmail": "juan@example.com",
      "action": "update",
      "entityType": "ticket",
      "entityId": "uuid",
      "entityName": "Ticket #1234",
      "description": "Ticket actualizado: Estado cambiado de 'Abierto' a 'En Progreso'",
      "changes": [
        {
          "field": "status",
          "oldValue": "open",
          "newValue": "in_progress"
        },
        {
          "field": "assignedTo",
          "oldValue": null,
          "newValue": "uuid-user"
        }
      ],
      "metadata": {
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0..."
      },
      "createdAt": "2024-12-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5000,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### 2. GET /api/audit-log/:entityType/:entityId
Obtener historial de cambios de una entidad específica.

**Autenticación:** Requerida (JWT)

**Permisos:** Usuarios con acceso a la entidad o admin

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "Juan Pérez",
      "action": "create",
      "entityType": "ticket",
      "entityId": "uuid",
      "description": "Ticket creado",
      "createdAt": "2024-12-01T09:00:00.000Z"
    }
  ]
}
```

#### 3. GET /api/audit-log/stats
Obtener estadísticas del audit log.

**Autenticación:** Requerida (JWT)

**Permisos:** Solo usuarios con rol `admin` o `super_admin`

**Query Parameters:**
- `userId` (string, opcional): Filtrar por usuario
- `startDate` (string, opcional): Fecha de inicio
- `endDate` (string, opcional): Fecha de fin

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "total": 5000,
    "byAction": {
      "create": 1500,
      "update": 2500,
      "delete": 200,
      "assign": 800
    },
    "byEntityType": {
      "ticket": 3000,
      "project": 1000,
      "user": 500,
      "comment": 500
    },
    "recentActivity": 150
  }
}
```

---

### Modelo de Datos: Audit Log

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  entity_name VARCHAR(255),
  description TEXT NOT NULL,
  changes JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_search ON audit_logs USING gin(to_tsvector('spanish', description));
```

---

### Lógica de Negocio

1. **Registro Automático:**
   - Registrar todas las acciones importantes del sistema
   - Capturar cambios de campos (oldValue → newValue)
   - Incluir metadata (IP, user agent, etc.)

2. **Tipos de Acciones a Registrar:**
   - `create`: Creación de entidades
   - `update`: Actualización de entidades (con cambios detallados)
   - `delete`: Eliminación de entidades
   - `assign`: Asignación de recursos
   - `status_change`: Cambios de estado
   - `comment`: Comentarios
   - `approve`/`reject`: Aprobaciones/rechazos
   - `login`/`logout`: Eventos de autenticación
   - `permission_change`: Cambios de permisos

3. **Retención de Datos:**
   - Mantener audit log por tiempo indefinido (o según política de la organización)
   - Considerar archivado para registros muy antiguos (> 1 año)

4. **Privacidad:**
   - No registrar información sensible (contraseñas, tokens, etc.)
   - Anonimizar datos personales si es necesario según GDPR

---

## 🔐 Seguridad

1. **Notificaciones:**
   - Solo el usuario puede ver sus propias notificaciones
   - Validar ownership en todas las operaciones

2. **Audit Log:**
   - Solo administradores pueden ver el audit log completo
   - Usuarios regulares solo pueden ver audit log de entidades a las que tienen acceso
   - No exponer información sensible en el audit log

3. **WebSocket:**
   - Validar token JWT en cada conexión
   - Cerrar conexión si el token es inválido o expira
   - Rate limiting para prevenir abuso

---

## 📊 Métricas y Monitoreo

1. **Notificaciones:**
   - Tasa de notificaciones no leídas
   - Tiempo promedio de lectura
   - Tipos de notificaciones más comunes

2. **Audit Log:**
   - Volumen de registros por día
   - Acciones más frecuentes
   - Usuarios más activos

---

## ✅ Checklist de Implementación

### Notificaciones
- [ ] Crear tabla `notifications`
- [ ] Implementar endpoints REST
- [ ] Implementar WebSocket server
- [ ] Crear servicio para generar notificaciones automáticamente
- [ ] Integrar notificaciones en flujos de negocio (tickets, proyectos, etc.)
- [ ] Testing de WebSocket con reconexión

### Audit Log
- [ ] Crear tabla `audit_logs`
- [ ] Implementar endpoints REST
- [ ] Crear middleware/decorator para registrar acciones automáticamente
- [ ] Integrar en todos los endpoints críticos
- [ ] Implementar búsqueda full-text
- [ ] Testing de rendimiento con grandes volúmenes

---

## 📝 Notas Adicionales

- **WebSocket Library:** Recomendado usar `socket.io` o `ws` (Node.js)
- **Notificaciones Push:** Considerar implementar notificaciones push del navegador (PWA) en el futuro
- **Email Digests:** Considerar enviar resúmenes diarios/semanales de notificaciones por email
- **Retención:** Definir política de retención para audit log (ej: 1 año, 5 años, indefinido)

