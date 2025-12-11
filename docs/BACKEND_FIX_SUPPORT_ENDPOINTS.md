# 🔧 Instrucciones para Corregir Errores 500 en Endpoints de Soporte

## 📋 Resumen del Problema

Los endpoints de soporte están devolviendo errores **500 (Internal Server Error**):

- `GET /api/support/agents` - Error 500
- `GET /api/support/chats` - Error 500

**URL Base del Backend:** `https://viotech-main.onrender.com/api`

**Frontend espera:**
- `GET /api/support/agents` → Array de agentes de soporte
- `GET /api/support/chats` → Array de conversaciones/chats del usuario

---

## 🔍 Paso 1: Diagnóstico - Verificar Logs del Backend

### 1.1 Revisar logs en Render.com

1. Accede a tu dashboard de Render: https://dashboard.render.com
2. Selecciona el servicio del backend (`viotech-main`)
3. Ve a la pestaña **"Logs"**
4. Busca errores relacionados con:
   - `/support/agents`
   - `/support/chats`
   - Errores de base de datos
   - Errores de autenticación
   - Stack traces completos

### 1.2 Verificar logs locales (si tienes acceso)

```bash
# En el directorio del backend
npm run dev
# O
node server.js
```

Observa los errores que aparecen cuando el frontend hace las peticiones.

### 1.3 Verificar Sentry (si está configurado)

Revisa tu dashboard de Sentry para ver si hay errores reportados relacionados con estos endpoints.

---

## 🔍 Paso 2: Verificar Estructura de Rutas

### 2.1 Ubicar el archivo de rutas

Busca el archivo que define las rutas de soporte. Probablemente esté en:

```
backend/
  routes/
    supportRoutes.js  (o support.js, support.routes.js)
```

O podría estar en:

```
backend/
  routes/
    index.js  (rutas centralizadas)
```

### 2.2 Verificar que las rutas existan

Asegúrate de que existan estas rutas definidas:

```javascript
// Ejemplo esperado en supportRoutes.js
router.get('/agents', authMiddleware, supportController.getAgents);
router.get('/chats', authMiddleware, supportController.getChats);
```

---

## 🔍 Paso 3: Verificar Controladores

### 3.1 Ubicar el controlador

Busca el archivo del controlador:

```
backend/
  controllers/
    supportController.js  (o support.controller.js)
```

### 3.2 Verificar métodos getAgents y getChats

Asegúrate de que existan estos métodos:

```javascript
// supportController.js
exports.getAgents = async (req, res) => {
  try {
    // Lógica aquí
  } catch (error) {
    // Manejo de errores
  }
};

exports.getChats = async (req, res) => {
  try {
    // Lógica aquí
  } catch (error) {
    // Manejo de errores
  }
};
```

---

## 🔍 Paso 4: Verificar Servicios

### 4.1 Ubicar el servicio

Busca el archivo del servicio:

```
backend/
  services/
    supportService.js  (o support.service.js)
```

### 4.2 Verificar métodos del servicio

Los servicios deberían tener métodos como:

```javascript
// supportService.js
async getAgents() {
  // Lógica de acceso a datos
}

async getChats(userId) {
  // Lógica de acceso a datos
}
```

---

## 🔍 Paso 5: Verificar Modelo de Datos

### 5.1 Verificar tablas en Supabase

Asegúrate de que existan estas tablas en tu base de datos:

#### Tabla: `support_agents` (o similar)

```sql
-- Estructura esperada
CREATE TABLE support_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  status VARCHAR(20) DEFAULT 'offline', -- 'online', 'offline', 'away'
  avatar_url TEXT,
  skills TEXT[], -- Array de habilidades
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: `support_chats` (o `support_threads`)

```sql
-- Estructura esperada
CREATE TABLE support_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  agent_id UUID REFERENCES support_agents(id) NOT NULL,
  hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, agent_id)
);

-- Tabla de mensajes
CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES support_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL, -- user_id o agent_id
  sender_type VARCHAR(20) NOT NULL, -- 'user' o 'agent'
  body TEXT NOT NULL,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.2 Verificar permisos RLS (Row Level Security)

Si usas Row Level Security en Supabase, asegúrate de que:

1. Las políticas permitan lectura a usuarios autenticados
2. Los usuarios solo puedan ver sus propios chats
3. Los agentes puedan ver todos los chats asignados

```sql
-- Ejemplo de política para support_chats
CREATE POLICY "Users can view their own chats"
ON support_chats
FOR SELECT
USING (auth.uid() = user_id);

-- Ejemplo de política para support_agents
CREATE POLICY "Authenticated users can view agents"
ON support_agents
FOR SELECT
TO authenticated
USING (true);
```

---

## 🔍 Paso 6: Verificar Autenticación

### 6.1 Verificar authMiddleware

Asegúrate de que el middleware de autenticación esté funcionando:

```javascript
// middleware/authMiddleware.js
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 6.2 Verificar que el token se esté enviando

El frontend envía el token en el header:
```
Authorization: Bearer <token>
```

---

## 🛠️ Paso 7: Implementación Correcta de los Endpoints

### 7.1 GET /api/support/agents

**Objetivo:** Retornar lista de agentes de soporte disponibles.

**Implementación esperada:**

```javascript
// controllers/supportController.js
const supportService = require('../services/supportService');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');

exports.getAgents = async (req, res) => {
  try {
    const agents = await supportService.getAgents();
    
    return successResponse(res, {
      data: agents,
      message: 'Agents retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching support agents', {
      error: error.message,
      stack: error.stack,
      endpoint: '/support/agents'
    });
    
    return errorResponse(res, 'Failed to fetch support agents', 500);
  }
};
```

```javascript
// services/supportService.js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.getAgents = async () => {
  try {
    // Opción 1: Usar Supabase (preferido)
    const { data, error } = await supabase
      .from('support_agents')
      .select('id, user_id, name, role, status, avatar_url, skills, created_at, updated_at')
      .order('status', { ascending: false }) // online primero
      .order('name', { ascending: true });
    
    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    // Mapear snake_case a camelCase
    return (data || []).map(agent => ({
      id: agent.id,
      name: agent.name,
      role: agent.role,
      status: agent.status || 'offline',
      avatarUrl: agent.avatar_url,
      skills: agent.skills || []
    }));
    
  } catch (error) {
    // Opción 2: Fallback a Prisma si Supabase falla
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      const agents = await prisma.supportAgent.findMany({
        orderBy: [
          { status: 'desc' },
          { name: 'asc' }
        ]
      });
      
      return agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        status: agent.status || 'offline',
        avatarUrl: agent.avatarUrl,
        skills: agent.skills || []
      }));
    } finally {
      await prisma.$disconnect();
    }
  }
};
```

### 7.2 GET /api/support/chats

**Objetivo:** Retornar lista de conversaciones/chats del usuario autenticado.

**Implementación esperada:**

```javascript
// controllers/supportController.js
exports.getChats = async (req, res) => {
  try {
    const userId = req.user.id; // Del token JWT decodificado
    
    const chats = await supportService.getChats(userId);
    
    return successResponse(res, {
      data: chats,
      message: 'Chats retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching support chats', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      endpoint: '/support/chats'
    });
    
    return errorResponse(res, 'Failed to fetch support chats', 500);
  }
};
```

```javascript
// services/supportService.js
exports.getChats = async (userId) => {
  try {
    // Opción 1: Usar Supabase (preferido)
    const { data, error } = await supabase
      .from('support_chats')
      .select(`
        id,
        user_id,
        agent_id,
        hidden,
        created_at,
        updated_at,
        support_agents!support_chats_agent_id_fkey (
          id,
          name,
          status
        )
      `)
      .eq('user_id', userId)
      .eq('hidden', false)
      .order('updated_at', { ascending: false });
    
    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    // Obtener último mensaje y conteo de no leídos para cada chat
    const chatsWithMessages = await Promise.all(
      (data || []).map(async (chat) => {
        // Obtener último mensaje
        const { data: lastMessage } = await supabase
          .from('support_messages')
          .select('body, created_at')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        // Contar mensajes no leídos (del agente, no leídos por el usuario)
        const { count: unreadCount } = await supabase
          .from('support_messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chat.id)
          .eq('sender_type', 'agent')
          .is('read_at', null);
        
        return {
          id: chat.id,
          agentId: chat.agent_id,
          agentName: chat.support_agents?.name || 'Unknown',
          agentStatus: chat.support_agents?.status || 'offline',
          lastMessage: lastMessage ? {
            body: lastMessage.body,
            createdAt: lastMessage.created_at
          } : undefined,
          unreadCount: unreadCount || 0,
          hidden: chat.hidden || false
        };
      })
    );
    
    return chatsWithMessages;
    
  } catch (error) {
    // Opción 2: Fallback a Prisma
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      const chats = await prisma.supportChat.findMany({
        where: {
          userId: userId,
          hidden: false
        },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              status: true
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
      
      return chats.map(chat => ({
        id: chat.id,
        agentId: chat.agentId,
        agentName: chat.agent.name,
        agentStatus: chat.agent.status || 'offline',
        lastMessage: chat.messages[0] ? {
          body: chat.messages[0].body,
          createdAt: chat.messages[0].createdAt
        } : undefined,
        unreadCount: 0, // Calcular según lógica de negocio
        hidden: chat.hidden || false
      }));
    } finally {
      await prisma.$disconnect();
    }
  }
};
```

---

## 🔒 Paso 8: Verificar Seguridad y Validaciones

### 8.1 Validar que el usuario esté autenticado

```javascript
// routes/supportRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const supportController = require('../controllers/supportController');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/agents', supportController.getAgents);
router.get('/chats', supportController.getChats);

module.exports = router;
```

### 8.2 Verificar que el userId se obtenga correctamente

El `authMiddleware` debe decodificar el JWT y poner `req.user` con el `id` del usuario.

---

## 🧪 Paso 9: Testing

### 9.1 Probar con curl o Postman

```bash
# Obtener token primero (desde /api/auth/login)
TOKEN="tu_token_jwt_aqui"

# Probar GET /api/support/agents
curl -X GET \
  https://viotech-main.onrender.com/api/support/agents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Probar GET /api/support/chats
curl -X GET \
  https://viotech-main.onrender.com/api/support/chats \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### 9.2 Verificar respuesta esperada

**GET /api/support/agents** debería retornar:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Juan Pérez",
      "role": "Senior Support",
      "status": "online",
      "avatarUrl": "https://...",
      "skills": ["technical", "billing"]
    }
  ],
  "message": "Agents retrieved successfully"
}
```

**GET /api/support/chats** debería retornar:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "agentId": "uuid",
      "agentName": "Juan Pérez",
      "agentStatus": "online",
      "lastMessage": {
        "body": "Hola, ¿en qué puedo ayudarte?",
        "createdAt": "2025-12-11T21:00:00Z"
      },
      "unreadCount": 2,
      "hidden": false
    }
  ],
  "message": "Chats retrieved successfully"
}
```

---

## 🐛 Paso 10: Errores Comunes y Soluciones

### Error 1: "Table does not exist"

**Solución:**
- Verificar que las tablas existan en Supabase
- Ejecutar migraciones si usas Prisma
- Verificar nombre de las tablas (case-sensitive)

### Error 2: "Permission denied" o RLS bloqueando

**Solución:**
- Revisar políticas RLS en Supabase
- Verificar que el usuario autenticado tenga permisos
- Usar `SUPABASE_SERVICE_ROLE_KEY` en el backend (no `SUPABASE_ANON_KEY`)

### Error 3: "JWT expired" o "Invalid token"

**Solución:**
- Verificar que el token se esté enviando correctamente
- Verificar que el `JWT_SECRET` sea el mismo en frontend y backend
- Verificar expiración del token

### Error 4: "Cannot read property 'id' of undefined"

**Solución:**
- Verificar que `authMiddleware` esté poniendo `req.user`
- Verificar que el token se esté decodificando correctamente

### Error 5: "Connection timeout" o "Database connection failed"

**Solución:**
- Verificar variables de entorno de Supabase
- Verificar conexión a la base de datos
- Verificar que Render tenga acceso a Supabase

---

## 📝 Paso 11: Checklist Final

Antes de marcar como resuelto, verifica:

- [ ] Las rutas están definidas en `routes/supportRoutes.js`
- [ ] Los controladores existen y manejan errores correctamente
- [ ] Los servicios usan Supabase (o Prisma como fallback)
- [ ] Las tablas existen en la base de datos
- [ ] Las políticas RLS permiten acceso a usuarios autenticados
- [ ] El `authMiddleware` está aplicado a las rutas
- [ ] Los logs muestran información útil para debugging
- [ ] Los endpoints retornan el formato esperado por el frontend
- [ ] Se probaron con curl/Postman y funcionan correctamente
- [ ] El frontend ya no muestra errores 500

---

## 📞 Contacto

Si después de seguir estos pasos el problema persiste:

1. Revisa los logs completos en Render
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que la base de datos esté accesible
4. Revisa si hay otros endpoints similares que funcionen para comparar

---

## 📚 Referencias

- **Documentación del Backend:** `docs/agents/backend-agent.md`
- **Estructura esperada:** Express 4 + Supabase + Prisma fallback
- **Formato de respuestas:** `utils/responseHandler.js`
- **Logging:** Winston (ver `utils/logger.js`)

---

**Última actualización:** 2025-12-11
**Versión del documento:** 1.0

