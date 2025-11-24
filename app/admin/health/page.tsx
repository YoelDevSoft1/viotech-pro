"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, HeartPulse, RefreshCcw } from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, refreshAccessToken, isTokenExpired, logout } from "@/lib/auth";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type HealthEntry = {
  name: string;
  status: string;
  error?: string | null;
};

export default function AdminHealthPage() {
  const [health, setHealth] = useState<HealthEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string>("");

  const loadHealth = async () => {
    setLoading(true);
    setError(null);
    let token = getAccessToken();
    if (token && isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        setError("Sesión expirada. Vuelve a iniciar sesión.");
        setLoading(false);
        return;
      }
    }

    try {
      const url = organizationId
        ? `${buildApiUrl("/health")}?organizationId=${organizationId}`
        : buildApiUrl("/health");
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload) {
        throw new Error(payload?.error || payload?.message || "No se pudo obtener salud del sistema");
      }
      const entries: HealthEntry[] = Array.isArray(payload.data)
        ? payload.data
        : Object.entries(payload.data || payload).map(([name, value]: any) => ({
            name,
            status: value?.status || value?.healthy ? "ok" : "down",
            error: value?.error || null,
          }));
      setHealth(entries);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar salud";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Salud</p>
            <h1 className="text-3xl font-medium text-foreground">Estado de servicios</h1>
            <p className="text-sm text-muted-foreground">
              DB, Redis, IA, Wompi, Supabase y servicios internos.
            </p>
          </div>
          <Button onClick={loadHealth} disabled={loading} variant="outline" size="sm">
            <RefreshCcw className="w-4 h-4" />
            Refrescar
          </Button>
        </div>

        <OrgSelector
          onChange={(org: Org | null) => setOrganizationId(org?.id || "")}
          label="Organización"
        />

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Cargando salud...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {health.map((h) => (
              <Card key={h.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <HeartPulse className="w-4 h-4" />
                    {h.name}
                  </div>
                  <span
                    className={`text-xs rounded-full border px-2 py-1 ${
                      h.status === "ok"
                        ? "border-green-500/60 text-green-700"
                        : "border-red-500/60 text-red-700"
                    }`}
                  >
                    {h.status}
                  </span>
                </div>
                {h.error && <p className="text-xs text-amber-700">Error: {h.error}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
