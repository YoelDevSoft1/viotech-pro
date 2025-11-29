# Requisitos Backend: Editor de Blog y Sistema de Comentarios

**Fecha:** Diciembre 2024  
**Prioridad:** Media  
**Sprint:** 1.3 - Content Marketing (Extensión)  
**Estado:** Pendiente de implementación

---

## 📋 Resumen Ejecutivo

Este documento describe los requisitos técnicos para implementar:
1. **Editor de contenido** para administradores (crear/editar posts del blog)
2. **Sistema de comentarios** para usuarios (comentar en artículos)

---

## 🎯 Parte 1: Editor de Contenido (Admin)

### **Endpoints Requeridos**

#### **1. POST /api/blog/posts** (Admin)

**Descripción:** Crear nuevo artículo del blog

**Autenticación:** Requerida (rol: admin)

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Título del artículo",
  "excerpt": "Resumen corto del artículo (150-200 caracteres)",
  "content": "<html>Contenido completo en HTML...</html>",
  "categoryId": "uuid-de-categoria",
  "tagIds": ["uuid-tag-1", "uuid-tag-2"],
  "featuredImage": "https://storage.supabase.co/.../image.jpg",
  "isPublished": false,
  "publishedAt": "2024-12-01T10:00:00.000Z",
  "seo": {
    "metaDescription": "Meta description para SEO",
    "metaKeywords": ["keyword1", "keyword2"],
    "ogImage": "https://storage.supabase.co/.../og-image.jpg"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Artículo creado exitosamente",
  "data": {
    "id": "uuid",
    "slug": "titulo-del-articulo",
    "title": "Título del artículo",
    "excerpt": "...",
    "content": "...",
    "author": {
      "id": "uuid",
      "name": "Admin User"
    },
    "category": {...},
    "tags": [...],
    "isPublished": false,
    "createdAt": "2024-12-01T10:00:00.000Z"
  }
}
```

**Validaciones:**
- `title`: Requerido, 3-500 caracteres
- `excerpt`: Requerido, 50-300 caracteres
- `content`: Requerido, mínimo 500 caracteres
- `categoryId`: Requerido, debe existir
- `tagIds`: Opcional, array de UUIDs válidos
- `slug`: Generado automáticamente desde el título (único)
- `readingTime`: Calculado automáticamente

---

#### **2. PUT /api/blog/posts/:id** (Admin)

**Descripción:** Actualizar artículo existente

**Autenticación:** Requerida (rol: admin)

**Path Parameters:**
- `id` (UUID) - ID del artículo

**Body:** (Mismo formato que POST, todos los campos opcionales)

```json
{
  "title": "Título actualizado",
  "excerpt": "Nuevo resumen",
  "content": "<html>Contenido actualizado...</html>",
  "categoryId": "uuid-nueva-categoria",
  "tagIds": ["uuid-tag-1", "uuid-tag-3"],
  "featuredImage": "https://...",
  "isPublished": true,
  "publishedAt": "2024-12-01T10:00:00.000Z",
  "seo": {
    "metaDescription": "...",
    "metaKeywords": [...],
    "ogImage": "..."
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Artículo actualizado exitosamente",
  "data": {
    "id": "uuid",
    "slug": "titulo-actualizado",
    "title": "Título actualizado",
    "updatedAt": "2024-12-01T15:30:00.000Z",
    ...
  }
}
```

**Notas:**
- Si se actualiza el `title`, regenerar el `slug` (verificar unicidad)
- Actualizar `updatedAt` automáticamente
- Recalcular `readingTime` si cambia el contenido

---

#### **3. GET /api/blog/posts/:id** (Admin)

**Descripción:** Obtener artículo individual por ID (para edición en admin)

**Autenticación:** Requerida (rol: admin)

**Path Parameters:**
- `id` (UUID) - ID del artículo

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {
    "id": "uuid",
    "slug": "titulo-del-articulo",
    "title": "Título del artículo",
    "excerpt": "Resumen corto...",
    "content": "<html>Contenido completo...</html>",
    "author": {
      "id": "uuid",
      "name": "Admin User",
      "avatar": "https://..."
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
    "isPublished": false,  // ← Puede ser false (borrador)
    "publishedAt": null,    // ← Puede ser null si es borrador
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-01T10:00:00.000Z",
    "views": 0,
    "seo": {
      "metaDescription": "...",
      "metaKeywords": ["keyword1", "keyword2"],
      "ogImage": "https://..."
    }
  }
}
```

**Validaciones:**
- Verificar que el usuario tenga rol de admin
- Retornar 404 si el post no existe
- **IMPORTANTE:** Incluir posts borradores (no filtrar por `isPublished`)
- Incluir relaciones: author, category, tags
- Incluir contenido completo (`content`)

**Notas:**
- Este endpoint es diferente a `GET /api/blog/posts/:slug` (público)
- El endpoint público solo retorna posts publicados
- Este endpoint admin retorna cualquier post (publicado o borrador)

---

#### **4. DELETE /api/blog/posts/:id** (Admin)

**Descripción:** Eliminar artículo (soft delete recomendado)

**Autenticación:** Requerida (rol: admin)

**Path Parameters:**
- `id` (UUID) - ID del artículo

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Artículo eliminado exitosamente"
}
```

**Recomendación:** Implementar soft delete (marcar como eliminado, no borrar físicamente)

---

#### **4. POST /api/blog/categories** (Admin)

**Descripción:** Crear nueva categoría

**Autenticación:** Requerida (rol: admin)

**Body:**
```json
{
  "name": "Nueva Categoría",
  "description": "Descripción opcional de la categoría"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Categoría creada exitosamente",
  "data": {
    "id": "uuid",
    "name": "Nueva Categoría",
    "slug": "nueva-categoria",
    "description": "...",
    "createdAt": "2024-12-01T10:00:00.000Z"
  }
}
```

**Validaciones:**
- `name`: Requerido, único
- `slug`: Generado automáticamente desde el nombre

---

#### **5. POST /api/blog/tags** (Admin)

**Descripción:** Crear nuevo tag

**Autenticación:** Requerida (rol: admin)

**Body:**
```json
{
  "name": "Nuevo Tag"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Tag creado exitosamente",
  "data": {
    "id": "uuid",
    "name": "Nuevo Tag",
    "slug": "nuevo-tag",
    "createdAt": "2024-12-01T10:00:00.000Z"
  }
}
```

**Validaciones:**
- `name`: Requerido, único
- `slug`: Generado automáticamente desde el nombre

---

#### **3. GET /api/blog/posts** (Admin - Listar todos los posts)

**Descripción:** Obtener lista de TODOS los artículos (incluyendo borradores) para administradores

**Autenticación:** Requerida (rol: admin)

**Query Parameters:**
- `all?: boolean` (default: `false`) - **IMPORTANTE:** Si `all=true`, retornar TODOS los posts (publicados y borradores). Si `all=false` o no se envía, retornar solo publicados (comportamiento público).
- `page?: number` (default: 1)
- `limit?: number` (default: 12, max: 50)
- `category?: string` (slug de categoría)
- `tag?: string` (slug de tag)
- `search?: string` (búsqueda en título y contenido)

**Ejemplo de Request:**
```
GET /api/blog/posts?all=true&limit=50
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {
    "posts": [
      {
        "id": "uuid",
        "slug": "titulo-del-articulo",
        "title": "Título del artículo",
        "excerpt": "Resumen corto...",
        "author": {
          "id": "uuid",
          "name": "Admin User",
          "avatar": "https://..."
        },
        "category": {
          "id": "uuid",
          "name": "Consultoría",
          "slug": "consultoria"
        },
        "tags": [...],
        "featuredImage": "https://...",
        "isPublished": false,  // ← Puede ser false (borrador)
        "publishedAt": null,    // ← Puede ser null si es borrador
        "createdAt": "2024-12-01T10:00:00.000Z",
        "updatedAt": "2024-12-01T10:00:00.000Z",
        "views": 0
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

**Lógica de Filtrado:**
- Si `all=true` Y usuario es admin: Retornar TODOS los posts (publicados y borradores)
- Si `all=false` o no se envía: Retornar solo posts con `isPublished: true` (comportamiento público)
- Ordenar por `createdAt DESC` (más recientes primero)
- Incluir relaciones: author, category, tags

**Validaciones:**
- Verificar que el usuario tenga rol de admin
- Si `all=true` sin autenticación admin, retornar error 403

---

#### **4. GET /api/blog/categories** (Admin - Listar todas las categorías)

**Descripción:** Obtener TODAS las categorías (incluyendo las sin posts publicados) para administradores

**Autenticación:** Requerida (rol: admin)

**Query Parameters:**
- `all?: boolean` (default: `false`) - Si `all=true`, retornar TODAS las categorías. Si `all=false`, retornar solo categorías con posts publicados (comportamiento público).

**Ejemplo de Request:**
```
GET /api/blog/categories?all=true
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": [
    {
      "id": "uuid",
      "name": "Consultoría",
      "slug": "consultoria",
      "description": "Artículos sobre consultoría TI",
      "postCount": 15  // Incluye borradores si all=true
    },
    {
      "id": "uuid-2",
      "name": "Nueva Categoría",
      "slug": "nueva-categoria",
      "description": "Sin posts aún",
      "postCount": 0  // ← Esta categoría no aparecería sin all=true
    }
  ]
}
```

**Lógica:**
- Si `all=true` Y usuario es admin: Retornar TODAS las categorías (incluso con `postCount: 0`)
- Si `all=false` o no se envía: Retornar solo categorías con posts publicados (comportamiento público)

---

#### **5. GET /api/blog/tags** (Admin - Listar todos los tags)

**Descripción:** Obtener TODOS los tags (incluyendo los sin posts publicados) para administradores

**Autenticación:** Requerida (rol: admin)

**Query Parameters:**
- `all?: boolean` (default: `false`) - Si `all=true`, retornar TODOS los tags. Si `all=false`, retornar solo tags con posts publicados (comportamiento público).

**Ejemplo de Request:**
```
GET /api/blog/tags?all=true
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": [
    {
      "id": "uuid",
      "name": "TI",
      "slug": "ti",
      "postCount": 25  // Incluye borradores si all=true
    },
    {
      "id": "uuid-2",
      "name": "Nuevo Tag",
      "slug": "nuevo-tag",
      "postCount": 0  // ← Este tag no aparecería sin all=true
    }
  ]
}
```

**Lógica:**
- Si `all=true` Y usuario es admin: Retornar TODOS los tags (incluso con `postCount: 0`)
- Si `all=false` o no se envía: Retornar solo tags con posts publicados (comportamiento público)

---

## 🎯 Parte 2: Sistema de Comentarios

### **Estructura de Datos**

#### **Modelo: BlogComment**

```typescript
interface BlogComment {
  id: string;                    // UUID
  postId: string;                // FK a blog_posts
  userId: string | null;          // FK a users (null si es anónimo)
  parentId: string | null;        // FK a blog_comments (para respuestas)
  authorName: string;             // Nombre del autor
  authorEmail: string | null;     // Email (opcional, para anónimos)
  content: string;                // Contenido del comentario
  isApproved: boolean;            // Moderación (default: false para anónimos)
  likes: number;                  // Contador de likes
  createdAt: string;              // ISO date string
  updatedAt?: string;              // ISO date string
  replies?: BlogComment[];         // Respuestas (nested)
}
```

### **Endpoints Requeridos**

#### **1. GET /api/blog/posts/:slug/comments**

**Descripción:** Obtener comentarios de un artículo

**Autenticación:** ❌ **NO REQUERIDA** - Este endpoint debe ser **público**

**Query Parameters:**
- `approved?: boolean` (default: `true` para público, `false` para admin)
- `includeReplies?: boolean` (default: `true`)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "postId": "uuid",
      "userId": "uuid",
      "parentId": null,
      "authorName": "Juan Pérez",
      "authorEmail": null,
      "content": "Excelente artículo, muy útil.",
      "isApproved": true,
      "likes": 5,
      "createdAt": "2024-12-01T10:00:00.000Z",
      "replies": [
        {
          "id": "uuid-reply",
          "parentId": "uuid",
          "authorName": "Admin",
          "content": "Gracias por tu comentario!",
          "isApproved": true,
          "likes": 2,
          "createdAt": "2024-12-01T11:00:00.000Z"
        }
      ]
    }
  ]
}
```

**Notas:**
- Solo mostrar comentarios aprobados para usuarios públicos
- Ordenar por fecha (más recientes primero)
- Incluir respuestas anidadas si `includeReplies: true`

---

#### **2. POST /api/blog/posts/:slug/comments**

**Descripción:** Crear nuevo comentario

**Autenticación:** ⚠️ **OPCIONAL** - No requerida, pero si el usuario está autenticado, usar sus datos

**Body:**
```json
{
  "content": "Contenido del comentario",
  "parentId": null,  // Opcional: ID del comentario padre (para respuestas)
  "authorName": "Juan Pérez",  // Requerido si no está autenticado
  "authorEmail": "juan@example.com"  // Opcional
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Comentario enviado. Está pendiente de moderación.",
  "data": {
    "id": "uuid",
    "postId": "uuid",
    "userId": "uuid" | null,
    "parentId": null,
    "authorName": "Juan Pérez",
    "authorEmail": "juan@example.com",
    "content": "Contenido del comentario",
    "isApproved": false,  // false si es anónimo, true si está autenticado
    "likes": 0,
    "createdAt": "2024-12-01T10:00:00.000Z"
  }
}
```

**Validaciones:**
- `content`: Requerido, 10-2000 caracteres
- `authorName`: Requerido si no está autenticado
- `authorEmail`: Opcional, validar formato si se proporciona
- `parentId`: Debe existir si se proporciona

**Lógica:**
- Si el usuario está autenticado: usar `userId`, `authorName` del usuario, `isApproved: true`
- Si es anónimo: `userId: null`, `isApproved: false` (requiere moderación)

---

#### **3. PUT /api/blog/posts/:slug/comments/:id**

**Descripción:** Editar comentario propio

**Autenticación:** Requerida (solo puede editar sus propios comentarios)

**Path Parameters:**
- `slug` - Slug del artículo
- `id` - ID del comentario

**Body:**
```json
{
  "content": "Contenido actualizado"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Comentario actualizado",
  "data": {
    "id": "uuid",
    "content": "Contenido actualizado",
    "updatedAt": "2024-12-01T15:30:00.000Z"
  }
}
```

**Validaciones:**
- Solo el autor puede editar su comentario
- Solo se puede editar el `content`
- No se puede editar si tiene respuestas (opcional)

---

#### **4. DELETE /api/blog/posts/:slug/comments/:id**

**Descripción:** Eliminar comentario propio

**Autenticación:** Requerida (solo puede eliminar sus propios comentarios)

**Path Parameters:**
- `slug` - Slug del artículo
- `id` - ID del comentario

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Comentario eliminado"
}
```

**Nota:** Si el comentario tiene respuestas, considerar soft delete o marcar como eliminado

---

#### **5. POST /api/blog/posts/:slug/comments/:id/like**

**Descripción:** Dar like/dislike a un comentario

**Autenticación:** Opcional (tracking por IP si no está autenticado)

**Path Parameters:**
- `slug` - Slug del artículo
- `id` - ID del comentario

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Like agregado",
  "data": {
    "likes": 6
  }
}
```

**Lógica:**
- Si está autenticado: trackear por `userId`
- Si es anónimo: trackear por IP (evitar likes múltiples desde la misma IP)
- Incrementar/decrementar contador de likes

---

#### **6. PUT /api/blog/posts/:slug/comments/:id/approve** (Admin)

**Descripción:** Aprobar/rechazar comentario (moderación)

**Autenticación:** Requerida (rol: admin)

**Path Parameters:**
- `slug` - Slug del artículo
- `id` - ID del comentario

**Body:**
```json
{
  "isApproved": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Comentario aprobado",
  "data": {
    "id": "uuid",
    "isApproved": true
  }
}
```

---

## 🗄️ Esquema de Base de Datos

### **Tabla: blog_comments**

```sql
CREATE TABLE blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,  -- Para soft delete
  CONSTRAINT check_content_length CHECK (char_length(content) >= 10 AND char_length(content) <= 2000)
);

CREATE INDEX idx_blog_comments_post ON blog_comments(post_id);
CREATE INDEX idx_blog_comments_parent ON blog_comments(parent_id);
CREATE INDEX idx_blog_comments_user ON blog_comments(user_id);
CREATE INDEX idx_blog_comments_approved ON blog_comments(is_approved, created_at DESC);
```

### **Tabla: blog_comment_likes** (Opcional - para tracking de likes)

```sql
CREATE TABLE blog_comment_likes (
  comment_id UUID NOT NULL REFERENCES blog_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address INET,  -- Para usuarios anónimos
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (comment_id, COALESCE(user_id::text, ip_address::text))
);

CREATE INDEX idx_blog_comment_likes_comment ON blog_comment_likes(comment_id);
CREATE INDEX idx_blog_comment_likes_user ON blog_comment_likes(user_id);
```

---

## 🔧 Funcionalidades Técnicas

### **1. Generación de Slug (Editor)**

- Regenerar slug si se actualiza el título
- Verificar unicidad
- Si existe, agregar sufijo numérico: `titulo-2`, `titulo-3`, etc.

### **2. Cálculo de Reading Time**

- Recalcular automáticamente cuando cambia el contenido
- Fórmula: `Math.ceil(wordCount / 200)`

### **3. Moderación de Comentarios**

- Comentarios de usuarios autenticados: `isApproved: true` por defecto
- Comentarios anónimos: `isApproved: false` (requieren aprobación)
- Endpoint de admin para aprobar/rechazar

### **4. Prevención de Spam** ⚠️ **MEJORAS RECOMENDADAS**

**Implementación Actual:**
- Rate limiting: máximo 5 comentarios por IP/hora
- Validación de contenido (no solo URLs, evitar spam)
- Opcional: Integración con servicio anti-spam (Akismet, etc.)

**Mejoras Recomendadas (Ver `docs/MEJORAS_SEGURIDAD_COMENTARIOS.md`):**
- ⚠️ **Email obligatorio** para comentarios anónimos
- ⚠️ **CAPTCHA** (reCAPTCHA v3 o hCaptcha) para anónimos
- ⚠️ **Rate limiting más estricto**: 2-3 comentarios/IP/hora
- ⚠️ **Filtros de spam mejorados**: Detección de patrones, múltiples URLs, palabras clave
- ⚠️ **Honeypot field**: Campo oculto para detectar bots
- ⚠️ **Validación de email**: Rechazar emails desechables (disposable)
- ⚠️ **Análisis de patrones**: Detectar comentarios duplicados o similares

**Nota:** Para producción, se recomienda implementar al menos email obligatorio + CAPTCHA para comentarios anónimos.

---

## 📝 Validaciones

### **Comentarios**
- `content`: 10-2000 caracteres
- `authorName`: 2-100 caracteres (si es anónimo)
- `authorEmail`: Formato válido (si se proporciona)
- `parentId`: Debe existir y pertenecer al mismo post

### **Editor de Posts**
- `title`: 3-500 caracteres
- `excerpt`: 50-300 caracteres
- `content`: Mínimo 500 caracteres
- `categoryId`: Debe existir
- `tagIds`: Array de UUIDs válidos

---

## ✅ Checklist de Implementación

### **Editor de Contenido**
- [ ] POST /api/blog/posts (crear)
- [ ] GET /api/blog/posts/:id (obtener por ID para admin)
- [ ] PUT /api/blog/posts/:id (actualizar)
- [ ] DELETE /api/blog/posts/:id (eliminar)
- [ ] POST /api/blog/categories (crear categoría)
- [ ] POST /api/blog/tags (crear tag)
- [ ] Validaciones de datos
- [ ] Generación de slugs
- [ ] Cálculo de reading time

### **Sistema de Comentarios**
- [ ] GET /api/blog/posts/:slug/comments (listar)
- [ ] POST /api/blog/posts/:slug/comments (crear)
- [ ] PUT /api/blog/posts/:slug/comments/:id (editar)
- [ ] DELETE /api/blog/posts/:slug/comments/:id (eliminar)
- [ ] POST /api/blog/posts/:slug/comments/:id/like (like)
- [ ] PUT /api/blog/posts/:slug/comments/:id/approve (moderar - admin)
- [ ] Tabla blog_comments
- [ ] Tabla blog_comment_likes (opcional)
- [ ] Rate limiting
- [ ] Validaciones

---

## 🔗 Integración con Frontend

El frontend esperará estos endpoints para:

1. **Editor de Contenido:**
   - Página admin: `/admin/blog/new` (crear)
   - Página admin: `/admin/blog/:id/edit` (editar)
   - Lista de posts: `/admin/blog` (con acciones editar/eliminar)

2. **Sistema de Comentarios:**
   - Sección de comentarios en `/blog/:slug`
   - Formulario para crear comentario
   - Botón de like en cada comentario
   - Panel de moderación en `/admin/blog/comments`

---

## 📞 Contacto

Para dudas sobre la implementación, consultar con el equipo de frontend o revisar:
- `docs/REQUISITOS_BACKEND_SISTEMA_BLOG.md` - Endpoints base del blog
- `lib/hooks/useBlog.ts` - Hooks existentes del frontend

---

**Última actualización:** Diciembre 2024

