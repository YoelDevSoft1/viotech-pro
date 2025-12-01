/**
 * Hooks para administración de partners (solo admin)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import type {
  PartnerWithUser,
  PartnerDetail,
  RegisterPartnerData,
  UpdatePartnerData,
  Partner,
} from "@/lib/types/partners";
import { toast } from "sonner";

// Listar todos los partners
export function usePartnersList(filters?: {
  status?: string;
  tier?: string;
  organizationId?: string;
}) {
  return useQuery<PartnerWithUser[]>({
    queryKey: ["partners", "admin", "list", filters],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.tier) params.append("tier", filters.tier);
      if (filters?.organizationId)
        params.append("organizationId", filters.organizationId);

      const response = await fetch(
        buildApiUrl(`/partners/admin/list?${params.toString()}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener partners");
      }

      const data = await response.json();
      return data.data;
    },
  });
}

// Obtener partner por ID
export function usePartnerDetail(partnerId: string | null) {
  return useQuery<PartnerDetail | null>({
    queryKey: ["partners", "admin", "detail", partnerId],
    queryFn: async () => {
      if (!partnerId) return null;

      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const response = await fetch(
        buildApiUrl(`/partners/admin/${partnerId}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener partner");
      }

      const data = await response.json();
      return data.data;
    },
    enabled: !!partnerId,
  });
}

// Registrar usuario como partner
export function useRegisterPartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterPartnerData) => {
      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const response = await fetch(buildApiUrl("/partners/admin/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al registrar partner");
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners", "admin"] });
      toast.success("Partner registrado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar partner");
    },
  });
}

// Actualizar partner
export function useUpdatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      partnerId,
      data,
    }: {
      partnerId: string;
      data: UpdatePartnerData;
    }) => {
      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const response = await fetch(
        buildApiUrl(`/partners/admin/update/${partnerId}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar partner");
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners", "admin"] });
      toast.success("Partner actualizado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar partner");
    },
  });
}

// Activar partner
export function useActivatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partnerId: string) => {
      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const response = await fetch(
        buildApiUrl(`/partners/admin/${partnerId}/activate`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al activar partner");
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners", "admin"] });
      toast.success("Partner activado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al activar partner");
    },
  });
}

// Suspender partner
export function useSuspendPartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partnerId: string) => {
      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const response = await fetch(
        buildApiUrl(`/partners/admin/${partnerId}/suspend`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al suspender partner");
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners", "admin"] });
      toast.success("Partner suspendido exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al suspender partner");
    },
  });
}

