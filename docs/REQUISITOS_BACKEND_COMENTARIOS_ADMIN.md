# 📋 Requisitos Backend: Panel de Moderación de Comentarios

## 🎯 Objetivo

Permitir que los administradores vean y moderen todos los comentarios del blog, especialmente los pendientes de aprobación.

---

## 🔌 Endpoints Requeridos

### **1. GET /api/blog/comments/pending** (Admin)

**Descripción:** Obtener todos los comentarios pendientes de aprobación

**Autenticación:** Requerida (rol: admin)

**Query Parameters:**
- Ninguno (retorna todos los pendientes)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": [
    {
      "id": "uuid",
      "postId": "uuid",
      "postSlug": "mi-articulo-blog",  // ← IMPORTANTE: Incluir slug del post
      "userId": "uuid" | null,
      "parentId": null,
      "authorName": "Juan Pérez",
      "authorEmail": "juan@example.com",
      "authorAvatar": "https://...",
      "content": "Excelente artículo...",
      "isApproved": false,  // ← Pendiente
      "likes": 0,
      "createdAt": "2024-12-01T10:00:00.000Z",
      "replies": []  // Opcional: incluir respuestas si las hay
    }
  ]
}
```

**Notas:**
- Debe incluir el campo `postSlug` para que el admin pueda navegar al artículo
- Solo retornar comentarios con `isApproved: false`
- Incluir información del autor (nombre, email, avatar si está disponible)

---

### **2. GET /api/blog/comments/admin** (Admin)

**Descripción:** Obtener todos los comentarios (para moderación completa)

**Autenticación:** Requerida (rol: admin)

**Query Parameters:**
- `approved?: boolean` - Filtrar por estado de aprobación (true/false)
- `postSlug?: string` - Filtrar por artículo específico

**Ejemplo de Request:**
```
GET /api/blog/comments/admin?approved=false
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
      "postId": "uuid",
      "postSlug": "mi-articulo-blog",  // ← IMPORTANTE
      "userId": "uuid" | null,
      "parentId": null,
      "authorName": "Juan Pérez",
      "authorEmail": "juan@example.com",
      "authorAvatar": "https://...",
      "content": "Excelente artículo...",
      "isApproved": false,
      "likes": 0,
      "createdAt": "2024-12-01T10:00:00.000Z",
      "updatedAt": "2024-12-01T10:00:00.000Z"
    }
  ]
}
```

**Lógica:**
- Si `approved=true`: Solo comentarios aprobados
- Si `approved=false`: Solo comentarios pendientes/rechazados
- Si no se especifica: Todos los comentarios
- Si `postSlug` está presente: Filtrar por ese artículo específico

---

### **3. PUT /api/blog/posts/:slug/comments/:id/approve** (Admin)

**Descripción:** Aprobar o rechazar un comentario

**Autenticación:** Requerida (rol: admin)

**Path Parameters:**
- `slug` - Slug del artículo
- `id` - ID del comentario

**Body:**
```json
{
  "isApproved": true  // true para aprobar, false para rechazar
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Comentario aprobado" | "Comentario rechazado",
  "data": {
    "id": "uuid",
    "isApproved": true,
    "updatedAt": "2024-12-01T15:30:00.000Z"
  }
}
```

**Validaciones:**
- Solo usuarios con rol `admin` pueden moderar
- El comentario debe existir
- Si se rechaza un comentario padre, considerar qué hacer con las respuestas (opcional: rechazarlas también)

---

## 📊 Estructura de Datos

### **BlogComment (para Admin)**

```typescript
interface BlogComment {
  id: string;
  postId: string;
  postSlug: string;  // ← REQUERIDO para admin (para navegación)
  userId: string | null;
  parentId: string | null;
  authorName: string;
  authorEmail: string | null;
  authorAvatar: string | null;
  content: string;
  isApproved: boolean;
  likes: number;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  replies?: BlogComment[];  // Opcional
}
```

**Campos importantes para admin:**
- `postSlug`: **REQUERIDO** - Permite al admin navegar al artículo
- `authorEmail`: Útil para contactar al autor si es necesario
- `authorAvatar`: Para mostrar avatar en el panel
- `isApproved`: Estado actual del comentario

---

## 🔄 Flujo de Moderación

1. **Admin accede a `/admin/blog/comments`**
   - Frontend llama a `GET /api/blog/comments/pending`
   - Backend retorna todos los comentarios con `isApproved: false`

2. **Admin revisa comentarios**
   - Ve lista de comentarios pendientes
   - Puede ver el contenido, autor, fecha, y artículo relacionado

3. **Admin aprueba/rechaza**
   - Frontend llama a `PUT /api/blog/posts/:slug/comments/:id/approve`
   - Backend actualiza `isApproved` y retorna el comentario actualizado
   - Frontend refresca la lista automáticamente

---

## ✅ Checklist de Implementación

### **Backend:**
- [ ] Implementar `GET /api/blog/comments/pending`
  - [ ] Retornar solo comentarios con `isApproved: false`
  - [ ] Incluir `postSlug` en cada comentario
  - [ ] Incluir información del autor (nombre, email, avatar)
  - [ ] Requerir autenticación y rol admin

- [ ] Implementar `GET /api/blog/comments/admin`
  - [ ] Soportar filtros `approved` y `postSlug`
  - [ ] Incluir `postSlug` en cada comentario
  - [ ] Requerir autenticación y rol admin

- [ ] Verificar `PUT /api/blog/posts/:slug/comments/:id/approve`
  - [ ] Asegurar que solo admins pueden usar este endpoint
  - [ ] Actualizar `isApproved` correctamente
  - [ ] Retornar comentario actualizado

---

## 🔗 Integración con Frontend

El frontend ya está implementado en:
- **Página:** `/admin/blog/comments`
- **Hooks:** `useBlogCommentsPending()`, `useApproveComment()`
- **Componente:** `app/(ops-admin)/admin/blog/comments/page.tsx`

**El frontend espera:**
1. Endpoint `GET /api/blog/comments/pending` que retorne array de comentarios
2. Cada comentario debe incluir `postSlug` para navegación
3. Endpoint `PUT /api/blog/posts/:slug/comments/:id/approve` para moderar

---

## 📝 Notas Adicionales

- **Performance:** Si hay muchos comentarios pendientes, considerar paginación
- **Notificaciones:** Opcionalmente, notificar al autor cuando su comentario es aprobado
- **Historial:** Considerar guardar un log de quién aprobó/rechazó cada comentario
- **Bulk Actions:** Opcionalmente, permitir aprobar/rechazar múltiples comentarios a la vez

---

**Última actualización:** Diciembre 2024

