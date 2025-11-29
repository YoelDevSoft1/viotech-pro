# 📸 Implementación Frontend - Cambio de Foto de Perfil

## ✅ Implementación Completada

La funcionalidad de cambio de foto de perfil ha sido implementada completamente en el frontend, integrada con los endpoints del backend.

---

## 📋 Archivos Creados/Modificados

### Nuevos Archivos

1. **`lib/hooks/useAvatar.ts`**
   - Hook `useUploadAvatar()` - Para subir nueva foto de perfil
   - Hook `useDeleteAvatar()` - Para eliminar foto de perfil existente
   - Manejo automático de cache con React Query
   - Notificaciones toast de éxito/error

2. **`components/common/AvatarUploader.tsx`**
   - Componente reutilizable para subida de avatar
   - Preview de imagen antes de subir
   - Validación de formato y tamaño de archivo
   - Dialog modal con opciones de subir/eliminar
   - Estados de carga y error

### Archivos Modificados

1. **`lib/apiClient.ts`**
   - Actualizado interceptor para manejar FormData correctamente
   - Permite que axios establezca automáticamente el Content-Type para multipart/form-data

2. **`app/(client)/client/profile/page.tsx`**
   - Integrado componente `AvatarUploader`
   - Removido código del botón deshabilitado

3. **`app/(account)/profile/page.tsx`**
   - Integrado componente `AvatarUploader`
   - Removido código del botón deshabilitado

---

## 🎨 Componente AvatarUploader

### Características

- ✅ Preview de imagen antes de subir
- ✅ Validación de formato (JPG, PNG, WebP)
- ✅ Validación de tamaño máximo (5MB)
- ✅ Dialog modal para subir/eliminar
- ✅ Estados de carga durante operaciones
- ✅ Manejo de errores con mensajes claros
- ✅ Tamaños personalizables (sm, md, lg)
- ✅ Iniciales como fallback cuando no hay avatar

### Props

```typescript
interface AvatarUploaderProps {
  currentAvatar: string | null | undefined;  // URL del avatar actual
  userName: string;                          // Nombre del usuario
  initials: string;                          // Iniciales para fallback
  size?: "sm" | "md" | "lg";                // Tamaño del avatar
}
```

### Uso

```tsx
<AvatarUploader
  currentAvatar={user?.avatar}
  userName={user?.nombre || "Usuario"}
  initials={initials}
  size="md"
/>
```

---

## 🔌 Integración con Backend

### Endpoints Utilizados

1. **POST `/api/auth/me/avatar`**
   - Sube nueva foto de perfil
   - Body: `FormData` con campo `avatar`
   - Headers: `Authorization: Bearer {token}`
   - Content-Type: Automático (multipart/form-data)

2. **DELETE `/api/auth/me/avatar`**
   - Elimina foto de perfil actual
   - Headers: `Authorization: Bearer {token}`

3. **GET `/api/auth/me`** (Ya existente)
   - Obtiene información del usuario incluyendo `avatar`
   - Se actualiza automáticamente después de subir/eliminar

---

## 🎯 Validaciones Frontend

### Validación de Archivos

- ✅ **Formato**: Solo JPG, JPEG, PNG, WebP
- ✅ **Tamaño**: Máximo 5MB
- ✅ **Validación en tiempo real**: Antes de subir
- ✅ **Mensajes de error claros**: Para cada tipo de error

### Validaciones Backend (ya implementadas)

- Validación de tipo MIME real
- Redimensionamiento a 400x400px
- Optimización y compresión
- Almacenamiento en Supabase Storage

---

## 🔄 Flujo de Usuario

### Subir Nueva Foto

1. Usuario hace clic en "Subir foto" o "Cambiar foto"
2. Se abre dialog modal con preview
3. Usuario selecciona archivo de imagen
4. Se valida formato y tamaño
5. Se muestra preview de la imagen seleccionada
6. Usuario hace clic en "Guardar"
7. Se muestra estado de carga "Subiendo..."
8. Se actualiza avatar automáticamente
9. Se cierra dialog
10. Se muestra toast de éxito

### Eliminar Foto

1. Usuario hace clic en "Eliminar" en el dialog
2. Se muestra confirmación y estado de carga
3. Se elimina avatar del storage
4. Se actualiza usuario (avatar = null)
5. Se muestra fallback con iniciales
6. Se muestra toast de éxito

---

## 📱 UI/UX

### Estados Visuales

- **Sin avatar**: Muestra iniciales en círculo de color
- **Con avatar**: Muestra imagen redondeada
- **Cargando**: Spinner de carga y botones deshabilitados
- **Error**: Alert rojo con mensaje específico
- **Preview**: Imagen seleccionada antes de subir

### Responsive

- ✅ Adaptable a diferentes tamaños de pantalla
- ✅ Dialog modal responsive
- ✅ Avatar escalable (sm, md, lg)

---

## 🧪 Testing Manual

### Casos de Prueba

#### Subida de Avatar

- [ ] Subir imagen JPG válida (< 5MB)
- [ ] Subir imagen PNG válida (< 5MB)
- [ ] Subir imagen WebP válida (< 5MB)
- [ ] Intentar subir archivo no imagen (debe rechazar)
- [ ] Intentar subir archivo > 5MB (debe rechazar)
- [ ] Preview se muestra correctamente antes de subir
- [ ] Estado de carga durante subida
- [ ] Toast de éxito después de subir
- [ ] Avatar se actualiza inmediatamente

#### Eliminación de Avatar

- [ ] Eliminar avatar existente
- [ ] Estado de carga durante eliminación
- [ ] Toast de éxito después de eliminar
- [ ] Fallback con iniciales se muestra correctamente
- [ ] Avatar se elimina de la base de datos

#### Integración

- [ ] GET /auth/me incluye campo avatar
- [ ] Cache de React Query se actualiza correctamente
- [ ] Avatar persiste al recargar página
- [ ] Avatar se muestra en todas las páginas de perfil

---

## 🔒 Seguridad

### Validaciones Frontend

- Validación de formato antes de subir
- Validación de tamaño antes de subir
- Manejo de errores del backend

### Seguridad Backend (ya implementada)

- ✅ Autenticación requerida
- ✅ Usuario solo puede modificar su propio avatar
- ✅ Validación de tipo MIME real
- ✅ Sanitización de nombres de archivo

---

## 📝 Notas de Implementación

### Manejo de FormData

El `apiClient` ha sido actualizado para manejar correctamente FormData:

```typescript
// En lib/apiClient.ts - Interceptor
if (config.data instanceof FormData) {
  delete config.headers["Content-Type"];
  // Axios establecerá automáticamente el Content-Type correcto
  // con el boundary necesario para multipart/form-data
}
```

### Cache de React Query

El hook `useAvatar` actualiza automáticamente el cache:

```typescript
// Después de subir/eliminar exitosamente
queryClient.setQueryData(["auth-user"], user);
queryClient.invalidateQueries({ queryKey: ["auth-user"] });
```

Esto asegura que:
- El avatar se actualiza inmediatamente en la UI
- No es necesario recargar la página
- Todas las referencias al usuario se actualizan automáticamente

---

## 🚀 Uso en Otras Páginas

El componente `AvatarUploader` es completamente reutilizable y puede usarse en cualquier parte de la aplicación:

```tsx
import { AvatarUploader } from "@/components/common/AvatarUploader";

// En cualquier componente
<AvatarUploader
  currentAvatar={user?.avatar}
  userName={user?.nombre}
  initials="JP"
  size="lg" // o "sm", "md"
/>
```

---

## ✅ Checklist de Implementación

- [x] Crear hook `useUploadAvatar`
- [x] Crear hook `useDeleteAvatar`
- [x] Crear componente `AvatarUploader`
- [x] Actualizar `apiClient` para manejar FormData
- [x] Integrar en página de perfil del cliente
- [x] Integrar en página de perfil de account
- [x] Agregar validaciones de formato y tamaño
- [x] Implementar preview de imagen
- [x] Manejar estados de carga y error
- [x] Actualizar cache de React Query
- [x] Agregar notificaciones toast
- [x] Verificar que el build funciona correctamente

---

## 🔗 Archivos Relacionados

- **Hook**: `lib/hooks/useAvatar.ts`
- **Componente**: `components/common/AvatarUploader.tsx`
- **API Client**: `lib/apiClient.ts`
- **Páginas de perfil**: 
  - `app/(client)/client/profile/page.tsx`
  - `app/(account)/profile/page.tsx`
- **Hook de usuario**: `lib/hooks/useResources.ts` (useCurrentUser)

---

## 📚 Documentación Backend

Para ver los requisitos del backend, consulta:
- `docs/REQUISITOS_BACKEND_CAMBIO_FOTO_PERFIL.md`

---

**Estado**: ✅ Implementación completa - Listo para usar

**Última actualización**: Noviembre 2025

