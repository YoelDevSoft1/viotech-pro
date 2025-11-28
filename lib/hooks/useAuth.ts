import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { saveTokens } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

// Login
export function useLogin(redirectTo?: string) {
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await apiClient.post("/auth/login", credentials);
      return data?.data || data;
    },
    onSuccess: (data, variables) => {
      const { token, refreshToken, user, nombre } = data;
      const userName = user?.nombre || nombre || "Usuario";
      
      saveTokens(token, refreshToken, userName, variables.remember);
      
      // Evento legacy para actualizar UI si usas listeners
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("authChanged", { 
          detail: { isAuthenticated: true, userName } 
        }));
      }

      toast.success(`Bienvenido, ${userName}`);
      const from = redirectTo || "/client/dashboard";
      router.replace(from);
    },
    onError: (error: any) => {
      toast.error(error.message || "Credenciales incorrectas");
    }
  });
}

// Registro
export function useRegister() {
  return useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await apiClient.post("/auth/registro", userData);
      return data;
    },
    onSuccess: () => {
      toast.success("Cuenta creada. Por favor inicia sesión.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al crear cuenta");
    }
  });
}

// Solicitar recuperación (Forgot Password)
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await apiClient.post("/auth/forgot-password", { email });
      return data;
    },
    onSuccess: () => {
      toast.success("Si el correo existe, recibirás instrucciones.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al solicitar recuperación");
    }
  });
}

// Restablecer contraseña (Reset Password)
export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: async ({ token, password }: any) => {
      const { data } = await apiClient.post("/auth/reset-password", { token, password });
      return data;
    },
    onSuccess: () => {
      toast.success("Contraseña actualizada correctamente");
      router.push("/login");
    },
    onError: (error: any) => {
      toast.error(error.message || "El enlace es inválido o ha expirado");
    }
  });
}