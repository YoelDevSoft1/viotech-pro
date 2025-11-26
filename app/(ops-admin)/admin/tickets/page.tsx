"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Filter, ArrowLeft } from "lucide-react";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, isTokenExpired, refreshAccessToken, logout } from "@/lib/auth";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/State";
import { useTickets } from "@/lib/hooks/useTickets";
import { useOrg } from "@/lib/useOrg";

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
  const [filters, setFilters] = useState({ estado: "", prioridad: "", projectId: "" });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { setOrgId } = useOrg();
  const { tickets, loading, error, refresh } = useTickets({
    estado: filters.estado || undefined,
    prioridad: filters.prioridad || undefined,
    projectId: filters.projectId || undefined,
  });

  const updateTicket = async (ticketId: string, payload: { estado?: string; prioridad?: string }) => {
    setActionLoading(ticketId);
    setActionError(null);
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
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al actualizar ticket");
    } finally {
      setActionLoading(null);
    }
  };

  const onFilterChange = (field: "estado" | "prioridad" | "projectId") => (e: ChangeEvent<HTMLSelectElement>) =>
    setFilters((f) => ({ ...f, [field]: e.target.value }));

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="w-full space-y-6">
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
            <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} label="Organización" />
          </div>
          <p className="text-sm text-muted-foreground">
            Admin puede ver y editar tickets de cualquier organización/proyecto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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

        {(error || actionError) && <ErrorState message={actionError || error || undefined} />}

        {loading ? (
          <LoadingState title="Cargando tickets..." />
        ) : tickets.length === 0 ? (
          <EmptyState title="No hay tickets" message="No hay tickets disponibles para esta selección." />
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
