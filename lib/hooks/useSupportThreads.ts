"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { AxiosError } from "axios";

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

export function useSupportThreads() {
  const qc = useQueryClient();

  const threadsQuery = useQuery({
    queryKey: ["support-threads"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/support/chats");
        return (data?.data || data || []) as SupportThread[];
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
  });

  const createThread = useMutation({
    mutationFn: async ({ agentId }: { agentId: string }) => {
      const { data } = await apiClient.post("/support/chats", { agentId });
      return data?.data || data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support-threads"] });
    },
  });

  const hideThread = useMutation({
    mutationFn: async ({ chatId, hidden }: { chatId: string; hidden: boolean }) => {
      await apiClient.patch(`/support/chats/${chatId}/hide`, { hidden });
      return { chatId, hidden };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support-threads"] });
    },
  });

  return {
    threads: threadsQuery.data || [],
    isLoading: threadsQuery.isLoading,
    isError: threadsQuery.isError,
    error: threadsQuery.error,
    refetch: threadsQuery.refetch,
    createThread,
    hideThread,
  };
}
