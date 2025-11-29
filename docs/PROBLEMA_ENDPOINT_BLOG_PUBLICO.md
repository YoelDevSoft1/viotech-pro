# 🔍 Problema: Endpoint Público del Blog Requiere Autenticación

## 📋 Descripción del Problema

El endpoint público `GET /api/blog/posts/:slug` está requiriendo autenticación, pero debería ser **público** (sin token).

### Logs del Backend:
```
warn: Intento de acceso sin token válido {"method":"GET","path":"/posts/ciberseguridad-en-la-nube-para-pymes-en-2025",...}
```

### Comportamiento Esperado:
- ✅ El endpoint `GET /api/blog/posts/:slug` debe ser **público** (sin autenticación)
- ✅ Solo debe retornar posts con `isPublished: true`
- ✅ Debe retornar 404 si el post no existe o no está publicado

### Comportamiento Actual:
- ❌ El endpoint está requiriendo autenticación
- ❌ Rechaza peticiones sin token

## 🎯 Solución Requerida (Backend)

### 1. Endpoint Público NO debe requerir autenticación

El endpoint `GET /api/blog/posts/:slug` debe estar configurado como **público** en el backend.

**Ejemplo de configuración (depende del framework):**

#### **Express.js / NestJS:**
```javascript
// El endpoint debe estar FUERA del middleware de autenticación
router.get('/blog/posts/:slug', getBlogPostBySlug); // Sin middleware de auth
```

#### **Laravel:**
```php
// En routes/api.php o routes/web.php
Route::get('/blog/posts/{slug}', [BlogController::class, 'getBySlug'])->withoutMiddleware('auth');
```

### 2. Endpoints que DEBEN ser públicos:

- ✅ `GET /api/blog/posts` - Lista de posts publicados
- ✅ `GET /api/blog/posts/:slug` - Post individual por slug
- ✅ `GET /api/blog/categories` - Categorías con posts publicados
- ✅ `GET /api/blog/tags` - Tags con posts publicados
- ✅ `GET /api/blog/posts/:slug/comments` - Comentarios de un post
- ✅ `POST /api/blog/posts/:slug/comments` - Crear comentario (opcional, puede requerir auth para usuarios autenticados)
- ✅ `POST /api/blog/newsletter/subscribe` - Suscribirse al newsletter

### 3. Endpoints que DEBEN requerir autenticación (Admin):

- 🔒 `POST /api/blog/posts` - Crear post (admin)
- 🔒 `PUT /api/blog/posts/:id` - Actualizar post (admin)
- 🔒 `DELETE /api/blog/posts/:id` - Eliminar post (admin)
- 🔒 `GET /api/blog/posts/:id` - Obtener post por ID (admin, incluye borradores)
- 🔒 `GET /api/blog/posts?all=true` - Lista todos los posts (admin)
- 🔒 `GET /api/blog/categories?all=true` - Lista todas las categorías (admin)
- 🔒 `GET /api/blog/tags?all=true` - Lista todos los tags (admin)
- 🔒 `POST /api/blog/categories` - Crear categoría (admin)
- 🔒 `POST /api/blog/tags` - Crear tag (admin)

## 📝 Verificación

Después de implementar, verificar:

1. **Sin token:**
   ```bash
   curl https://viotech-main.onrender.com/api/blog/posts/ciberseguridad-en-la-nube-para-pymes-en-2025
   ```
   Debe retornar 200 OK con el post (si está publicado)

2. **Con token (admin):**
   ```bash
   curl -H "Authorization: Bearer {token}" https://viotech-main.onrender.com/api/blog/posts/ciberseguridad-en-la-nube-para-pymes-en-2025
   ```
   Debe retornar 200 OK con el post (incluso si es borrador, si se usa el endpoint admin)

## 🔗 Referencias

- `docs/REQUISITOS_BACKEND_SISTEMA_BLOG.md` - Documentación completa del sistema de blog
- `docs/REQUISITOS_BACKEND_EDITOR_BLOG_COMENTARIOS.md` - Documentación del editor y comentarios

