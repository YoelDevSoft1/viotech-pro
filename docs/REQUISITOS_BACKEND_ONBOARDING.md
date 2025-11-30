# 🎯 Requisitos Backend: Onboarding Inteligente

## 🎯 Objetivo

Implementar un sistema completo de onboarding que guíe a los usuarios nuevos a través de la plataforma, mejore la adopción de funcionalidades y reduzca el tiempo de configuración inicial.

---

## 📊 Endpoints Requeridos

### **1. GET /api/onboarding/progress**
Obtener el progreso de onboarding del usuario actual.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "userId": "user-id",
    "role": "client",
    "toursCompleted": ["tour-1", "tour-2"],
    "checklistProgress": 75,
    "currentTour": null,
    "skippedTours": [],
    "lastActiveAt": "2024-12-01T10:00:00.000Z"
  }
}
```

---

### **2. GET /api/onboarding/checklist**
Obtener la checklist de onboarding del usuario.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "checklist-id",
    "userId": "user-id",
    "role": "client",
    "items": [
      {
        "id": "item-1",
        "title": "Completar perfil",
        "description": "Agrega tu información personal y foto de perfil",
        "completed": false,
        "actionUrl": "/profile",
        "actionLabel": "Ir a perfil",
        "category": "profile",
        "required": true,
        "order": 1
      }
    ],
    "completed": false,
    "completedAt": null,
    "progress": 25
  }
}
```

**Lógica:**
- Generar checklist según el rol del usuario
- Calcular progreso basado en items completados
- Incluir items requeridos y opcionales

---

### **3. POST /api/onboarding/checklist/:itemId/complete**
Marcar un item de checklist como completado.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "itemId": "item-1",
    "completed": true,
    "updatedAt": "2024-12-01T10:00:00.000Z"
  }
}
```

---

### **4. GET /api/onboarding/tours**
Obtener tours disponibles para el usuario.

**Query Parameters:**
- `role` (opcional) - Filtrar por rol

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "tour-dashboard",
      "name": "Tour del Dashboard",
      "description": "Aprende a navegar por el dashboard principal",
      "steps": [
        {
          "id": "step-1",
          "target": "#dashboard-header",
          "title": "Bienvenido al Dashboard",
          "content": "Este es tu centro de control principal",
          "placement": "bottom"
        }
      ],
      "role": "client",
      "enabled": true
    }
  ]
}
```

**Lógica:**
- Filtrar tours por rol del usuario
- Solo retornar tours habilitados
- Incluir todos los pasos del tour

---

### **5. POST /api/onboarding/tours/:tourId/complete**
Marcar un tour como completado o saltado.

**Body:**
```json
{
  "skipped": false
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "tourId": "tour-dashboard",
    "completed": true,
    "skipped": false,
    "completedAt": "2024-12-01T10:00:00.000Z"
  }
}
```

---

### **6. GET /api/onboarding/config**
Obtener configuración de onboarding del usuario.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "userId": "user-id",
    "role": "client",
    "skipOnboarding": false,
    "showTips": true,
    "showChecklist": true,
    "autoStartTour": "tour-dashboard"
  }
}
```

---

### **7. PUT /api/onboarding/config**
Actualizar configuración de onboarding.

**Body:**
```json
{
  "skipOnboarding": false,
  "showTips": true,
  "showChecklist": true,
  "autoStartTour": "tour-dashboard"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "userId": "user-id",
    "role": "client",
    "skipOnboarding": false,
    "showTips": true,
    "showChecklist": true,
    "autoStartTour": "tour-dashboard"
  }
}
```

---

## 🗄️ Estructura de Base de Datos

### **Tabla: `onboarding_progress`**
```sql
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  tours_completed TEXT[] DEFAULT '{}',
  checklist_progress INTEGER DEFAULT 0 CHECK (checklist_progress >= 0 AND checklist_progress <= 100),
  current_tour TEXT,
  skipped_tours TEXT[] DEFAULT '{}',
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### **Tabla: `onboarding_checklist_items`**
```sql
CREATE TABLE onboarding_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  action_url TEXT,
  action_label VARCHAR(100),
  category VARCHAR(50) NOT NULL CHECK (category IN ('profile', 'organization', 'features', 'settings', 'other')),
  required BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Tabla: `onboarding_tours`**
```sql
CREATE TABLE onboarding_tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  steps JSONB NOT NULL,
  role VARCHAR(50) CHECK (role IN ('client', 'internal', 'admin', 'all')),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Tabla: `onboarding_config`**
```sql
CREATE TABLE onboarding_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  skip_onboarding BOOLEAN DEFAULT false,
  show_tips BOOLEAN DEFAULT true,
  show_checklist BOOLEAN DEFAULT true,
  auto_start_tour TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

---

## 🔧 Lógica de Negocio

### **1. Generación de Checklist**

La checklist se genera automáticamente según el rol:

**Cliente:**
- Completar perfil (requerido)
- Configurar organización (requerido)
- Explorar dashboard (opcional)
- Crear primer ticket (opcional)
- Configurar notificaciones (opcional)

**Agente/Admin:**
- Completar perfil (requerido)
- Configurar disponibilidad (requerido)
- Explorar panel de administración (opcional)
- Revisar proyectos activos (opcional)
- Configurar skills y certificaciones (opcional)

### **2. Tours Predefinidos**

**Tour Dashboard (Cliente):**
- Header y navegación
- KPIs principales
- Servicios activos
- Tickets recientes
- Roadmap

**Tour Panel Admin:**
- Dashboard administrativo
- Gestión de usuarios
- Gestión de servicios
- Health check
- Configuración

**Tour Panel Interno:**
- Proyectos
- Kanban board
- Gantt charts
- Recursos
- Reportes

### **3. Cálculo de Progreso**

- **Checklist Progress:** `(items completados / total items) * 100`
- **Tour Progress:** `(tours completados / total tours) * 20` (máximo 20 puntos)
- **Total Progress:** `(checklistProgress + tourProgress) / 2`

### **4. Auto-inicio de Tours**

- Si `autoStartTour` está configurado y el usuario no ha completado ese tour
- Esperar 1 segundo después de cargar la página
- Iniciar el tour automáticamente

---

## 📝 Permisos y Seguridad

### **Todos los endpoints:**
- ✅ Requieren autenticación
- ✅ Solo el usuario puede ver/modificar su propio progreso
- ✅ Admin puede ver progreso de todos los usuarios (futuro)

---

## 🚀 Integración con Sistema Existente

- ✅ Usa tabla `users` existente
- ✅ Respeta roles del sistema
- ✅ Compatible con sistema de organizaciones
- ✅ Integra con rutas existentes para `actionUrl`

---

## ✅ Checklist de Implementación

- [ ] Crear tabla `onboarding_progress`
- [ ] Crear tabla `onboarding_checklist_items`
- [ ] Crear tabla `onboarding_tours`
- [ ] Crear tabla `onboarding_config`
- [ ] Implementar `GET /api/onboarding/progress`
- [ ] Implementar `GET /api/onboarding/checklist`
- [ ] Implementar `POST /api/onboarding/checklist/:itemId/complete`
- [ ] Implementar `GET /api/onboarding/tours`
- [ ] Implementar `POST /api/onboarding/tours/:tourId/complete`
- [ ] Implementar `GET /api/onboarding/config`
- [ ] Implementar `PUT /api/onboarding/config`
- [ ] Implementar generación automática de checklist por rol
- [ ] Implementar tours predefinidos
- [ ] Implementar cálculo de progreso
- [ ] Integrar rutas en `index.cjs`
- [ ] Documentación Swagger

---

**Última actualización:** Diciembre 2024  
**Estado:** 📋 Requisitos definidos - Pendiente implementación backend

