# 📊 Requisitos Backend: Gestión de Recursos

## 🎯 Objetivo

Implementar un sistema completo de gestión de recursos que permita:
- Gestionar disponibilidad de recursos (usuarios)
- Calcular carga de trabajo
- Detectar conflictos de asignación
- Gestionar skills y certificaciones
- Gestionar vacaciones y ausencias

---

## 📊 Endpoints Requeridos

### **1. GET /api/resources**
Obtener lista de recursos (usuarios con información de disponibilidad).

**Query Parameters:**
- `organizationId` (opcional) - Filtrar por organización
- `role` (opcional) - Filtrar por rol
- `availability` (opcional) - Filtrar por estado de disponibilidad
- `skill` (opcional) - Filtrar por skill
- `search` (opcional) - Búsqueda por nombre o email

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "Juan Pérez",
      "userEmail": "juan@example.com",
      "avatar": "https://...",
      "role": "agente",
      "organizationId": "uuid",
      "availability": {
        "status": "available",
        "workingHours": {
          "start": "09:00",
          "end": "18:00",
          "timezone": "America/Bogota"
        },
        "workingDays": [1, 2, 3, 4, 5],
        "vacations": [],
        "customUnavailable": []
      },
      "skills": [...],
      "certifications": [...],
      "currentWorkload": 75,
      "maxWorkload": 100
    }
  ]
}
```

---

### **2. GET /api/resources/:id**
Obtener un recurso específico.

**Respuesta:** Mismo formato que el item del array anterior.

---

### **3. GET /api/resources/:id/workload**
Obtener carga de trabajo de un recurso en un período.

**Query Parameters:**
- `startDate` (requerido) - Fecha de inicio (ISO date)
- `endDate` (requerido) - Fecha de fin (ISO date)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "resourceId": "uuid",
    "resourceName": "Juan Pérez",
    "period": {
      "start": "2024-12-01",
      "end": "2024-12-07"
    },
    "dailyWorkload": [
      {
        "date": "2024-12-01",
        "hours": 8,
        "tasks": ["task-id-1", "task-id-2"],
        "utilization": 100
      }
    ],
    "totalHours": 40,
    "averageUtilization": 100,
    "maxUtilization": 100,
    "conflicts": [
      {
        "id": "uuid",
        "date": "2024-12-01",
        "type": "overallocation",
        "severity": "error",
        "message": "Recurso sobreasignado: 10 horas asignadas, máximo 8 horas",
        "tasks": ["task-id-1", "task-id-2"],
        "suggestedResolution": "Redistribuir tareas o extender fechas"
      }
    ]
  }
}
```

**Lógica:**
- Calcular horas asignadas por día basado en tareas asignadas al recurso
- Detectar conflictos:
  - **overallocation**: Horas asignadas > horas disponibles
  - **double_booking**: Misma tarea asignada a múltiples recursos en mismo horario
  - **unavailable**: Tarea asignada en día de vacación o fuera de horario

---

### **4. GET /api/resources/calendar**
Obtener eventos del calendario para múltiples recursos.

**Query Parameters:**
- `resourceIds` (requerido) - IDs separados por coma
- `startDate` (requerido) - Fecha de inicio (ISO date)
- `endDate` (requerido) - Fecha de fin (ISO date)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "resourceId": "uuid",
      "resourceName": "Juan Pérez",
      "type": "task",
      "title": "Implementar feature X",
      "start": "2024-12-01T09:00:00.000Z",
      "end": "2024-12-01T17:00:00.000Z",
      "color": "#3b82f6",
      "taskId": "uuid",
      "description": "..."
    },
    {
      "id": "uuid",
      "resourceId": "uuid",
      "resourceName": "Juan Pérez",
      "type": "vacation",
      "title": "Vacaciones",
      "start": "2024-12-15T00:00:00.000Z",
      "end": "2024-12-20T23:59:59.999Z",
      "color": "#f97316",
      "vacationId": "uuid"
    }
  ]
}
```

**Lógica:**
- Obtener tareas asignadas a los recursos en el período
- Obtener vacaciones de los recursos en el período
- Obtener períodos de no disponibilidad
- Convertir a eventos de calendario

---

### **5. POST /api/resources/:id/vacations**
Crear una vacación para un recurso.

**Body:**
```json
{
  "startDate": "2024-12-15",
  "endDate": "2024-12-20",
  "type": "vacation",
  "description": "Vacaciones de fin de año"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "startDate": "2024-12-15",
    "endDate": "2024-12-20",
    "type": "vacation",
    "description": "Vacaciones de fin de año",
    "approved": false,
    "createdAt": "2024-12-01T00:00:00.000Z"
  }
}
```

---

### **6. PUT /api/resources/:id/vacations/:vacationId**
Actualizar una vacación.

**Body:** Mismos campos que POST (todos opcionales).

---

### **7. DELETE /api/resources/:id/vacations/:vacationId**
Eliminar una vacación.

---

### **8. POST /api/resources/:id/skills**
Agregar un skill a un recurso.

**Body:**
```json
{
  "name": "React",
  "category": "Programming",
  "level": "advanced",
  "yearsOfExperience": 3
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "React",
    "category": "Programming",
    "level": "advanced",
    "yearsOfExperience": 3,
    "verified": false
  }
}
```

---

### **9. POST /api/resources/:id/certifications**
Agregar una certificación a un recurso.

**Body:**
```json
{
  "name": "AWS Certified Solutions Architect",
  "issuer": "AWS",
  "issueDate": "2024-01-15",
  "expiryDate": "2027-01-15",
  "credentialId": "ABC123XYZ",
  "credentialUrl": "https://..."
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "AWS Certified Solutions Architect",
    "issuer": "AWS",
    "issueDate": "2024-01-15",
    "expiryDate": "2027-01-15",
    "credentialId": "ABC123XYZ",
    "credentialUrl": "https://...",
    "verified": false
  }
}
```

---

### **10. PUT /api/resources/:id/availability**
Actualizar disponibilidad de un recurso.

**Body:**
```json
{
  "status": "available",
  "workingHours": {
    "start": "09:00",
    "end": "18:00",
    "timezone": "America/Bogota"
  },
  "workingDays": [1, 2, 3, 4, 5]
}
```

**Respuesta:** Recurso actualizado.

---

## 🗄️ Estructura de Base de Datos

### **Tabla: `resource_availability`**
```sql
CREATE TABLE resource_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'unavailable', 'on_leave')),
  working_hours_start TIME DEFAULT '09:00:00',
  working_hours_end TIME DEFAULT '18:00:00',
  working_hours_timezone VARCHAR(50) DEFAULT 'America/Bogota',
  working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
  max_workload INTEGER DEFAULT 100 CHECK (max_workload >= 0 AND max_workload <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### **Tabla: `resource_vacations`**
```sql
CREATE TABLE resource_vacations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('vacation', 'sick_leave', 'personal', 'other')),
  description TEXT,
  approved BOOLEAN DEFAULT false,
  approved_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_date >= start_date)
);
```

### **Tabla: `resource_skills`**
```sql
CREATE TABLE resource_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_of_experience INTEGER,
  verified BOOLEAN DEFAULT false,
  verified_by TEXT REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Tabla: `resource_certifications`**
```sql
CREATE TABLE resource_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  issuer VARCHAR(100) NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  credential_id VARCHAR(255),
  credential_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔧 Lógica de Negocio

### **1. Cálculo de Carga de Trabajo**

Para cada día en el período:
1. Obtener todas las tareas asignadas al recurso que se solapan con ese día
2. Calcular horas asignadas basado en:
   - `estimatedDuration` de la tarea (si está en horas)
   - O duración estimada basada en fechas de inicio/fin
3. Calcular horas disponibles:
   - Horas de trabajo del día (ej: 8 horas)
   - Menos horas de vacaciones si aplica
4. Calcular utilización: `(horas asignadas / horas disponibles) * 100`
5. Detectar conflictos:
   - Si `utilization > 100`: overallocation
   - Si hay solapamiento de tareas: double_booking
   - Si tarea está en día de vacación: unavailable

### **2. Detección de Conflictos**

**Overallocation:**
- Horas asignadas > horas disponibles en el día
- Severidad: "error"
- Mensaje: "Recurso sobreasignado: X horas asignadas, máximo Y horas"

**Double Booking:**
- Misma tarea asignada a múltiples recursos en mismo horario
- Severidad: "warning"
- Mensaje: "Tarea asignada a múltiples recursos en mismo horario"

**Unavailable:**
- Tarea asignada en día de vacación o fuera de horario
- Severidad: "error"
- Mensaje: "Tarea asignada en período de no disponibilidad"

### **3. Calendario de Recursos**

Generar eventos para:
- **Tareas:** Basado en tareas asignadas al recurso
- **Vacaciones:** Basado en `resource_vacations`
- **No disponible:** Basado en `customUnavailable` (futuro)

---

## 📝 Permisos y Seguridad

### **GET /api/resources**
- ✅ Requiere autenticación
- ✅ Cliente solo ve recursos de su organización
- ✅ Agente/admin ven todos los recursos

### **GET /api/resources/:id/workload**
- ✅ Requiere autenticación
- ✅ Solo el propio recurso, admin o agente pueden ver

### **POST/PUT/DELETE /api/resources/:id/vacations**
- ✅ Requiere autenticación
- ✅ Solo el propio recurso, admin o agente pueden gestionar

### **POST /api/resources/:id/skills**
- ✅ Requiere autenticación
- ✅ Solo el propio recurso, admin o agente pueden agregar

### **PUT /api/resources/:id/availability**
- ✅ Requiere autenticación
- ✅ Solo el propio recurso, admin o agente pueden actualizar

---

## 🚀 Integración con Sistema Existente

- ✅ Usa tabla `users` existente
- ✅ Integra con sistema de tickets (para calcular carga de trabajo)
- ✅ Integra con sistema de proyectos (para asignaciones)
- ✅ Compatible con sistema de organizaciones

---

## ✅ Checklist de Implementación

- [ ] Crear tabla `resource_availability`
- [ ] Crear tabla `resource_vacations`
- [ ] Crear tabla `resource_skills`
- [ ] Crear tabla `resource_certifications`
- [ ] Implementar `GET /api/resources`
- [ ] Implementar `GET /api/resources/:id`
- [ ] Implementar `GET /api/resources/:id/workload`
- [ ] Implementar `GET /api/resources/calendar`
- [ ] Implementar `POST /api/resources/:id/vacations`
- [ ] Implementar `PUT /api/resources/:id/vacations/:vacationId`
- [ ] Implementar `DELETE /api/resources/:id/vacations/:vacationId`
- [ ] Implementar `POST /api/resources/:id/skills`
- [ ] Implementar `POST /api/resources/:id/certifications`
- [ ] Implementar `PUT /api/resources/:id/availability`
- [ ] Implementar cálculo de carga de trabajo
- [ ] Implementar detección de conflictos
- [ ] Integrar rutas en `index.cjs`
- [ ] Documentación Swagger

---

**Última actualización:** Diciembre 2024  
**Estado:** 📋 Requisitos definidos - Pendiente implementación backend

