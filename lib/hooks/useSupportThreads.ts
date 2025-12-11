"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supportApi, Chat } from "@/lib/api/support";
import { AxiosError } from "axios";

// Tipo compatible con la estructura actual del componente
export type SupportThread = {
  id: string;
  agentId: string;
  agentName: string;
  agentStatus?: "online" | "offline" | "away";
  lastMessage?: {
    body: string;
    createdAt: string;
  };
  unreadCount?: number;
  hidden?: boolean;
};

// Función helper para convertir Chat a SupportThread
function chatToThread(chat: Chat): SupportThread {
  return {
    id: chat.id,
    agentId: chat.agentId,
    agentName: chat.agent.name,
    agentStatus: (chat.agent.status as "online" | "offline" | "away") || "offline",
    lastMessage: chat.lastMessage
      ? {
          body: chat.lastMessage.body,
          createdAt: chat.lastMessage.createdAt,
        }
      : undefined,
    unreadCount: chat.unreadCount,
    hidden: chat.hiddenForUser,
  };
}

export function useSupportThreads(includeHidden = false) {
  const qc = useQueryClient();

  const threadsQuery = useQuery({
    queryKey: ["support-threads", includeHidden],
    queryFn: async () => {
      try {
        const chats = await supportApi.getChats(includeHidden);
        // Convertir Chat[] a SupportThread[]
        return chats.map(chatToThread);
      } catch (error) {
        // Si es un error 500, retornar array vacío en lugar de lanzar
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 500) {
          // Backend no disponible - retornar array vacío para que la UI funcione
          return [] as SupportThread[];
        }
        throw error;
      }
    },
    staleTime: 1000 * 15,
    retry: (failureCount, error) => {
      // No hacer retry en errores 500 (problema del servidor)
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 500) {
        return false;
      }
      // Retry máximo 1 vez para otros errores
      return failureCount < 1;
    },
    retryDelay: 1000,
    // Valor inicial por defecto
    initialData: [],
  });

  const createThread = useMutation({
    mutationFn: async ({ agentId }: { agentId: string }) => {
      const chat = await supportApi.createChat(agentId);
      return chatToThread(chat);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support-threads"] });
    },
  });

  const hideThread = useMutation({
    mutationFn: async ({ chatId, hidden }: { chatId: string; hidden: boolean }) => {
      const chat = await supportApi.hideChat(chatId, hidden);
      return chatToThread(chat);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support-threads"] });
    },
  });

  // Asegurar que siempre sea un array
  const threads = Array.isArray(threadsQuery.data) ? threadsQuery.data : [];

  return {
    threads,
    isLoading: threadsQuery.isLoading,
    isError: threadsQuery.isError,
    error: threadsQuery.error,
    refetch: threadsQuery.refetch,
    createThread,
    hideThread,
  };
}
