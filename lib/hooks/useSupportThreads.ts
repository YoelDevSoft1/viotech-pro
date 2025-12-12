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
        console.log("[useSupportThreads] Chats fetched:", chats?.length || 0);
        // Convertir Chat[] a SupportThread[]
        return chats.map(chatToThread);
      } catch (error) {
        console.error("[useSupportThreads] Error fetching chats:", error);
        // Si es un error 500, retornar array vacío en lugar de lanzar
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 500) {
          // Backend no disponible - retornar array vacío para que la UI funcione
          return [] as SupportThread[];
        }
        throw error;
      }
    },
    staleTime: 1000 * 30, // 30 segundos
    gcTime: 1000 * 60 * 5, // 5 minutos en cache
    retry: (failureCount, error) => {
      // No hacer retry en errores 500 (problema del servidor)
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 500) {
        return false;
      }
      // No hacer retry en errores de autenticación
      if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        return false;
      }
      // Retry máximo 2 veces para otros errores
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    // NO usar initialData - causa parpadeo
    placeholderData: [],
    refetchOnWindowFocus: false,
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
