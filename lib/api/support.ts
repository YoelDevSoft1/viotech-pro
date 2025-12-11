/**
 * API Client específico para el sistema de soporte
 * Basado en la guía completa de implementación
 */

import { apiClient } from "@/lib/apiClient";

// Tipos TypeScript según la estructura del backend
export interface Agent {
  id: string;
  name: string;
  role: string;
  status: "online" | "offline" | "away" | "busy"; // Sincronizado automáticamente basado en sesiones activas
  avatarUrl: string | null;
  skills: string[];
  isActive: boolean; // Indica si el agente está activo en el sistema (no relacionado con presencia)
  lastSeenAt: string | null; // Última actividad detectada (basada en sesiones activas)
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
    senderType: "user" | "agent";
    createdAt: string;
  } | null;
  unreadCount: number;
  hiddenForUser: boolean;
  lastMessageAt: string | null;
}

export interface Message {
  id: string;
  body: string;
  senderType: "user" | "agent";
  senderId: string;
  status: "sending" | "sent" | "delivered" | "read";
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

/**
 * API Client para soporte técnico
 * Usa el apiClient centralizado que ya maneja autenticación y errores
 */
export const supportApi = {
  /**
   * Obtener agentes de soporte
   * 
   * Por defecto incluye TODOS los agentes (activos e inactivos) con estado sincronizado.
   * El backend sincroniza automáticamente la presencia basada en sesiones activas:
   * - Si tiene sesiones activas → status = "online"
   * - Si no tiene sesiones activas → status = "offline"
   * - Actualiza lastSeenAt con la última actividad
   * 
   * @param filters - Filtros opcionales
   * @param filters.status - Filtrar por estado: 'online', 'offline', 'away', 'busy'
   * @param filters.role - Filtrar por rol: 'agent', 'supervisor', 'admin'
   * @param filters.includeInactive - Incluir agentes inactivos (default: true)
   * @returns Array de agentes con estado sincronizado automáticamente
   */
  getAgents: async (filters?: { 
    status?: string; 
    role?: string; 
    includeInactive?: boolean;
  }): Promise<Agent[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.role) params.append("role", filters.role);
    // Por defecto incluir todos (activos e inactivos)
    if (filters?.includeInactive !== undefined) {
      params.append("includeInactive", filters.includeInactive.toString());
    } else {
      params.append("includeInactive", "true"); // Default: incluir todos
    }

    const query = params.toString();
    const { data } = await apiClient.get<{
      success: boolean;
      data: { agents: Agent[] };
    }>(`/support/agents${query ? `?${query}` : ""}`);

    // El backend ya sincronizó el estado automáticamente
    return data?.data?.agents || [];
  },

  /**
   * Actualizar estado de agente (solo para agentes)
   */
  updateAgentStatus: async (
    status: "online" | "offline" | "away" | "busy"
  ): Promise<Agent> => {
    const { data } = await apiClient.patch<{
      success: boolean;
      data: { agent: Agent };
    }>("/support/agents/status", { status });

    return data?.data?.agent;
  },

  /**
   * Obtener chats del usuario
   */
  getChats: async (includeHidden = false): Promise<Chat[]> => {
    const { data } = await apiClient.get<{
      success: boolean;
      data: { chats: Chat[] };
    }>(`/support/chats?includeHidden=${includeHidden}`);

    return data?.data?.chats || [];
  },

  /**
   * Crear/abrir chat con un agente
   */
  createChat: async (agentId: string): Promise<Chat> => {
    const { data } = await apiClient.post<{
      success: boolean;
      data: { chat: Chat };
    }>("/support/chats", { agentId });

    return data?.data?.chat;
  },

  /**
   * Ocultar/mostrar chat
   */
  hideChat: async (chatId: string, hidden: boolean): Promise<Chat> => {
    const { data } = await apiClient.patch<{
      success: boolean;
      data: { chat: Chat };
    }>(`/support/chats/${chatId}/hide`, { hidden });

    return data?.data?.chat;
  },

  /**
   * Obtener mensajes de un chat
   */
  getMessages: async (
    chatId: string,
    before?: string,
    limit = 50
  ): Promise<Message[]> => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (before) params.append("before", before);

    const { data } = await apiClient.get<{
      success: boolean;
      data: { messages: Message[] };
    }>(`/support/chats/${chatId}/messages?${params.toString()}`);

    return data?.data?.messages || [];
  },

  /**
   * Enviar mensaje en un chat
   */
  sendMessage: async (
    chatId: string,
    body: string,
    tempId?: string,
    attachments: Attachment[] = []
  ): Promise<Message> => {
    const { data } = await apiClient.post<{
      success: boolean;
      data: { message: Message };
    }>(`/support/chats/${chatId}/messages`, { body, tempId, attachments });

    return data?.data?.message;
  },

  /**
   * Marcar chat como leído
   */
  markAsRead: async (chatId: string, lastMessageId?: string): Promise<Chat> => {
    const { data } = await apiClient.post<{
      success: boolean;
      data: { chat: Chat };
    }>(`/support/chats/${chatId}/read`, { lastMessageId });

    return data?.data?.chat;
  },

  /**
   * Buscar mensajes en un chat
   */
  searchMessages: async (chatId: string, query: string): Promise<Message[]> => {
    const { data } = await apiClient.get<{
      success: boolean;
      data: { messages: Message[] };
    }>(`/support/chats/${chatId}/search?q=${encodeURIComponent(query)}`);

    return data?.data?.messages || [];
  },

  /**
   * Subir adjunto
   */
  uploadAttachment: async (file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("fileType", file.type);

    // Usar apiClient pero con FormData (sin Content-Type header)
    const { data } = await apiClient.post<{
      success: boolean;
      data: { attachment: Attachment };
    }>(`/support/attachments/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data?.data?.attachment;
  },
};

