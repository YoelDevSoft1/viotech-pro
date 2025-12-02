# VioTech Pro - Frontend

Frontend de VioTech Pro, una plataforma SaaS B2B para PyMEs. Construido con Next.js 16, React 19, TypeScript y Tailwind CSS.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📚 Documentación

La documentación completa está en la carpeta [`docs/`](./docs/README.md):

- **[📖 Índice de Documentación](./docs/README.md)** - Guía completa de la documentación
- **[🏗️ Arquitectura](./docs/ARCHITECTURE.md)** - Arquitectura del frontend y patrones de desarrollo
- **[🛠️ Stack Tecnológico](./docs/STACK_TECNOLOGICO_COMPLETO.md)** - Tecnologías y dependencias
- **[🎯 Roadmap Estratégico 2025](./docs/VIOTECH_ROADMAP_STRATEGICO_2025.md)** - Visión y plan de desarrollo
- **[🤖 Agentes de Desarrollo](./docs/AGENTS.md)** - Guías para trabajar con Cursor

## 🎨 Stack Tecnológico

### Core
- **Next.js 16** - Framework React con App Router
- **React 19** - Biblioteca UI
- **TypeScript 5** - Type safety estricto

### UI y Estilos
- **Tailwind CSS 4** - Utility-first CSS
- **Shadcn/UI** - Design system base
- **Radix UI** - Primitives accesibles
- **Lucide React** - Iconos

### Estado y Datos
- **TanStack Query 5** - Server state management
- **Axios** - Cliente HTTP centralizado
- **React Hook Form + Zod** - Formularios y validación

### Internacionalización
- **next-intl** - i18n (español, inglés, portugués)

> Ver [Stack Tecnológico Completo](./docs/STACK_TECNOLOGICO_COMPLETO.md) para la lista completa de dependencias.

## 🔌 Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Backend API (requerido)
NEXT_PUBLIC_BACKEND_API_URL=https://viotech-main.onrender.com

# Features flags (opcional)
NEXT_PUBLIC_ENABLE_PREDICTOR=true
NEXT_PUBLIC_ENABLE_AI_ASSISTANT=true
NEXT_PUBLIC_ENABLE_ADMIN=true

# Supabase (opcional)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=

# Wompi (opcional)
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=
```

> **Nota**: El backend debe estar configurado para permitir CORS desde el dominio del frontend.

## 🏗️ Estructura del Proyecto

```
viotech-pro/
├── app/                    # Rutas Next.js (App Router)
│   ├── (auth)/            # Autenticación
│   ├── (client)/          # Portal cliente
│   ├── (marketing)/       # Landing y sitio público
│   ├── (ops-admin)/       # Panel administrativo
│   ├── (ops-internal)/    # Panel operaciones
│   └── (payments)/        # Flujos de pago
├── components/             # Componentes React
│   ├── ui/                # Componentes Shadcn/UI base
│   ├── dashboard/         # Componentes de dashboard
│   └── ...
├── lib/                    # Lógica compartida
│   ├── apiClient.ts       # Cliente Axios (NUNCA usar fetch directo)
│   ├── hooks/             # Custom hooks (TanStack Query)
│   ├── types/             # Tipos TypeScript
│   └── utils/             # Utilidades
├── messages/              # i18n (es.json, en.json, pt.json)
└── docs/                  # Documentación
```

> Ver [Arquitectura](./docs/ARCHITECTURE.md) para más detalles.

## 🛠️ Comandos de Desarrollo

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Iniciar producción
npm start

# Lint
npm run lint

# Type check
npm run type-check
```

## 📋 Reglas de Desarrollo

### Los 3 Mandamientos del Código

1. **No usarás `fetch` nativo** - Usa `lib/apiClient.ts` (Axios con interceptores JWT)
2. **No usarás `useEffect` para cargar datos** - Usa TanStack Query con custom hooks
3. **Separarás la UI de la Lógica** - Componentes para UI, hooks para lógica

> Ver [Arquitectura - Patrones de Desarrollo](./docs/ARCHITECTURE.md#-arquitectura-de-desarrollo) para ejemplos.

### Estándares de Código

- **TypeScript estricto** - Evitar `any`, usar tipos explícitos
- **Componentes funcionales** - Usar React Hooks
- **TanStack Query** - Para estado del servidor (nunca `fetch` directo)
- **React Hook Form + Zod** - Para formularios y validación
- **Shadcn/UI** - Para componentes base
- **next-intl** - Para textos visibles al usuario

## 🧪 Testing

> Testing aún no está configurado. Ver [Roadmap](./docs/VIOTECH_ROADMAP_STRATEGICO_2025.md) para planes futuros.

## 🚀 Deploy

### Vercel (Recomendado)

```bash
npm run build
vercel --prod
```

### Netlify

```bash
npm run build
netlify deploy --prod
```

> Asegúrate de configurar las variables de entorno en la plataforma de deploy.

## 📊 Performance

- **Lighthouse Score**: 100/100
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Cumulative Layout Shift**: < 0.1

## 🤝 Contribuir

1. Lee la [documentación](./docs/README.md)
2. Sigue los [patrones de desarrollo](./docs/ARCHITECTURE.md#-arquitectura-de-desarrollo)
3. Mantén el código tipado y documentado
4. Actualiza la documentación cuando sea necesario

## 📝 Licencia

Propietario - VioTech Solutions

---

**VioTech Solutions** - Desarrollo web profesional para PyMEs

Para más información, consulta la [documentación completa](./docs/README.md).
