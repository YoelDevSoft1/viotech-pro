"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Package } from "lucide-react";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, refreshAccessToken, isTokenExpired, logout } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Service = {
  id: string;
  nombre: string;
  tipo?: string;
  estado: string;
  fecha_expiracion?: string | null;
  usuario_id?: string;
};

export default function AdminServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string>("");

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    let token = getAccessToken();
    if (!token) {
      router.replace("/login?from=/admin/services");
      return;
    }
    if (isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        router.replace("/login?from=/admin/services&reason=expired");
        return;
      }
    }

    try {
      const params = new URLSearchParams();
      if (orgId) params.append("organizationId", orgId);
      const url = `${buildApiUrl("/services")}${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload) {
        throw new Error(payload?.error || payload?.message || "No se pudieron cargar servicios");
      }
      const data = payload.data || payload.services || [];
      setServices(
        data.map((s: any) => ({
          id: String(s.id),
          nombre: s.nombre || "Sin nombre",
          tipo: s.tipo || "",
          estado: s.estado || "activo",
          fecha_expiracion: s.fecha_expiracion || s.expiration || null,
          usuario_id: s.usuario_id || s.userId,
        })),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar servicios";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [orgId, router]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

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

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Servicios</p>
          <h1 className="text-3xl font-medium text-foreground">Licencias y servicios por org</h1>
          <p className="text-sm text-muted-foreground">
            Filtra por organización para ver servicios activos y expirados.
          </p>
        </div>

        <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} />

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Cargando servicios...
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            No hay servicios para la organización seleccionada.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((s) => (
              <Card key={s.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Package className="w-4 h-4" />
                    {s.nombre}
                  </div>
                  <span className="text-xs rounded-full border border-border px-2 py-1 capitalize text-muted-foreground">
                    {s.estado}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {s.tipo || "Servicio"} · Usuario: {s.usuario_id || "N/A"}
                </p>
                {s.fecha_expiracion && (
                  <p className="text-xs text-muted-foreground">
                    Expira:{" "}
                    {new Date(s.fecha_expiracion).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
