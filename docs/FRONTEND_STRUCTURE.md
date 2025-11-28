# Estructura del frontend

```
viotech-pro/
├─ ARCHITECTURE.md
├─ DIAGNOSTICO_ERROR_502_PAGOS.md
├─ INTEGRACION_METRICAS_COMPLETADA.md
├─ PLAN_INTEGRACION_FRONTEND.md
├─ README.md
├─ ROADMAP_BACKEND.md
├─ ROADMAP_FRONTEND.md
├─ ROADMAP_INNOVACIONES_2025.md
├─ SOLUCION_TOKEN_ACEPTACION_WOMPI.md
├─ ViotechCompleto.md
├─ backend-desarrollo-completo.md
├─ eslint.config.mjs
├─ netlify.toml
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ tsconfig.json
├─ update_dashboard.js
├─ app/
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ providers.tsx
│  ├─ api/
│  │  ├─ predictions/model-status/route.ts
│  │  └─ predictions/project-timeline/route.ts
│  ├─ (auth)/
│  │  ├─ layout.tsx
│  │  ├─ forgot-password/page.tsx
│  │  ├─ login/page.tsx
│  │  └─ reset-password/page.tsx
│  ├─ (client)/
│  │  ├─ layout.tsx
│  │  ├─ dashboard/page.tsx
│  │  ├─ client/
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ ia/
│  │  │  │  ├─ asistente/page.tsx
│  │  │  │  └─ predictor/page.tsx
│  │  │  ├─ tickets/
│  │  │  │  ├─ [id]/page.tsx
│  │  │  │  └─ page.tsx
│  ├─ (marketing)/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ services/page.tsx
│  │  └─ services/catalog/page.tsx
│  ├─ (ops-admin)/
│  │  ├─ layout.tsx
│  │  ├─ admin/
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ health/page.tsx
│  │  │  ├─ services/page.tsx
│  │  │  ├─ settings/page.tsx
│  │  │  ├─ tickets/page.tsx
│  │  │  └─ users/page.tsx
│  ├─ (ops-internal)/
│  │  ├─ layout.tsx
│  │  └─ internal/
│  │     ├─ layout.tsx
│  │     ├─ page.tsx
│  │     ├─ projects/
│  │     │  ├─ [id]/page.tsx
│  │     │  └─ page.tsx
│  │     └─ tickets/
│  │        ├─ [id]/page.tsx
│  │        └─ page.tsx
│  ├─ (payments)/
│  │  ├─ layout.tsx
│  │  └─ payment/
│  │     ├─ error/page.tsx
│  │     └─ success/page.tsx
├─ components/
│  ├─ AITicketAssistant.tsx
│  ├─ CaseStudies.tsx
│  ├─ ChangePasswordModal.tsx
│  ├─ CheckoutModal.tsx
│  ├─ Contact.tsx
│  ├─ Features.tsx
│  ├─ Footer.tsx
│  ├─ Header.tsx
│  ├─ Hero.tsx
│  ├─ MFASettings.tsx
│  ├─ MFASetupModal.tsx
│  ├─ OrgProvider.tsx
│  ├─ OrgSelector.tsx
│  ├─ Process.tsx
│  ├─ RoleGate.tsx
│  ├─ ServiceWorkerRegister.tsx
│  ├─ Services.tsx
│  ├─ Stats.tsx
│  ├─ TechStack.tsx
│  ├─ TestFile.tsx
│  ├─ TimelinePredictor.tsx
│  ├─ dashboard/
│  │  ├─ QuickLinks.tsx
│  │  ├─ RoadmapPanel.tsx
│  │  ├─ SecurityPanel.tsx
│  │  ├─ ServicesPanel.tsx
│  │  └─ TicketsPanel.tsx
│  ├─ admin/
│  │  ├─ AdminGate.tsx
│  │  ├─ AdminLayout.tsx
│  │  └─ RoleManager.tsx
│  └─ ui/
│     ├─ Badge.tsx
│     ├─ Breadcrumb.tsx
│     ├─ Button.tsx
│     ├─ Card.tsx
│     ├─ Pagination.tsx
│     ├─ Select.tsx
│     ├─ Skeleton.tsx
│     ├─ State.tsx
│     ├─ Table.tsx
│     └─ ToastProvider.tsx
├─ lib/
│  ├─ api.ts
│  ├─ apiClient.ts
│  ├─ auth.ts
│  ├─ metrics.ts
│  ├─ payments.ts
│  ├─ projects.ts
│  ├─ services.ts
│  ├─ useAuth.ts
│  ├─ useOrg.ts
│  ├─ hooks/
│  │  ├─ useMetrics.ts
│  │  ├─ useModelStatus.ts
│  │  ├─ useServices.ts
│  │  └─ useTickets.ts
│  └─ storage/
│     └─ uploadTicketAttachment.ts
├─ public/
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ service-worker.js
│  ├─ vercel.svg
│  └─ window.svg
```
