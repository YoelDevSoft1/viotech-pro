# VioTech Pro · Arquitectura (Frontend)

> Última actualización: 2025-11-21  
> Alcance: Frontend (Next.js 16, React 19) y puntos de integración clave con backend (`viotech-main.onrender.com`)

## Stack y estructura
- **Framework:** Next.js 16 (App Router), React 19, TypeScript.
- **Estilos:** Tailwind 4 (clases utilitarias en `app/globals.css`).
- **Íconos/animaciones:** Lucide React, sin Storybook.
- **Routing:** App Router (`app/`), server components por defecto; vistas con interacción marcan `"use client"`.

### Estructura relevante
- `app/`
  - `/` landing.
  - `/login`, `/forgot-password`, `/reset-password`: auth.
  - `/dashboard`: panel cliente (servicios, tickets, métricas).
  - `/client/*`: portal cliente (guard rol cliente).
  - `/internal/*`: portal interno (guard rol agente/admin).
  - `/services`, `/services/catalog`: servicios y pagos.
  - `/payment/*`: callbacks Wompi.
  - `/admin/*`: panel admin (guard + layout + RoleManager).
  - `/api/predictions/*`: proxies al backend real para predictor ML.
- `components/`
  - UI principales: Hero, Stats, Services, etc.
  - Autenticación/seguridad: `ChangePasswordModal`, `MFASettings`.
  - IA: `TimelinePredictor`, `AITicketAssistant` (chat + creación de tickets vía backend).
  - Admin: `admin/AdminGate`, `admin/AdminLayout`, `admin/RoleManager`.
- `lib/`
  - `api.ts`: construye base URL a backend.
  - `auth.ts`, `useAuth.ts`: manejo de tokens, refresh, logout.
  - `metrics.ts`, `services.ts`, `payments.ts`: llamadas a backend para métricas, servicios, pagos.

## Autenticación y roles
- Tokens almacenados en localStorage/sessionStorage (`viotech_token`, `viotech_refresh_token`, compatibilidad legacy).
- Refresh automático vía `/auth/refresh`; logout vía `/auth/logout`; guard de ruta en `useAuth`.
- Roles:
  - Cliente (default): ve sus tickets/servicios.
  - Agente/Admin: acceso global a tickets; admin puede cambiar roles.
  - Guard admin: `AdminGate` consulta `/auth/me` y permite solo roles `admin/agente/support` (ajustable).

## Integraciones backend
- **Base API:** `NEXT_PUBLIC_BACKEND_API_URL` (ej. `https://viotech-main.onrender.com`), se fuerza sufijo `/api`.
- **Tickets/Servicios:** `/services/me`, `/tickets` (+ comentarios/adjuntos), `/metrics/dashboard`.
- **Pagos:** Wompi (`/payments/*`), página de éxito/error.
- **ML Predictor:** `/predictions/model-status`, `/predictions/project-timeline` (proxies en `app/api/predictions/*`).
- **Asistente IA:** `/ai/ticket-assistant`, `/ai/ticket-assistant/create-ticket` (frontend envía draft en `context` y mensaje `TICKET_DRAFT_JSON`).
- **Roles:** `/users` (listado admin) y `PUT /users/:id/role` (cambio de rol).

## Flags y entornos
- `NEXT_PUBLIC_BACKEND_API_URL` (sin slash final; se añade `/api`).
- `BACKEND_API_URL` (opcional, para proxies server-side).
- `NEXT_PUBLIC_ENABLE_PREDICTOR`, `NEXT_PUBLIC_ENABLE_AI_ASSISTANT`, `NEXT_PUBLIC_ENABLE_ADMIN`, `NEXT_PUBLIC_ADMIN_MOCK`.
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`.
- Wompi: `NEXT_PUBLIC_WOMPI_PUBLIC_KEY`.

## Flujo de datos clave
- **Auth:** login → guarda tokens → `authChanged` event → guards leen `useAuth` / storage → refresh si expira.
- **Dashboard cliente:** fetch servicios (`/services/me`), tickets (`/tickets`), métricas (`/metrics/dashboard`), predictor ML opcional.
- **Asistente IA de tickets:** chat con backend IA; si usuario afirma “crea el ticket” o pulsa botón, se envía historial + draft al endpoint de creación con Bearer.
- **Admin:** lista usuarios desde `/users` (o mock); cambio de rol via `PUT /users/:id/role`; acceso protegido por rol.

## Seguridad y errores
- CORS: backend permite `https://viotech.com.co`.
- Manejo de 401/403: redirigir a login; 429: mensajes amigables en IA/predicciones.
- Inputs: formularios con validaciones básicas; falta sanitización extra (pendiente en front).

## Pendientes (según roadmap)
- Documentar diagrama del backend en su repo (integraciones, módulos).
- Multi-tenant: organization/project aún no implementado en front/back.
- Design system unificado y Storybook: no existe.
- Testing (Jest/RTL, E2E) y CI: no configurado en frontend.
