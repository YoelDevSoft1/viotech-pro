# 🚀 Stack Tecnológico Completo - VioTech Pro

**Fecha:** Diciembre 2024  
**Versión del Proyecto:** 0.1.0  
**Última actualización:** Diciembre 2024

---

## 📋 Índice

1. [Framework y Core](#framework-y-core)
2. [Lenguajes y Type Safety](#lenguajes-y-type-safety)
3. [Estilos y UI](#estilos-y-ui)
4. [Gestión de Estado](#gestión-de-estado)
5. [Formularios y Validación](#formularios-y-validación)
6. [HTTP y API](#http-y-api)
7. [Animaciones y UX](#animaciones-y-ux)
8. [Iconos y Visuales](#iconos-y-visuales)
9. [Internacionalización](#internacionalización)
10. [Gráficos y Visualización](#gráficos-y-visualización)
11. [Calendarios y Fechas](#calendarios-y-fechas)
12. [Gestión de Proyectos](#gestión-de-proyectos)
13. [Pagos](#pagos)
14. [Exportación de Datos](#exportación-de-datos)
15. [Onboarding y Tours](#onboarding-y-tours)
16. [Drag and Drop](#drag-and-drop)
17. [Utilidades](#utilidades)
18. [Herramientas de Desarrollo](#herramientas-de-desarrollo)
19. [Configuración y Build](#configuración-y-build)
20. [Integraciones Externas](#integraciones-externas)

---

## 🎯 Framework y Core

### **Next.js 16.0.3**
- **Tipo:** Framework React con App Router
- **Uso:** Framework principal del proyecto
- **Características:**
  - App Router (Next.js 13+)
  - Server Components y Client Components
  - Route Groups: `(auth)`, `(client)`, `(marketing)`, `(ops-admin)`, `(ops-internal)`, `(payments)`
  - Image Optimization
  - API Routes
  - Middleware
  - Metadata API

### **React 19.2.0**
- **Tipo:** Biblioteca UI
- **Uso:** Biblioteca base para componentes
- **Características:**
  - React Server Components
  - React Client Components
  - Hooks personalizados

### **React DOM 19.2.0**
- **Tipo:** Renderer para DOM
- **Uso:** Renderizado en navegador

---

## 🔷 Lenguajes y Type Safety

### **TypeScript 5.x**
- **Tipo:** Superset de JavaScript con tipos
- **Configuración:**
  - `strict: true` - Modo estricto habilitado
  - Target: ES2017
  - Module: ESNext
  - JSX: react-jsx
  - Path aliases: `@/*` → `./*`

### **Node.js 20+**
- **Tipo:** Runtime de JavaScript
- **Uso:** Entorno de ejecución

---

## 🎨 Estilos y UI

### **Tailwind CSS 4.x**
- **Tipo:** Framework CSS utility-first
- **Uso:** Estilos principales del proyecto
- **Configuración:**
  - PostCSS 4.x
  - Tailwind Typography plugin
  - Tailwind Animate plugin

### **Shadcn/UI 3.5.1**
- **Tipo:** Sistema de componentes
- **Uso:** Componentes UI base
- **Componentes incluidos:**
  - Button, Card, Input, Select, Dialog, Dropdown, Tabs, Tooltip, etc.
  - 35+ componentes en `components/ui/`

### **Radix UI**
- **Tipo:** Primitivos UI accesibles
- **Componentes usados:**
  - `@radix-ui/react-alert-dialog` (1.1.15)
  - `@radix-ui/react-avatar` (1.1.11)
  - `@radix-ui/react-checkbox` (1.3.3)
  - `@radix-ui/react-dialog` (1.1.15)
  - `@radix-ui/react-dropdown-menu` (2.1.16)
  - `@radix-ui/react-label` (2.1.8)
  - `@radix-ui/react-progress` (1.1.8)
  - `@radix-ui/react-radio-group` (1.3.8)
  - `@radix-ui/react-scroll-area` (1.2.10)
  - `@radix-ui/react-select` (2.2.6)
  - `@radix-ui/react-separator` (1.1.8)
  - `@radix-ui/react-slot` (1.2.4)
  - `@radix-ui/react-switch` (1.2.6)
  - `@radix-ui/react-tabs` (1.1.13)
  - `@radix-ui/react-tooltip` (1.2.8)

### **Class Variance Authority (CVA) 0.7.1**
- **Tipo:** Utilidad para variantes de componentes
- **Uso:** Gestión de variantes de estilos

### **Tailwind Merge 3.4.0**
- **Tipo:** Utilidad para merge de clases Tailwind
- **Uso:** Combinación inteligente de clases

### **CLSX 2.1.1**
- **Tipo:** Utilidad para construir className
- **Uso:** Construcción condicional de clases

### **Next Themes 0.4.6**
- **Tipo:** Gestión de temas (Dark/Light mode)
- **Uso:** Sistema de temas del proyecto

---

## 🔄 Gestión de Estado

### **TanStack Query (React Query) 5.90.11**
- **Tipo:** Biblioteca de gestión de estado del servidor
- **Uso:** 
  - Fetching de datos
  - Caching
  - Sincronización
  - Mutations
- **Hooks personalizados:**
  - `useAuth`, `useTickets`, `useServices`, `useDashboard`, `useBlog`, etc.
  - 30+ hooks en `lib/hooks/`

### **TanStack Query DevTools 5.91.1**
- **Tipo:** Herramientas de desarrollo
- **Uso:** Debugging de queries en desarrollo

---

## 📝 Formularios y Validación

### **React Hook Form 7.66.1**
- **Tipo:** Biblioteca de gestión de formularios
- **Uso:** Formularios en toda la aplicación

### **Zod 4.1.13**
- **Tipo:** Schema validation
- **Uso:** Validación de formularios y tipos

### **@hookform/resolvers 5.2.2**
- **Tipo:** Resolvers para React Hook Form
- **Uso:** Integración Zod + React Hook Form

---

## 🌐 HTTP y API

### **Axios 1.13.2**
- **Tipo:** Cliente HTTP
- **Uso:** 
  - Cliente API centralizado (`lib/apiClient.ts`)
  - Interceptores para tokens JWT
  - Refresh token automático
  - Manejo de errores

### **API Backend**
- **URL Base:** `https://viotech-main.onrender.com/api`
- **Autenticación:** JWT (Bearer tokens)
- **Endpoints principales:**
  - `/auth/*` - Autenticación
  - `/tickets/*` - Sistema de tickets
  - `/services/*` - Servicios
  - `/projects/*` - Proyectos
  - `/blog/*` - Blog
  - `/payments/*` - Pagos
  - `/onboarding/*` - Onboarding
  - `/metrics/*` - Métricas

---

## ✨ Animaciones y UX

### **Framer Motion 12.23.24**
- **Tipo:** Biblioteca de animaciones
- **Uso:** 
  - Animaciones de página
  - Transiciones suaves
  - Micro-interacciones

### **Sonner 2.0.7**
- **Tipo:** Sistema de notificaciones toast
- **Uso:** Notificaciones de usuario

### **Vaul 1.1.2**
- **Tipo:** Componente drawer/sheet
- **Uso:** Paneles laterales deslizables

---

## 🎯 Iconos y Visuales

### **Lucide React 0.553.0**
- **Tipo:** Biblioteca de iconos
- **Uso:** Iconos en toda la aplicación
- **Estilo:** Minimalista y moderno

---

## 🌍 Internacionalización

### **Next Intl 4.5.6**
- **Tipo:** Framework de i18n para Next.js
- **Estado:** Instalado pero middleware temporalmente deshabilitado
- **Idiomas soportados:**
  - Español (es) - Default
  - Inglés (en)
  - Portugués (pt)
- **Archivos de traducción:**
  - `messages/es.json` (1,701 líneas)
  - `messages/en.json` (1,701 líneas)
  - `messages/pt.json` (1,711 líneas)

---

## 📊 Gráficos y Visualización

### **Recharts 3.5.1**
- **Tipo:** Biblioteca de gráficos
- **Uso:** 
  - Gráficos de métricas
  - Dashboards
  - Visualización de datos

---

## 📅 Calendarios y Fechas

### **React Big Calendar 1.19.4**
- **Tipo:** Componente de calendario
- **Uso:** Vista de calendario para eventos y tareas

### **React Day Picker 9.11.2**
- **Tipo:** Selector de fechas
- **Uso:** Inputs de fecha

### **Date-fns 4.1.0**
- **Tipo:** Utilidades de fechas
- **Uso:** Formateo y manipulación de fechas

### **Date-fns-tz 3.2.0**
- **Tipo:** Soporte de timezones para date-fns
- **Uso:** Manejo de zonas horarias

---

## 📋 Gestión de Proyectos

### **@rsagiev/gantt-task-react-19 0.3.9**
- **Tipo:** Componente Gantt Chart
- **Uso:** Visualización de cronogramas de proyectos
- **Compatibilidad:** React 19

---

## 💳 Pagos

### **Wompi**
- **Tipo:** Pasarela de pagos
- **Uso:** Procesamiento de pagos
- **Integración:**
  - `checkout.wompi.co`
  - `cdn.wompi.co`
  - `production.wompi.co`
- **Componente:** `components/payments/CheckoutModal.tsx`

---

## 📄 Exportación de Datos

### **jsPDF 3.0.4**
- **Tipo:** Generación de PDFs
- **Uso:** Exportación de reportes a PDF

### **jsPDF AutoTable 5.0.2**
- **Tipo:** Plugin para tablas en PDFs
- **Uso:** Tablas en documentos PDF

### **XLSX 0.18.5**
- **Tipo:** Manipulación de Excel
- **Uso:** Exportación de datos a Excel

---

## 🎓 Onboarding y Tours

### **React Joyride 2.9.3**
- **Tipo:** Biblioteca de tours guiados
- **Uso:** 
  - Onboarding de usuarios
  - Tours interactivos
  - Guías contextuales

---

## 🖱️ Drag and Drop

### **@dnd-kit/core 6.3.1**
- **Tipo:** Biblioteca de drag and drop
- **Uso:** Funcionalidad de arrastrar y soltar

### **@dnd-kit/sortable 10.0.0**
- **Tipo:** Extensión para listas ordenables
- **Uso:** Reordenamiento de elementos

### **@dnd-kit/utilities 3.2.2**
- **Tipo:** Utilidades para dnd-kit
- **Uso:** Helpers y utilidades

---

## 🛠️ Utilidades

### **CMDK 1.1.1**
- **Tipo:** Command menu (⌘K)
- **Uso:** Menú de comandos tipo Spotlight

---

## 🔧 Herramientas de Desarrollo

### **ESLint 9.x**
- **Tipo:** Linter de JavaScript/TypeScript
- **Configuración:** `eslint-config-next` 16.0.3

### **TypeScript 5.x**
- **Tipo:** Compilador de TypeScript
- **Configuración:** `tsconfig.json` con modo estricto

### **Shadcn CLI 3.5.1**
- **Tipo:** CLI para componentes Shadcn
- **Uso:** Gestión de componentes UI

---

## ⚙️ Configuración y Build

### **Next.js Config**
- **Image Optimization:**
  - Formatos: AVIF, WebP
  - Device sizes: 640-3840px
  - Image sizes: 16-384px
  - Remote patterns: Supabase, Wompi, Backend

- **Security Headers:**
  - Content Security Policy (CSP)
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin

### **PostCSS 4.x**
- **Tipo:** Procesador CSS
- **Uso:** Procesamiento de Tailwind CSS

### **Tailwind CSS 4.x**
- **Tipo:** Framework CSS
- **Configuración:** `tailwind.config.ts` (si existe)

---

## 🔌 Integraciones Externas

### **Supabase**
- **Tipo:** Backend as a Service
- **Uso:** Storage de imágenes
- **URL:** `*.supabase.co`

### **Google Services**
- **Google Analytics:** `www.googletagmanager.com`
- **Google Translate:** `translate.googleapis.com`
- **Google Static:** `www.gstatic.com`

### **Wompi**
- **Checkout:** `checkout.wompi.co`
- **CDN:** `cdn.wompi.co`
- **Production API:** `production.wompi.co`

### **Backend API**
- **URL:** `https://viotech-main.onrender.com/api`
- **Protocolo:** HTTPS
- **Autenticación:** JWT Bearer tokens

---

## 📦 Estructura del Proyecto

```
viotech-pro/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── (client)/          # Panel de cliente
│   ├── (marketing)/       # Páginas de marketing
│   ├── (ops-admin)/      # Panel de administración
│   ├── (ops-internal)/   # Panel interno
│   ├── (payments)/       # Rutas de pagos
│   └── api/              # API Routes
├── components/            # Componentes React
│   ├── ui/               # Componentes Shadcn/UI
│   ├── dashboard/        # Componentes de dashboard
│   ├── admin/            # Componentes de admin
│   └── ...
├── lib/                   # Utilidades y lógica
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript types
│   └── utils/            # Utilidades
├── messages/             # Traducciones i18n
│   ├── es.json
│   ├── en.json
│   └── pt.json
└── public/                # Assets estáticos
```

---

## 🎯 Características Principales

### **Arquitectura**
- ✅ App Router (Next.js 16)
- ✅ Server Components + Client Components
- ✅ Route Groups para organización
- ✅ TypeScript estricto
- ✅ Componentes modulares

### **UI/UX**
- ✅ Design System (Shadcn/UI)
- ✅ Dark/Light mode
- ✅ Responsive design
- ✅ Animaciones fluidas (Framer Motion)
- ✅ Accesibilidad (Radix UI)

### **Funcionalidades**
- ✅ Autenticación JWT
- ✅ Sistema de tickets
- ✅ Gestión de proyectos (Gantt, Kanban)
- ✅ Blog con comentarios
- ✅ Pagos (Wompi)
- ✅ Onboarding interactivo
- ✅ Dashboard ejecutivo
- ✅ Reportes y exportación
- ✅ Internacionalización (3 idiomas)

### **Performance**
- ✅ Image optimization
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Caching con React Query
- ✅ Service Worker

### **Seguridad**
- ✅ CSP headers
- ✅ XSS protection
- ✅ Frame protection
- ✅ Token refresh automático

---

## 📊 Estadísticas del Stack

- **Total de dependencias:** 61
- **Dependencias de producción:** 50
- **Dependencias de desarrollo:** 11
- **Componentes UI:** 35+
- **Custom hooks:** 30+
- **Idiomas soportados:** 3
- **Rutas principales:** 6 grupos de rutas

---

## 🔄 Versiones Clave

| Tecnología | Versión | Estado |
|------------|---------|--------|
| Next.js | 16.0.3 | ✅ Actualizado |
| React | 19.2.0 | ✅ Última versión |
| TypeScript | 5.x | ✅ Actualizado |
| Tailwind CSS | 4.x | ✅ Última versión |
| TanStack Query | 5.90.11 | ✅ Actualizado |
| React Hook Form | 7.66.1 | ✅ Actualizado |
| Zod | 4.1.13 | ✅ Actualizado |

---

## 📝 Notas

- **Next Intl:** Instalado pero middleware deshabilitado temporalmente
- **Service Worker:** Implementado para PWA
- **Backend:** Integrado con API en Render.com
- **Pagos:** Integrado con Wompi (Colombia)
- **Storage:** Supabase para imágenes

---

**Última actualización:** Diciembre 2024  
**Mantenido por:** Equipo VioTech Pro

