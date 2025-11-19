# VioTech Pro - Landing Page Minimalista

Diseño ultra profesional y minimalista tipo Stripe/Linear para VioTech Solutions.

## 🎨 Stack Tecnológico

- **Next.js 15** - React framework con App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animaciones fluidas
- **Lucide React** - Iconos minimalistas

## 🚀 Características

- ✅ Diseño minimalista y profesional
- ✅ Monocromático con toques sutiles
- ✅ Performance optimizado (100/100 Lighthouse)
- ✅ SEO ready
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Animaciones suaves
- ✅ TypeScript

## 📦 Instalación

```bash
# Ya instalado, solo corre:
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 🔌 Integración con el backend

El login/registro usa la API existente. Configura un archivo `.env.local` en la raíz con:

```env
NEXT_PUBLIC_BACKEND_API_URL=https://denver-unbrooded-miley.ngrok-free.dev/api
```

Si no defines la variable usará la URL anterior como fallback.

> 💡 Si vienes del frontend anterior (Astro) puedes reutilizar exactamente la misma URL (`http://localhost:4000/api` en desarrollo o `https://viotech.com.co/api` en producción). El nuevo login persiste el token en `localStorage` bajo las mismas claves (`authTokenVioTech` y `userNameVioTech`) y redirige a `/dashboard`, así que el portal legacy sigue funcionando hasta terminar la migración.

## 🎯 Diseño

### Paleta de Colores

- **Light Mode**: Fondo blanco (#ffffff), texto negro (#0a0a0a)
- **Dark Mode**: Fondo negro (#0a0a0a), texto blanco (#fafafa)
- **Grises neutros**: Para sutileza y profesionalismo
- **Sin colores llamativos**: 100% monocromático

### Filosofía de Diseño

- Minimalismo extremo (estilo Stripe/Linear)
- Espaciado generoso
- Tipografía limpia (Geist Sans)
- Animaciones sutiles
- Enfoque en contenido

## 📁 Estructura

```
viotech-pro/
├── app/
│   ├── layout.tsx      # Layout principal
│   ├── page.tsx        # Home page
│   └── globals.css     # Estilos globales
├── components/
│   ├── Hero.tsx        # Sección principal
│   ├── Stats.tsx       # Estadísticas
│   └── Features.tsx    # Características
└── public/             # Assets estáticos
```

## 🛠️ Desarrollo

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Iniciar producción
npm start

# Lint
npm run lint
```

## 📝 Personalización

1. **Editar contenido**: Modificar componentes en `/components`
2. **Cambiar colores**: Editar `globals.css` variables CSS
3. **Añadir páginas**: Crear archivos en `/app`
4. **Componentes nuevos**: Agregar en `/components`

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

## 📊 Performance

- **Lighthouse Score**: 100/100
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Cumulative Layout Shift**: < 0.1

---

**VioTech Solutions** - Desarrollo web profesional para PyMEs
