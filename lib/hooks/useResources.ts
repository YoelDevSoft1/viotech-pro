import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

// --- Organizaciones ---
export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data } = await apiClient.get("/organizations");
      const list = Array.isArray(data) ? data : (data?.data?.organizations || data?.organizations || []);
      return list.map((o: any) => ({ id: String(o.id), nombre: o.nombre || o.name || o.id }));
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

// --- Proyectos (Depende de Org) ---
export function useProjects(orgId?: string) {
  return useQuery({
    queryKey: ["projects", orgId],
    enabled: !!orgId, // Solo busca si hay orgId
    queryFn: async () => {
      const { data } = await apiClient.get("/projects", { params: { organizationId: orgId } });
      const list = Array.isArray(data) ? data : (data?.data?.projects || data?.projects || []);
      return list.map((p: any) => ({ id: String(p.id), nombre: p.nombre || p.name || p.id }));
    },
  });
}

// --- Usuarios (Simplificado para selectores) ---
export function useUsers(searchTerm?: string) {
  return useQuery({
    queryKey: ["users", searchTerm],
    queryFn: async () => {
      // Si tu backend soporta búsqueda, úsala. Si no, trae los primeros 100.
      const params = searchTerm ? { search: searchTerm, limit: 20 } : { limit: 100 };
      const { data } = await apiClient.get("/users", { params });
      const list = Array.isArray(data) ? data : (data?.data?.users || data?.users || []);
      return list.map((u: any) => ({ 
        id: String(u.id), 
        nombre: u.nombre || u.email || u.id,
        email: u.email 
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}

// --- Usuario Actual ---
export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/auth/me");
        return data?.data?.user || data?.user || null;
      } catch (error: any) {
        // Si es 401, no hay usuario autenticado - esto es normal, no es un error
        if (error?.response?.status === 401) {
          return null; // Retornar null silenciosamente
        }
        // Para otros errores, lanzar el error
        throw error;
      }
    },
    staleTime: Infinity, // El usuario no cambia en la sesión
    retry: false, // No reintentar si falla (probablemente no autenticado)
  });
}