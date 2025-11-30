# Requisitos Backend: Gantt Charts Interactivos

## 📋 Resumen

Este documento describe los requisitos del backend para implementar Gantt Charts interactivos que muestren las tareas (tickets) de un proyecto en una línea de tiempo visual.

---

## 🎯 Funcionalidades Requeridas

### **1. Datos de Tareas para Gantt**

El Gantt necesita información adicional de los tickets que actualmente no está disponible:

- ✅ **Fechas de inicio y fin** (`startDate`, `endDate`)
- ✅ **Duración estimada** (`estimatedDuration`)
- ✅ **Progreso** (`progress` - 0-100%)
- ✅ **Dependencias** entre tareas
- ✅ **Milestones** (hitos del proyecto)

---

## 📊 Endpoints Requeridos

### **1. GET /api/projects/:id/gantt**

Obtener datos de Gantt para un proyecto específico.

**Autenticación:** Requerida (JWT)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "uuid",
      "nombre": "Proyecto X",
      "startDate": "2024-12-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.000Z"
    },
    "tasks": [
      {
        "id": "uuid",
        "ticketId": "uuid",
        "title": "Implementar feature X",
        "startDate": "2024-12-01T00:00:00.000Z",
        "endDate": "2024-12-05T23:59:59.000Z",
        "progress": 50,
        "priority": "P1",
        "status": "EN_PROGRESO",
        "assignedTo": "uuid",
        "assignedToName": "Juan Pérez",
        "dependencies": ["uuid-otra-tarea"],
        "isMilestone": false
      }
    ],
    "milestones": [
      {
        "id": "uuid",
        "title": "Sprint 1 completado",
        "date": "2024-12-15T00:00:00.000Z",
        "description": "Primer sprint completado exitosamente"
      }
    ]
  }
}
```

---

### **2. PUT /api/tickets/:id/gantt**

Actualizar información de Gantt de un ticket (fechas, progreso, dependencias).

**Autenticación:** Requerida (JWT)

**Body:**
```json
{
  "startDate": "2024-12-01T00:00:00.000Z",
  "endDate": "2024-12-05T23:59:59.000Z",
  "progress": 50,
  "dependencies": ["uuid-otra-tarea"]
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "startDate": "2024-12-01T00:00:00.000Z",
    "endDate": "2024-12-05T23:59:59.000Z",
    "progress": 50,
    "dependencies": ["uuid-otra-tarea"]
  }
}
```

---

### **3. POST /api/projects/:id/milestones**

Crear un milestone (hito) para el proyecto.

**Autenticación:** Requerida (JWT)

**Body:**
```json
{
  "title": "Sprint 1 completado",
  "date": "2024-12-15T00:00:00.000Z",
  "description": "Primer sprint completado exitosamente"
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "title": "Sprint 1 completado",
    "date": "2024-12-15T00:00:00.000Z",
    "description": "Primer sprint completado exitosamente",
    "createdAt": "2024-12-01T10:00:00.000Z"
  }
}
```

---

### **4. PUT /api/projects/:id/milestones/:milestoneId**

Actualizar un milestone.

**Autenticación:** Requerida (JWT)

**Body:**
```json
{
  "title": "Sprint 1 completado (actualizado)",
  "date": "2024-12-16T00:00:00.000Z",
  "description": "Primer sprint completado exitosamente"
}
```

---

### **5. DELETE /api/projects/:id/milestones/:milestoneId**

Eliminar un milestone.

**Autenticación:** Requerida (JWT)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Milestone eliminado"
}
```

---

## 🗄️ Modelo de Datos

### **Tabla: `ticket_gantt_data`**

```sql
CREATE TABLE ticket_gantt_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  estimated_duration INTEGER, -- en horas
  dependencies UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ticket_id)
);

CREATE INDEX idx_ticket_gantt_data_ticket_id ON ticket_gantt_data(ticket_id);
```

### **Tabla: `project_milestones`**

```sql
CREATE TABLE project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_milestones_project_id ON project_milestones(project_id);
CREATE INDEX idx_project_milestones_date ON project_milestones(date);
```

---

## 🔄 Lógica de Negocio

### **1. Cálculo Automático de Fechas**

Si un ticket no tiene `startDate` o `endDate` definidos:

- **startDate:** Usar `createdAt` del ticket
- **endDate:** Calcular basado en:
  - `estimatedDuration` si está disponible
  - SLA del ticket si está disponible
  - Fecha por defecto: `createdAt + 7 días`

### **2. Validación de Dependencias**

- Las dependencias deben ser tickets del mismo proyecto
- No permitir dependencias circulares
- Al actualizar una tarea, recalcular fechas de tareas dependientes si es necesario

### **3. Cálculo de Ruta Crítica**

- Identificar la secuencia más larga de tareas dependientes
- Calcular la fecha de finalización del proyecto basada en la ruta crítica
- Resaltar tareas en la ruta crítica

---

## 📝 Notas de Implementación

### **Compatibilidad con Sistema Actual**

- Los tickets existentes seguirán funcionando sin datos de Gantt
- Si no hay `startDate`/`endDate`, se calculan automáticamente
- Las dependencias son opcionales

### **Performance**

- Cachear datos de Gantt para proyectos grandes
- Usar paginación si hay más de 100 tareas
- Indexar `ticket_id` y `project_id` para consultas rápidas

---

## ✅ Checklist de Implementación

- [ ] Crear tabla `ticket_gantt_data`
- [ ] Crear tabla `project_milestones`
- [ ] Implementar `GET /api/projects/:id/gantt`
- [ ] Implementar `PUT /api/tickets/:id/gantt`
- [ ] Implementar `POST /api/projects/:id/milestones`
- [ ] Implementar `PUT /api/projects/:id/milestones/:milestoneId`
- [ ] Implementar `DELETE /api/projects/:id/milestones/:milestoneId`
- [ ] Validar dependencias (no circulares)
- [ ] Calcular ruta crítica
- [ ] Testing de endpoints

---

**Última actualización:** Diciembre 2024

