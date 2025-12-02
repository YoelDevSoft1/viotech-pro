# 🚀 Plan de Próximos Pasos - Mejoras UX

**Fecha:** Enero 2025  
**Estado:** 📋 Planificado  
**Prioridad:** Basada en impacto y esfuerzo

---

## 📊 Resumen del Estado Actual

### ✅ Completado (Fases 1, 2 y 3)
- Empty states mejorados
- Actualización suave sin recarga
- Traducciones en payments page
- ServiceCards mejorados
- Búsqueda y filtros
- UrgencyBanner
- Estados de carga estandarizados
- Mejoras de accesibilidad básicas

### 📋 Pendiente
- Textos hardcodeados en otros componentes
- Focus management en modales
- Tour guiado de onboarding
- Optimistic updates
- Mejoras de accesibilidad avanzadas

---

## 🎯 Próximos Pasos Priorizados

### **Fase 4: Consolidación y Limpieza** (Prioridad Alta)

#### 1. **Corregir Textos Hardcodeados Restantes** 🔴
**Impacto:** Alto | **Esfuerzo:** Medio | **Tiempo:** 2-3 horas

**Archivos a revisar:**
- `components/services/ServiceGrid.tsx` - "No se encontraron servicios"
- `app/(marketing)/services/catalog/[slug]/service-detail-client.tsx` - Múltiples textos
- `components/services/ServiceCard.tsx` - Textos de duración y características
- `components/services/ServiceReviews.tsx` - Mensajes de validación

**Acciones:**
- [ ] Auditar todos los componentes de servicios
- [ ] Agregar traducciones faltantes
- [ ] Reemplazar textos hardcodeados con `useTranslationsSafe()`
- [ ] Verificar en es/en/pt

**Archivos de traducción a actualizar:**
- `messages/es.json` - Agregar claves de servicios
- `messages/en.json` - Agregar claves de servicios
- `messages/pt.json` - Agregar claves de servicios

---

#### 2. **Focus Management en Modales** 🟡
**Impacto:** Medio | **Esfuerzo:** Medio | **Tiempo:** 2-3 horas

**Componentes afectados:**
- `components/payments/CheckoutModal.tsx`
- Otros modales en la aplicación

**Mejoras:**
- [ ] Implementar `focus-trap` en modales
- [ ] Restaurar focus al elemento que abrió el modal al cerrar
- [ ] Navegación por teclado (ESC para cerrar, Tab para navegar)
- [ ] `aria-modal="true"` en contenedores de modales
- [ ] `aria-labelledby` y `aria-describedby` en modales

**Librería sugerida:**
- `@radix-ui/react-dialog` ya incluye focus management, verificar implementación
- O usar `focus-trap-react` si es necesario

---

#### 3. **Mejorar Empty States en Marketplace** 🟡
**Impacto:** Medio | **Esfuerzo:** Bajo | **Tiempo:** 1 hora

**Componentes:**
- `components/services/ServiceGrid.tsx` - Empty state simple
- `components/services/ServiceFilters.tsx` - Mensaje cuando no hay filtros

**Acciones:**
- [ ] Reemplazar empty state simple con componente `EmptyState`
- [ ] Agregar icono y acciones claras
- [ ] Traducciones completas

---

### **Fase 5: Mejoras Avanzadas** (Prioridad Media)

#### 4. **Tour Guiado de Onboarding** 🟢
**Impacto:** Alto | **Esfuerzo:** Alto | **Tiempo:** 4-6 horas

**Objetivo:** Guiar a usuarios nuevos en su primera visita al dashboard

**Características:**
- [ ] Tour opcional con React Joyride o similar
- [ ] Pasos: Dashboard → Servicios → Tickets → Configuración
- [ ] Botón "Omitir tour" siempre visible
- [ ] Guardar preferencia de usuario (no mostrar de nuevo)
- [ ] Traducciones completas

**Librería sugerida:**
- `react-joyride` o `@reactour/tour`

**Flujo:**
1. Usuario nuevo entra al dashboard
2. Modal de bienvenida: "¿Te gustaría un tour guiado?"
3. Si acepta: Tour paso a paso
4. Si omite: Guardar preferencia

---

#### 5. **Optimistic Updates en Compra** 🟢
**Impacto:** Medio | **Esfuerzo:** Medio | **Tiempo:** 3-4 horas

**Objetivo:** Mostrar cambios inmediatamente sin esperar respuesta del servidor

**Implementación:**
- [ ] Al hacer checkout, mostrar servicio como "pendiente" inmediatamente
- [ ] Si hay error, revertir y mostrar mensaje
- [ ] Actualizar lista de servicios optimísticamente
- [ ] Sincronizar con servidor en background

**Componentes:**
- `app/(client)/client/payments/page.tsx`
- `lib/hooks/useServices.ts`

**Consideraciones:**
- Requiere cambios en backend para soportar estado "pendiente"
- O usar cache de React Query con `optimisticUpdate`

---

#### 6. **Mejoras de Accesibilidad Avanzadas** 🟢
**Impacto:** Medio | **Esfuerzo:** Medio | **Tiempo:** 3-4 horas

**Mejoras:**
- [ ] Skip links para saltar navegación
- [ ] `aria-invalid` en campos de formulario con error
- [ ] `aria-describedby` para mensajes de error
- [ ] `aria-required` en campos obligatorios
- [ ] Focus visible mejorado (outline más prominente)
- [ ] Atajos de teclado documentados

**Componentes a mejorar:**
- Formularios en toda la app
- Botones de iconos sin texto
- Navegación principal

---

### **Fase 6: Features Adicionales** (Prioridad Baja)

#### 7. **Notificaciones Push (PWA)** 🔵
**Impacto:** Alto | **Esfuerzo:** Alto | **Tiempo:** 6-8 horas

**Requisitos:**
- [ ] Configurar PWA (manifest, service worker)
- [ ] Solicitar permisos de notificaciones
- [ ] Integrar con backend para envío de push
- [ ] Manejar notificaciones cuando la app está cerrada
- [ ] Preferencias de usuario para push notifications

**Dependencias:**
- Backend debe soportar Web Push API
- Service Worker configurado

---

#### 8. **Email Digests** 🔵
**Impacto:** Medio | **Esfuerzo:** Alto | **Tiempo:** 4-6 horas

**Características:**
- [ ] Configuración de frecuencia (diario/semanal)
- [ ] Selección de contenido a incluir
- [ ] Hora preferida de envío
- [ ] Preview del digest

**Dependencias:**
- Backend debe soportar envío de emails
- Sistema de templates de email

---

#### 9. **Indicador de Progreso en Checkout** 🔵
**Impacto:** Bajo | **Esfuerzo:** Medio | **Tiempo:** 2-3 horas

**Problema:** Flujo actual redirige a Wompi, difícil de implementar

**Solución alternativa:**
- [ ] Mostrar pasos antes de redirección:
  - Paso 1: Validando plan
  - Paso 2: Creando transacción
  - Paso 3: Redirigiendo a Wompi
- [ ] O mostrar indicador de progreso en la página de retorno de Wompi

---

## 📅 Roadmap Sugerido

### **Sprint Actual (Esta Semana)**
1. ✅ Corregir textos hardcodeados restantes
2. ✅ Focus management en modales
3. ✅ Mejorar empty states en marketplace

### **Siguiente Sprint**
4. Tour guiado de onboarding
5. Optimistic updates en compra

### **Futuro (v2)**
6. Mejoras de accesibilidad avanzadas
7. Notificaciones push (PWA)
8. Email digests

---

## 🎯 Métricas de Éxito

### **Fase 4 (Consolidación)**
- [ ] 0 textos hardcodeados en componentes principales
- [ ] 100% de modales con focus management
- [ ] Todos los empty states mejorados

### **Fase 5 (Avanzadas)**
- [ ] Tour de onboarding implementado
- [ ] Optimistic updates funcionando
- [ ] Accesibilidad mejorada (Lighthouse score >90)

### **Fase 6 (Features)**
- [ ] PWA funcional con push notifications
- [ ] Email digests configurados

---

## 📝 Notas Técnicas

### **Priorización**
- **Alta:** Impacto alto, esfuerzo bajo/medio
- **Media:** Impacto medio/alto, esfuerzo medio
- **Baja:** Impacto bajo/medio, esfuerzo alto (features futuras)

### **Dependencias**
- Algunas mejoras requieren cambios en backend
- PWA requiere configuración de service worker
- Push notifications requieren certificados y configuración

---

**Última actualización:** Enero 2025  
**Responsable:** Frontend Agent + UX Agent  
**Estado:** 📋 Planificado

