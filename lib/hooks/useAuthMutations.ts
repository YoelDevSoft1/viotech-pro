import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

type LoginCredentials = {
  email: string;
  password: string;
  remember?: boolean;
};

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      // Usamos la función login existente o llamamos directo al API
      // Si usas tu función login de lib/auth, asegúrate de que use apiClient o maneje el error
      const { data } = await apiClient.post("/auth/login", credentials);
      return data;
    },
  });
}

export function useRecoverPasswordMutation() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await apiClient.post("/auth/forgot-password", { email });
      return data;
    },
  });
}