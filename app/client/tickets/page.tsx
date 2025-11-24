"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, AlertCircle } from "lucide-react";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, isTokenExpired, refreshAccessToken, logout } from "@/lib/auth";

type Ticket = {
  id: string;
  titulo: string;
  descripcion?: string | null;
  estado: string;
  prioridad: string;
  createdAt: string;
};

export default function ClientTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string>("");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    let token = getAccessToken();
    if (!token) {
      router.replace("/login?from=/client/tickets");
      return;
    }
    if (isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        router.replace("/login?from=/client/tickets&reason=expired");
        return;
      }
    }
    try {
      const url = orgId ? `${buildApiUrl("/tickets")}?organizationId=${orgId}` : buildApiUrl("/tickets");
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
          createdAt: t.createdAt || t.created_at || new Date().toISOString(),
        })),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar tickets";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets, orgId]);

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/client"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al panel cliente
          </Link>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tickets</p>
          <h1 className="text-3xl font-medium text-foreground">Mis tickets</h1>
          <p className="text-sm text-muted-foreground">
            Solo ves tus tickets; para más acciones, usa el detalle en el dashboard.
          </p>
        </div>

        <OrgSelector
          onChange={(org: Org | null) => setOrgId(org?.id || "")}
          label="Organización"
        />

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
            No tienes tickets aún.
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
                    <p className="text-xs text-muted-foreground">{t.id}</p>
                  </div>
                  <span className="text-xs rounded-full border border-border px-2 py-1 text-muted-foreground capitalize">
                    {t.estado}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{t.descripcion}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted px-2 py-1 text-foreground">
                    Prioridad: {t.prioridad}
                  </span>
                  <span>
                    Creado:{" "}
                    {new Date(t.createdAt).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
