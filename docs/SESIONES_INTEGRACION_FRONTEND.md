# 🔐 Integración Frontend - Sistema de Gestión de Sesiones

Guía completa para integrar el sistema de gestión de sesiones en el frontend.

## 📋 Tabla de Contenidos

1. [Endpoints Disponibles](#endpoints-disponibles)
2. [Flujos de Integración](#flujos-de-integración)
3. [Estructura de Datos](#estructura-de-datos)
4. [Ejemplos de Código](#ejemplos-de-código)
5. [Manejo de Tokens](#manejo-de-tokens)
6. [UI/UX Recomendaciones](#uiux-recomendaciones)
7. [Manejo de Errores](#manejo-de-errores)

---

## 🔌 Endpoints Disponibles

### 1. GET `/api/auth/sessions`
**Descripción:** Lista todas las sesiones activas del usuario autenticado.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "deviceName": "Chrome en Windows 10/11",
      "location": "Bogotá, Colombia",
      "ipAddress": "192.168.1.100",
      "lastActivity": "2024-01-15T10:30:00.000Z",
      "isCurrent": true
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "deviceName": "Safari en iOS (iPhone)",
      "location": "Medellín, Colombia",
      "ipAddress": "192.168.1.101",
      "lastActivity": "2024-01-14T15:20:00.000Z",
      "isCurrent": false
    }
  ]
}
```

**Errores:**
- `401`: No autenticado o token inválido
- `500`: Error del servidor

---

### 2. DELETE `/api/auth/sessions/:sessionId`
**Descripción:** Cierra una sesión específica.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Parámetros:**
- `sessionId` (path): ID de la sesión a cerrar

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "message": "Sesión cerrada exitosamente."
  }
}
```

**Errores:**
- `400`: Sesión no encontrada
- `401`: No autenticado o no tienes permiso
- `500`: Error del servidor

---

### 3. DELETE `/api/auth/sessions`
**Descripción:** Cierra todas las sesiones excepto la actual.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "message": "2 sesión(es) cerrada(s) exitosamente.",
    "deactivatedCount": 2
  }
}
```

**Errores:**
- `400`: No se pudo identificar la sesión actual
- `401`: No autenticado
- `500`: Error del servidor

---

## 🔄 Flujos de Integración

### Flujo 1: Login (Creación de Sesión)

El login ahora crea automáticamente una sesión. No necesitas hacer nada adicional:

```typescript
// El login funciona igual que antes
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { data } = await response.json();
// data.token - access token (15 min)
// data.refreshToken - refresh token (7 días)
// La sesión se crea automáticamente en el backend
```

### Flujo 2: Refresh Token (Actualización de Actividad)

El refresh token ahora actualiza automáticamente la última actividad de la sesión:

```typescript
// El refresh funciona igual que antes
const response = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});

const { data } = await response.json();
// data.token - nuevo access token
// data.refreshToken - mismo refresh token
// La sesión se actualiza automáticamente
```

### Flujo 3: Logout (Cierre de Sesión)

El logout ahora marca la sesión como inactiva:

```typescript
// El logout funciona igual que antes
await fetch('/api/auth/logout', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json' 
  }
});

// La sesión se marca como inactiva automáticamente
```

---

## 📊 Estructura de Datos

### Tipo: Session

```typescript
interface Session {
  id: string;                    // UUID de la sesión
  deviceName: string;             // Ej: "Chrome en Windows 10/11"
  location: string | null;         // Ej: "Bogotá, Colombia" o null
  ipAddress: string | null;       // IP del cliente o null
  lastActivity: string;            // ISO 8601 timestamp
  isCurrent: boolean;              // true si es la sesión actual
}
```

### Tipo: SessionsResponse

```typescript
interface SessionsResponse {
  success: boolean;
  data: Session[];
}
```

### Tipo: CloseSessionResponse

```typescript
interface CloseSessionResponse {
  success: boolean;
  data: {
    message: string;
    deactivatedCount?: number;  // Solo en DELETE /sessions
  };
}
```

---

## 💻 Ejemplos de Código

### React/TypeScript - Hook para Sesiones

```typescript
import { useState, useEffect } from 'react';

interface Session {
  id: string;
  deviceName: string;
  location: string | null;
  ipAddress: string | null;
  lastActivity: string;
  isCurrent: boolean;
}

export function useSessions(accessToken: string | null) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/sessions', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar sesiones');
      }

      const result = await response.json();
      setSessions(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const closeSession = async (sessionId: string) => {
    if (!accessToken) return false;

    try {
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cerrar sesión');
      }

      // Recargar lista de sesiones
      await fetchSessions();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    }
  };

  const closeAllSessions = async () => {
    if (!accessToken) return false;

    try {
      const response = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cerrar sesiones');
      }

      // Recargar lista de sesiones
      await fetchSessions();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [accessToken]);

  return {
    sessions,
    loading,
    error,
    refresh: fetchSessions,
    closeSession,
    closeAllSessions,
  };
}
```

### Componente React - Lista de Sesiones

```typescript
import React from 'react';
import { useSessions } from './useSessions';

interface SessionsListProps {
  accessToken: string | null;
}

export function SessionsList({ accessToken }: SessionsListProps) {
  const { sessions, loading, error, closeSession, closeAllSessions } = useSessions(accessToken);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Hace menos de un minuto';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div>Cargando sesiones...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  const otherSessions = sessions.filter(s => !s.isCurrent);
  const currentSession = sessions.find(s => s.isCurrent);

  return (
    <div className="sessions-container">
      <div className="sessions-header">
        <h2>Dispositivos Activos</h2>
        {otherSessions.length > 0 && (
          <button 
            onClick={closeAllSessions}
            className="btn-danger"
          >
            Cerrar todas las demás sesiones
          </button>
        )}
      </div>

      {currentSession && (
        <div className="session-card current">
          <div className="session-info">
            <div className="session-device">
              <strong>{currentSession.deviceName}</strong>
              <span className="badge-current">Sesión actual</span>
            </div>
            <div className="session-details">
              <span>📍 {currentSession.location || 'Ubicación desconocida'}</span>
              <span>🌐 {currentSession.ipAddress || 'IP desconocida'}</span>
              <span>🕐 {formatDate(currentSession.lastActivity)}</span>
            </div>
          </div>
        </div>
      )}

      {otherSessions.length > 0 && (
        <>
          <h3>Otras sesiones activas</h3>
          {otherSessions.map(session => (
            <div key={session.id} className="session-card">
              <div className="session-info">
                <div className="session-device">
                  <strong>{session.deviceName}</strong>
                </div>
                <div className="session-details">
                  <span>📍 {session.location || 'Ubicación desconocida'}</span>
                  <span>🌐 {session.ipAddress || 'IP desconocida'}</span>
                  <span>🕐 {formatDate(session.lastActivity)}</span>
                </div>
              </div>
              <button
                onClick={() => closeSession(session.id)}
                className="btn-secondary"
              >
                Cerrar sesión
              </button>
            </div>
          ))}
        </>
      )}

      {sessions.length === 0 && (
        <div className="empty-state">
          No hay sesiones activas
        </div>
      )}
    </div>
  );
}
```

### Vue 3 Composition API

```vue
<template>
  <div class="sessions-container">
    <div class="sessions-header">
      <h2>Dispositivos Activos</h2>
      <button 
        v-if="otherSessions.length > 0"
        @click="closeAllSessions"
        class="btn-danger"
      >
        Cerrar todas las demás sesiones
      </button>
    </div>

    <div v-if="loading">Cargando sesiones...</div>
    <div v-else-if="error" class="error">Error: {{ error }}</div>
    <div v-else>
      <!-- Sesión actual -->
      <div v-if="currentSession" class="session-card current">
        <div class="session-info">
          <div class="session-device">
            <strong>{{ currentSession.deviceName }}</strong>
            <span class="badge-current">Sesión actual</span>
          </div>
          <div class="session-details">
            <span>📍 {{ currentSession.location || 'Ubicación desconocida' }}</span>
            <span>🌐 {{ currentSession.ipAddress || 'IP desconocida' }}</span>
            <span>🕐 {{ formatDate(currentSession.lastActivity) }}</span>
          </div>
        </div>
      </div>

      <!-- Otras sesiones -->
      <div v-if="otherSessions.length > 0">
        <h3>Otras sesiones activas</h3>
        <div 
          v-for="session in otherSessions" 
          :key="session.id"
          class="session-card"
        >
          <div class="session-info">
            <div class="session-device">
              <strong>{{ session.deviceName }}</strong>
            </div>
            <div class="session-details">
              <span>📍 {{ session.location || 'Ubicación desconocida' }}</span>
              <span>🌐 {{ session.ipAddress || 'IP desconocida' }}</span>
              <span>🕐 {{ formatDate(session.lastActivity) }}</span>
            </div>
          </div>
          <button
            @click="closeSession(session.id)"
            class="btn-secondary"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface Session {
  id: string;
  deviceName: string;
  location: string | null;
  ipAddress: string | null;
  lastActivity: string;
  isCurrent: boolean;
}

const props = defineProps<{
  accessToken: string | null;
}>();

const sessions = ref<Session[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const currentSession = computed(() => 
  sessions.value.find(s => s.isCurrent)
);

const otherSessions = computed(() => 
  sessions.value.filter(s => !s.isCurrent)
);

const fetchSessions = async () => {
  if (!props.accessToken) return;

  loading.value = true;
  error.value = null;

  try {
    const response = await fetch('/api/auth/sessions', {
      headers: {
        'Authorization': `Bearer ${props.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al cargar sesiones');
    }

    const result = await response.json();
    sessions.value = result.data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido';
  } finally {
    loading.value = false;
  }
};

const closeSession = async (sessionId: string) => {
  if (!props.accessToken) return;

  try {
    const response = await fetch(`/api/auth/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${props.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al cerrar sesión');
    }

    await fetchSessions();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido';
  }
};

const closeAllSessions = async () => {
  if (!props.accessToken) return;

  try {
    const response = await fetch('/api/auth/sessions', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${props.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al cerrar sesiones');
    }

    await fetchSessions();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Hace menos de un minuto';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  fetchSessions();
});
</script>
```

---

## 🔑 Manejo de Tokens

### Importante: Los tokens ahora incluyen `sessionId`

Los tokens JWT ahora incluyen el `sessionId` en el payload. Esto permite:

1. **Validación de sesión:** El backend valida que la sesión esté activa en cada request
2. **Identificación de sesión actual:** Puedes identificar qué sesión es la actual

**Ejemplo de decodificación del token:**

```typescript
import jwtDecode from 'jwt-decode';

interface TokenPayload {
  userId: string;
  email: string;
  sessionId?: string;  // Nuevo campo
  iat: number;
  exp: number;
}

const token = localStorage.getItem('accessToken');
if (token) {
  const decoded = jwtDecode<TokenPayload>(token);
  console.log('Session ID:', decoded.sessionId);
}
```

### Flujo de Refresh Token

Cuando el refresh token expira o la sesión se cierra, el usuario debe hacer login nuevamente:

```typescript
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // Si falla, la sesión puede estar inactiva o expirada
      // Redirigir a login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return null;
    }

    const { data } = await response.json();
    localStorage.setItem('accessToken', data.token);
    return data.token;
  } catch (error) {
    // Error de red o sesión inválida
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    return null;
  }
}
```

---

## 🎨 UI/UX Recomendaciones

### 1. Página de Configuración de Seguridad

Crea una página dedicada para gestionar sesiones:

```
/account/security/sessions
```

### 2. Indicadores Visuales

- **Sesión actual:** Muestra un badge verde "Sesión actual"
- **Otras sesiones:** Muestra botón "Cerrar sesión" en rojo
- **Última actividad:** Muestra tiempo relativo (ej: "Hace 2 horas")

### 3. Confirmaciones

Solicita confirmación antes de cerrar sesiones:

```typescript
const handleCloseSession = async (sessionId: string, deviceName: string) => {
  if (!confirm(`¿Estás seguro de cerrar la sesión en ${deviceName}?`)) {
    return;
  }
  
  await closeSession(sessionId);
};
```

### 4. Notificaciones

Muestra notificaciones cuando:
- Se cierra una sesión exitosamente
- Se cierran todas las demás sesiones
- Ocurre un error al cerrar una sesión

### 5. Auto-refresh

Actualiza la lista de sesiones periódicamente (cada 30-60 segundos) o cuando el usuario vuelve a la página.

---

## ⚠️ Manejo de Errores

### Errores Comunes

#### 1. Sesión Inactiva (401)
```typescript
if (response.status === 401) {
  // La sesión fue cerrada desde otro dispositivo
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login?message=session-closed';
}
```

#### 2. Sesión No Encontrada (404)
```typescript
if (response.status === 404) {
  // La sesión ya no existe
  await fetchSessions(); // Recargar lista
  showNotification('La sesión ya fue cerrada', 'info');
}
```

#### 3. Sin Permisos (403)
```typescript
if (response.status === 403) {
  showNotification('No tienes permiso para cerrar esta sesión', 'error');
}
```

### Interceptor de Errores Global

```typescript
// Axios interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Intentar refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const newToken = await refreshAccessToken(refreshToken);
        if (newToken) {
          // Reintentar request original
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return axios.request(error.config);
        }
      }
      
      // Si refresh falla, redirigir a login
      localStorage.clear();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);
```

---

## 📱 Ejemplo de Estilos CSS

```css
.sessions-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.sessions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.session-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1rem;
  background: white;
}

.session-card.current {
  border-color: #4caf50;
  background: #f1f8f4;
}

.session-info {
  flex: 1;
}

.session-device {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.badge-current {
  background: #4caf50;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.session-details {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #666;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary:hover {
  background: #d32f2f;
}

.btn-danger {
  padding: 0.75rem 1.5rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-danger:hover {
  background: #d32f2f;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}
```

---

## ✅ Checklist de Integración

- [ ] Crear hook/composable para gestionar sesiones
- [ ] Crear componente de lista de sesiones
- [ ] Agregar página de configuración de seguridad
- [ ] Implementar cierre de sesión individual
- [ ] Implementar cierre de todas las demás sesiones
- [ ] Agregar manejo de errores
- [ ] Agregar notificaciones de éxito/error
- [ ] Agregar confirmaciones antes de cerrar sesiones
- [ ] Implementar auto-refresh de lista de sesiones
- [ ] Agregar estilos y UI responsive
- [ ] Probar flujo completo end-to-end
- [ ] Documentar para el equipo

---

## 🔗 Recursos Adicionales

- **Base URL:** `https://tu-backend.com/api/auth`
- **Documentación API:** `/api-docs` (Swagger)
- **Postman Collection:** Ver `docs/postman/`

---

¿Necesitas ayuda con alguna parte específica de la integración? ¡Pregunta!

