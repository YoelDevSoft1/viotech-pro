# 📘 Guía Completa: Implementación de la Página de Soporte en Frontend

## 📋 Tabla de Contenidos

1. [Resumen de Endpoints](#resumen-de-endpoints)
2. [Estructura de Datos](#estructura-de-datos)
3. [Paso 1: Configurar API Client](#paso-1-configurar-api-client)
4. [Paso 2: Hooks Personalizados](#paso-2-hooks-personalizados)
5. [Paso 3: Componente de Lista de Agentes](#paso-3-componente-de-lista-de-agentes)
6. [Paso 4: Componente de Lista de Chats](#paso-4-componente-de-lista-de-chats)
7. [Paso 5: Componente de Chat/Mensajes](#paso-5-componente-de-chatmensajes)
8. [Paso 6: Componente Principal de Soporte](#paso-6-componente-principal-de-soporte)
9. [Paso 7: Integración con WebSocket (Tiempo Real)](#paso-7-integracion-con-websocket-tiempo-real)
10. [Paso 8: Manejo de Estados y Errores](#paso-8-manejo-de-estados-y-errores)

---

## 📡 Resumen de Endpoints

### Base URL
```
https://viotech-main.onrender.com/api
```

### Endpoints Disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/support/agents` | Listar agentes de soporte |
| `PATCH` | `/support/agents/status` | Actualizar estado de agente |
| `GET` | `/support/chats` | Listar chats del usuario |
| `POST` | `/support/chats` | Crear/abrir chat con agente |
| `PATCH` | `/support/chats/:id/hide` | Ocultar/mostrar chat |
| `GET` | `/support/chats/:id/messages` | Listar mensajes de un chat |
| `POST` | `/support/chats/:id/messages` | Enviar mensaje |
| `POST` | `/support/chats/:id/read` | Marcar chat como leído |
| `GET` | `/support/chats/:id/search` | Buscar mensajes |
| `POST` | `/support/attachments/upload` | Subir adjunto |
| `GET` | `/support/tickets` | Listar tickets |
| `POST` | `/support/tickets` | Crear ticket |
| `GET` | `/support/status` | Estado de servicios |

---

## 📊 Estructura de Datos

### GET /api/support/agents

**Respuesta:**
```json
{
  "success": true,
  "message": "Agentes obtenidos exitosamente",
  "data": {
    "agents": [
      {
        "id": "uuid",
        "name": "Juan Pérez",
        "role": "agent",
        "status": "online",
        "avatarUrl": "https://...",
        "skills": ["tickets", "billing"]
      }
    ]
  }
}
```

### GET /api/support/chats

**Respuesta:**
```json
{
  "success": true,
  "message": "Chats obtenidos exitosamente",
  "data": {
    "chats": [
      {
        "id": "uuid",
        "agentId": "uuid",
        "agent": {
          "id": "uuid",
          "name": "Juan Pérez",
          "avatarUrl": "https://...",
          "status": "online"
        },
        "lastMessage": {
          "id": "uuid",
          "body": "Hola, ¿en qué puedo ayudarte?",
          "senderType": "agent",
          "createdAt": "2025-12-11T22:00:00Z"
        },
        "unreadCount": 2,
        "hiddenForUser": false,
        "lastMessageAt": "2025-12-11T22:00:00Z"
      }
    ]
  }
}
```

### GET /api/support/chats/:id/messages

**Respuesta:**
```json
{
  "success": true,
  "message": "Mensajes obtenidos exitosamente",
  "data": {
    "messages": [
      {
        "id": "uuid",
        "body": "Hola, ¿en qué puedo ayudarte?",
        "senderType": "agent",
        "senderId": "uuid",
        "status": "read",
        "createdAt": "2025-12-11T22:00:00Z",
        "attachments": []
      }
    ]
  }
}
```

---

## 🔧 Paso 1: Configurar API Client

Crea un archivo para manejar todas las peticiones a la API:

```typescript
// lib/api/support.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://viotech-main.onrender.com/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token'); // O tu método de obtener token
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const result: ApiResponse<T> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Error en la petición');
  }

  return result.data as T;
}

// Agentes
export const supportApi = {
  // Obtener agentes
  getAgents: async (filters?: { status?: string; role?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.role) params.append('role', filters.role);
    
    const query = params.toString();
    const data = await apiRequest<{ agents: Agent[] }>(
      `/support/agents${query ? `?${query}` : ''}`
    );
    return data.agents || [];
  },

  // Actualizar estado de agente
  updateAgentStatus: async (status: 'online' | 'offline' | 'away' | 'busy') => {
    const data = await apiRequest<{ agent: Agent }>(
      '/support/agents/status',
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
    return data.agent;
  },

  // Obtener chats
  getChats: async (includeHidden = false) => {
    const data = await apiRequest<{ chats: Chat[] }>(
      `/support/chats?includeHidden=${includeHidden}`
    );
    return data.chats || [];
  },

  // Crear/abrir chat
  createChat: async (agentId: string) => {
    const data = await apiRequest<{ chat: Chat }>(
      '/support/chats',
      {
        method: 'POST',
        body: JSON.stringify({ agentId }),
      }
    );
    return data.chat;
  },

  // Ocultar/mostrar chat
  hideChat: async (chatId: string, hidden: boolean) => {
    const data = await apiRequest<{ chat: Chat }>(
      `/support/chats/${chatId}/hide`,
      {
        method: 'PATCH',
        body: JSON.stringify({ hidden }),
      }
    );
    return data.chat;
  },

  // Obtener mensajes
  getMessages: async (chatId: string, before?: string, limit = 50) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (before) params.append('before', before);
    
    const data = await apiRequest<{ messages: Message[] }>(
      `/support/chats/${chatId}/messages?${params.toString()}`
    );
    return data.messages || [];
  },

  // Enviar mensaje
  sendMessage: async (
    chatId: string,
    body: string,
    tempId?: string,
    attachments: any[] = []
  ) => {
    const data = await apiRequest<{ message: Message }>(
      `/support/chats/${chatId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ body, tempId, attachments }),
      }
    );
    return data.message;
  },

  // Marcar como leído
  markAsRead: async (chatId: string, lastMessageId?: string) => {
    const data = await apiRequest<{ chat: Chat }>(
      `/support/chats/${chatId}/read`,
      {
        method: 'POST',
        body: JSON.stringify({ lastMessageId }),
      }
    );
    return data.chat;
  },

  // Buscar mensajes
  searchMessages: async (chatId: string, query: string) => {
    const data = await apiRequest<{ messages: Message[] }>(
      `/support/chats/${chatId}/search?q=${encodeURIComponent(query)}`
    );
    return data.messages || [];
  },

  // Subir adjunto
  uploadAttachment: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/support/attachments/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const result: ApiResponse<{ attachment: Attachment }> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Error subiendo archivo');
    }
    return result.data!.attachment;
  },
};

// Tipos TypeScript
export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  avatarUrl: string | null;
  skills: string[];
}

export interface Chat {
  id: string;
  agentId: string;
  agent: {
    id: string;
    name: string;
    avatarUrl: string | null;
    status: string;
  };
  lastMessage: {
    id: string;
    body: string;
    senderType: 'user' | 'agent';
    createdAt: string;
  } | null;
  unreadCount: number;
  hiddenForUser: boolean;
  lastMessageAt: string | null;
}

export interface Message {
  id: string;
  body: string;
  senderType: 'user' | 'agent';
  senderId: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  createdAt: string;
  attachments: Attachment[];
}

export interface Attachment {
  fileName: string;
  fileType: string;
  fileSize: number;
  storageUrl: string;
  storagePath: string;
}
```

---

## 🎣 Paso 2: Hooks Personalizados

Crea hooks para manejar el estado y la lógica:

```typescript
// hooks/useSupportAgents.ts
import { useState, useEffect, useMemo } from 'react';
import { supportApi, Agent } from '@/lib/api/support';

export function useSupportAgents(filters?: { status?: string; role?: string }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        setError(null);
        const agentsData = await supportApi.getAgents(filters);
        setAgents(agentsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al obtener agentes');
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [filters?.status, filters?.role]);

  const onlineAgents = useMemo(() => {
    return agents.filter(agent => agent.status === 'online');
  }, [agents]);

  const offlineAgents = useMemo(() => {
    return agents.filter(agent => agent.status === 'offline');
  }, [agents]);

  const awayAgents = useMemo(() => {
    return agents.filter(agent => agent.status === 'away');
  }, [agents]);

  return {
    agents,
    onlineAgents,
    offlineAgents,
    awayAgents,
    loading,
    error,
    refetch: () => {
      const fetchAgents = async () => {
        try {
          const agentsData = await supportApi.getAgents(filters);
          setAgents(agentsData);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al obtener agentes');
        }
      };
      fetchAgents();
    },
  };
}
```

```typescript
// hooks/useSupportChats.ts
import { useState, useEffect } from 'react';
import { supportApi, Chat } from '@/lib/api/support';

export function useSupportChats(includeHidden = false) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        setError(null);
        const chatsData = await supportApi.getChats(includeHidden);
        setChats(chatsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al obtener chats');
        setChats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [includeHidden]);

  const createChat = async (agentId: string) => {
    try {
      const newChat = await supportApi.createChat(agentId);
      setChats(prev => [newChat, ...prev]);
      return newChat;
    } catch (err) {
      throw err;
    }
  };

  const hideChat = async (chatId: string, hidden: boolean) => {
    try {
      const updatedChat = await supportApi.hideChat(chatId, hidden);
      setChats(prev =>
        prev.map(chat => (chat.id === chatId ? updatedChat : chat))
      );
      return updatedChat;
    } catch (err) {
      throw err;
    }
  };

  return {
    chats,
    loading,
    error,
    createChat,
    hideChat,
    refetch: async () => {
      try {
        const chatsData = await supportApi.getChats(includeHidden);
        setChats(chatsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al obtener chats');
      }
    },
  };
}
```

```typescript
// hooks/useChatMessages.ts
import { useState, useEffect, useCallback } from 'react';
import { supportApi, Message } from '@/lib/api/support';

export function useChatMessages(chatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadMessages = useCallback(async (before?: string) => {
    if (!chatId) return;

    try {
      setLoading(true);
      setError(null);
      const newMessages = await supportApi.getMessages(chatId, before, 50);
      
      if (before) {
        // Cargar más mensajes (paginación hacia atrás)
        setMessages(prev => [...newMessages, ...prev]);
      } else {
        // Cargar mensajes iniciales
        setMessages(newMessages);
      }
      
      setHasMore(newMessages.length === 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    if (chatId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [chatId, loadMessages]);

  const sendMessage = async (body: string, tempId?: string, attachments: any[] = []) => {
    if (!chatId) throw new Error('No hay chat seleccionado');

    // Optimistic update
    const tempMessage: Message = {
      id: tempId || `temp-${Date.now()}`,
      body,
      senderType: 'user',
      senderId: '', // Se llenará con el ID real del usuario
      status: 'sending',
      createdAt: new Date().toISOString(),
      attachments,
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      const sentMessage = await supportApi.sendMessage(chatId, body, tempId, attachments);
      setMessages(prev =>
        prev.map(msg => (msg.id === tempId ? sentMessage : msg))
      );
      return sentMessage;
    } catch (err) {
      // Revertir optimistic update
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      throw err;
    }
  };

  const loadMore = () => {
    if (hasMore && messages.length > 0) {
      const lastMessage = messages[0];
      loadMessages(lastMessage.createdAt);
    }
  };

  return {
    messages,
    loading,
    error,
    hasMore,
    sendMessage,
    loadMore,
    refetch: () => loadMessages(),
  };
}
```

---

## 👥 Paso 3: Componente de Lista de Agentes

```typescript
// components/support/AgentsList.tsx
'use client';

import { useSupportAgents } from '@/hooks/useSupportAgents';
import { Agent } from '@/lib/api/support';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface AgentsListProps {
  onSelectAgent: (agent: Agent) => void;
  selectedAgentId?: string;
}

export function AgentsList({ onSelectAgent, selectedAgentId }: AgentsListProps) {
  const { agents, onlineAgents, loading, error } = useSupportAgents();

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-sm text-red-500 py-4">
        Error: {error}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
        <p className="font-medium mb-1">No hay agentes disponibles</p>
        <p className="text-xs">No hay agentes disponibles en este momento</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Contador de agentes online */}
      <div className="px-2 py-1 text-xs text-muted-foreground">
        {onlineAgents.length} en línea
      </div>

      {/* Lista de agentes */}
      {agents.map(agent => (
        <button
          key={agent.id}
          onClick={() => onSelectAgent(agent)}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
            selectedAgentId === agent.id
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          }`}
        >
          <div className="relative">
            <Avatar>
              <AvatarImage src={agent.avatarUrl || undefined} alt={agent.name} />
              <AvatarFallback>
                {agent.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Indicador de estado */}
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                agent.status === 'online'
                  ? 'bg-green-500'
                  : agent.status === 'away'
                  ? 'bg-yellow-500'
                  : agent.status === 'busy'
                  ? 'bg-red-500'
                  : 'bg-gray-400'
              }`}
            />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium">{agent.name}</div>
            <div className="text-xs opacity-70">{agent.role}</div>
          </div>
          <Badge variant="outline" className="text-xs">
            {agent.status}
          </Badge>
        </button>
      ))}
    </div>
  );
}
```

---

## 💬 Paso 4: Componente de Lista de Chats

```typescript
// components/support/ChatsList.tsx
'use client';

import { useSupportChats } from '@/hooks/useSupportChats';
import { Chat } from '@/lib/api/support';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatsListProps {
  onSelectChat: (chat: Chat) => void;
  selectedChatId?: string;
}

export function ChatsList({ onSelectChat, selectedChatId }: ChatsListProps) {
  const { chats, loading, error } = useSupportChats(false);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-sm text-red-500 py-4">
        Error: {error}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
        <p className="font-medium mb-1">Sin conversación activa</p>
        <p className="text-xs">
          Selecciona una conversación existente o inicia una nueva con un agente de soporte.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {chats.map(chat => (
        <button
          key={chat.id}
          onClick={() => onSelectChat(chat)}
          className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors ${
            selectedChatId === chat.id
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          }`}
        >
          <Avatar>
            <AvatarImage src={chat.agent.avatarUrl || undefined} alt={chat.agent.name} />
            <AvatarFallback>
              {chat.agent.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="font-medium truncate">{chat.agent.name}</div>
              {chat.lastMessageAt && (
                <span className="text-xs opacity-70 ml-2">
                  {formatDistanceToNow(new Date(chat.lastMessageAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              )}
            </div>
            {chat.lastMessage && (
              <p className="text-sm opacity-70 truncate">
                {chat.lastMessage.body}
              </p>
            )}
          </div>
          {chat.unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {chat.unreadCount}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}
```

---

## 💬 Paso 5: Componente de Chat/Mensajes

```typescript
// components/support/ChatWindow.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatMessages } from '@/hooks/useChatMessages';
import { Chat, Message } from '@/lib/api/support';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Send, Paperclip, Loader2 } from 'lucide-react';

interface ChatWindowProps {
  chat: Chat | null;
  currentUserId: string;
}

export function ChatWindow({ chat, currentUserId }: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, loading, sendMessage, loadMore, hasMore } = useChatMessages(
    chat?.id || null
  );

  // Scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Marcar como leído cuando se abre el chat
  useEffect(() => {
    if (chat && chat.unreadCount > 0) {
      // Llamar a la API para marcar como leído
      import('@/lib/api/support').then(({ supportApi }) => {
        supportApi.markAsRead(chat.id);
      });
    }
  }, [chat?.id]);

  const handleSend = async () => {
    if (!message.trim() || !chat || sending) return;

    const messageText = message.trim();
    setMessage('');
    setSending(true);

    try {
      const tempId = `temp-${Date.now()}`;
      await sendMessage(messageText, tempId);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      // Mostrar error al usuario
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="font-medium mb-1">Sin conversación activa</p>
          <p className="text-sm">
            Selecciona una conversación existente o inicia una nueva con un agente de soporte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header del chat */}
      <div className="border-b p-4 flex items-center gap-3">
        <Avatar>
          <AvatarImage src={chat.agent.avatarUrl || undefined} alt={chat.agent.name} />
          <AvatarFallback>
            {chat.agent.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-medium">{chat.agent.name}</div>
          <div className="text-xs text-muted-foreground">
            {chat.agent.status === 'online' ? 'En línea' : 'Desconectado'}
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {loading && messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Cargando mensajes...
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="text-center mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'Cargando...' : 'Cargar más mensajes'}
                </Button>
              </div>
            )}
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isUser = msg.senderType === 'user';
                const showAvatar = index === 0 || messages[index - 1].senderType !== msg.senderType;
                const showDate =
                  index === 0 ||
                  new Date(msg.createdAt).getDate() !==
                    new Date(messages[index - 1].createdAt).getDate();

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="text-center text-xs text-muted-foreground my-4">
                        {format(new Date(msg.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                      </div>
                    )}
                    <div
                      className={`flex gap-2 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isUser && showAvatar && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={chat.agent.avatarUrl || undefined}
                            alt={chat.agent.name}
                          />
                          <AvatarFallback>
                            {chat.agent.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{msg.body}</p>
                        <div className="text-xs opacity-70 mt-1">
                          {format(new Date(msg.createdAt), 'HH:mm')}
                          {isUser && msg.status !== 'read' && (
                            <span className="ml-2">
                              {msg.status === 'sending' && '⏳'}
                              {msg.status === 'sent' && '✓'}
                              {msg.status === 'delivered' && '✓✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </ScrollArea>

      {/* Input de mensaje */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            disabled={sending}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="shrink-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎯 Paso 6: Componente Principal de Soporte

```typescript
// app/support/page.tsx o components/support/SupportPage.tsx
'use client';

import { useState } from 'react';
import { AgentsList } from '@/components/support/AgentsList';
import { ChatsList } from '@/components/support/ChatsList';
import { ChatWindow } from '@/components/support/ChatWindow';
import { useSupportChats } from '@/hooks/useSupportChats';
import { Agent, Chat } from '@/lib/api/support';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function SupportPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const { chats, createChat, loading: chatsLoading } = useSupportChats();
  const [currentUserId] = useState(''); // Obtener del contexto de autenticación

  const selectedChat = chats.find(chat => chat.id === selectedChatId) || null;

  const handleSelectAgent = async (agent: Agent) => {
    setSelectedAgent(agent);
    
    // Buscar si ya existe un chat con este agente
    const existingChat = chats.find(chat => chat.agentId === agent.id);
    
    if (existingChat) {
      setSelectedChatId(existingChat.id);
    } else {
      // Crear nuevo chat
      try {
        const newChat = await createChat(agent.id);
        setSelectedChatId(newChat.id);
      } catch (error) {
        console.error('Error creando chat:', error);
      }
    }
  };

  const handleSelectChat = (chat: Chat) => {
    setSelectedChatId(chat.id);
    setSelectedAgent(null);
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar izquierdo - Agentes y Chats */}
      <div className="w-80 border-r flex flex-col">
        <div className="border-b p-4">
          <h2 className="font-semibold text-lg">Soporte técnico</h2>
          <p className="text-sm text-muted-foreground">Chat en vivo</p>
        </div>

        <Tabs defaultValue="chats" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="chats">Chats</TabsTrigger>
            <TabsTrigger value="agents">Agentes</TabsTrigger>
          </TabsList>

          <TabsContent value="chats" className="flex-1 overflow-auto px-4 pb-4">
            <ChatsList
              onSelectChat={handleSelectChat}
              selectedChatId={selectedChatId || undefined}
            />
          </TabsContent>

          <TabsContent value="agents" className="flex-1 overflow-auto px-4 pb-4">
            <AgentsList
              onSelectAgent={handleSelectAgent}
              selectedAgentId={selectedAgent?.id}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Área principal - Chat */}
      <div className="flex-1 flex flex-col">
        <ChatWindow chat={selectedChat} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
```

---

## 🔌 Paso 7: Integración con WebSocket (Tiempo Real)

Para actualizaciones en tiempo real, conecta con WebSocket:

```typescript
// hooks/useWebSocket.ts
import { useEffect, useRef } from 'react';

export function useWebSocket(
  url: string,
  onMessage: (data: any) => void,
  onError?: (error: Event) => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const connect = () => {
      const token = localStorage.getItem('token');
      const wsUrl = `${url}?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket conectado');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Error parseando mensaje WebSocket:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Error WebSocket:', error);
        if (onError) onError(error);
      };

      ws.onclose = () => {
        console.log('WebSocket desconectado, reconectando...');
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      wsRef.current = ws;
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url, onMessage, onError]);

  return wsRef;
}
```

Uso en el componente de chat:

```typescript
// En ChatWindow.tsx, agregar:
useWebSocket(
  'wss://viotech-main.onrender.com/ws/support',
  (data) => {
    if (data.type === 'new_message' && data.chatId === chat?.id) {
      // Agregar nuevo mensaje
      setMessages(prev => [...prev, data.message]);
    } else if (data.type === 'message_status' && data.chatId === chat?.id) {
      // Actualizar estado de mensaje
      setMessages(prev =>
        prev.map(msg =>
          msg.id === data.messageId ? { ...msg, status: data.status } : msg
        )
      );
    } else if (data.type === 'agent_status' && data.agentId === chat?.agent.id) {
      // Actualizar estado del agente
      // Actualizar el estado en el chat
    }
  }
);
```

---

## ⚠️ Paso 8: Manejo de Estados y Errores

Agrega manejo de errores global:

```typescript
// components/support/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SupportErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error en soporte:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Algo salió mal</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.error?.message || 'Ocurrió un error inesperado'}
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
            >
              Recargar página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## ✅ Checklist de Implementación

- [ ] Configurar API client (`lib/api/support.ts`)
- [ ] Crear hooks personalizados (`useSupportAgents`, `useSupportChats`, `useChatMessages`)
- [ ] Implementar componente `AgentsList`
- [ ] Implementar componente `ChatsList`
- [ ] Implementar componente `ChatWindow`
- [ ] Implementar componente principal `SupportPage`
- [ ] Agregar manejo de errores y estados de carga
- [ ] Integrar WebSocket para tiempo real (opcional)
- [ ] Agregar funcionalidad de subir adjuntos
- [ ] Agregar búsqueda de mensajes
- [ ] Probar todos los flujos de usuario

---

## 🎨 Mejoras Adicionales

1. **Notificaciones**: Mostrar notificaciones cuando lleguen nuevos mensajes
2. **Sonidos**: Reproducir sonido al recibir mensaje
3. **Typing indicators**: Mostrar cuando el agente está escribiendo
4. **Emojis**: Agregar selector de emojis
5. **Adjuntos**: Vista previa de imágenes y descarga de archivos
6. **Búsqueda**: Búsqueda en tiempo real de mensajes
7. **Temas**: Soporte para temas claro/oscuro

---

**Última actualización:** 2025-12-11  
**Backend API:** `https://viotech-main.onrender.com/api`  
**Documentación Swagger:** `https://viotech-main.onrender.com/api-docs`

