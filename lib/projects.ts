import { buildApiUrl } from "./api";
import { getAccessToken, refreshAccessToken, isTokenExpired } from "./auth";

export type Project = {
  id: string;
  nombre: string;
  estado: string;
  tipo?: string;
  descripcion?: string | null;
  organizationId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchProjects(organizationId?: string): Promise<Project[]> {
  let token = getAccessToken();
  if (!token) throw new Error("No autenticado");
  if (isTokenExpired(token)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) token = refreshed;
    else throw new Error("Sesión expirada");
  }
  const params = new URLSearchParams();
  if (organizationId) params.append("organizationId", organizationId);
  const url = `${buildApiUrl("/projects")}${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok || !payload) {
    throw new Error(payload?.error || payload?.message || "No se pudieron cargar proyectos");
  }
  const raw = payload.data || payload.projects || payload || [];
  const data = Array.isArray(raw?.projects)
    ? raw.projects
    : Array.isArray(raw)
      ? raw
      : Array.isArray(raw.data)
        ? raw.data
        : [];
  return data.map((p: any) => ({
    id: String(p.id),
    nombre: p.nombre || p.name || "Sin nombre",
    estado: p.estado || p.status || "desconocido",
    tipo: p.tipo || p.type || "",
    descripcion: p.descripcion || p.description || "",
    organizationId: p.organizationId || p.organization_id || null,
    createdAt: p.createdAt || p.created_at,
    updatedAt: p.updatedAt || p.updated_at,
  }));
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  let token = getAccessToken();
  if (!token) throw new Error("No autenticado");
  if (isTokenExpired(token)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) token = refreshed;
    else throw new Error("Sesión expirada");
  }
  const url = buildApiUrl(`/projects/${id}`);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const payload = await res.json().catch(() => null);
  
  if (!res.ok || !payload) {
    throw new Error(payload?.error || payload?.message || "No se pudo cargar el proyecto");
  }
  
  // La respuesta tiene estructura: { success: true, data: { project: {...}, tickets: [...] } }
  const data = payload.data || payload;
  
  // El proyecto puede estar en data.project o directamente en data
  const p = data.project || data;
  
  const project: Project = {
    id: String(p?.id || id),
    nombre: p?.nombre || p?.name || "Sin nombre",
    estado: p?.estado || p?.status || "desconocido",
    tipo: p?.tipo || p?.type || "",
    descripcion: p?.descripcion || p?.description || "",
    organizationId: p?.organizationId || p?.organization_id || null,
    createdAt: p?.createdAt || p?.created_at || undefined,
    updatedAt: p?.updated_at || p?.updatedAt || undefined,
  };
  
  return project;
}
