# 🚀 Guía de Optimización de Imágenes y Lazy Loading

## ✅ Implementado

### 1. Optimización de Imágenes (next/image con WebP/AVIF)

#### Configuración en `next.config.ts`
- ✅ Formatos modernos: AVIF y WebP
- ✅ Device sizes optimizados
- ✅ Image sizes para diferentes breakpoints
- ✅ Cache TTL configurado
- ✅ Remote patterns para Supabase, Wompi, etc.

#### Componente Optimizado
**`components/common/OptimizedImage.tsx`**

```tsx
import { OptimizedImage } from "@/components/common/OptimizedImage";

// Uso básico
<OptimizedImage
  src="/hero-image.jpg"
  alt="Descripción de la imagen"
  width={1200}
  height={630}
  priority={true} // Solo para imágenes above-the-fold
/>

// Con lazy loading (por defecto)
<OptimizedImage
  src="/feature-image.jpg"
  alt="Feature"
  width={800}
  height={600}
  quality={85} // Calidad personalizada
/>
```

**Características:**
- ✅ Conversión automática a WebP/AVIF
- ✅ Lazy loading por defecto
- ✅ Blur placeholder mientras carga
- ✅ Responsive automático con sizes
- ✅ Optimización de tamaño

### 2. Lazy Loading de Componentes Pesados

#### Componentes con Lazy Loading
- ✅ `components/marketing/LazyHero.tsx` - Hero con framer-motion
- ✅ `components/marketing/LazyServices.tsx` - Services con animaciones
- ✅ `components/marketing/LazyCaseStudies.tsx` - Case studies

#### Patrón de Uso

```tsx
// En lugar de importar directamente:
import Hero from "@/components/marketing/Hero"; // ❌

// Usar la versión lazy:
import LazyHero from "@/components/marketing/LazyHero"; // ✅

// O usar dynamic import directamente:
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(
  () => import("./HeavyComponent"),
  {
    loading: () => <Skeleton />, // Loading state
    ssr: false, // Si usa librerías solo cliente (framer-motion, etc.)
  }
);
```

#### Cuándo Usar Lazy Loading

**✅ Usar lazy loading para:**
- Componentes con animaciones pesadas (framer-motion)
- Componentes que solo se ven al hacer scroll
- Componentes con muchas dependencias
- Componentes de terceros grandes
- Modales y dialogs que no se abren inmediatamente

**❌ NO usar lazy loading para:**
- Componentes críticos above-the-fold
- Componentes pequeños y ligeros
- Componentes que necesitan SEO (mejor SSR)

### 3. Mejores Prácticas

#### Imágenes
1. **Prioridad**: Solo marcar `priority={true}` en imágenes hero/above-the-fold
2. **Tamaños**: Siempre especificar width y height para evitar layout shift
3. **Alt text**: Siempre incluir descripción accesible
4. **Formato**: Dejar que Next.js convierta automáticamente a WebP/AVIF
5. **Remote images**: Configurar dominios en `next.config.ts`

#### Lazy Loading
1. **Loading states**: Siempre proporcionar skeleton o loading state
2. **SSR**: Desactivar solo si es necesario (framer-motion, etc.)
3. **Preload**: Considerar preload para componentes críticos
4. **Error handling**: Manejar errores de carga

### 4. Ejemplo Completo

```tsx
"use client";

import dynamic from "next/dynamic";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load componente pesado
const AnimatedSection = dynamic(
  () => import("./AnimatedSection"),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: false,
  }
);

export default function Page() {
  return (
    <div>
      {/* Imagen optimizada above-the-fold */}
      <OptimizedImage
        src="/hero.jpg"
        alt="Hero"
        width={1920}
        height={1080}
        priority={true}
      />

      {/* Componente lazy loaded */}
      <AnimatedSection />

      {/* Imagen lazy loaded */}
      <OptimizedImage
        src="/feature.jpg"
        alt="Feature"
        width={800}
        height={600}
        // priority por defecto es false = lazy loading
      />
    </div>
  );
}
```

### 5. Métricas de Performance

**Objetivos:**
- ✅ Lighthouse Image Score: 100/100
- ✅ Largest Contentful Paint (LCP): < 2.5s
- ✅ Cumulative Layout Shift (CLS): < 0.1
- ✅ First Input Delay (FID): < 100ms

**Herramientas de medición:**
- Lighthouse (Chrome DevTools)
- WebPageTest
- Next.js Analytics

---

**Última actualización**: Diciembre 2024  
**Estado**: ✅ Implementado y listo para usar

