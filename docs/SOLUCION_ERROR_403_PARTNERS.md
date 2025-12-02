# 🔍 Solución: Error 403 en Portal de Partners

## Problema

El usuario recibe un error **403 (Forbidden)** al intentar acceder al endpoint `/api/partners/dashboard`.

```
GET https://viotech-main.onrender.com/api/partners/dashboard 403 (Forbidden)
```

## Causas Posibles

### 1. **Usuario no tiene rol "partner"**
El usuario no tiene el rol `"partner"` asignado en la base de datos.

**Solución:**
- Verificar el rol del usuario en la tabla `users` o `user_roles`
- Asignar el rol `"partner"` al usuario
- O registrar al usuario como partner usando el endpoint admin: `POST /api/partners/admin/register`

### 2. **Usuario no está registrado como partner**
El usuario tiene el rol correcto, pero no existe un registro en la tabla `partners`.

**Solución:**
- Verificar si existe un registro en la tabla `partners` para este usuario
- Registrar al usuario como partner usando el endpoint admin: `POST /api/partners/admin/register`

### 3. **Partner está suspendido o inactivo**
El partner existe pero está en estado `suspended` o `inactive`.

**Solución:**
- Verificar el estado del partner en la tabla `partners`
- Activar el partner usando: `POST /api/partners/admin/:id/activate`

### 4. **Token inválido o expirado**
El token JWT no es válido o ha expirado.

**Solución:**
- Verificar que el token sea válido
- El frontend intentará refrescar el token automáticamente
- Si falla, el usuario será redirigido al login

## Soluciones Implementadas en Frontend

### 1. **Componente PartnerGate**
Se creó un componente `PartnerGate` que verifica el rol del usuario antes de mostrar el contenido:

```tsx
// components/partners/PartnerGate.tsx
- Verifica que el usuario tenga rol "partner" o "admin"
- Muestra mensaje claro si no tiene permisos
- Redirige al login si no está autenticado
```

### 2. **Manejo Mejorado de Errores**
Se mejoró el manejo de errores en los hooks para mostrar mensajes más claros:

```typescript
// lib/hooks/usePartners.ts
- Detecta errores 403 específicamente
- Muestra mensaje del backend si está disponible
- Mensaje claro sobre permisos insuficientes
```

### 3. **Mensajes de Error Mejorados**
Se agregaron traducciones para errores de autorización:

```json
{
  "partners": {
    "error": {
      "forbidden": "Acceso denegado",
      "unauthorized": "Sesión expirada",
      "goToLogin": "Ir a iniciar sesión"
    }
  }
}
```

## Verificación en Backend

### 1. Verificar Rol del Usuario

```sql
-- Verificar rol del usuario
SELECT id, email, rol, role 
FROM users 
WHERE email = 'usuario@ejemplo.com';
```

### 2. Verificar Registro de Partner

```sql
-- Verificar si el usuario está registrado como partner
SELECT p.*, u.email, u.rol
FROM partners p
JOIN users u ON p.user_id = u.id
WHERE u.email = 'usuario@ejemplo.com';
```

### 3. Verificar Estado del Partner

```sql
-- Verificar estado del partner
SELECT id, user_id, status, tier, commission_rate
FROM partners
WHERE user_id = 'user-id-aqui';
```

## Endpoints de Admin para Registrar Partner

Si el usuario no está registrado como partner, un admin puede registrarlo usando:

```bash
POST /api/partners/admin/register
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "userId": "user-id",
  "tier": "bronze",
  "commissionRate": 10,
  "status": "active"
}
```

## Flujo Recomendado

1. **Usuario intenta acceder a `/partners`**
2. **PartnerGate verifica rol:**
   - Si no tiene rol "partner" o "admin" → Muestra mensaje de error
   - Si tiene rol correcto → Continúa
3. **Hook intenta cargar dashboard:**
   - Si 403 → Muestra mensaje específico del backend
   - Si 401 → Redirige al login
   - Si éxito → Muestra dashboard

## Próximos Pasos

1. ✅ Frontend: Componente PartnerGate implementado
2. ✅ Frontend: Manejo mejorado de errores 403
3. ⏳ Backend: Verificar que el endpoint valide correctamente el rol
4. ⏳ Backend: Verificar que el endpoint valide que el usuario esté registrado como partner
5. ⏳ Backend: Mejorar mensajes de error para ser más descriptivos

---

**Última actualización:** Diciembre 2024  
**Estado:** ✅ Frontend mejorado - ⏳ Verificación backend pendiente

