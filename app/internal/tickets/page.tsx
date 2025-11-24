"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Filter, AlertCircle } from "lucide-react";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, isTokenExpired, refreshAccessToken, logout } from "@/lib/auth";

type Ticket = {
  id: string;
  titulo: string;
  descripcion?: string | null;
  estado: string;
  prioridad: string;
  usuario?: { nombre?: string; email?: string };
  createdAt: string;
};

export default function InternalTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string>("");
  const [filters, setFilters] = useState({ estado: "", prioridad: "" });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    let token = getAccessToken();
    if (!token) {
      router.replace("/login?from=/internal/tickets");
      return;
    }
    if (isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        router.replace("/login?from=/internal/tickets&reason=expired");
        return;
      }
    }

    try {
      const params = new URLSearchParams();
      if (orgId) params.append("organizationId", orgId);
      if (filters.estado) params.append("estado", filters.estado);
      if (filters.prioridad) params.append("prioridad", filters.prioridad);
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

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets, orgId, filters]);

  const updateTicket = async (ticketId: string, payload: { estado?: string; prioridad?: string }) => {
    setActionLoading(ticketId);
    setError(null);
    let token = getAccessToken();
    if (!token) {
      router.replace("/login?from=/internal/tickets");
      return;
    }
    if (isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        router.replace("/login?from=/internal/tickets&reason=expired");
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
      const updateUrl = new URL(buildApiUrl(`/tickets/${ticketId}`));
      if (orgId) updateUrl.searchParams.set("organizationId", orgId);
      const res = await fetch(updateUrl.toString(), {
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

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/internal"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al panel interno
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Tickets globales
          </p>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-medium text-foreground">Todos los tickets</h1>
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Filter className="w-4 h-4" />
              Filtros rápidos
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Como agente/admin puedes ver y gestionar tickets de todos los usuarios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} />
          <Select
            label="Estado"
            value={filters.estado}
            onChange={(e) => setFilters((f) => ({ ...f, estado: e.target.value }))}
          >
            <option value="">Todos</option>
            <option value="abierto">Abierto</option>
            <option value="en_progreso">En progreso</option>
            <option value="resuelto">Resuelto</option>
          </Select>
          <Select
            label="Prioridad"
            value={filters.prioridad}
            onChange={(e) => setFilters((f) => ({ ...f, prioridad: e.target.value }))}
          >
            <option value="">Todas</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
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
          <div className="space-y-3">
            {tickets.map((t) => (
              <article
                key={t.id}
                className="rounded-2xl border border-border/70 bg-background/80 p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-foreground">{t.titulo}</p>
                    <p className="text-[11px] text-muted-foreground">ID: {t.id}</p>
                  </div>
                  <span className="text-xs rounded-full border border-border px-2 py-1 text-muted-foreground capitalize">
                    {t.estado}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{t.descripcion}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted px-2 py-1 text-foreground">
                    Prioridad: {t.prioridad}
                  </span>
                  {t.usuario?.email && (
                    <span>
                      Usuario: {t.usuario.nombre || "Sin nombre"} ({t.usuario.email})
                    </span>
                  )}
                  <span>
                    Creado:{" "}
                    {new Date(t.createdAt).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs pt-2">
                  <Select
                    value={t.estado}
                    onChange={(e) => updateTicket(t.id, { estado: e.target.value })}
                    className="w-32"
                  >
                    <option value="abierto">Abierto</option>
                    <option value="en_progreso">En progreso</option>
                    <option value="resuelto">Resuelto</option>
                  </Select>
                  <Select
                    value={t.prioridad}
                    onChange={(e) => updateTicket(t.id, { prioridad: e.target.value })}
                    className="w-28"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
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
