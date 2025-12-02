# 🏗️ Sprint 4.2: Marketplace de Servicios - Diseño Arquitectónico

**Agente Orquestador:** Diseño completo del Marketplace de Servicios  
**Fecha:** Diciembre 2024  
**Estado:** 🎯 Diseño Inicial

---

## 1. Contexto & Suposiciones

### 1.1 Objetivo de Negocio

Transformar el catálogo básico de servicios en un **marketplace completo** que permita:

- **Descubrimiento mejorado**: Los clientes encuentren servicios relevantes fácilmente
- **Comparación inteligente**: Decisión informada entre opciones
- **Social proof**: Reviews y ratings que generen confianza
- **Personalización**: Recomendaciones basadas en perfil y necesidades
- **Conversión optimizada**: UX que facilite la compra

### 1.2 Suposiciones

- El backend ya tiene endpoints básicos para `/services/catalog`
- Los servicios tienen estructura: `id`, `nombre`, `tipo`, `precio`, `features[]`
- Necesitamos extender el modelo para incluir: `categorias[]`, `tags[]`, `rating`, `reviews[]`, `metadata`
- Las recomendaciones pueden ser basadas en reglas (v1) o ML (v2)
- Los reviews requieren autenticación pero pueden ser públicos

---

## 2. Diseño & Arquitectura

### 2.1 Modelo de Datos Extendido

```typescript
// lib/types/services.ts

export interface ServiceCategory {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  icon?: string;
  parentId?: string; // Para categorías anidadas
}

export interface ServiceTag {
  id: string;
  nombre: string;
  slug: string;
}

export interface ServiceReview {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  verified: boolean; // Cliente que compró el servicio
  createdAt: string;
  helpful: number; // Contador de "útil"
}

export interface ServiceMetadata {
  popular?: boolean;
  featured?: boolean;
  new?: boolean;
  bestSeller?: boolean;
  discount?: {
    percentage: number;
    validUntil: string;
  };
}

export interface ServicePlanExtended {
  id: string;
  nombre: string;
  tipo: string;
  slug: string;
  descripcion: string;
  descripcionCorta?: string;
  precio: number;
  currency: string;
  features: string[];
  
  // Nuevos campos
  categorias: ServiceCategory[];
  tags: ServiceTag[];
  rating: {
    average: number;
    count: number;
  };
  reviews?: ServiceReview[];
  metadata?: ServiceMetadata;
  
  // Para comparación
  specs?: Record<string, string | number | boolean>;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  image?: string;
  
  // Fechas
  createdAt: string;
  updatedAt: string;
}

export interface ServiceComparison {
  services: ServicePlanExtended[];
  differences: {
    field: string;
    values: Record<string, any>;
  }[];
}
```

### 2.2 Arquitectura de Componentes Frontend

```
app/(marketing)/services/
├── page.tsx                    # Landing de servicios (existente)
├── catalog/
│   ├── page.tsx                # Catálogo principal (mejorado)
│   ├── catalog-client.tsx      # Cliente del catálogo (refactor)
│   ├── [slug]/
│   │   └── page.tsx            # Detalle de servicio individual
│   ├── compare/
│   │   └── page.tsx            # Página de comparación
│   └── search/
│       └── page.tsx            # Página de búsqueda avanzada

components/services/
├── ServiceCard.tsx             # Card de servicio (mejorado)
├── ServiceGrid.tsx             # Grid responsive de servicios
├── ServiceFilters.tsx          # Panel de filtros lateral
├── ServiceSearch.tsx           # Barra de búsqueda avanzada
├── ServiceComparison.tsx       # Tabla de comparación
├── ServiceReviews.tsx          # Lista y formulario de reviews
├── ServiceRating.tsx           # Componente de rating (estrellas)
├── ServiceRecommendations.tsx  # Sección de recomendaciones
├── ServiceCategoryFilter.tsx   # Filtro por categorías
├── ServiceTagCloud.tsx         # Nube de tags
└── ServiceSpecsTable.tsx       # Tabla de especificaciones técnicas
```

### 2.3 Hooks de React Query

```typescript
// lib/hooks/useServicesMarketplace.ts

// Catálogo con filtros
export function useServiceCatalog(filters?: {
  category?: string;
  tags?: string[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: 'price' | 'rating' | 'popular' | 'newest';
  page?: number;
  limit?: number;
}) {
  // GET /api/services/catalog?category=...&tags=...&search=...
}

// Servicio individual
export function useServiceBySlug(slug: string) {
  // GET /api/services/catalog/:slug
}

// Reviews de un servicio
export function useServiceReviews(serviceId: string) {
  // GET /api/services/:id/reviews
}

// Crear review
export function useCreateServiceReview() {
  // POST /api/services/:id/reviews
}

// Comparar servicios
export function useCompareServices(serviceIds: string[]) {
  // POST /api/services/compare { serviceIds: [...] }
}

// Recomendaciones
export function useServiceRecommendations(userId?: string) {
  // GET /api/services/recommendations?userId=...
  // Si no hay userId, recomendaciones generales (populares, nuevos)
}
```

### 2.4 Endpoints Backend Requeridos

```
GET  /api/services/catalog
  Query params:
    - category (string, opcional)
    - tags (string[], opcional)
    - search (string, opcional)
    - minPrice, maxPrice (number, opcional)
    - rating (number, opcional, mínimo)
    - sortBy (string: 'price' | 'rating' | 'popular' | 'newest')
    - page, limit (paginación)
  
  Response: {
    success: true,
    data: {
      services: ServicePlanExtended[],
      pagination: { page, limit, total, totalPages },
      filters: { categories, tags, priceRange }
    }
  }

GET  /api/services/catalog/:slug
  Response: {
    success: true,
    data: ServicePlanExtended
  }

GET  /api/services/categories
  Response: {
    success: true,
    data: ServiceCategory[]
  }

GET  /api/services/tags
  Response: {
    success: true,
    data: ServiceTag[]
  }

GET  /api/services/:id/reviews
  Query params:
    - page, limit (paginación)
    - sortBy (string: 'newest' | 'oldest' | 'rating' | 'helpful')
  
  Response: {
    success: true,
    data: {
      reviews: ServiceReview[],
      pagination: { page, limit, total, totalPages },
      summary: { average, count, distribution: { 5: 10, 4: 5, ... } }
    }
  }

POST /api/services/:id/reviews
  Auth: Requerido
  Body: {
    rating: number (1-5),
    title: string,
    comment: string
  }
  
  Response: {
    success: true,
    data: ServiceReview
  }

POST /api/services/reviews/:id/helpful
  Auth: Requerido
  Response: { success: true, helpful: number }

POST /api/services/compare
  Body: {
    serviceIds: string[]
  }
  
  Response: {
    success: true,
    data: ServiceComparison
  }

GET  /api/services/recommendations
  Query params:
    - userId (string, opcional)
    - limit (number, default: 6)
  
  Response: {
    success: true,
    data: ServicePlanExtended[]
  }
```

---

## 3. Plan por Roles/Agentes

### 3.1 FRONTEND_NEXT_REACT_TS

#### Fase 1: Fundación (MVP)
- [ ] **Tipos TypeScript** (`lib/types/services.ts`)
  - Extender `ServicePlan` a `ServicePlanExtended`
  - Crear interfaces: `ServiceCategory`, `ServiceTag`, `ServiceReview`, `ServiceMetadata`
  - Crear tipo `ServiceComparison`

- [ ] **Hooks de React Query** (`lib/hooks/useServicesMarketplace.ts`)
  - `useServiceCatalog(filters)` - Catálogo con filtros
  - `useServiceBySlug(slug)` - Servicio individual
  - `useServiceReviews(serviceId)` - Reviews
  - `useCreateServiceReview()` - Crear review
  - `useCompareServices(serviceIds)` - Comparación
  - `useServiceRecommendations(userId?)` - Recomendaciones

- [ ] **Componentes Base**
  - `ServiceCard.tsx` - Card mejorado con rating, badges, preview
  - `ServiceGrid.tsx` - Grid responsive con skeleton loading
  - `ServiceRating.tsx` - Estrellas interactivas (display y input)

#### Fase 2: Filtros y Búsqueda
- [ ] **Componentes de Filtrado**
  - `ServiceFilters.tsx` - Panel lateral con:
    - Filtro por categoría (tree)
    - Filtro por tags (checkboxes)
    - Rango de precios (slider)
    - Rating mínimo (estrellas)
    - Botón "Limpiar filtros"
  - `ServiceSearch.tsx` - Barra de búsqueda con:
    - Autocompletado
    - Sugerencias
    - Historial de búsquedas (localStorage)
  - `ServiceCategoryFilter.tsx` - Tree de categorías
  - `ServiceTagCloud.tsx` - Nube de tags clickeable

- [ ] **Página de Catálogo Mejorada**
  - Refactorizar `catalog-client.tsx`:
    - Integrar filtros
    - Búsqueda en tiempo real
    - Ordenamiento (dropdown)
    - Vista de grid/list toggle
    - Paginación mejorada

#### Fase 3: Detalle y Comparación
- [ ] **Página de Detalle** (`[slug]/page.tsx`)
  - Hero con imagen, título, rating, precio
  - Tabs: Descripción, Features, Specs, Reviews
  - `ServiceSpecsTable.tsx` - Tabla de especificaciones
  - `ServiceReviews.tsx` - Lista de reviews con:
    - Filtro por rating
    - Ordenamiento
    - Formulario para crear review (si autenticado)
    - Botón "útil" en cada review
  - CTA: "Comprar ahora" → CheckoutModal

- [ ] **Página de Comparación** (`compare/page.tsx`)
  - Selector de servicios (máx 4)
  - `ServiceComparison.tsx` - Tabla comparativa:
    - Columnas: Servicio 1, Servicio 2, Servicio 3, Servicio 4
    - Filas: Precio, Features, Specs, Rating, Reviews
    - Diferencias destacadas
  - Botón "Agregar servicio" para comparar más
  - Exportar comparación (PDF)

#### Fase 4: Recomendaciones
- [ ] **Componente de Recomendaciones**
  - `ServiceRecommendations.tsx`:
    - Sección "Para ti" (si autenticado)
    - Sección "Populares"
    - Sección "Nuevos"
    - Sección "Relacionados" (misma categoría)
  - Integrar en:
    - Página de catálogo
    - Página de detalle
    - Dashboard cliente

#### Fase 5: UX y Polish
- [ ] **Traducciones** (ES, EN, PT)
  - Agregar keys para marketplace en `messages/*.json`
  - Namespace: `services.marketplace.*`

- [ ] **Skeletons y Loading States**
  - Skeleton para ServiceCard
  - Skeleton para ServiceGrid
  - Loading states en filtros

- [ ] **Empty States**
  - Sin resultados de búsqueda
  - Sin reviews
  - Sin recomendaciones

- [ ] **Toasts y Feedback**
  - Review creado exitosamente
  - Error al crear review
  - Servicio agregado a comparación

### 3.2 BACKEND_EXPRESS_SUPABASE

#### Fase 1: Modelos y Migraciones
- [ ] **Tablas en Supabase**
  ```sql
  -- Categorías de servicios
  CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    icon VARCHAR(50),
    parent_id UUID REFERENCES service_categories(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- Tags de servicios
  CREATE TABLE service_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Relación servicios-categorías (many-to-many)
  CREATE TABLE service_category_relations (
    service_id UUID REFERENCES services(id),
    category_id UUID REFERENCES service_categories(id),
    PRIMARY KEY (service_id, category_id)
  );

  -- Relación servicios-tags (many-to-many)
  CREATE TABLE service_tag_relations (
    service_id UUID REFERENCES services(id),
    tag_id UUID REFERENCES service_tags(id),
    PRIMARY KEY (service_id, tag_id)
  );

  -- Reviews de servicios
  CREATE TABLE service_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    title VARCHAR(200) NOT NULL,
    comment TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE, -- Si el usuario compró el servicio
    helpful INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(service_id, user_id) -- Un review por usuario por servicio
  );

  -- Relación usuarios-reviews útiles (para evitar duplicados)
  CREATE TABLE service_review_helpful (
    review_id UUID REFERENCES service_reviews(id),
    user_id UUID REFERENCES users(id),
    PRIMARY KEY (review_id, user_id)
  );

  -- Metadata de servicios (JSONB para flexibilidad)
  ALTER TABLE services ADD COLUMN metadata JSONB;
  ALTER TABLE services ADD COLUMN slug VARCHAR(100) UNIQUE;
  ALTER TABLE services ADD COLUMN descripcion_corta TEXT;
  ALTER TABLE services ADD COLUMN image_url TEXT;
  ```

- [ ] **Modelos en Backend** (`models/ServiceCategory.js`, `models/ServiceTag.js`, `models/ServiceReview.js`)
  - Funciones CRUD básicas
  - Validaciones con express-validator

#### Fase 2: Endpoints de Catálogo
- [ ] **GET /api/services/catalog**
  - Implementar filtros:
    - Por categoría (incluir subcategorías)
    - Por tags (AND/OR lógico)
    - Por búsqueda (nombre, descripción)
    - Por rango de precio
    - Por rating mínimo
  - Ordenamiento:
    - Por precio (asc/desc)
    - Por rating (desc)
    - Por popularidad (contador de compras)
    - Por fecha (nuevos primero)
  - Paginación
  - Retornar también: categorías disponibles, tags disponibles, rango de precios

- [ ] **GET /api/services/catalog/:slug**
  - Obtener servicio por slug
  - Incluir: categorías, tags, rating promedio, metadata
  - Incrementar contador de vistas

- [ ] **GET /api/services/categories**
  - Lista todas las categorías
  - Estructura jerárquica (con parent_id)

- [ ] **GET /api/services/tags**
  - Lista todos los tags
  - Opcional: con contador de servicios

#### Fase 3: Reviews
- [ ] **GET /api/services/:id/reviews**
  - Lista reviews con paginación
  - Filtro por rating
  - Ordenamiento: newest, oldest, rating, helpful
  - Incluir: resumen (promedio, distribución de ratings)

- [ ] **POST /api/services/:id/reviews**
  - Crear review (auth requerido)
  - Validar: rating 1-5, título y comentario no vacíos
  - Verificar si usuario compró el servicio (verified = true)
  - Recalcular rating promedio del servicio
  - Retornar review creado

- [ ] **POST /api/services/reviews/:id/helpful**
  - Marcar review como útil (auth requerido)
  - Evitar duplicados (tabla service_review_helpful)
  - Incrementar contador helpful

#### Fase 4: Comparación y Recomendaciones
- [ ] **POST /api/services/compare**
  - Recibir array de serviceIds (máx 4)
  - Retornar comparación:
    - Datos de cada servicio
    - Diferencias destacadas (precio, features, specs)

- [ ] **GET /api/services/recommendations**
  - Si userId presente:
    - Basado en servicios comprados
    - Basado en categorías favoritas
    - Basado en búsquedas previas
  - Si no userId:
    - Servicios populares (más comprados)
    - Servicios nuevos (últimos 30 días)
    - Servicios mejor valorados
  - Retornar array de servicios

#### Fase 5: Optimizaciones
- [ ] **Caché**
  - Redis para catálogo (TTL: 30 min)
  - Cachear reviews por servicio (TTL: 1 hora)
  - Invalidar cache al crear review

- [ ] **Índices**
  - Índice en `services.slug`
  - Índice en `service_reviews.service_id, rating`
  - Índice en `service_category_relations`
  - Índice en `service_tag_relations`

- [ ] **Agregaciones**
  - Calcular rating promedio en tiempo real (o cachear)
  - Contador de reviews por servicio
  - Contador de compras por servicio (para popularidad)

### 3.3 UX_PRODUCT

- [ ] **Diseño de ServiceCard**
  - Rating visible (estrellas + número)
  - Badges: "Popular", "Nuevo", "Destacado", "Descuento"
  - Preview de imagen
  - Hover: mostrar más info
  - CTA claro: "Ver detalles" / "Comprar"

- [ ] **Diseño de Filtros**
  - Panel lateral colapsable (mobile: drawer)
  - Filtros agrupados lógicamente
  - Contador de resultados
  - Botón "Aplicar" / "Limpiar"

- [ ] **Diseño de Comparación**
  - Tabla responsive
  - Diferencias destacadas (verde/rojo)
  - Sticky header al hacer scroll
  - Exportar a PDF

- [ ] **Diseño de Reviews**
  - Rating visual (estrellas)
  - Avatar del usuario
  - Badge "Verificado" si compró
  - Botón "Útil" con contador
  - Formulario inline para crear review

- [ ] **Flujo de Compra**
  - Desde catálogo → Detalle → Checkout
  - Desde comparación → Seleccionar → Checkout
  - Mantener contexto (volver atrás)

### 3.4 QA_AUTOMATION

- [ ] **Tests E2E** (Playwright)
  - Navegar catálogo
  - Aplicar filtros
  - Buscar servicio
  - Ver detalle de servicio
  - Comparar servicios
  - Crear review (autenticado)
  - Ver recomendaciones

- [ ] **Tests de Integración**
  - Hooks de React Query
  - Componentes con datos mock

- [ ] **Tests de Accesibilidad**
  - ARIA labels en filtros
  - Navegación por teclado
  - Screen reader compatibility

### 3.5 DOCS_KNOWLEDGE

- [ ] **Documentación de API**
  - Swagger/OpenAPI para nuevos endpoints
  - Ejemplos de requests/responses

- [ ] **Guía de Uso**
  - Cómo usar el marketplace
  - Cómo comparar servicios
  - Cómo dejar un review

---

## 4. Prioridades

### MVP (v0) - Primera Iteración
1. ✅ Tipos TypeScript extendidos
2. ✅ Hooks básicos de React Query
3. ✅ Componente ServiceCard mejorado
4. ✅ Filtros básicos (categoría, precio, rating)
5. ✅ Búsqueda simple
6. ✅ Backend: GET /api/services/catalog con filtros
7. ✅ Backend: GET /api/services/catalog/:slug
8. ✅ Backend: GET /api/services/categories

### v1 - Funcionalidad Completa
1. ✅ Reviews (listar y crear)
2. ✅ Comparación de servicios
3. ✅ Recomendaciones básicas
4. ✅ Página de detalle completa
5. ✅ Backend: Endpoints de reviews
6. ✅ Backend: Endpoint de comparación
7. ✅ Backend: Endpoint de recomendaciones

### v2 - Optimizaciones
1. ⏳ Recomendaciones con ML
2. ⏳ Autocompletado avanzado
3. ⏳ Analytics de búsquedas
4. ⏳ A/B testing de CTAs
5. ⏳ Caché avanzado
6. ⏳ Performance optimization

---

## 5. Riesgos & Recomendaciones

### Riesgos Técnicos

1. **Performance con muchos servicios**
   - **Riesgo**: Catálogo lento con 1000+ servicios
   - **Mitigación**: 
     - Paginación eficiente
     - Índices en BD
     - Caché de resultados
     - Lazy loading de imágenes

2. **Reviews spam/falsos**
   - **Riesgo**: Reviews falsos afectan confianza
   - **Mitigación**:
     - Verificar compra (verified = true)
     - Moderación manual (flag para admin)
     - Rate limiting por usuario

3. **Recomendaciones poco precisas**
   - **Riesgo**: Recomendaciones irrelevantes
   - **Mitigación**:
     - Empezar con reglas simples (v1)
     - Recolectar datos de uso
     - Mejorar con ML gradualmente (v2)

### Riesgos de Producto/UX

1. **Sobrecarga de opciones**
   - **Riesgo**: Demasiados filtros confunden
   - **Mitigación**:
     - Filtros por defecto (más usados)
     - Panel colapsable
     - Guardar preferencias de usuario

2. **Comparación compleja**
   - **Riesgo**: Tabla de comparación difícil de leer
   - **Mitigación**:
     - Máximo 4 servicios
     - Diferencias destacadas
     - Vista móvil simplificada

### Recomendaciones

1. **Empezar simple**
   - MVP con filtros básicos
   - Reviews simples (rating + comentario)
   - Recomendaciones por reglas

2. **Iterar basado en datos**
   - Analytics de búsquedas
   - Heatmaps de interacción
   - Feedback de usuarios

3. **SEO**
   - URLs amigables (`/services/catalog/desarrollo-software`)
   - Metadata dinámica por servicio
   - Structured data (Product schema)

---

## 6. Métricas de Éxito

- **Descubrimiento**: % de usuarios que encuentran servicios relevantes
- **Conversión**: Tasa de clic en "Comprar" desde catálogo
- **Engagement**: Tiempo en página de catálogo
- **Reviews**: Número de reviews por servicio (objetivo: 5+)
- **Recomendaciones**: Click-through rate de recomendaciones
- **Comparación**: % de usuarios que usan comparación antes de comprar

---

**Próximos Pasos:**
1. Revisar y aprobar este diseño
2. Asignar tareas por agente
3. Iniciar Fase 1 (MVP)

