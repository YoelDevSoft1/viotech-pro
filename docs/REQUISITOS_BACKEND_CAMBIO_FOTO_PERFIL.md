# Requisitos Backend - Cambio de Foto de Perfil

## 📋 Resumen
Este documento especifica los requisitos del backend para implementar la funcionalidad de cambio de foto de perfil de usuario en el frontend.

---

## 🔌 Endpoints Necesarios

### 1. **POST `/api/auth/me/avatar`** - Subir nueva foto de perfil

**Descripción**: Endpoint para subir y actualizar la foto de perfil del usuario autenticado.

**Método**: `POST`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body** (FormData):
- `avatar`: Archivo de imagen (File)
  - Formatos aceptados: `jpg`, `jpeg`, `png`, `webp`
  - Tamaño máximo: `5MB` (recomendado)
  - Dimensiones recomendadas: `400x400px` o mayor (el backend debe redimensionar/optimizar)

**Respuesta exitosa** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "avatar": "https://storage.example.com/avatars/user-uuid.jpg",
      "rol": "cliente",
      // ... otros campos del usuario
    }
  },
  "message": "Foto de perfil actualizada correctamente"
}
```

**Errores posibles**:
- `400`: Archivo inválido (formato no soportado, tamaño excedido)
- `401`: No autenticado
- `413`: Archivo muy grande
- `500`: Error al procesar la imagen

**Validaciones backend**:
- ✅ Verificar que el usuario esté autenticado (token válido)
- ✅ Validar formato de archivo (solo imágenes)
- ✅ Validar tamaño máximo del archivo
- ✅ Redimensionar/optimizar la imagen a un tamaño estándar (ej: 400x400px)
- ✅ Guardar en storage (Supabase Storage, S3, etc.)
- ✅ Actualizar el campo `avatar` en la base de datos del usuario
- ✅ Eliminar la imagen anterior si existe (para liberar espacio)

---

### 2. **DELETE `/api/auth/me/avatar`** - Eliminar foto de perfil

**Descripción**: Endpoint para eliminar la foto de perfil actual del usuario.

**Método**: `DELETE`

**Headers**:
```
Authorization: Bearer {token}
```

**Respuesta exitosa** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "avatar": null,
      "rol": "cliente",
      // ... otros campos
    }
  },
  "message": "Foto de perfil eliminada correctamente"
}
```

**Errores posibles**:
- `401`: No autenticado
- `404`: No hay foto de perfil para eliminar
- `500`: Error al eliminar

**Validaciones backend**:
- ✅ Verificar que el usuario esté autenticado
- ✅ Verificar que exista una foto de perfil actual
- ✅ Eliminar el archivo del storage
- ✅ Actualizar el campo `avatar` a `null` en la base de datos

---

### 3. **GET `/api/auth/me`** - Actualizar para incluir campo `avatar`

**Descripción**: El endpoint actual ya existe, pero necesitamos asegurarnos de que incluya el campo `avatar` en la respuesta.

**Respuesta actual esperada** (debe incluir `avatar`):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "avatar": "https://storage.example.com/avatars/user-uuid.jpg" | null,
      "rol": "cliente",
      "organizationId": "uuid",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
      // ... otros campos
    }
  }
}
```

---

## 🗄️ Estructura de Base de Datos

### Modificación en tabla `users`

Necesitas agregar/modificar el campo `avatar` en la tabla de usuarios:

```sql
-- Si no existe, agregar la columna
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar VARCHAR(500) NULL;

-- O si prefieres usar TEXT para URLs más largas
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar TEXT NULL;

-- Índice opcional para búsquedas (si planeas buscar usuarios sin avatar)
CREATE INDEX IF NOT EXISTS idx_users_avatar ON users(avatar) WHERE avatar IS NOT NULL;
```

**Tipo de dato recomendado**: `VARCHAR(500)` o `TEXT` para almacenar la URL completa de la imagen.

**Valores posibles**:
- `NULL`: Usuario no tiene foto de perfil
- URL completa: `https://storage.example.com/avatars/user-id.jpg`

---

## 📦 Almacenamiento de Archivos

### Opción 1: Supabase Storage (Recomendado si ya lo usas)

**Bucket**: Crear un bucket llamado `avatars` o usar uno existente

**Estructura de rutas**:
```
avatars/
  └── {user_id}.jpg (o .png, .webp)
```

**Ventajas**:
- Ya tienes Supabase configurado para tickets
- Integración sencilla
- CDN incluido

**Configuración necesaria**:
```sql
-- En Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Política para que usuarios solo suban/eliminen sus propias fotos
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Avatars are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

---

### Opción 2: Almacenamiento Local (Desarrollo)

**Ruta**: `/public/uploads/avatars/{user_id}.{ext}`

**Consideraciones**:
- Solo para desarrollo
- No recomendado para producción
- Requiere configuración de servidor para servir archivos estáticos

---

## 🖼️ Procesamiento de Imágenes

### Recomendaciones de procesamiento

El backend debe:

1. **Validar formato**:
   - Aceptar solo: `image/jpeg`, `image/png`, `image/webp`
   - Rechazar otros formatos

2. **Validar tamaño**:
   - Máximo: 5MB por archivo
   - Recomendado: 2MB

3. **Redimensionar y optimizar**:
   - Redimensionar a máximo 400x400px manteniendo aspecto
   - Comprimir calidad JPEG a 85%
   - Convertir a WebP si es posible (mejor compresión)
   - Generar thumbnail opcional (150x150px)

4. **Validar contenido**:
   - Verificar que realmente sea una imagen válida (no solo extensión)
   - Considerar validación de contenido explícito (opcional pero recomendado)

**Librerías recomendadas (Node.js)**:
- `sharp` - Procesamiento de imágenes eficiente
- `multer` - Manejo de multipart/form-data
- `file-type` - Validación de tipo de archivo real

**Ejemplo de código (Node.js + Express + Sharp)**:
```javascript
const sharp = require('sharp');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

router.post('/auth/me/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const userId = req.user.id;
    const processedImage = await sharp(req.file.buffer)
      .resize(400, 400, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Subir a storage (ejemplo con Supabase)
    const fileName = `${userId}.jpg`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, processedImage, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) throw error;

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Actualizar usuario en BD
    await db.query(
      'UPDATE users SET avatar = $1, updated_at = NOW() WHERE id = $2',
      [urlData.publicUrl, userId]
    );

    res.json({
      success: true,
      data: { user: { ...req.user, avatar: urlData.publicUrl } }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🔐 Consideraciones de Seguridad

1. **Autenticación**:
   - Todos los endpoints deben requerir autenticación
   - El usuario solo puede modificar su propia foto

2. **Validación de archivos**:
   - No confiar solo en la extensión del archivo
   - Validar el tipo MIME real del archivo
   - Escanear contenido malicioso (opcional pero recomendado)

3. **Límites**:
   - Tamaño máximo de archivo (5MB recomendado)
   - Rate limiting para prevenir abuso (ej: 5 subidas por hora)

4. **Sanitización**:
   - Sanitizar nombres de archivo
   - Usar UUID del usuario como nombre de archivo (no nombre original)

---

## 📝 Ejemplo de Implementación Completa

### Estructura de endpoints sugerida:

```
POST   /api/auth/me/avatar          → Subir/actualizar foto
DELETE /api/auth/me/avatar          → Eliminar foto
GET    /api/auth/me                 → Debe incluir campo avatar
```

### Campos adicionales opcionales (para mejor UX):

```typescript
// En la respuesta del usuario, puedes incluir:
{
  avatar: string | null,
  avatarThumbnail: string | null,  // Versión pequeña (opcional)
  avatarUpdatedAt: string | null   // Fecha de última actualización (opcional)
}
```

---

## ✅ Checklist de Implementación Backend

- [ ] Agregar columna `avatar` a tabla `users` en base de datos
- [ ] Crear bucket de storage para avatares (si usas Supabase/S3)
- [ ] Implementar endpoint `POST /api/auth/me/avatar`
- [ ] Implementar endpoint `DELETE /api/auth/me/avatar`
- [ ] Actualizar endpoint `GET /api/auth/me` para incluir campo `avatar`
- [ ] Agregar validación de formato de archivo (solo imágenes)
- [ ] Agregar validación de tamaño máximo (5MB)
- [ ] Implementar redimensionamiento de imágenes (400x400px)
- [ ] Implementar compresión/optimización de imágenes
- [ ] Agregar eliminación de imagen anterior al subir nueva
- [ ] Agregar autenticación y autorización (solo propio avatar)
- [ ] Agregar rate limiting
- [ ] Probar con diferentes formatos de imagen
- [ ] Probar con archivos muy grandes
- [ ] Probar con archivos corruptos
- [ ] Documentar endpoints en Swagger/OpenAPI (si lo usas)

---

## 🔗 URLs Públicas vs Privadas

**Recomendación**: Usar URLs públicas para avatares

**Razón**: 
- Los avatares no son información sensible
- Mejor rendimiento (CDN)
- Más fácil de implementar
- Compatible con `<img>` tags directamente

**Si prefieres privadas**:
- Necesitarías un endpoint proxy: `GET /api/auth/avatar/:userId`
- Mayor complejidad
- Más carga en el servidor

---

## 📞 Contacto

Si tienes preguntas sobre estos requisitos o necesitas aclaraciones, por favor contacta al equipo de frontend.

**Nota**: Una vez implementados estos endpoints, el frontend estará listo para implementar la funcionalidad completa de cambio de foto de perfil.

