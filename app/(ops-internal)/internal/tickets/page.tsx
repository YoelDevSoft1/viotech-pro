"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Filter } from "lucide-react";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { Select } from "@/components/ui/Select";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, isTokenExpired, refreshAccessToken, logout } from "@/lib/auth";
import { useOrg } from "@/lib/useOrg";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/State";
import { Button } from "@/components/ui/Button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";

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
  const { orgId, setOrgId } = useOrg();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    <main className="min-h-screen bg-background px-6 py-10 md:py-12">
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
          <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} label="Organización" />
          <Select label="Estado" value={filters.estado} onChange={(e) => setFilters((f) => ({ ...f, estado: e.target.value }))}>
            <option value="">Todos</option>
            <option value="abierto">Abierto</option>
            <option value="en_progreso">En progreso</option>
            <option value="resuelto">Resuelto</option>
          </Select>
          <Select label="Prioridad" value={filters.prioridad} onChange={(e) => setFilters((f) => ({ ...f, prioridad: e.target.value }))}>
            <option value="">Todas</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </Select>
        </div>

        {error && <ErrorState message={error} />}

        {loading ? (
          <LoadingState title="Cargando tickets..." />
        ) : tickets.length === 0 ? (
          <EmptyState title="No hay tickets" message="No se encontraron tickets para esta organización o filtros." />
        ) : (
          <Table>
            <THead>
              <TH className="col-span-4">Ticket</TH>
              <TH className="col-span-2">Estado</TH>
              <TH className="col-span-2">Prioridad</TH>
              <TH className="col-span-2">Usuario</TH>
              <TH className="col-span-2">Creado</TH>
            </THead>
            <TBody>
              {tickets.map((t) => (
                <TR key={t.id} className="items-center">
                  <TD className="col-span-4">
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground">{t.titulo}</p>
                      <p className="text-[11px] text-muted-foreground">ID: {t.id}</p>
                      {t.descripcion && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{t.descripcion}</p>
                      )}
                    </div>
                  </TD>
                  <TD className="col-span-2">
                    <Select
                      value={t.estado}
                      onChange={(e) => updateTicket(t.id, { estado: e.target.value })}
                      className="w-full"
                    >
                      <option value="abierto">Abierto</option>
                      <option value="en_progreso">En progreso</option>
                      <option value="resuelto">Resuelto</option>
                    </Select>
                  </TD>
                  <TD className="col-span-2">
                    <Select
                      value={t.prioridad}
                      onChange={(e) => updateTicket(t.id, { prioridad: e.target.value })}
                      className="w-full"
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                    </Select>
                  </TD>
                  <TD className="col-span-2 text-sm text-muted-foreground">
                    {t.usuario?.email ? `${t.usuario.nombre || "Sin nombre"} (${t.usuario.email})` : "N/D"}
                  </TD>
                  <TD className="col-span-2 text-sm text-muted-foreground">
                    {new Date(t.createdAt).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </TD>
                  <TD className="col-span-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/internal/tickets/${t.id}`)}
                      disabled={actionLoading === t.id}
                    >
                      Ver detalle
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </main>
  );
}
