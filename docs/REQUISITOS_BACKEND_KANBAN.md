# 📋 Requisitos Backend: Sistema Kanban para Proyectos

## 🎯 Objetivo

Permitir la visualización y gestión de tareas (tickets) de proyectos mediante un board Kanban con drag & drop.

---

## 🔌 Endpoints Requeridos

### **1. GET /api/tickets** (Ya existe - Verificar filtros)

**Descripción:** Obtener tickets de un proyecto para el Kanban

**Autenticación:** Requerida

**Query Parameters:**
- `projectId` - **REQUERIDO** para Kanban - Filtrar tickets por proyecto
- `asignadoA?: string` - Filtrar por usuario asignado
- `prioridad?: string` - Filtrar por prioridad (P1, P2, P3, P4)
- `categoria?: string` - Filtrar por categoría
- `limit?: number` - Límite de resultados (default: 20, para Kanban usar 1000)

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
        "prioridad": "P2",
        "asignadoA": "uuid-usuario",
        "asignadoNombre": "Juan Pérez",
        "categoria": "Técnico",
        "impacto": "Alto",
        "urgencia": "Alta",
        "projectId": "uuid-proyecto",
        "createdAt": "2024-12-01T10:00:00.000Z",
        "updatedAt": "2024-12-01T15:30:00.000Z"
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

**Notas:**
- El endpoint ya existe, solo necesita soportar `limit=1000` para obtener todos los tickets del proyecto
- Debe incluir información del usuario asignado (`asignadoNombre`) si está disponible

---

### **2. PUT /api/tickets/:id** (Ya existe - Verificar)

**Descripción:** Actualizar estado de ticket (para mover entre columnas)

**Autenticación:** Requerida

**Path Parameters:**
- `id` - ID del ticket

**Body:**
```json
{
  "estado": "EN_PROGRESO"  // Nuevo estado
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Ticket actualizado",
  "data": {
    "id": "uuid",
    "estado": "EN_PROGRESO",
    "updatedAt": "2024-12-01T15:30:00.000Z"
  }
}
```

**Estados válidos:**
- `NUEVO`
- `EN_PROGRESO`
- `EN_ESPERA`
- `RESUELTO`
- `CERRADO`
- `REABIERTO`

**Notas:**
- El endpoint ya existe, solo necesita verificar que acepta actualización de `estado`
- Debe retornar el ticket actualizado

---

## 📊 Estructura de Datos

### **Ticket (para Kanban)**

El ticket debe incluir:
```typescript
{
  id: string;
  titulo: string;
  descripcion?: string | null;
  estado: string;  // NUEVO, EN_PROGRESO, EN_ESPERA, RESUELTO, CERRADO
  prioridad: string;  // P1, P2, P3, P4
  asignadoA?: string | null;
  asignadoNombre?: string;  // ← Útil para mostrar en Kanban
  categoria?: string | null;
  impacto?: string | null;
  urgencia?: string | null;
  projectId?: string | null;
  createdAt: string;
  updatedAt?: string;
}
```

**Campos importantes:**
- `estado`: **REQUERIDO** - Determina en qué columna aparece
- `asignadoNombre`: Útil para mostrar quién está asignado sin hacer otra query
- `projectId`: **REQUERIDO** - Para filtrar tickets del proyecto

---

## 🔄 Flujo de Kanban

1. **Usuario accede a `/internal/projects/:id/kanban`**
   - Frontend llama a `GET /api/tickets?projectId=:id&limit=1000`
   - Backend retorna todos los tickets del proyecto

2. **Usuario arrastra tarea entre columnas**
   - Frontend detecta el cambio de columna
   - Frontend llama a `PUT /api/tickets/:id` con nuevo `estado`
   - Backend actualiza el estado y retorna el ticket actualizado
   - Frontend refresca la lista automáticamente

3. **Usuario aplica filtros**
   - Frontend envía filtros en query params
   - Backend retorna tickets filtrados
   - Frontend también aplica filtro de búsqueda en cliente

---

## ✅ Checklist de Implementación

### **Backend:**
- [ ] Verificar que `GET /api/tickets` soporta `projectId` como filtro
- [ ] Verificar que `GET /api/tickets` soporta `limit=1000` (o un límite alto)
- [ ] Verificar que `GET /api/tickets` incluye `asignadoNombre` en la respuesta (o información del usuario asignado)
- [ ] Verificar que `PUT /api/tickets/:id` acepta actualización de `estado`
- [ ] Verificar que los estados son: `NUEVO`, `EN_PROGRESO`, `EN_ESPERA`, `RESUELTO`, `CERRADO`

---

## 🔗 Integración con Frontend

El frontend ya está implementado en:
- **Página:** `/internal/projects/:id/kanban`
- **Componente:** `components/projects/KanbanBoard.tsx`
- **Hooks:** `useKanbanTasks()`, `useMoveTask()`
- **Tipos:** `lib/types/kanban.ts`

**El frontend espera:**
1. Endpoint `GET /api/tickets?projectId=:id&limit=1000` que retorne todos los tickets del proyecto
2. Endpoint `PUT /api/tickets/:id` que acepte actualización de `estado`
3. Tickets con información del usuario asignado (nombre) si está disponible

---

## 📝 Notas Adicionales

- **Performance:** Si hay muchos tickets (>1000), considerar paginación o virtualización
- **Notificaciones:** Opcionalmente, notificar al usuario asignado cuando se mueve su ticket
- **Historial:** Considerar guardar un log de cambios de estado (audit log)
- **Validaciones:** Verificar que el usuario tiene permisos para mover tickets entre estados

---

**Última actualización:** Diciembre 2024

