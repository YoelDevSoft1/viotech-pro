# 🎨 Requisitos Backend: Personalización Avanzada

## 🎯 Objetivo

Implementar un sistema completo de personalización que permita a los usuarios y organizaciones personalizar su experiencia en la plataforma, incluyendo preferencias, dashboard personalizable, branding y shortcuts de teclado.

---

## 📊 Endpoints Requeridos

### **1. GET /api/user/preferences**
Obtener preferencias del usuario actual.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "pref-id",
    "userId": "user-id",
    "theme": "system",
    "language": "es",
    "timezone": "America/Bogota",
    "dateFormat": "DD/MM/YYYY",
    "timeFormat": "24h",
    "notifications": {
      "email": true,
      "push": false,
      "inApp": true,
      "digest": false
    },
    "dashboard": {
      "layout": {
        "columns": 3,
        "rows": 4,
        "gap": 4,
        "widgetPositions": []
      },
      "widgets": [
        {
          "id": "widget-1",
          "type": "kpi",
          "title": "Tickets Activos",
          "config": {},
          "visible": true,
          "order": 0
        }
      ]
    },
    "shortcuts": {},
    "views": [],
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-01T10:00:00.000Z"
  }
}
```

---

### **2. PUT /api/user/preferences**
Actualizar preferencias del usuario.

**Body:**
```json
{
  "theme": "dark",
  "timezone": "America/Mexico_City",
  "notifications": {
    "email": true,
    "push": true
  },
  "dashboard": {
    "widgets": [...]
  }
}
```

---

### **3. GET /api/organizations/:id/branding**
Obtener branding de una organización.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "branding-id",
    "organizationId": "org-id",
    "logo": "https://...",
    "favicon": "https://...",
    "primaryColor": "#6366f1",
    "secondaryColor": "#8b5cf6",
    "accentColor": "#a78bfa",
    "fontFamily": "Inter",
    "customCss": "...",
    "enabled": true,
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-01T10:00:00.000Z"
  }
}
```

---

### **4. PUT /api/organizations/:id/branding**
Actualizar branding de una organización (solo admin de org).

**Body:**
```json
{
  "logo": "https://...",
  "primaryColor": "#6366f1",
  "enabled": true
}
```

---

### **5. POST /api/user/views**
Guardar una vista personalizada.

**Body:**
```json
{
  "name": "Tickets Urgentes",
  "type": "tickets",
  "filters": {
    "priority": "high",
    "status": "open"
  },
  "columns": ["id", "title", "priority", "status"],
  "sortBy": "createdAt",
  "sortOrder": "desc",
  "pageSize": 25
}
```

---

### **6. PUT /api/user/views/:id**
Actualizar una vista guardada.

---

### **7. DELETE /api/user/views/:id**
Eliminar una vista guardada.

---

### **8. GET /api/user/shortcuts**
Obtener shortcuts de teclado del usuario.

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "shortcut-1",
      "key": "k",
      "modifiers": ["ctrl"],
      "action": "search",
      "description": "Abrir búsqueda",
      "category": "navigation",
      "enabled": true
    }
  ]
}
```

---

### **9. PUT /api/user/shortcuts**
Actualizar shortcuts de teclado.

**Body:**
```json
{
  "shortcuts": [
    {
      "id": "shortcut-1",
      "key": "k",
      "modifiers": ["ctrl"],
      "action": "search",
      "description": "Abrir búsqueda",
      "category": "navigation",
      "enabled": true
    }
  ]
}
```

---

## 🗄️ Estructura de Base de Datos

### **Tabla: `user_preferences`**
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language VARCHAR(10) DEFAULT 'es',
  timezone VARCHAR(50) DEFAULT 'America/Bogota',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  time_format VARCHAR(10) DEFAULT '24h' CHECK (time_format IN ('12h', '24h')),
  notifications JSONB DEFAULT '{"email": true, "push": false, "inApp": true, "digest": false}',
  dashboard JSONB DEFAULT '{"layout": {"columns": 3, "rows": 4, "gap": 4, "widgetPositions": []}, "widgets": []}',
  shortcuts JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### **Tabla: `saved_views`**
```sql
CREATE TABLE saved_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('tickets', 'projects', 'resources', 'reports', 'custom')),
  filters JSONB DEFAULT '{}',
  columns TEXT[] DEFAULT '{}',
  sort_by VARCHAR(100),
  sort_order VARCHAR(10) CHECK (sort_order IN ('asc', 'desc')),
  page_size INTEGER DEFAULT 25,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Tabla: `organization_branding`**
```sql
CREATE TABLE organization_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  logo TEXT,
  favicon TEXT,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  accent_color VARCHAR(7),
  font_family VARCHAR(100),
  custom_css TEXT,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);
```

### **Tabla: `keyboard_shortcuts`**
```sql
CREATE TABLE keyboard_shortcuts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key VARCHAR(50) NOT NULL,
  modifiers TEXT[] DEFAULT '{}',
  action VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('navigation', 'actions', 'views', 'custom')),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔧 Lógica de Negocio

### **1. Preferencias de Usuario**

- Se crean automáticamente con valores por defecto al registrarse
- Se actualizan en tiempo real
- Se sincronizan entre dispositivos

### **2. Dashboard Personalizable**

- Widgets se pueden arrastrar y soltar
- Posiciones se guardan en `widgetPositions`
- Orden se guarda en `order` de cada widget
- Widgets se pueden ocultar/mostrar

### **3. Branding de Organización**

- Solo admin de organización puede editar
- Se aplica a todos los usuarios de la organización
- Colores se aplican como CSS variables
- Logo y favicon se almacenan en storage

### **4. Vistas Guardadas**

- Cada usuario puede guardar múltiples vistas
- Vistas incluyen filtros, columnas, ordenamiento
- Se pueden aplicar rápidamente desde la UI

### **5. Shortcuts de Teclado**

- Shortcuts predefinidos por defecto
- Usuarios pueden personalizar
- Se validan conflictos antes de guardar

---

## 📝 Permisos y Seguridad

### **GET/PUT /api/user/preferences**
- ✅ Requiere autenticación
- ✅ Solo el usuario puede ver/modificar sus propias preferencias

### **GET/PUT /api/organizations/:id/branding**
- ✅ Requiere autenticación
- ✅ Solo admin de organización puede editar
- ✅ Todos los usuarios de la org pueden ver

### **POST/PUT/DELETE /api/user/views**
- ✅ Requiere autenticación
- ✅ Solo el usuario puede gestionar sus propias vistas

### **GET/PUT /api/user/shortcuts**
- ✅ Requiere autenticación
- ✅ Solo el usuario puede ver/modificar sus shortcuts

---

## 🚀 Integración con Sistema Existente

- ✅ Usa tabla `users` existente
- ✅ Usa tabla `organizations` existente
- ✅ Compatible con sistema de roles
- ✅ Integra con sistema de notificaciones

---

## ✅ Checklist de Implementación

- [ ] Crear tabla `user_preferences`
- [ ] Crear tabla `saved_views`
- [ ] Crear tabla `organization_branding`
- [ ] Crear tabla `keyboard_shortcuts`
- [ ] Implementar `GET /api/user/preferences`
- [ ] Implementar `PUT /api/user/preferences`
- [ ] Implementar `GET /api/organizations/:id/branding`
- [ ] Implementar `PUT /api/organizations/:id/branding`
- [ ] Implementar `POST /api/user/views`
- [ ] Implementar `PUT /api/user/views/:id`
- [ ] Implementar `DELETE /api/user/views/:id`
- [ ] Implementar `GET /api/user/shortcuts`
- [ ] Implementar `PUT /api/user/shortcuts`
- [ ] Implementar creación automática de preferencias
- [ ] Implementar shortcuts predefinidos
- [ ] Integrar rutas en `index.cjs`
- [ ] Documentación Swagger

---

**Última actualización:** Diciembre 2024  
**Estado:** 📋 Requisitos definidos - Pendiente implementación backend

