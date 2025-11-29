# 📋 Requisitos Backend: Sistema de Timeline para Proyectos

## 🎯 Objetivo

Permitir la visualización de eventos históricos de un proyecto en formato timeline, incluyendo creación de tickets, cambios de estado, comentarios, y otros eventos relevantes.

---

## 🔌 Endpoints Requeridos

### **1. GET /api/projects/:id** ✅ (Ya existe - Verificar estructura)

**Descripción:** Obtener información del proyecto (ya implementado)

**Autenticación:** Requerida

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "uuid",
      "nombre": "Migración a Cloud AWS",
      "tipo": "CONSULTORIA_TI",
      "estado": "en_ejecucion",
      "descripcion": "Descripción del proyecto",
      "organizationId": "uuid",
      "createdAt": "2024-12-01T10:00:00.000Z",
      "updatedAt": "2024-12-01T15:30:00.000Z"
    },
    "tickets": []  // Opcional: tickets asociados
  }
}
```

**Nota:** ✅ Ya implementado. El proyecto está en `data.project`, no directamente en `data`.

---

### **2. GET /api/tickets** ✅ (Ya existe - Usado para Timeline)

**Descripción:** Obtener tickets de un proyecto para generar eventos del timeline

**Autenticación:** Requerida

**Query Parameters:**
- `projectId` - **REQUERIDO** para Timeline - Filtrar tickets por proyecto
- `limit?: number` - Límite de resultados (default: 20, para Timeline usar 1000)

**Ejemplo de Request:**
```
GET /api/tickets?projectId=uuid&limit=1000
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "uuid",
        "titulo": "Implementar login",
        "descripcion": "Crear sistema de autenticación",
        "estado": "EN_PROGRESO",
        "prioridad": "media",
        "projectId": "uuid-proyecto",
        "createdAt": "2024-12-01T10:00:00.000Z",
        "updatedAt": "2024-12-01T15:30:00.000Z",
        "comentarios": [
          {
            "id": "uuid-comment",
            "contenido": "Comentario del ticket",
            "createdAt": "2024-12-01T11:00:00.000Z",
            "created_at": "2024-12-01T11:00:00.000Z",
            "usuarioId": "uuid-user",
            "userId": "uuid-user",
            "usuarioNombre": "Juan Pérez",
            "userName": "Juan Pérez"
          }
        ],
        "usuario": {
          "nombre": "Juan Pérez",
          "email": "juan@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 1000,
      "total": 25,
      "totalPages": 1
    }
  }
}
```

**Campos importantes para Timeline:**
- ✅ `createdAt` - Para evento de creación
- ✅ `updatedAt` - Para evento de actualización
- ✅ `comentarios[]` - Array de comentarios con:
  - `id`, `contenido` o `content`
  - `createdAt` o `created_at`
  - `usuarioId` o `userId`
  - `usuarioNombre` o `userName`
- ✅ `usuario` - Información del usuario que creó el ticket
- ✅ `projectId` - Para filtrar por proyecto

**Nota:** ✅ Ya implementado. El frontend genera eventos del timeline a partir de los tickets.

---

### **3. GET /api/users** ✅ (Ya existe - Para filtros)

**Descripción:** Obtener lista de usuarios para filtros del timeline

**Autenticación:** Requerida

**Query Parameters:**
- `limit?: number` - Límite de resultados (default: 20, para filtros usar 100)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "nombre": "Juan Pérez",
        "name": "Juan Pérez",
        "email": "juan@example.com"
      }
    ]
  }
}
```

**Nota:** ✅ Ya implementado. Se usa para el filtro de usuario en el timeline.

---

## 📊 Estructura de Datos para Timeline

### **Eventos Generados desde Tickets**

El frontend genera automáticamente eventos del timeline a partir de los tickets:

1. **Ticket Creado** (`ticket_created`)
   - Se genera cuando `ticket.createdAt` existe
   - Incluye: título, descripción, usuario creador

2. **Ticket Actualizado** (`ticket_updated`)
   - Se genera cuando `ticket.updatedAt` existe y es diferente de `createdAt`
   - Incluye: título, fecha de actualización

3. **Comentario Agregado** (`ticket_commented`)
   - Se genera por cada comentario en `ticket.comentarios[]`
   - Incluye: contenido del comentario, usuario, fecha

### **Eventos Futuros (Opcional - Backend)**

Para eventos más avanzados, el backend podría implementar:

4. **Cambio de Estado** (`ticket_status_changed`)
   - **Requisito:** Historial de cambios de estado en tabla `ticket_status_history` o similar
   - **Estructura sugerida:**
     ```sql
     CREATE TABLE ticket_status_history (
       id UUID PRIMARY KEY,
       ticket_id UUID REFERENCES tickets(id),
       old_status VARCHAR(50),
       new_status VARCHAR(50),
       changed_by UUID REFERENCES users(id),
       changed_at TIMESTAMPTZ DEFAULT NOW(),
       reason TEXT
     );
     ```
   - **Incluye:** estado anterior, estado nuevo, usuario que cambió, razón del cambio
   - **Endpoint sugerido:** `GET /api/tickets/:id/history` o incluir en `GET /api/tickets/:id`

5. **Ticket Asignado** (`ticket_assigned`)
   - **Requisito:** Historial de asignaciones en tabla `ticket_assignments` o similar
   - **Estructura sugerida:**
     ```sql
     CREATE TABLE ticket_assignments (
       id UUID PRIMARY KEY,
       ticket_id UUID REFERENCES tickets(id),
       assigned_to UUID REFERENCES users(id),
       assigned_by UUID REFERENCES users(id),
       assigned_at TIMESTAMPTZ DEFAULT NOW(),
       unassigned_at TIMESTAMPTZ
     );
     ```
   - **Incluye:** usuario asignado, usuario que asignó, fecha de asignación

6. **Proyecto Creado** (`project_created`)
   - **Estado actual:** ✅ Se puede generar desde `project.createdAt`
   - **Incluye:** nombre del proyecto, usuario creador (si está disponible)

7. **Proyecto Actualizado** (`project_updated`)
   - **Estado actual:** ✅ Se puede generar desde `project.updatedAt`
   - **Mejora futura:** Historial de cambios con detalles de qué cambió
   - **Incluye:** cambios realizados, usuario que actualizó

8. **Hito Alcanzado** (`milestone_reached`)
   - **Requisito:** Sistema de milestones/hitos en tabla `project_milestones`
   - **Estructura sugerida:**
     ```sql
     CREATE TABLE project_milestones (
       id UUID PRIMARY KEY,
       project_id UUID REFERENCES projects(id),
       nombre VARCHAR(255),
       descripcion TEXT,
       fecha_objetivo DATE,
       fecha_alcanzado DATE,
       alcanzado_por UUID REFERENCES users(id),
       created_at TIMESTAMPTZ DEFAULT NOW()
     );
     ```
   - **Incluye:** nombre del hito, fecha alcanzado, usuario que marcó como alcanzado

---

## 🔄 Flujo de Timeline

1. **Usuario accede a `/internal/projects/:id`**
   - Frontend llama a `GET /api/projects/:id` para obtener el proyecto
   - Frontend llama a `GET /api/tickets?projectId=:id&limit=1000` para obtener tickets
   - Frontend genera eventos del timeline a partir de los tickets

2. **Usuario aplica filtros**
   - Frontend filtra eventos por:
     - Tipo de evento
     - Rango de fechas (startDate, endDate)
     - Usuario (userId)
   - Los filtros se aplican en el cliente (no requiere endpoints adicionales)

3. **Visualización**
   - Eventos agrupados por fecha
   - Ordenados por fecha (más reciente primero)
   - Con iconos y colores según tipo de evento

---

## ✅ Checklist de Implementación

### **Backend:** ✅ COMPLETADO (Usa endpoints existentes)
- [x] `GET /api/projects/:id` retorna proyecto en `data.project`
- [x] `GET /api/tickets?projectId=:id` retorna tickets del proyecto
- [x] Tickets incluyen `createdAt`, `updatedAt`
- [x] Tickets incluyen `comentarios[]` con información completa
- [x] Tickets incluyen `usuario` (creador del ticket)
- [x] `GET /api/users` retorna lista de usuarios para filtros

### **Frontend:** ✅ COMPLETADO
- [x] Componente `ProjectTimeline` implementado
- [x] Hook `useProjectTimeline` para obtener eventos
- [x] Generación automática de eventos desde tickets
- [x] Filtros por tipo, fecha, usuario
- [x] Agrupación por fecha
- [x] Visualización con iconos y colores

---

## 🔗 Integración con Frontend

El frontend ya está implementado en:
- **Página:** `/internal/projects/:id` (tab Timeline)
- **Componente:** `components/projects/ProjectTimeline.tsx`
- **Hook:** `useProjectTimeline()`
- **Tipos:** `lib/types/timeline.ts`

**El frontend espera:**
1. ✅ `GET /api/projects/:id` que retorne proyecto en `data.project`
2. ✅ `GET /api/tickets?projectId=:id&limit=1000` que retorne tickets con comentarios
3. ✅ Tickets con `createdAt`, `updatedAt`, `comentarios[]`, `usuario`
4. ✅ `GET /api/users` para filtros de usuario

---

## 📝 Mejoras Futuras (Opcional)

### **Backend - Historial de Cambios de Estado**

Para eventos más detallados de cambios de estado, se recomienda implementar:

**Tabla: `ticket_status_history`**
```sql
CREATE TABLE ticket_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_status_history_ticket_id ON ticket_status_history(ticket_id);
CREATE INDEX idx_ticket_status_history_changed_at ON ticket_status_history(changed_at);
```

**Trigger o Middleware:**
- Al actualizar `ticket.estado`, insertar registro en `ticket_status_history`
- Capturar `old_status` y `new_status`
- Capturar `changed_by` (usuario que hizo el cambio)

**Endpoint sugerido:**
```
GET /api/tickets/:id/history
```

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "uuid",
        "oldStatus": "NUEVO",
        "newStatus": "EN_PROGRESO",
        "changedBy": "uuid-user",
        "changedByName": "Juan Pérez",
        "changedAt": "2024-12-01T10:00:00.000Z",
        "reason": "Iniciando trabajo en el ticket"
      }
    ]
  }
}
```

---

### **Backend - Endpoint Dedicado de Timeline**

Si se requiere un endpoint específico para timeline (más eficiente):

**GET /api/projects/:id/timeline**

**Query Parameters:**
- `startDate?: string` - Filtrar desde fecha (ISO 8601)
- `endDate?: string` - Filtrar hasta fecha (ISO 8601)
- `eventTypes?: string[]` - Filtrar por tipos de evento (comma-separated o array)
- `userId?: string` - Filtrar por usuario

**Ejemplo de Request:**
```
GET /api/projects/:id/timeline?startDate=2024-12-01&eventTypes=ticket_created,ticket_commented
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "type": "ticket_created",
        "title": "Ticket creado: Implementar login",
        "description": "Crear sistema de autenticación",
        "timestamp": "2024-12-01T10:00:00.000Z",
        "userId": "uuid-user",
        "userName": "Juan Pérez",
        "userAvatar": "https://...",
        "metadata": {
          "ticketId": "uuid-ticket",
          "ticketTitle": "Implementar login",
          "oldStatus": null,
          "newStatus": "NUEVO"
        }
      },
      {
        "id": "uuid-2",
        "type": "ticket_status_changed",
        "title": "Estado cambiado: Implementar login",
        "timestamp": "2024-12-01T11:00:00.000Z",
        "userId": "uuid-user-2",
        "userName": "María García",
        "metadata": {
          "ticketId": "uuid-ticket",
          "ticketTitle": "Implementar login",
          "oldStatus": "NUEVO",
          "newStatus": "EN_PROGRESO"
        }
      }
    ]
  }
}
```

**Ventajas:**
- Más eficiente (no necesita cargar todos los tickets)
- Puede incluir eventos adicionales (milestones, cambios de estado históricos)
- Filtrado en el servidor (más rápido)
- Puede incluir eventos de múltiples fuentes (tickets, proyectos, milestones)

**Nota:** Por ahora, el frontend genera eventos desde tickets, lo cual es suficiente para MVP. Este endpoint sería útil para proyectos con muchos tickets o cuando se implementen milestones.

---

## 📝 Notas Adicionales

### **Performance:**
- El límite de 1000 tickets es suficiente para la mayoría de proyectos
- Si un proyecto tiene más de 1000 tickets, considerar:
  - Paginación en el timeline
  - Filtros más específicos
  - Endpoint dedicado de timeline

### **Información de Comentarios:**
- Los comentarios deben incluir:
  - ✅ `id` - ID único del comentario
  - ✅ `contenido` o `content` - Contenido del comentario
  - ✅ `createdAt` o `created_at` - Fecha de creación (ISO 8601)
  - ✅ `usuarioId` o `userId` - ID del usuario que comentó
  - ✅ `usuarioNombre` o `userName` - **RECOMENDADO** - Nombre del usuario (para mostrar sin otra query)
  - ⚠️ `userAvatar` - Opcional - Avatar del usuario (para mostrar en timeline)

### **Historial de Cambios de Estado (Futuro):**

Para eventos más detallados de cambios de estado, se recomienda:

1. **Crear tabla de historial:**
   ```sql
   CREATE TABLE ticket_status_history (
     id UUID PRIMARY KEY,
     ticket_id UUID REFERENCES tickets(id),
     old_status VARCHAR(50),
     new_status VARCHAR(50),
     changed_by UUID REFERENCES users(id),
     changed_at TIMESTAMPTZ DEFAULT NOW(),
     reason TEXT
   );
   ```

2. **Trigger o Middleware:**
   - Al actualizar `ticket.estado`, insertar registro automáticamente
   - Capturar estado anterior y nuevo
   - Capturar usuario que hizo el cambio

3. **Endpoint opcional:**
   - `GET /api/tickets/:id/history` - Retornar historial de cambios
   - O incluir `statusHistory[]` en `GET /api/tickets/:id`

4. **Beneficios:**
   - Eventos más precisos en el timeline
   - Auditoría completa de cambios
   - Razones de cambio documentadas
   - Mejor trazabilidad

### **Compatibilidad:**
- El frontend maneja tanto `contenido` como `content`
- El frontend maneja tanto `createdAt` como `created_at`
- El frontend maneja tanto `usuarioId` como `userId`
- El frontend maneja tanto `usuarioNombre` como `userName`

---

**Última actualización:** Diciembre 2024  
**Estado:** ✅ Implementación Completa - Frontend listo, Backend usa endpoints existentes

