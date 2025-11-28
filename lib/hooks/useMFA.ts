import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

export type MFAStatus = {
  enabled: boolean;
  enrolled?: boolean;
  lastVerifiedAt?: string | null;
};

export function useMFAStatus() {
  return useQuery({
    queryKey: ["mfa-status"],
    queryFn: async (): Promise<MFAStatus> => {
      const { data } = await apiClient.get("/mfa/status");
      const mfaData = data?.data || data;
      return {
        enabled: Boolean(mfaData?.enabled ?? mfaData?.mfaEnabled),
        enrolled: mfaData?.enrolled,
        lastVerifiedAt: mfaData?.lastVerifiedAt || mfaData?.last_verified_at || null,
      };
    },
    staleTime: 1000 * 60, // 1 minuto
  });
}

export function useMFASetup() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post("/mfa/setup");
      return data?.data || data;
    },
  });
}

export function useMFAVerify() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ secret, token }: { secret: string; token: string }) => {
      const { data } = await apiClient.post("/mfa/verify", { secret, token });
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mfa-status"] });
      toast.success("MFA habilitado correctamente");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al verificar el código");
    },
  });
}

export function useMFADisable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (password: string) => {
      const { data } = await apiClient.post("/mfa/disable", { password });
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mfa-status"] });
      toast.success("MFA deshabilitado correctamente");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al deshabilitar MFA");
    },
  });
}

