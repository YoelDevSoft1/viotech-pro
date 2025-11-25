"use client";

import { useEffect, useState, useCallback, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Filter, ArrowLeft } from "lucide-react";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, isTokenExpired, refreshAccessToken, logout } from "@/lib/auth";

type Ticket = {
  id: string;
  titulo: string;
  descripcion?: string | null;
  estado: string;
  prioridad: string;
  organizationId?: string;
  projectId?: string;
  usuario?: { nombre?: string; email?: string };
  createdAt: string;
};

const estadoOptions = [
  { value: "", label: "Todos" },
  { value: "abierto", label: "Abierto" },
  { value: "en_progreso", label: "En progreso" },
  { value: "resuelto", label: "Resuelto" },
];

const prioridadOptions = [
  { value: "", label: "Todas" },
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

export default function AdminTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string>("");
  const [filters, setFilters] = useState({ estado: "", prioridad: "", projectId: "" });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    let token = getAccessToken();
    if (!token) {
      router.replace("/login?from=/admin/tickets");
      return;
    }
    if (isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        router.replace("/login?from=/admin/tickets&reason=expired");
        return;
      }
    }

    try {
      const params = new URLSearchParams();
      if (orgId) params.append("organizationId", orgId);
      if (filters.estado) params.append("estado", filters.estado);
      if (filters.prioridad) params.append("prioridad", filters.prioridad);
      if (filters.projectId) params.append("projectId", filters.projectId);
      const url = `${buildApiUrl("/tickets")}${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload) {
        throw new Error(payload?.error || payload?.message || "No se pudieron cargar los tickets");
      }
      const data = payload.data?.tickets || payload.data || [];
      setTickets(
        data.map((t: any) => ({
          id: String(t.id),
          titulo: t.titulo || "Sin título",
          descripcion: t.descripcion || "",
          estado: t.estado || "abierto",
          prioridad: t.prioridad || "media",
          organizationId: t.organizationId || t.organization_id || "",
          projectId: t.projectId || t.project_id || "",
          usuario: t.usuario || null,
          createdAt: t.createdAt || t.created_at || new Date().toISOString(),
        })),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar tickets";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [router, orgId, filters]);

  const updateTicket = async (ticketId: string, payload: { estado?: string; prioridad?: string }) => {
    setActionLoading(ticketId);
    setError(null);
    let token = getAccessToken();
    if (!token) {
      router.replace("/login?from=/admin/tickets");
      return;
    }
    if (isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        router.replace("/login?from=/admin/tickets&reason=expired");
        return;
      }
    }
    // Optimista
    const prev = tickets;
    setTickets((curr) =>
      curr.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              estado: payload.estado ?? t.estado,
              prioridad: payload.prioridad ?? t.prioridad,
            }
          : t,
      ),
    );
    try {
      const res = await fetch(buildApiUrl(`/tickets/${ticketId}`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || data?.message || "No se pudo actualizar el ticket");
      }
    } catch (err) {
      setTickets(prev);
      setError(err instanceof Error ? err.message : "Error al actualizar ticket");
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const onFilterChange = (field: "estado" | "prioridad" | "projectId") => (e: ChangeEvent<HTMLSelectElement>) =>
    setFilters((f) => ({ ...f, [field]: e.target.value }));

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al panel admin
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tickets globales</p>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-medium text-foreground">Tickets (admin)</h1>
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Filter className="w-4 h-4" />
              Filtros
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Admin puede ver y editar tickets de cualquier organización/proyecto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} />
          <Select label="Estado" value={filters.estado} onChange={onFilterChange("estado")}>
            {estadoOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Select label="Prioridad" value={filters.prioridad} onChange={onFilterChange("prioridad")}>
            {prioridadOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Select label="Proyecto" value={filters.projectId} onChange={onFilterChange("projectId")}>
            <option value="">Todos</option>
          </Select>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Cargando tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            No hay tickets disponibles.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {tickets.map((t) => (
              <article key={t.id} className="rounded-2xl border border-border/70 bg-background/80 p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-foreground">{t.titulo}</p>
                    <p className="text-[11px] text-muted-foreground">ID: {t.id}</p>
                    {t.usuario?.email && (
                      <p className="text-[11px] text-muted-foreground">
                        Usuario: {t.usuario.nombre || "Sin nombre"} ({t.usuario.email})
                      </p>
                    )}
                    {t.organizationId && (
                      <p className="text-[11px] text-muted-foreground">Org: {t.organizationId}</p>
                    )}
                    {t.projectId && (
                      <p className="text-[11px] text-muted-foreground">Proyecto: {t.projectId}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      Creado:{" "}
                      {new Date(t.createdAt).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border px-2 py-0.5 capitalize">
                      {t.estado}
                    </span>
                    <span className="rounded-full border border-border px-2 py-0.5 capitalize">
                      Prioridad: {t.prioridad}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{t.descripcion}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs pt-2">
                  <Select
                    value={t.estado}
                    onChange={(e) => updateTicket(t.id, { estado: e.target.value })}
                    className="w-32"
                  >
                    {estadoOptions
                      .filter((o) => o.value !== "")
                      .map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                  </Select>
                  <Select
                    value={t.prioridad}
                    onChange={(e) => updateTicket(t.id, { prioridad: e.target.value })}
                    className="w-28"
                  >
                    {prioridadOptions
                      .filter((o) => o.value !== "")
                      .map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/internal/tickets/${t.id}`)}
                    disabled={actionLoading === t.id}
                  >
                    Ver detalle
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
