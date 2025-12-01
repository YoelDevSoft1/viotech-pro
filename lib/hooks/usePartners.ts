/**
 * Hooks para el Portal de Partners
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import type {
  Partner,
  PartnerLead,
  PartnerCommission,
  MarketingMaterial,
  PartnerTraining,
  PartnerCertification,
  ReferralCode,
  PartnerDashboard,
  PartnerPerformance,
} from "@/lib/types/partners";

// Hook para obtener el dashboard del partner actual
export function usePartnerDashboard() {
  return useQuery<PartnerDashboard>({
    queryKey: ["partner-dashboard"],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const response = await fetch(buildApiUrl("/partners/dashboard"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener dashboard de partner");
      }

      const data = await response.json();
      return data.data;
    },
  });
}

// Hook para obtener leads del partner
export function usePartnerLeads(filters?: {
  status?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery<PartnerLead[]>({
    queryKey: ["partner-leads", filters],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.source) params.append("source", filters.source);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(
        buildApiUrl(`/partners/leads?${params.toString()}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener leads");
      }

      const data = await response.json();
      return data.data;
    },
  });
}

// Hook para crear un nuevo lead
export function useCreatePartnerLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadData: {
      email: string;
      name: string;
      company?: string;
      phone?: string;
      source: "referral" | "direct" | "campaign";
    }) => {
      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const response = await fetch(buildApiUrl("/partners/leads"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear lead");
      }

      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-leads"] });
      queryClient.invalidateQueries({ queryKey: ["partner-dashboard"] });
    },
  });
}

// Hook para obtener comisiones
export function usePartnerCommissions(filters?: {
  status?: string;
  period?: string;
}) {
  return useQuery<PartnerCommission[]>({
    queryKey: ["partner-commissions", filters],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.period) params.append("period", filters.period);

      const response = await fetch(
        buildApiUrl(`/partners/commissions?${params.toString()}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener comisiones");
      }

      const data = await response.json();
      return data.data;
    },
  });
}

// Hook para obtener materiales de marketing
export function useMarketingMaterials(filters?: {
  type?: string;
  category?: string;
}) {
  return useQuery<MarketingMaterial[]>({
    queryKey: ["marketing-materials", filters],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const params = new URLSearchParams();
      if (filters?.type) params.append("type", filters.type);
      if (filters?.category) params.append("category", filters.category);

      const response = await fetch(
        buildApiUrl(`/partners/marketing-materials?${params.toString()}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener materiales de marketing");
      }

      const data = await response.json();
      return data.data;
    },
  });
}

// Hook para obtener trainings
export function usePartnerTrainings(filters?: {
  type?: string;
  level?: string;
  required?: boolean;
}) {
  return useQuery<PartnerTraining[]>({
    queryKey: ["partner-trainings", filters],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const params = new URLSearchParams();
      if (filters?.type) params.append("type", filters.type);
      if (filters?.level) params.append("level", filters.level);
      if (filters?.required !== undefined)
        params.append("required", filters.required.toString());

      const response = await fetch(
        buildApiUrl(`/partners/trainings?${params.toString()}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener trainings");
      }

      const data = await response.json();
      return data.data;
    },
  });
}

// Hook para marcar training como completado
export function useCompleteTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trainingId: string) => {
      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const response = await fetch(
        buildApiUrl(`/partners/trainings/${trainingId}/complete`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al completar training");
      }

      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-trainings"] });
      queryClient.invalidateQueries({ queryKey: ["partner-dashboard"] });
    },
  });
}

// Hook para obtener certificaciones
export function usePartnerCertifications() {
  return useQuery<PartnerCertification[]>({
    queryKey: ["partner-certifications"],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const response = await fetch(buildApiUrl("/partners/certifications"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener certificaciones");
      }

      const data = await response.json();
      return data.data;
    },
  });
}

// Hook para obtener códigos de referido
export function useReferralCodes() {
  return useQuery<ReferralCode[]>({
    queryKey: ["referral-codes"],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const response = await fetch(buildApiUrl("/partners/referral-codes"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener códigos de referido");
      }

      const data = await response.json();
      return data.data;
    },
  });
}

// Hook para crear código de referido
export function useCreateReferralCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (codeData: {
      type: "discount" | "commission" | "bonus";
      discount?: number;
      commission?: number;
      bonus?: number;
      maxUses?: number;
      expiresAt?: string;
    }) => {
      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const response = await fetch(buildApiUrl("/partners/referral-codes"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(codeData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear código de referido");
      }

      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-codes"] });
    },
  });
}

// Hook para obtener performance
export function usePartnerPerformance(period?: string) {
  return useQuery<PartnerPerformance[]>({
    queryKey: ["partner-performance", period],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const params = new URLSearchParams();
      if (period) params.append("period", period);

      const response = await fetch(
        buildApiUrl(`/partners/performance?${params.toString()}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener performance");
      }

      const data = await response.json();
      return data.data;
    },
  });
}

