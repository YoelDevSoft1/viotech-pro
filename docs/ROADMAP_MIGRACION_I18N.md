# 🌍 Roadmap Completo de Migración a Internacionalización (i18n)

## 📋 Resumen Ejecutivo

Este documento describe el plan completo para migrar VioTech Pro a un sistema de internacionalización completo usando `next-intl`, permitiendo soporte para Español, Inglés y Portugués.

**Estado Actual:** Infraestructura base creada, pendiente activación  
**Objetivo:** Migración gradual sin interrumpir funcionalidad existente  
**Tiempo Estimado:** 2-3 sprints (4-6 semanas)

---

## 🎯 Estrategia de Migración

### **Enfoque: Migración Gradual por Fases**

Optamos por una **migración gradual** en lugar de una reestructuración completa para:
- ✅ Minimizar riesgo de romper funcionalidad existente
- ✅ Permitir testing incremental
- ✅ Mantener el proyecto funcional durante la migración
- ✅ Facilitar rollback si es necesario

---

## 📊 Fases de Migración

### **FASE 1: Preparación y Configuración** ✅ COMPLETADA

**Objetivo:** Establecer infraestructura base sin afectar código existente

**Tareas:**
- [x] Instalar `next-intl`
- [x] Crear archivos de traducción base (ES, EN, PT)
- [x] Configurar `i18n.ts`
- [x] Crear componente `LocaleSelector`
- [x] Crear hook `useI18n` con utilidades
- [x] Middleware deshabilitado (se activará en Fase 2)

**Archivos Creados:**
- ✅ `i18n.ts`
- ✅ `messages/es.json`, `messages/en.json`, `messages/pt.json`
- ✅ `components/i18n/LocaleSelector.tsx`
- ✅ `lib/hooks/useI18n.ts`
- ✅ `middleware.ts` (deshabilitado)

**Estado:** ✅ Completado

---

### **FASE 2: Migración de Componentes Base**

**Objetivo:** Migrar componentes compartidos y UI base

**Prioridad:** ALTA - Estos componentes se usan en toda la aplicación

#### **2.1 Componentes UI Base**

**Componentes a Migrar:**
1. `components/ui/button.tsx` - Textos de botones
2. `components/ui/dialog.tsx` - Títulos y acciones
3. `components/ui/alert.tsx` - Mensajes de alerta
4. `components/dashboard/header-content.tsx` - Header principal
5. `components/dashboard/app-sidebar.tsx` - Navegación

**Ejemplo de Migración:**

**Antes:**
```tsx
<Button>Guardar</Button>
```

**Después:**
```tsx
import { useTranslations } from "next-intl";

const t = useTranslations("common");
<Button>{t("save")}</Button>
```

**Checklist:**
- [ ] Migrar `components/ui/button.tsx`
- [ ] Migrar `components/ui/dialog.tsx`
- [ ] Migrar `components/ui/alert.tsx`
- [ ] Migrar `components/dashboard/header-content.tsx`
- [ ] Migrar `components/dashboard/app-sidebar.tsx`
- [ ] Actualizar `messages/*.json` con nuevas claves

**Tiempo Estimado:** 1 semana

---

#### **2.2 Componentes de Formularios**

**Componentes a Migrar:**
1. `components/tickets/CreateTicketDialog.tsx`
2. `components/tickets/EditTicketDialog.tsx`
3. `components/projects/CreateProjectDialog.tsx`
4. Formularios de autenticación (`app/(auth)/login/page.tsx`)

**Checklist:**
- [ ] Migrar formularios de tickets
- [ ] Migrar formularios de proyectos
- [ ] Migrar formularios de autenticación
- [ ] Actualizar traducciones

**Tiempo Estimado:** 1 semana

---

### **FASE 3: Migración de Páginas por Prioridad**

**Objetivo:** Migrar páginas una por una, empezando por las más importantes

#### **3.1 Páginas de Marketing (Prioridad: MEDIA)**

**Páginas:**
1. `app/(marketing)/page.tsx` - Landing page
2. `app/(marketing)/about/page.tsx` - Sobre nosotros
3. `app/(marketing)/services/page.tsx` - Servicios
4. `app/(marketing)/services/catalog/page.tsx` - Catálogo

**Orden de Migración:**
1. Landing page (más visible)
2. About (contenido estático)
3. Services (contenido dinámico)
4. Catalog (más complejo)

**Checklist:**
- [ ] Migrar landing page
- [ ] Migrar página About
- [ ] Migrar página Services
- [ ] Migrar página Catalog
- [ ] Testing de todas las páginas

**Tiempo Estimado:** 1 semana

---

#### **3.2 Páginas de Cliente (Prioridad: ALTA)**

**Páginas:**
1. `app/(client)/client/dashboard/page.tsx` - Dashboard cliente
2. `app/(client)/client/tickets/page.tsx` - Tickets cliente
3. `app/(client)/client/tickets/[id]/page.tsx` - Detalle ticket
4. `app/(client)/client/profile/page.tsx` - Perfil

**Orden de Migración:**
1. Dashboard (más usado)
2. Tickets (funcionalidad core)
3. Detalle ticket
4. Perfil

**Checklist:**
- [ ] Migrar dashboard cliente
- [ ] Migrar lista de tickets
- [ ] Migrar detalle de ticket
- [ ] Migrar perfil
- [ ] Testing completo

**Tiempo Estimado:** 1 semana

---

#### **3.3 Páginas Internas (Prioridad: ALTA)**

**Páginas:**
1. `app/(ops-internal)/internal/projects/page.tsx` - Proyectos
2. `app/(ops-internal)/internal/projects/[id]/page.tsx` - Detalle proyecto
3. `app/(ops-internal)/internal/projects/[id]/kanban/page.tsx` - Kanban
4. `app/(ops-internal)/internal/projects/[id]/gantt/page.tsx` - Gantt
5. `app/(ops-internal)/internal/tickets/page.tsx` - Tickets internos

**Orden de Migración:**
1. Lista de proyectos
2. Detalle de proyecto
3. Kanban (más complejo)
4. Gantt (más complejo)
5. Tickets internos

**Checklist:**
- [ ] Migrar lista de proyectos
- [ ] Migrar detalle de proyecto
- [ ] Migrar vista Kanban
- [ ] Migrar vista Gantt
- [ ] Migrar tickets internos
- [ ] Testing completo

**Tiempo Estimado:** 1.5 semanas

---

#### **3.4 Páginas de Administración (Prioridad: MEDIA)**

**Páginas:**
1. `app/(ops-admin)/admin/page.tsx` - Dashboard admin
2. `app/(ops-admin)/admin/users/page.tsx` - Usuarios
3. `app/(ops-admin)/admin/tickets/page.tsx` - Tickets admin
4. `app/(ops-admin)/admin/services/page.tsx` - Servicios admin

**Checklist:**
- [ ] Migrar dashboard admin
- [ ] Migrar gestión de usuarios
- [ ] Migrar tickets admin
- [ ] Migrar servicios admin
- [ ] Testing completo

**Tiempo Estimado:** 1 semana

---

#### **3.5 Páginas de Funcionalidades Nuevas (Prioridad: ALTA)**

**Páginas:**
1. `app/(ops-internal)/internal/notifications/page.tsx` - Notificaciones
2. `app/(ops-internal)/internal/audit-log/page.tsx` - Audit Log
3. `app/(ops-internal)/internal/reports/page.tsx` - Reportes
4. `app/(ops-internal)/internal/resources/page.tsx` - Recursos
5. `app/(ops-internal)/internal/onboarding/page.tsx` - Onboarding
6. `app/(ops-internal)/internal/settings/customization/page.tsx` - Personalización

**Orden de Migración:**
1. Notificaciones (más usado)
2. Audit Log
3. Reportes
4. Recursos
5. Onboarding
6. Personalización

**Checklist:**
- [ ] Migrar notificaciones
- [ ] Migrar audit log
- [ ] Migrar reportes
- [ ] Migrar recursos
- [ ] Migrar onboarding
- [ ] Migrar personalización
- [ ] Testing completo

**Tiempo Estimado:** 1.5 semanas

---

### **FASE 4: Activación de Middleware y Routing**

**Objetivo:** Activar middleware de next-intl y configurar routing con locales

**Tareas:**
1. **Reestructurar rutas (Opcional - Estrategia A):**
   - Mover páginas a `app/[locale]/...`
   - Actualizar todas las referencias
   - Configurar redirects

2. **O mantener estructura actual (Estrategia B):**
   - Usar middleware sin prefijos de URL
   - Locale se maneja por cookie/preferencias
   - Menos SEO-friendly pero más simple

**Recomendación:** Empezar con Estrategia B, migrar a A si es necesario

**Checklist:**
- [ ] Decidir estrategia (A o B)
- [ ] Activar middleware gradualmente
- [ ] Configurar detección automática de idioma
- [ ] Testing de routing
- [ ] Validar SEO (si usa Estrategia A)

**Tiempo Estimado:** 1 semana

---

### **FASE 5: Completar Traducciones**

**Objetivo:** Asegurar que todas las traducciones estén completas

**Tareas:**
1. Revisar todas las claves de traducción
2. Completar traducciones faltantes
3. Validar calidad de traducciones
4. Agregar traducciones de contenido dinámico (backend)

**Checklist:**
- [ ] Auditar todas las claves de traducción
- [ ] Completar ES (100%)
- [ ] Completar EN (100%)
- [ ] Completar PT (100%)
- [ ] Revisión de calidad
- [ ] Testing con usuarios nativos

**Tiempo Estimado:** 1 semana

---

### **FASE 6: Optimización y Testing Final**

**Objetivo:** Optimizar rendimiento y realizar testing completo

**Tareas:**
1. Optimizar carga de traducciones
2. Testing de todas las funcionalidades
3. Testing de cambio de idioma
4. Validar formato de fechas/números
5. Testing de SEO (si aplica)

**Checklist:**
- [ ] Optimizar bundle size
- [ ] Testing funcional completo
- [ ] Testing de cambio de idioma
- [ ] Validar formatos regionales
- [ ] Testing de SEO
- [ ] Documentación final

**Tiempo Estimado:** 1 semana

---

## 📝 Guía de Migración por Componente

### **Paso 1: Identificar Textos a Traducir**

```tsx
// ANTES
<h1>Dashboard</h1>
<p>Bienvenido a tu panel de control</p>
<Button>Guardar</Button>

// DESPUÉS
import { useTranslations } from "next-intl";

const t = useTranslations("dashboard");
<h1>{t("title")}</h1>
<p>{t("description")}</p>
<Button>{t("save")}</Button>
```

### **Paso 2: Agregar Claves a Archivos de Traducción**

```json
// messages/es.json
{
  "dashboard": {
    "title": "Dashboard",
    "description": "Bienvenido a tu panel de control",
    "save": "Guardar"
  }
}

// messages/en.json
{
  "dashboard": {
    "title": "Dashboard",
    "description": "Welcome to your control panel",
    "save": "Save"
  }
}
```

### **Paso 3: Usar Hook useI18n para Formateo**

```tsx
import { useI18n } from "@/lib/hooks/useI18n";

const { formatDate, formatCurrency, formatNumber } = useI18n();

// Formatear fecha
<span>{formatDate(new Date(), "PP")}</span>

// Formatear moneda
<span>{formatCurrency(1000000, "COP")}</span>

// Formatear número
<span>{formatNumber(1234.56)}</span>
```

---

## 🗂️ Estructura de Claves de Traducción

### **Organización Propuesta:**

```json
{
  "common": {
    "welcome": "...",
    "loading": "...",
    "save": "...",
    "cancel": "..."
  },
  "navigation": {
    "dashboard": "...",
    "projects": "...",
    "tickets": "..."
  },
  "dashboard": {
    "title": "...",
    "kpis": {
      "activeProjects": "...",
      "openTickets": "..."
    }
  },
  "projects": {
    "title": "...",
    "create": "...",
    "status": {
      "active": "...",
      "completed": "..."
    }
  },
  "tickets": {
    "title": "...",
    "create": "...",
    "status": {
      "open": "...",
      "resolved": "..."
    }
  },
  "errors": {
    "notFound": "...",
    "unauthorized": "...",
    "serverError": "..."
  },
  "validation": {
    "required": "...",
    "email": "...",
    "minLength": "..."
  }
}
```

---

## 🔄 Orden de Prioridad de Migración

### **Prioridad ALTA (Semanas 1-2):**
1. ✅ Componentes UI base (Button, Dialog, Alert)
2. ✅ Dashboard cliente
3. ✅ Lista de tickets (cliente e interno)
4. ✅ Lista de proyectos
5. ✅ Notificaciones

### **Prioridad MEDIA (Semanas 3-4):**
1. Formularios (Create/Edit dialogs)
2. Vista Kanban
3. Vista Gantt
4. Reportes
5. Recursos

### **Prioridad BAJA (Semanas 5-6):**
1. Páginas de marketing
2. Páginas de administración
3. Onboarding
4. Personalización

---

## 🧪 Estrategia de Testing

### **Testing por Fase:**

**Fase 2 (Componentes Base):**
- [ ] Verificar que botones muestran texto correcto
- [ ] Verificar que diálogos funcionan
- [ ] Verificar que alertas se muestran

**Fase 3 (Páginas):**
- [ ] Testing de cada página migrada
- [ ] Verificar cambio de idioma funciona
- [ ] Verificar formato de fechas/números
- [ ] Verificar que no hay textos hardcodeados

**Fase 4 (Routing):**
- [ ] Verificar routing con locales
- [ ] Verificar detección automática
- [ ] Verificar persistencia de preferencia

**Fase 5 (Traducciones):**
- [ ] Revisar todas las traducciones
- [ ] Testing con usuarios nativos
- [ ] Validar contexto y tono

**Fase 6 (Final):**
- [ ] Testing end-to-end completo
- [ ] Performance testing
- [ ] SEO testing (si aplica)

---

## 📊 Métricas de Éxito

### **Cobertura de Traducción:**
- [ ] 100% de componentes UI base traducidos
- [ ] 100% de páginas principales traducidas
- [ ] 100% de mensajes de error traducidos
- [ ] 100% de validaciones traducidas

### **Calidad:**
- [ ] Todas las traducciones revisadas por nativos
- [ ] Contexto y tono apropiados
- [ ] Consistencia en terminología

### **Funcionalidad:**
- [ ] Cambio de idioma funciona en todas las páginas
- [ ] Formato de fechas/números correcto por región
- [ ] No hay textos hardcodeados visibles
- [ ] Performance no degradado

---

## 🚨 Riesgos y Mitigación

### **Riesgo 1: Romper Funcionalidad Existente**
**Mitigación:**
- Migración gradual página por página
- Testing exhaustivo después de cada migración
- Branch separado para i18n
- Rollback plan listo

### **Riesgo 2: Pérdida de SEO**
**Mitigación:**
- Usar Estrategia A (prefijos de URL) si SEO es crítico
- Implementar hreflang tags
- Mantener URLs canónicas

### **Riesgo 3: Aumento de Bundle Size**
**Mitigación:**
- Lazy loading de traducciones
- Code splitting por locale
- Optimizar archivos JSON

### **Riesgo 4: Traducciones Incompletas**
**Mitigación:**
- Checklist de cobertura
- Fallback a español si falta traducción
- Sistema de alertas para traducciones faltantes

---

## 📅 Timeline Estimado

| Fase | Duración | Estado |
|------|----------|--------|
| Fase 1: Preparación | 1 semana | ✅ Completada |
| Fase 2: Componentes Base | 1 semana | ⏳ Pendiente |
| Fase 3: Páginas (Alta Prioridad) | 2 semanas | ⏳ Pendiente |
| Fase 3: Páginas (Media Prioridad) | 1.5 semanas | ⏳ Pendiente |
| Fase 3: Páginas (Baja Prioridad) | 1 semana | ⏳ Pendiente |
| Fase 4: Routing | 1 semana | ⏳ Pendiente |
| Fase 5: Traducciones | 1 semana | ⏳ Pendiente |
| Fase 6: Testing Final | 1 semana | ⏳ Pendiente |
| **TOTAL** | **9.5 semanas** | |

---

## 🔧 Herramientas y Utilidades

### **Scripts Útiles:**

**1. Buscar textos hardcodeados:**
```bash
# Buscar strings en español que deberían estar traducidos
grep -r "Bienvenido\|Guardar\|Cancelar" app/ components/
```

**2. Validar claves de traducción:**
```typescript
// Script para verificar que todas las claves existen en todos los idiomas
// (crear en scripts/validate-translations.ts)
```

**3. Extraer textos automáticamente:**
```bash
# Usar herramienta para extraer textos de componentes
# (investigar herramientas como i18next-scanner)
```

---

## 📚 Recursos y Referencias

### **Documentación:**
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

### **Mejores Prácticas:**
- Usar claves descriptivas y anidadas
- Mantener consistencia en terminología
- Evitar concatenación de strings
- Usar pluralización cuando sea necesario

---

## ✅ Checklist de Inicio

Antes de comenzar la migración:

- [x] Infraestructura base creada
- [ ] Equipo de traducción asignado
- [ ] Herramientas de testing configuradas
- [ ] Branch de desarrollo creado
- [ ] Plan de comunicación establecido
- [ ] Métricas de progreso definidas

---

## 🎯 Próximos Pasos Inmediatos

1. **Decidir estrategia de routing** (A o B)
2. **Asignar recursos** para traducción
3. **Comenzar Fase 2** - Migrar componentes UI base
4. **Establecer proceso** de revisión de traducciones
5. **Configurar CI/CD** para validar traducciones

---

**Última actualización:** Diciembre 2024  
**Estado:** 📋 Roadmap completo - Listo para comenzar migración

