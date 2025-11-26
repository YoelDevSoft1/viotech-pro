# Roadmap Frontend · Rutas limpias y UX consistente

Formato checklist para ir marcando. Orden sugerido por impacto/riesgo.

## Fase 1 · Sitemap y layouts base
- [x] Definir sitemap final (marketing, auth, cliente, admin, interno, pagos) y acordar redirects.
- [x] Crear route groups: `/(marketing)`, `/(auth)`, `/(client)`, `/(ops-admin)`, `/(ops-internal)`, `/(payments)`.
- [x] Mover `Header/Footer` solo a `/(marketing)` y usar layouts ligeros para auth/pagos.
- [x] Añadir topbar/sidebar específicos por portal (cliente, admin, interno) en sus layouts.
- [x] Actualizar navegación (`Header`, CTAs) para enlazar al nuevo árbol y evitar rutas rotas.

## Fase 2 · Contexto de organización y data layer común
- [x] Crear `OrgContext` global (persistencia local + hydrate inicial) disponible en layouts protegidos.
- [x] Exponer hooks `useOrg`, `useOrgSelector` y quitar selectores sueltos por página.
- [x] Centralizar cliente HTTP: wrapper `apiClient` con refresh de token, manejo de 401/429 y logging.
- [x] Crear hooks de datos reutilizables: `useServices`, `useTickets`, `useMetrics`, `useModelStatus`.
- [x] Unificar estados de `loading/error/empty` con componentes comunes (skeleton, alert, empty-state).

## Fase 3 · Refactor Dashboard Cliente
- [x] Extraer `ServicesPanel` y `TicketsPanel` desde `app/(client)/dashboard/page.tsx` (pendiente `SecurityPanel`, `RoadmapPanel`, `QuickLinks`).
- [x] Mover lógica de tickets (creación, comentarios, adjuntos) a hooks/servicios compartidos.
- [x] Reusar componentes de listas/tabla para tickets y servicios en lugar de markup duplicado.
- [x] Simplificar métricas: priorizar `useMetrics` y skeletons; reducir side-effects y logs de consola.
- [x] Completar paneles restantes (`SecurityPanel`, `RoadmapPanel`, `QuickLinks`) para cerrar la modularización.
- [ ] Añadir pruebas rápidas de render (RTL) para las secciones refactorizadas.
- [x] Migrar dashboard cliente a hooks de datos (`useServices`, `useTickets`, `useMetrics`, `useModelStatus`, `useOrg`) y estados comunes en Overview/Tickets.
- [x] Quitar contenido mock (reportes ejecutivos, checklist) y paginar servicios activos (4 por página).

## Fase 4 · Portales Admin / Interno coherentes
- [x] Ajustar `/admin/*` al layout `/(ops-admin)` con sidebar y breadcrumbs consistentes.
- [x] Reutilizar tablas/cards para usuarios, servicios y health; eliminar estilos ad-hoc.
- [x] Homologar filtros y selector de organización entre `/admin` y `/internal`.
- [x] Extraer RoleManager/OrgSelector a patrones documentados y sin mocks por defecto.
- [x] Añadir vistas vacías y errores consistentes (alert/info) en admin/interno.

## Fase 5 · Design System y UX
- [x] Completar kit de componentes: tabla, pagination, badge, skeleton, alert/empty-state, breadcrumb.
- [x] Definir tokens de espaciado/tipografía y documentar en `ARCHITECTURE.md` o `ui.md`.
- [ ] Revisar accesibilidad: focus visible, labels en formularios, aria en botones/iconos.
- [ ] Ajustar mobile: menús colapsables y layouts responsivos por portal.
- [ ] Reducir uso innecesario de `"use client"` y cargar pesado de forma diferida.

## Fase 6 · Testing y documentación
- [ ] Configurar testing frontend (Jest + React Testing Library) y script en `package.json`.
- [ ] Tests mínimos: guards de rol, `apiClient` (mocks), `useOrg`, y flujos de login→dashboard.
- [ ] Documentar árbol de rutas y layouts nuevos en `ARCHITECTURE.md`.
- [ ] Actualizar README con cómo correr tests y cómo añadir una página por portal.
- [ ] Opcional: añadir smoke E2E (Playwright/Cypress) para login y creación de ticket.
