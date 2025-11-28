# Ruta E2E de refactor de estilos con Shadcn/UI

Objetivo: mover todas las vistas a primitives y patrones Shadcn/UI, unificando tokens de diseño y eliminando estilos ad hoc. Ejecuta en este orden para evitar re-trabajo.

## Convenciones base
- Tokens en `app/globals.css` → mantener `@theme` y mapear a `:root` con la paleta final; exportar helpers `cn`, `spacing`, etc.
- Primitives Shadcn en `components/ui` (regenerar con CLI si falta): `button`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `label`, `form`, `card`, `badge`, `table`, `tabs`, `alert`, `dialog`, `drawer/sheet`, `tooltip`, `dropdown-menu`, `pagination`, `breadcrumb`, `skeleton`, `toast/sonner`, `avatar`, `progress`.
- Page shell reutilizable (`PageHeader`, `PageSection`, `PageGrid`, `StatCard`, `DataTable`) para no repetir flex/spacing.

## Árbol de ejecución (end-to-end)
```
refactor-shadcn/
├─ 00-setup/
│  ├─ Revisar tokens en app/globals.css (background/foreground/radius/shadows) y alinear con theme Shadcn.
│  ├─ Validar components.json y actualizar `npx shadcn@latest init` (paths, alias @/).
│  ├─ Regenerar primitives en components/ui/* (sobrescribir variaciones y estados focus/disabled).
│  └─ Añadir helpers: components/ui/page-header.tsx, page-section.tsx, data-table.tsx, stat-card.tsx.
│
├─ 01-layouts/
│  ├─ app/layout.tsx: envoltorio global, <ThemeProvider>, fuente, <Toaster>.
│  ├─ app/providers.tsx: mover providers de theme/sonner/swr aquí.
│  ├─ (marketing)/layout.tsx: layout público minimal, navbar/footer shadcn.
│  ├─ (auth)/layout.tsx: fondo neutro, card centrada, uso de <Card>, <Input>, <Button>.
│  ├─ (client)/layout.tsx y (client)/client/layout.tsx: shell con sidebar/header usando <Sheet> móvil.
│  ├─ (ops-internal)/layout.tsx y internal/layout.tsx: shell interno con breadcrumbs y tabs.
│  ├─ (ops-admin)/layout.tsx y admin/layout.tsx: shell admin con nav secundario + estados <Alert>.
│  └─ (payments)/layout.tsx: wrapper limpio para páginas de estado.
│
├─ 02-marketing/
│  ├─ /(home) app/(marketing)/page.tsx: reemplazar Hero/Features/Stats con Card, Badge, Button, Tabs.
│  ├─ /services app/(marketing)/services/page.tsx: cards de servicio con <Card> + CTA <Button>.
│  └─ /services/catalog app/(marketing)/services/catalog/page.tsx: grid de planes con <Card>, <Badge>, <Dialog> para detalles.
│
├─ 03-auth/
│  ├─ /login, /forgot-password, /reset-password: formularios con <Form>, <Input>, <Button>, <Alert> de error, <Tabs> si multi-método.
│  └─ Estado loading con <Skeleton> y mensajes con <Alert>.
│
├─ 04-portal-cliente (app/(client))/
│  ├─ /dashboard: usar StatCard, DataTable para tickets/servicios, Cards para predictor.
│  ├─ /client (home): panel de bienvenida con CTA, QuickLinks en <Card>.
│  ├─ /client/tickets: lista con DataTable (<Table>, <Badge> estado, <DropdownMenu> acciones), filtros con <Select>/<Input>.
│  ├─ /client/tickets/[id]: detalle en <Card>, timeline de comentarios como <ScrollArea> + <Textarea> + <Button>.
│  ├─ /client/ia/asistente: chat bubbles con <Card>, input en <Form> + <Textarea>, toolbar con <Tooltip>.
│  └─ /client/ia/predictor: formulario en <Card>, resultado en <Alert>/<Card> con <Progress>.
│
├─ 05-ops-internal (app/(ops-internal))/
│  ├─ /internal: dashboard interno con StatCard y tabla de tickets recientes.
│  ├─ /internal/tickets: DataTable con columnas sort, filtros <Select>, acciones en <DropdownMenu>.
│  ├─ /internal/tickets/[id]: detalle con tabs (<Tabs> resumen/comentarios/adjuntos), comment box con <Form>.
│  ├─ /internal/projects: grid/list con <Card>, filtros <Select>.
│  └─ /internal/projects/[id]: layout con <Tabs> (overview/timeline/files), badges de estado.
│
├─ 06-ops-admin (app/(ops-admin))/
│  ├─ /admin: landing admin con quick actions en <Card>, alerts de riesgo.
│  ├─ /admin/tickets: DataTable con estados, bulk actions en <DropdownMenu>.
│  ├─ /admin/services: cards/tabla de servicios, botones primaria/ghost.
│  ├─ /admin/users: tabla con rol en <Badge>, cambio rol en <Dialog>/<Select>.
│  ├─ /admin/settings: formularios con <Form>, toggles con <Switch>, alerts de peligro en <Alert variant="destructive">.
│  └─ /admin/health: panel de checks con <Badge> y <Card> listado.
│
├─ 07-payments (app/(payments))/
│  ├─ /payment/success: estado con <Card>, icono <Badge>, botones CTA.
│  └─ /payment/error: estado de error con <Alert>, botón retry.
│
├─ 08-componentes de dominio (components/)/
│  ├─ UI genérico: Hero, Header, Footer, Stats, Services → reescribir con primitives y spacing consistente.
│  ├─ dashboard/*: QuickLinks, RoadmapPanel, SecurityPanel, ServicesPanel, TicketsPanel → migrar a Cards/Badges/Tabs.
│  ├─ auth: ChangePasswordModal, MFASettings, MFASetupModal → usar <Dialog>, <Form>, <Input>, <Button>.
│  ├─ IA: AITicketAssistant, TimelinePredictor → cards, textarea, steps con <Badge>/<Progress>.
│  ├─ payments: CheckoutModal → <Dialog>, inputs shadcn, estados con <Alert>/<Skeleton>.
│  ├─ servicios: ServiceCard, ServiceDetailsModal → <Card>/<Dialog>/<Badge>.
│  └─ shared: RoleGate/AdminGate/OrgSelector → botones/alerts con primitives.
│
├─ 09-form-patterns/
│  ├─ Crear kit de formularios (AuthForm, TicketForm, PaymentForm) basado en <Form>.
│  ├─ Estados: loading (<Skeleton>), empty (<State>), error (<Alert>), success (<Callout> vía Alert).
│  └─ Acciones flotantes en móvil con <Sheet>/<Drawer>.
│
├─ 10-accesibilidad y estados/
│  ├─ Focus visible en todos los botones/links (outline desde tokens).
│  ├─ Hover/active/disabled unificados en Button/Input/Select.
│  ├─ Dark mode: verificar contraste en Badge/Card/Table.
│  └─ Skeletons para data fetching en dashboards/listas.
│
└─ 11-QA visual
   ├─ Storyless smoke: recorrer cada ruta y validar check de estilos/tokens.
   ├─ Capturas rápidas por ruta (before/after) para validar consistencia.
   └─ Revisar breakpoints (sm/md/lg) en tablas y grids.
```

## Notas rápidas por ruta
- Marketing (`/`, `/services`, `/services/catalog`): aplicar Hero/Features con <Button> ghost/primary, cards con sombras suaves.
- Auth (`/login`, `/forgot-password`, `/reset-password`): forms compactos, alerts de error, checkbox “recordar” con <Checkbox>.
- Cliente (`/dashboard`, `/client`, `/client/tickets`, `/client/tickets/[id]`, `/client/ia/*`): usar DataTable + filtros, comentarios en textarea shadcn, chips de estado en <Badge>.
- Operaciones internas (`/internal*`): tabs, tablas con acciones, skeleton en cargas.
- Admin (`/admin*`): tablas con bulk actions, dialogs para confirmaciones, alerts de riesgo.
- Pagos (`/payment/success|error`): cards de estado, CTAs claros.

## Entregable final
- Todas las páginas usan exclusivamente primitives de `components/ui`.
- Tokens centralizados en `globals.css`; layouts sin clases duplicadas.
- Checklist de QA visual completo (dark/light, desktop/móvil) antes de cerrar.
