# 🎯 Implementación: Sistema de Onboarding Inteligente

## ✅ Estado: IMPLEMENTACIÓN COMPLETADA

Este documento describe la implementación completa del sistema de onboarding inteligente que guía a los usuarios nuevos a través de la plataforma, mejora la adopción de funcionalidades y reduce el tiempo de configuración inicial.

---

## 🎯 Funcionalidades Implementadas

### **1. Gestión de Progreso** ✅
- ✅ Seguimiento de tours completados
- ✅ Seguimiento de tours saltados
- ✅ Cálculo de progreso de checklist
- ✅ Tour actual activo
- ✅ Última actividad registrada

### **2. Checklist de Onboarding** ✅
- ✅ Generación automática según rol
- ✅ Items requeridos y opcionales
- ✅ Categorización (profile, organization, features, settings, other)
- ✅ Acciones con URLs y etiquetas
- ✅ Cálculo de progreso automático

### **3. Tours Interactivos** ✅
- ✅ Tours predefinidos por rol
- ✅ Pasos con targets, títulos y contenido
- ✅ Placements configurables (top, bottom, left, right)
- ✅ Tours habilitados/deshabilitados
- ✅ Filtrado por rol
- ✅ **Auto-inicio inteligente** (mejora reciente)

### **4. Configuración de Usuario** ✅
- ✅ Opción de saltar onboarding
- ✅ Mostrar/ocultar tips
- ✅ Mostrar/ocultar checklist
- ✅ Tour de auto-inicio configurable

---

## 📊 Endpoints Implementados

### **1. GET /api/onboarding/progress** ✅
Obtener progreso de onboarding del usuario actual.

**Respuesta incluye:**
- Tours completados
- Progreso de checklist
- Tour actual
- Tours saltados
- Última actividad

---

### **2. GET /api/onboarding/checklist** ✅
Obtener checklist de onboarding del usuario.

**Características:**
- Generación automática si no existe
- Cálculo de progreso
- Items ordenados por prioridad
- Información de acciones (URLs y etiquetas)

---

### **3. POST /api/onboarding/checklist/:itemId/complete** ✅
Marcar un item de checklist como completado.

**Validaciones:**
- Verifica que el item pertenezca al usuario
- Recalcula progreso automáticamente
- Actualiza progreso general

---

### **4. GET /api/onboarding/tours** ✅
Obtener tours disponibles para el usuario.

**Query Parameters:**
- `role` (opcional) - Filtrar por rol

**Características:**
- Filtrado por rol del usuario
- Solo tours habilitados
- Incluye todos los pasos del tour
- Tours predefinidos si no hay en BD

---

### **5. POST /api/onboarding/tours/:tourId/complete** ✅
Marcar un tour como completado o saltado.

**Body:**
```json
{
  "skipped": false
}
```

**Características:**
- Soporta completar o saltar
- Actualiza progreso automáticamente
- Registra fecha de completado

---

### **6. GET /api/onboarding/config** ✅
Obtener configuración de onboarding del usuario.

**Respuesta incluye:**
- skipOnboarding
- showTips
- showChecklist
- autoStartTour

---

### **7. PUT /api/onboarding/config** ✅
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

---

## 🗄️ Estructura de Base de Datos

### **Tabla: `onboarding_progress`**
- Progreso de onboarding por usuario
- Tours completados (array)
- Progreso de checklist (0-100%)
- Tour actual activo
- Tours saltados (array)

### **Tabla: `onboarding_checklist_items`**
- Items de checklist por usuario
- Categorías: profile, organization, features, settings, other
- Items requeridos y opcionales
- Orden de visualización
- Fecha de completado

### **Tabla: `onboarding_tours`**
- Tours predefinidos
- Pasos en formato JSONB
- Filtrado por rol
- Estado habilitado/deshabilitado

### **Tabla: `onboarding_config`**
- Configuración por usuario
- Preferencias de visualización
- Tour de auto-inicio

---

## 🔧 Modelos Implementados

### **1. OnboardingProgress** (`models/OnboardingProgress.js`)
- ✅ `findByUserId(userId)` - Obtener progreso
- ✅ `upsert(userId, data)` - Crear o actualizar
- ✅ `addCompletedTour(userId, tourId)` - Agregar tour completado
- ✅ `addSkippedTour(userId, tourId)` - Agregar tour saltado

### **2. OnboardingChecklist** (`models/OnboardingChecklist.js`)
- ✅ `listByUser(userId, role)` - Listar items
- ✅ `create(data)` - Crear item
- ✅ `findById(itemId)` - Obtener por ID
- ✅ `complete(itemId)` - Marcar como completado
- ✅ `createBatch(items)` - Crear múltiples items

### **3. OnboardingTour** (`models/OnboardingTour.js`)
- ✅ `list(role)` - Listar tours disponibles
- ✅ `findById(tourId)` - Obtener por ID

### **4. OnboardingConfig** (`models/OnboardingConfig.js`)
- ✅ `findByUserId(userId)` - Obtener configuración
- ✅ `upsert(userId, data)` - Crear o actualizar

---

## 🧮 Utilidades

### **`utils/onboardingChecklistGenerator.js`**

**generateChecklistForRole(userId, role)**

Genera checklist automáticamente según el rol:

**Cliente:**
1. Completar perfil (requerido)
2. Configurar organización (requerido)
3. Explorar dashboard (opcional)
4. Crear primer ticket (opcional)
5. Configurar notificaciones (opcional)

**Agente/Admin:**
1. Completar perfil (requerido)
2. Configurar disponibilidad (requerido)
3. Explorar panel de administración (opcional)
4. Revisar proyectos activos (opcional)
5. Configurar skills y certificaciones (opcional)

### **`utils/onboardingToursData.js`**

**getPredefinedTours()**

Retorna tours predefinidos:

1. **Tour del Dashboard** (Cliente)
   - Header y navegación
   - KPIs principales
   - Servicios activos
   - Tickets recientes

2. **Tour del Panel Admin** (Admin)
   - Dashboard administrativo
   - Gestión de usuarios
   - Gestión de servicios
   - Health check
   - Configuración

3. **Tour del Panel Interno** (Agente)
   - Proyectos
   - Kanban board
   - Gantt charts
   - Recursos
   - Reportes

---

## 🔄 Lógica de Negocio

### **1. Generación de Checklist**

- Se genera automáticamente al acceder por primera vez
- Basado en el rol del usuario
- Incluye items requeridos y opcionales
- Cada item tiene acción con URL y etiqueta

### **2. Cálculo de Progreso**

**Checklist Progress:**
```
progreso = (items completados / total items) * 100
```

**Tour Progress:**
- Se calcula basado en tours completados
- Máximo 20 puntos por tours

**Total Progress:**
```
progreso_total = (checklistProgress + tourProgress) / 2
```

### **3. Tours Predefinidos**

- Tours se cargan desde la base de datos
- Si no hay tours en BD, se usan tours predefinidos
- Filtrado automático por rol
- Solo tours habilitados se muestran

### **4. Auto-inicio de Tours (Mejorado)**

**Lógica implementada en `OnboardingProvider`:**

1. **Prioridad 1 - Configuración explícita:**
   - Si `autoStartTour` está configurado en la BD
   - Y el tour no está completado/saltado
   - Inicia automáticamente después de 1.5 segundos

2. **Prioridad 2 - Fallback inteligente (NUEVO):**
   - Si NO hay `autoStartTour` configurado
   - Y el usuario es nuevo (sin tours completados/saltados)
   - Inicia automáticamente el primer tour disponible para su rol
   - Esto asegura que usuarios nuevos siempre vean el tour

3. **Protecciones:**
   - No inicia si `skipOnboarding: true`
   - No inicia tours ya completados o saltados
   - Evita múltiples inicios simultáneos con `useRef`
   - Verifica que el tour esté habilitado

**Beneficios:**
- ✅ Usuarios nuevos siempre reciben el tour, incluso sin configuración del backend
- ✅ Mejor experiencia sin necesidad de configuración manual
- ✅ Compatible con configuración existente (`autoStartTour` tiene prioridad)

---

## 📝 Permisos y Seguridad

### **Todos los endpoints:**
- ✅ Requieren autenticación
- ✅ Solo el usuario puede ver/modificar su propio progreso
- ✅ Validación de pertenencia de items/tours al usuario

---

## 🚀 Integración con Sistema Existente

- ✅ Usa tabla `users` existente
- ✅ Respeta roles del sistema (cliente, agente, admin)
- ✅ Compatible con sistema de organizaciones
- ✅ Integra con rutas existentes para `actionUrl`
- ✅ Usa Supabase API REST como método principal
- ✅ Fallback a Prisma si Supabase no está disponible

---

## ✅ Checklist de Implementación

- [x] Crear tabla `onboarding_progress`
- [x] Crear tabla `onboarding_checklist_items`
- [x] Crear tabla `onboarding_tours`
- [x] Crear tabla `onboarding_config`
- [x] Implementar modelo `OnboardingProgress`
- [x] Implementar modelo `OnboardingChecklist`
- [x] Implementar modelo `OnboardingTour`
- [x] Implementar modelo `OnboardingConfig`
- [x] Implementar `GET /api/onboarding/progress`
- [x] Implementar `GET /api/onboarding/checklist`
- [x] Implementar `POST /api/onboarding/checklist/:itemId/complete`
- [x] Implementar `GET /api/onboarding/tours`
- [x] Implementar `POST /api/onboarding/tours/:tourId/complete`
- [x] Implementar `GET /api/onboarding/config`
- [x] Implementar `PUT /api/onboarding/config`
- [x] Implementar generación automática de checklist por rol
- [x] Implementar tours predefinidos
- [x] Implementar cálculo de progreso
- [x] Integrar rutas en `index.cjs`
- [x] Documentación Swagger
- [x] **Auto-inicio inteligente de tours (fallback para usuarios nuevos)**

---

## 📊 Ejemplo de Respuesta de Checklist

```json
{
  "success": true,
  "data": {
    "id": "checklist-user-123",
    "userId": "user-123",
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

---

## 🔗 Integración con Frontend

### **Flujo Recomendado:**

1. **Al iniciar sesión:**
   - Verificar `GET /api/onboarding/config`
   - Si `skipOnboarding: false`, mostrar onboarding

2. **Cargar checklist:**
   - `GET /api/onboarding/checklist`
   - Mostrar items pendientes
   - Resaltar items requeridos

3. **Auto-iniciar tour (Mejorado):**
   - **Opción A:** Si `autoStartTour` está configurado y el tour no está completado/saltado
   - **Opción B (Fallback):** Si no hay `autoStartTour` y el usuario es nuevo, iniciar primer tour disponible
   - Iniciar tour después de 1.5 segundos
   - Tour se muestra con react-joyride

4. **Completar items:**
   - Cuando el usuario completa una acción
   - Llamar `POST /api/onboarding/checklist/:itemId/complete`
   - Actualizar UI automáticamente

5. **Completar tours:**
   - Al finalizar un tour
   - Llamar `POST /api/onboarding/tours/:tourId/complete`
   - Actualizar progreso

---

## 🆕 Mejoras Recientes (Diciembre 2024)

### **Auto-inicio Inteligente de Tours**

✅ **Problema resuelto:** Los tours no se iniciaban automáticamente para usuarios nuevos si el backend no configuraba `autoStartTour`.

✅ **Solución implementada:**
- Lógica de fallback en `OnboardingProvider` que inicia automáticamente el primer tour disponible para usuarios nuevos
- Verificación de progreso para evitar iniciar tours ya completados/saltados
- Protección contra múltiples inicios simultáneos con `useRef`
- Respeta la preferencia `skipOnboarding`

✅ **Beneficios:**
- Usuarios nuevos siempre ven el tour guiado, incluso sin configuración del backend
- Mejor experiencia de usuario sin necesidad de configuración manual
- Compatible con la configuración existente (`autoStartTour` tiene prioridad)

---

**Última actualización:** Diciembre 2024  
**Estado:** ✅ Implementación Completa - Sistema funcional y listo para producción  
**Mejoras:** ✅ Auto-inicio inteligente de tours implementado

