import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

export interface Session {
  id: string;
  deviceName: string;
  location: string | null;
  ipAddress: string | null;
  lastActivity: string;
  isCurrent: boolean;
}

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async (): Promise<Session[]> => {
      const { data } = await apiClient.get("/auth/sessions");
      return data?.data || data || [];
    },
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // Auto-refresh cada minuto
  });
}

export function useCloseSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await apiClient.delete(`/auth/sessions/${sessionId}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Sesión cerrada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al cerrar la sesión");
    },
  });
}

export function useCloseAllOtherSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete("/auth/sessions");
      return data?.data || data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      const count = data?.deactivatedCount || 0;
      toast.success(`${count} sesión(es) cerrada(s) exitosamente`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al cerrar las sesiones");
    },
  });
}

