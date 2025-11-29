# Requisitos Backend: Sistema de Blog

**Fecha:** Diciembre 2024  
**Prioridad:** Alta  
**Sprint:** 1.3 - Content Marketing  
**Estado:** Pendiente de implementación

---

## 📋 Resumen Ejecutivo

Este documento describe los requisitos técnicos para implementar el sistema de blog completo en el backend, incluyendo gestión de artículos, categorías, tags, suscripciones al newsletter y artículos relacionados.

---

## 🎯 Objetivos

1. **API REST completa** para gestión de artículos de blog
2. **Sistema de categorías y tags** para organización de contenido
3. **Newsletter subscription** para captura de leads
4. **Artículos relacionados** basados en categorías
5. **SEO optimizado** con metadata personalizable
6. **Búsqueda y filtrado** avanzado de artículos

---

## 📊 Estructura de Datos

### **Modelo: BlogPost**

```typescript
interface BlogPost {
  id: string;                    // UUID
  slug: string;                  // URL-friendly (único)
  title: string;                 // Título del artículo
  excerpt: string;               // Resumen corto (150-200 caracteres)
  content: string;               // Contenido HTML/Markdown
  authorId: string;              // FK a User
  categoryId: string;           // FK a BlogCategory
  featuredImage?: string;        // URL de imagen destacada
  publishedAt: Date;            // Fecha de publicación
  updatedAt?: Date;              // Última actualización
  readingTime?: number;         // Minutos estimados (calculado)
  views: number;                 // Contador de vistas (default: 0)
  isPublished: boolean;         // Estado de publicación
  seo?: {
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
  };
  tags: BlogTag[];               // Relación many-to-many
  createdAt: Date;
  updatedAt: Date;
}
```

### **Modelo: BlogCategory**

```typescript
interface BlogCategory {
  id: string;                   // UUID
  name: string;                  // Nombre de la categoría
  slug: string;                  // URL-friendly (único)
  description?: string;          // Descripción opcional
  postCount?: number;            // Contador de posts (calculado)
  createdAt: Date;
  updatedAt: Date;
}
```

### **Modelo: BlogTag**

```typescript
interface BlogTag {
  id: string;                   // UUID
  name: string;                  // Nombre del tag
  slug: string;                  // URL-friendly (único)
  postCount?: number;            // Contador de posts (calculado)
  createdAt: Date;
  updatedAt: Date;
}
```

### **Modelo: NewsletterSubscription**

```typescript
interface NewsletterSubscription {
  id: string;                   // UUID
  email: string;                 // Email (único, validado)
  isActive: boolean;             // Estado de suscripción
  subscribedAt: Date;            // Fecha de suscripción
  unsubscribedAt?: Date;         // Fecha de cancelación
  source?: string;               // Origen (blog, landing, etc.)
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔌 Endpoints Requeridos

### **1. GET /api/blog/posts**

**Descripción:** Obtener lista paginada de artículos publicados

**Autenticación:** ❌ **NO REQUERIDA** - Este endpoint debe ser **público**

**Query Parameters:**
- `page?: number` (default: 1)
- `limit?: number` (default: 12, max: 50)
- `category?: string` (slug de categoría)
- `tag?: string` (slug de tag)
- `search?: string` (búsqueda en título y contenido)

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "slug": "como-elegir-consultoria-ti",
        "title": "Cómo elegir una consultoría TI en 2025",
        "excerpt": "Guía completa para seleccionar...",
        "author": {
          "id": "uuid",
          "name": "Juan Pérez",
          "avatar": "https://...",
          "bio": "Consultor TI senior"
        },
        "category": {
          "id": "uuid",
          "name": "Consultoría",
          "slug": "consultoria"
        },
        "tags": [
          {
            "id": "uuid",
            "name": "TI",
            "slug": "ti"
          }
        ],
        "featuredImage": "https://...",
        "publishedAt": "2024-12-01T10:00:00Z",
        "readingTime": 5,
        "views": 1234
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 12,
    "totalPages": 5
  }
}
```

**Validaciones:**
- Solo mostrar posts con `isPublished: true`
- Ordenar por `publishedAt DESC`
- Incluir relaciones: author, category, tags
- Calcular `readingTime` automáticamente (aprox. 200 palabras/minuto)

---

### **2. GET /api/blog/posts/:slug**

**Descripción:** Obtener artículo individual por slug

**Autenticación:** ❌ **NO REQUERIDA** - Este endpoint debe ser **público**

**Path Parameters:**
- `slug` (string) - Slug del artículo (URL-friendly)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "como-elegir-consultoria-ti",
    "title": "Cómo elegir una consultoría TI en 2025",
    "excerpt": "Guía completa...",
    "content": "<html>...</html>",
    "author": {
      "id": "uuid",
      "name": "Juan Pérez",
      "avatar": "https://...",
      "bio": "Consultor TI senior"
    },
    "category": {
      "id": "uuid",
      "name": "Consultoría",
      "slug": "consultoria"
    },
    "tags": [...],
    "featuredImage": "https://...",
    "publishedAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-05T15:30:00Z",
    "readingTime": 5,
    "views": 1234,
    "seo": {
      "metaDescription": "...",
      "metaKeywords": ["consultoría", "TI"],
      "ogImage": "https://..."
    }
  }
}
```

**Validaciones:**
- Solo mostrar si `isPublished: true`
- Incrementar contador de `views` en cada lectura
- Retornar 404 si no existe o no está publicado

---

### **3. GET /api/blog/posts/:id/related**

**Descripción:** Obtener artículos relacionados

**Query Parameters:**
- `category: string` (ID de categoría)
- `limit?: number` (default: 3, max: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "slug": "otro-articulo",
      "title": "...",
      "excerpt": "...",
      "featuredImage": "https://...",
      "category": {...},
      "publishedAt": "..."
    }
  ]
}
```

**Lógica:**
- Buscar artículos de la misma categoría
- Excluir el artículo actual
- Ordenar por fecha de publicación (más recientes primero)
- Limitar resultados según parámetro

---

### **4. GET /api/blog/categories**

**Descripción:** Obtener todas las categorías con contador de posts

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Consultoría",
      "slug": "consultoria",
      "description": "Artículos sobre consultoría TI",
      "postCount": 15
    }
  ]
}
```

**Validaciones:**
- Incluir solo categorías con posts publicados
- Calcular `postCount` dinámicamente

---

### **5. GET /api/blog/tags**

**Descripción:** Obtener todos los tags con contador de posts

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "TI",
      "slug": "ti",
      "postCount": 25
    }
  ]
}
```

**Validaciones:**
- Incluir solo tags con posts publicados
- Calcular `postCount` dinámicamente
- Ordenar por `postCount DESC` (más populares primero)

---

### **6. POST /api/blog/newsletter/subscribe**

**Descripción:** Suscribir email al newsletter

**Body:**
```json
{
  "email": "usuario@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Suscripción exitosa",
  "data": {
    "id": "uuid",
    "email": "usuario@example.com",
    "subscribedAt": "2024-12-01T10:00:00Z"
  }
}
```

**Validaciones:**
- Validar formato de email
- Verificar que no esté ya suscrito (o reactivar si estaba desactivado)
- Si ya existe y está activo, retornar mensaje amigable
- Si existe pero está inactivo, reactivar y actualizar fecha

**Errores:**
- `400`: Email inválido
- `409`: Ya está suscrito (pero retornar éxito)

---

### **7. POST /api/blog/newsletter/unsubscribe**

**Descripción:** Cancelar suscripción al newsletter

**Body:**
```json
{
  "email": "usuario@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Suscripción cancelada"
}
```

---

## 🔐 Endpoints de Administración (Opcional - Fase 2)

### **POST /api/blog/posts** (Admin)
- Crear nuevo artículo
- Requiere autenticación y rol admin

### **PUT /api/blog/posts/:id** (Admin)
- Actualizar artículo existente

### **DELETE /api/blog/posts/:id** (Admin)
- Eliminar artículo (soft delete recomendado)

### **POST /api/blog/categories** (Admin)
- Crear categoría

### **POST /api/blog/tags** (Admin)
- Crear tag

---

## 🗄️ Esquema de Base de Datos

### **Tabla: blog_posts**

```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  category_id UUID NOT NULL REFERENCES blog_categories(id),
  featured_image VARCHAR(500),
  published_at TIMESTAMP,
  updated_at TIMESTAMP,
  reading_time INTEGER,
  views INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  seo_meta_description TEXT,
  seo_meta_keywords TEXT[], -- Array de strings
  seo_og_image VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(is_published, published_at DESC);
CREATE INDEX idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX idx_blog_posts_search ON blog_posts USING gin(to_tsvector('spanish', title || ' ' || excerpt));
```

### **Tabla: blog_categories**

```sql
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);
```

### **Tabla: blog_tags**

```sql
CREATE TABLE blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blog_tags_slug ON blog_tags(slug);
```

### **Tabla: blog_post_tags** (Many-to-Many)

```sql
CREATE TABLE blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX idx_blog_post_tags_post ON blog_post_tags(post_id);
CREATE INDEX idx_blog_post_tags_tag ON blog_post_tags(tag_id);
```

### **Tabla: newsletter_subscriptions**

```sql
CREATE TABLE newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP,
  source VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_active ON newsletter_subscriptions(is_active);
```

---

## 🔧 Funcionalidades Técnicas

### **1. Generación de Slug**

- Convertir título a slug automáticamente
- Eliminar acentos y caracteres especiales
- Convertir a minúsculas
- Reemplazar espacios con guiones
- Verificar unicidad y agregar sufijo numérico si es necesario

**Ejemplo:**
```
"Cómo elegir una consultoría TI en 2025"
→ "como-elegir-una-consultoria-ti-en-2025"
```

### **2. Cálculo de Reading Time**

- Contar palabras en el contenido HTML (sin tags)
- Dividir por 200 palabras/minuto (velocidad promedio)
- Redondear hacia arriba
- Guardar en base de datos para evitar cálculo en cada request

### **3. Búsqueda Full-Text**

- Usar PostgreSQL `to_tsvector` para búsqueda en español
- Buscar en: título, excerpt, contenido
- Ordenar por relevancia

**Ejemplo SQL:**
```sql
SELECT * FROM blog_posts
WHERE to_tsvector('spanish', title || ' ' || excerpt || ' ' || content) 
      @@ plainto_tsquery('spanish', $1)
AND is_published = true
ORDER BY ts_rank(...) DESC;
```

### **4. Incremento de Views**

- Incrementar contador de vistas en cada lectura
- Considerar usar Redis para evitar escrituras excesivas
- O usar batch updates cada X minutos

---

## 📝 Validaciones

### **BlogPost**
- `slug`: Requerido, único, formato válido (a-z, 0-9, guiones)
- `title`: Requerido, 3-500 caracteres
- `excerpt`: Requerido, 50-300 caracteres
- `content`: Requerido, mínimo 500 caracteres
- `authorId`: Requerido, debe existir en users
- `categoryId`: Requerido, debe existir en blog_categories
- `publishedAt`: Si `isPublished: true`, debe ser fecha válida

### **NewsletterSubscription**
- `email`: Requerido, formato válido, único

---

## 🚀 Endpoints de Ejemplo (Express/Node.js)

### **GET /api/blog/posts**

```typescript
router.get('/blog/posts', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, tag, search } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = db('blog_posts')
      .where('is_published', true)
      .orderBy('published_at', 'desc');
    
    if (category) {
      query = query.where('category_slug', category);
    }
    
    if (tag) {
      query = query
        .join('blog_post_tags', 'blog_posts.id', 'blog_post_tags.post_id')
        .join('blog_tags', 'blog_post_tags.tag_id', 'blog_tags.id')
        .where('blog_tags.slug', tag);
    }
    
    if (search) {
      query = query.whereRaw(
        "to_tsvector('spanish', title || ' ' || excerpt) @@ plainto_tsquery('spanish', ?)",
        [search]
      );
    }
    
    const [posts, total] = await Promise.all([
      query
        .select('blog_posts.*')
        .limit(Number(limit))
        .offset(offset)
        .withRelated(['author', 'category', 'tags']),
      query.clone().count('* as count').first()
    ]);
    
    res.json({
      success: true,
      data: {
        posts,
        total: Number(total.count),
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(Number(total.count) / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### **POST /api/blog/newsletter/subscribe**

```typescript
router.post('/blog/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validar email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido'
      });
    }
    
    // Buscar suscripción existente
    let subscription = await db('newsletter_subscriptions')
      .where('email', email.toLowerCase())
      .first();
    
    if (subscription) {
      if (subscription.is_active) {
        // Ya está suscrito
        return res.json({
          success: true,
          message: 'Ya estás suscrito a nuestro newsletter',
          data: subscription
        });
      } else {
        // Reactivar
        await db('newsletter_subscriptions')
          .where('id', subscription.id)
          .update({
            is_active: true,
            subscribed_at: new Date(),
            unsubscribed_at: null
          });
        
        subscription = await db('newsletter_subscriptions')
          .where('id', subscription.id)
          .first();
      }
    } else {
      // Crear nueva suscripción
      [subscription] = await db('newsletter_subscriptions')
        .insert({
          email: email.toLowerCase(),
          is_active: true,
          subscribed_at: new Date()
        })
        .returning('*');
    }
    
    res.json({
      success: true,
      message: 'Suscripción exitosa',
      data: subscription
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## 📊 Datos de Prueba (Seed)

### **Categorías Iniciales**

```sql
INSERT INTO blog_categories (name, slug, description) VALUES
('Consultoría', 'consultoria', 'Artículos sobre consultoría TI estratégica'),
('Desarrollo', 'desarrollo', 'Artículos sobre desarrollo de software'),
('Infraestructura', 'infraestructura', 'Artículos sobre cloud y DevOps'),
('Seguridad', 'seguridad', 'Artículos sobre ciberseguridad'),
('Transformación Digital', 'transformacion-digital', 'Artículos sobre transformación digital');
```

### **Tags Iniciales**

```sql
INSERT INTO blog_tags (name, slug) VALUES
('TI', 'ti'),
('Cloud', 'cloud'),
('AWS', 'aws'),
('Azure', 'azure'),
('DevOps', 'devops'),
('Agile', 'agile'),
('Scrum', 'scrum'),
('Microservicios', 'microservicios'),
('API', 'api'),
('React', 'react'),
('Next.js', 'nextjs'),
('TypeScript', 'typescript');
```

---

## ✅ Checklist de Implementación

- [ ] Crear modelos/tablas en base de datos
- [ ] Implementar endpoints GET /api/blog/posts
- [ ] Implementar endpoint GET /api/blog/posts/:slug
- [ ] Implementar endpoint GET /api/blog/posts/:id/related
- [ ] Implementar endpoint GET /api/blog/categories
- [ ] Implementar endpoint GET /api/blog/tags
- [ ] Implementar endpoint POST /api/blog/newsletter/subscribe
- [ ] Implementar endpoint POST /api/blog/newsletter/unsubscribe
- [ ] Agregar validaciones de datos
- [ ] Implementar generación de slugs
- [ ] Implementar cálculo de reading time
- [ ] Implementar búsqueda full-text
- [ ] Agregar índices de base de datos
- [ ] Crear datos de prueba (seed)
- [ ] Agregar tests unitarios
- [ ] Documentar API (Swagger/OpenAPI)

---

## 🔗 Integración con Frontend

El frontend ya está preparado y espera estos endpoints. Una vez implementados, el sistema funcionará automáticamente.

**Endpoints que el frontend consume:**
1. `GET /api/blog/posts` - Listado con filtros
2. `GET /api/blog/posts/:slug` - Detalle de artículo
3. `GET /api/blog/posts/:id/related` - Artículos relacionados
4. `GET /api/blog/categories` - Lista de categorías
5. `GET /api/blog/tags` - Lista de tags
6. `POST /api/blog/newsletter/subscribe` - Suscripción

---

## 📞 Contacto

Para dudas sobre la implementación, consultar con el equipo de frontend o revisar el código en:
- `lib/hooks/useBlog.ts` - Hooks de React Query
- `lib/types/blog.ts` - Tipos TypeScript esperados

---

**Última actualización:** Diciembre 2024

