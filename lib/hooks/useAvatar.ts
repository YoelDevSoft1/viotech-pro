import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

/**
 * Hook para manejar la subida de foto de perfil
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);

      // Axios detecta FormData automáticamente y establece el Content-Type correcto
      // No necesitamos especificarlo manualmente
      const { data } = await apiClient.post("/auth/me/avatar", formData);

      return data?.data?.user || data?.user || data;
    },
    onSuccess: (user) => {
      // Actualizar el cache del usuario actual
      queryClient.setQueryData(["auth-user"], user);
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      toast.success("Foto de perfil actualizada correctamente");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Error al subir la foto de perfil";
      toast.error(message);
    },
  });
}

/**
 * Hook para eliminar la foto de perfil
 */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete("/auth/me/avatar");
      return data?.data?.user || data?.user || data;
    },
    onSuccess: (user) => {
      // Actualizar el cache del usuario actual
      queryClient.setQueryData(["auth-user"], user);
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      toast.success("Foto de perfil eliminada correctamente");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Error al eliminar la foto de perfil";
      toast.error(message);
    },
  });
}
