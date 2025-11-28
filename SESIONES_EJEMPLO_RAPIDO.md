# 🚀 Integración Rápida - Sistema de Sesiones

Guía rápida para integrar el sistema de sesiones en tu frontend.

## 📝 Resumen de Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/auth/sessions` | Listar todas las sesiones activas |
| `DELETE` | `/api/auth/sessions/:sessionId` | Cerrar una sesión específica |
| `DELETE` | `/api/auth/sessions` | Cerrar todas las demás sesiones |

## 🔑 Cambios Importantes

### ✅ No necesitas cambiar nada en:
- `POST /api/auth/login` - Funciona igual, ahora crea sesión automáticamente
- `POST /api/auth/refresh` - Funciona igual, ahora actualiza actividad automáticamente
- `POST /api/auth/logout` - Funciona igual, ahora marca sesión como inactiva

### 🆕 Nuevos endpoints a integrar:
- `GET /api/auth/sessions` - Para mostrar lista de dispositivos
- `DELETE /api/auth/sessions/:sessionId` - Para cerrar sesión específica
- `DELETE /api/auth/sessions` - Para cerrar todas las demás

## 💻 Código Listo para Usar

### 1. Servicio de Sesiones (TypeScript)

```typescript
// services/sessionsService.ts

const API_BASE = '/api/auth';

export interface Session {
  id: string;
  deviceName: string;
  location: string | null;
  ipAddress: string | null;
  lastActivity: string;
  isCurrent: boolean;
}

export class SessionsService {
  static async getSessions(token: string): Promise<Session[]> {
    const response = await fetch(`${API_BASE}/sessions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al cargar sesiones');
    }

    const result = await response.json();
    return result.data;
  }

  static async closeSession(token: string, sessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al cerrar sesión');
    }
  }

  static async closeAllOtherSessions(token: string): Promise<number> {
    const response = await fetch(`${API_BASE}/sessions`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al cerrar sesiones');
    }

    const result = await response.json();
    return result.data.deactivatedCount || 0;
  }
}
```

### 2. Hook React Simple

```typescript
// hooks/useSessions.ts

import { useState, useEffect } from 'react';
import { SessionsService, Session } from '../services/sessionsService';

export function useSessions(accessToken: string | null) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const data = await SessionsService.getSessions(accessToken);
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const closeSession = async (sessionId: string) => {
    if (!accessToken) return false;

    try {
      await SessionsService.closeSession(accessToken, sessionId);
      await loadSessions(); // Recargar lista
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    }
  };

  const closeAllOther = async () => {
    if (!accessToken) return false;

    try {
      await SessionsService.closeAllOtherSessions(accessToken);
      await loadSessions(); // Recargar lista
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    }
  };

  useEffect(() => {
    loadSessions();
  }, [accessToken]);

  return {
    sessions,
    loading,
    error,
    refresh: loadSessions,
    closeSession,
    closeAllOther,
  };
}
```

### 3. Componente React Completo

```typescript
// components/SessionsList.tsx

import React from 'react';
import { useSessions } from '../hooks/useSessions';

interface Props {
  accessToken: string | null;
}

export function SessionsList({ accessToken }: Props) {
  const { sessions, loading, error, closeSession, closeAllOther } = useSessions(accessToken);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Hace menos de un minuto';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-CO');
  };

  const handleCloseSession = async (sessionId: string, deviceName: string) => {
    if (!confirm(`¿Cerrar sesión en ${deviceName}?`)) return;
    const success = await closeSession(sessionId);
    if (success) {
      alert('Sesión cerrada exitosamente');
    }
  };

  const handleCloseAll = async () => {
    const otherCount = sessions.filter(s => !s.isCurrent).length;
    if (!confirm(`¿Cerrar las ${otherCount} sesión(es) restante(s)?`)) return;
    const success = await closeAllOther();
    if (success) {
      alert('Todas las demás sesiones fueron cerradas');
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const currentSession = sessions.find(s => s.isCurrent);
  const otherSessions = sessions.filter(s => !s.isCurrent);

  return (
    <div className="sessions-list">
      <div className="header">
        <h2>Dispositivos Activos</h2>
        {otherSessions.length > 0 && (
          <button onClick={handleCloseAll} className="btn-danger">
            Cerrar todas las demás ({otherSessions.length})
          </button>
        )}
      </div>

      {currentSession && (
        <div className="session current">
          <div>
            <strong>{currentSession.deviceName}</strong>
            <span className="badge">Sesión actual</span>
          </div>
          <div className="details">
            {currentSession.location && <span>📍 {currentSession.location}</span>}
            {currentSession.ipAddress && <span>🌐 {currentSession.ipAddress}</span>}
            <span>🕐 {formatTimeAgo(currentSession.lastActivity)}</span>
          </div>
        </div>
      )}

      {otherSessions.length > 0 && (
        <div className="other-sessions">
          <h3>Otras sesiones ({otherSessions.length})</h3>
          {otherSessions.map(session => (
            <div key={session.id} className="session">
              <div>
                <strong>{session.deviceName}</strong>
              </div>
              <div className="details">
                {session.location && <span>📍 {session.location}</span>}
                {session.ipAddress && <span>🌐 {session.ipAddress}</span>}
                <span>🕐 {formatTimeAgo(session.lastActivity)}</span>
              </div>
              <button
                onClick={() => handleCloseSession(session.id, session.deviceName)}
                className="btn-close"
              >
                Cerrar sesión
              </button>
            </div>
          ))}
        </div>
      )}

      {sessions.length === 0 && (
        <div className="empty">No hay sesiones activas</div>
      )}
    </div>
  );
}
```

### 4. Estilos CSS Mínimos

```css
/* components/SessionsList.css */

.sessions-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.sessions-list .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.sessions-list .session {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 1rem;
  background: white;
}

.sessions-list .session.current {
  border-color: #4caf50;
  background: #f1f8f4;
}

.sessions-list .badge {
  background: #4caf50;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

.sessions-list .details {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.5rem;
}

.sessions-list .btn-danger {
  padding: 0.75rem 1.5rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.sessions-list .btn-close {
  padding: 0.5rem 1rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.sessions-list .empty {
  text-align: center;
  padding: 3rem;
  color: #999;
}
```

## 🎯 Uso Rápido

```typescript
// En tu componente de perfil o configuración de seguridad

import { SessionsList } from './components/SessionsList';

function SecuritySettings() {
  const accessToken = localStorage.getItem('accessToken');

  return (
    <div>
      <h1>Configuración de Seguridad</h1>
      <SessionsList accessToken={accessToken} />
    </div>
  );
}
```

## 📋 Respuestas de Ejemplo

### GET /api/auth/sessions
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
    }
  ]
}
```

### DELETE /api/auth/sessions/:sessionId
```json
{
  "success": true,
  "data": {
    "message": "Sesión cerrada exitosamente."
  }
}
```

### DELETE /api/auth/sessions
```json
{
  "success": true,
  "data": {
    "message": "2 sesión(es) cerrada(s) exitosamente.",
    "deactivatedCount": 2
  }
}
```

## ⚠️ Errores Comunes

### 401 - No autenticado
```typescript
if (response.status === 401) {
  // Redirigir a login
  window.location.href = '/login';
}
```

### 404 - Sesión no encontrada
```typescript
// La sesión ya fue cerrada, recargar lista
await loadSessions();
```

## ✅ Checklist de Integración

1. [ ] Copiar `SessionsService` a tu proyecto
2. [ ] Copiar hook `useSessions` (si usas React)
3. [ ] Copiar componente `SessionsList`
4. [ ] Agregar estilos CSS
5. [ ] Agregar ruta `/account/security` o similar
6. [ ] Probar listar sesiones
7. [ ] Probar cerrar sesión individual
8. [ ] Probar cerrar todas las demás sesiones
9. [ ] Agregar notificaciones de éxito/error
10. [ ] Probar en diferentes dispositivos

¡Listo! 🎉

