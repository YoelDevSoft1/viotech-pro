# 🐛 Problema Reportado: Carga de Trabajo Incorrecta en Recursos

## 📋 Resumen del Problema

Los recursos que **NO tienen tareas asignadas** están mostrando un porcentaje de carga de trabajo incorrecto (ej: 28%) en lugar de mostrar **0%**.

## 🔍 Detalles Técnicos

### Endpoint Afectado
- `GET /api/resources` - Lista de recursos
- `GET /api/resources/:id` - Recurso individual

### Campo Problemático
- `currentWorkload` (o `current_workload`) está retornando un valor > 0 cuando el recurso no tiene tareas asignadas.

### Ejemplo del Problema
```json
{
  "id": "resource-id",
  "userName": "Agente Demo",
  "currentWorkload": 28,  // ❌ INCORRECTO: No hay tareas asignadas
  "maxWorkload": 100
}
```

**Debería retornar:**
```json
{
  "id": "resource-id",
  "userName": "Agente Demo",
  "currentWorkload": 0,  // ✅ CORRECTO: Sin tareas = 0%
  "maxWorkload": 100
}
```

## 🔧 Solución Temporal en Frontend

El frontend ha implementado una validación que corrige este problema:

1. **Validación contra datos de workload**: Cuando se obtienen los datos de `GET /api/resources/:id/workload`, se valida si realmente hay tareas asignadas.
2. **Corrección automática**: Si `totalHours = 0` y no hay tareas en `dailyWorkload`, el frontend fuerza `currentWorkload` a 0.

**Archivos modificados:**
- `components/resources/ResourceWorkload.tsx`
- `components/resources/ResourceSelector.tsx`
- `lib/hooks/useResources.ts`

## ✅ Solución Permanente Requerida en Backend

### 1. Validar Cálculo de `currentWorkload`

El backend debe calcular `currentWorkload` basándose en:
- **Tareas asignadas al recurso** en el período actual
- **Horas asignadas** vs **horas disponibles**
- Si **NO hay tareas asignadas** → `currentWorkload = 0`

### 2. Lógica Esperada

```javascript
// Pseudocódigo de la lógica esperada
function calculateCurrentWorkload(resourceId) {
  // Obtener tareas asignadas al recurso
  const assignedTasks = getAssignedTasks(resourceId);
  
  // Si no hay tareas, retornar 0
  if (!assignedTasks || assignedTasks.length === 0) {
    return 0;
  }
  
  // Calcular horas asignadas
  const assignedHours = assignedTasks.reduce((total, task) => {
    return total + (task.estimatedHours || 0);
  }, 0);
  
  // Calcular horas disponibles del recurso
  const availableHours = calculateAvailableHours(resourceId);
  
  // Calcular porcentaje
  const workloadPercentage = (assignedHours / availableHours) * 100;
  
  // Asegurar que no exceda 100%
  return Math.min(workloadPercentage, 100);
}
```

### 3. Validación Adicional

El backend debe asegurar que:
- Si `currentWorkload > 0`, debe haber al menos una tarea asignada
- Si no hay tareas asignadas, `currentWorkload` debe ser exactamente `0`
- El cálculo debe ser consistente con los datos retornados por `GET /api/resources/:id/workload`

## 🧪 Casos de Prueba

### Caso 1: Recurso sin tareas
```json
// Request
GET /api/resources/resource-id

// Response esperado
{
  "id": "resource-id",
  "currentWorkload": 0,  // ✅ Debe ser 0
  "maxWorkload": 100
}
```

### Caso 2: Recurso con tareas
```json
// Request
GET /api/resources/resource-id

// Response esperado
{
  "id": "resource-id",
  "currentWorkload": 45,  // ✅ Calculado correctamente
  "maxWorkload": 100
}
```

### Caso 3: Consistencia con workload endpoint
```json
// Request 1
GET /api/resources/resource-id
// Response: { "currentWorkload": 0 }

// Request 2
GET /api/resources/resource-id/workload?startDate=2025-01-01&endDate=2025-01-07
// Response: { "totalHours": 0, "dailyWorkload": [] }

// ✅ Ambos deben ser consistentes: si workload.totalHours = 0, entonces currentWorkload = 0
```

## 📝 Notas Adicionales

1. **Sincronización**: El `currentWorkload` debe estar sincronizado con los datos de `GET /api/resources/:id/workload`.
2. **Performance**: Si el cálculo es costoso, considerar cachear el resultado y actualizarlo cuando se asignen/desasignen tareas.
3. **Validación**: Agregar validación en el backend para asegurar que `currentWorkload` siempre refleje el estado real de las tareas asignadas.

## 🔗 Referencias

- Endpoint de workload: `GET /api/resources/:id/workload`
- Endpoint de recursos: `GET /api/resources` y `GET /api/resources/:id`
- Frontend validation: `components/resources/ResourceWorkload.tsx` (líneas 82-123)

---

**Fecha de reporte**: 2025-01-11  
**Prioridad**: Media-Alta (afecta la visualización correcta de datos)  
**Estado**: Solución temporal implementada en frontend, requiere corrección permanente en backend

