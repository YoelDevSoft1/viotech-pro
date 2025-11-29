# 📋 Requisitos Backend: Sistema Kanban para Proyectos

## ✅ Estado: IMPLEMENTACIÓN COMPLETA

Todos los requisitos del backend han sido implementados y verificados. El sistema Kanban está completamente funcional.

---

## 🎯 Objetivo

Permitir la visualización y gestión de tareas (tickets) de proyectos mediante un board Kanban con drag & drop.

---

## 🔌 Endpoints Implementados ✅

### **1. GET /api/tickets** ✅

**Descripción:** Obtener tickets de un proyecto para el Kanban

**Autenticación:** Requerida

**Query Parameters:**
- `projectId` - **REQUERIDO** para Kanban - Filtrar tickets por proyecto
- `asignadoA?: string` - Filtrar por usuario asignado
- `prioridad?: string` - Filtrar por prioridad (P1, P2, P3, P4 o baja, media, alta, critica)
- `categoria?: string` - Filtrar por categoría
- `limit?: number` - Límite de resultados (default: 20, máximo: 1000 para Kanban)

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
- ✅ Soporta `limit=1000` para obtener todos los tickets del proyecto
- ✅ Incluye `asignadoNombre` en la respuesta
- ✅ Incluye `projectId` en la respuesta

---

### **2. PUT /api/tickets/:id** ✅

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

**Estados válidos (alineados con backend):**
- `NUEVO` - Ticket recién creado
- `ABIERTO` - Ticket abierto (compatibilidad con estado anterior)
- `EN_PROGRESO` - Ticket en proceso de resolución
- `EN_ESPERA` - Ticket en espera de información o acción
- `RESUELTO` - Ticket resuelto
- `CERRADO` - Ticket cerrado
- `REABIERTO` - Ticket reabierto después de estar cerrado

**Nota:** El backend mantiene compatibilidad con estados antiguos (`abierto`, `en_progreso`, etc.) mapeándolos automáticamente.

---

## 📊 Estructura de Datos

### **Ticket (para Kanban)**

El ticket debe incluir:
```typescript
{
  id: string;
  titulo: string;
  descripcion?: string | null;
  estado: string;  // NUEVO, ABIERTO, EN_PROGRESO, EN_ESPERA, RESUELTO, CERRADO, REABIERTO
  prioridad: string;  // P1, P2, P3, P4 o baja, media, alta, critica
  asignadoA?: string | null;
  asignadoNombre?: string;  // ← Incluido para mostrar en Kanban
  categoria?: string | null;
  impacto?: string | null;
  urgencia?: string | null;
  projectId?: string | null;  // ← Requerido para filtrar
  createdAt: string;
  updatedAt?: string;
}
```

**Campos importantes:**
- `estado`: **REQUERIDO** - Determina en qué columna aparece
- `asignadoNombre`: ✅ Incluido - Muestra quién está asignado sin hacer otra query
- `projectId`: **REQUERIDO** - Para filtrar tickets del proyecto

---

## 🔄 Flujo de Kanban

1. **Usuario accede a `/internal/projects/:id/kanban`**
   - Frontend llama a `GET /api/tickets?projectId=:id&limit=1000`
   - Backend retorna todos los tickets del proyecto ✅

2. **Usuario arrastra tarea entre columnas**
   - Frontend detecta el cambio de columna
   - Frontend llama a `PUT /api/tickets/:id` con nuevo `estado`
   - Backend actualiza el estado y retorna el ticket actualizado ✅
   - Frontend refresca la lista automáticamente

3. **Usuario aplica filtros**
   - Frontend envía filtros en query params
   - Backend retorna tickets filtrados ✅
   - Frontend también aplica filtro de búsqueda en cliente

---

## ✅ Checklist de Implementación

### **Backend:** ✅ COMPLETADO
- [x] Verificar que `GET /api/tickets` soporta `projectId` como filtro
- [x] Verificar que `GET /api/tickets` soporta `limit=1000` (o un límite alto)
- [x] Verificar que `GET /api/tickets` incluye `asignadoNombre` en la respuesta
- [x] Verificar que `PUT /api/tickets/:id` acepta actualización de `estado`
- [x] Verificar que los estados son: `NUEVO`, `ABIERTO`, `EN_PROGRESO`, `EN_ESPERA`, `RESUELTO`, `CERRADO`, `REABIERTO`
- [x] Verificar que `projectId` se incluye en las respuestas

---

## 🔗 Integración con Frontend

El frontend ya está implementado en:
- **Página:** `/internal/projects/:id/kanban`
- **Componente:** `components/projects/KanbanBoard.tsx`
- **Hooks:** `useKanbanTasks()`, `useMoveTask()`
- **Tipos:** `lib/types/kanban.ts`

**El frontend espera:**
1. ✅ Endpoint `GET /api/tickets?projectId=:id&limit=1000` que retorne todos los tickets del proyecto
2. ✅ Endpoint `PUT /api/tickets/:id` que acepte actualización de `estado`
3. ✅ Tickets con información del usuario asignado (`asignadoNombre`) si está disponible

---

## 📝 Notas Adicionales

### **Cambios Implementados en Backend:**

1. **Límite Máximo Aumentado**
   - Antes: Máximo 100 tickets por página
   - Ahora: Máximo 1000 tickets por página (suficiente para Kanban)

2. **Estados Actualizados**
   - Antes: `['abierto', 'en_progreso', 'resuelto', 'cerrado']`
   - Ahora: `['NUEVO', 'ABIERTO', 'EN_PROGRESO', 'EN_ESPERA', 'RESUELTO', 'CERRADO', 'REABIERTO']`
   - Mantiene compatibilidad con estados antiguos

3. **Campo `asignadoNombre` Agregado**
   - Se agregó el campo `asignadoNombre` al mapeo de tickets
   - Se obtiene del objeto `asignado` (usuario asignado)
   - Disponible en todas las respuestas de tickets

4. **Campo `projectId` Incluido**
   - El campo `projectId` ahora se incluye explícitamente en todas las respuestas
   - Disponible tanto en Supabase como en Prisma

### **Performance:**
- El límite de 1000 tickets es suficiente para la mayoría de proyectos
- Si un proyecto tiene más de 1000 tickets, considerar:
  - Paginación adicional
  - Filtros más específicos
  - Virtualización en el frontend

### **Información del Usuario Asignado:**
- `asignadoNombre` se obtiene del objeto `asignado` (relación con tabla `users`)
- Si no hay usuario asignado, `asignadoNombre` será `null`
- Disponible tanto en Supabase como en Prisma

---

**Última actualización:** Diciembre 2024  
**Estado:** ✅ Implementación Completa - Backend y Frontend listos
