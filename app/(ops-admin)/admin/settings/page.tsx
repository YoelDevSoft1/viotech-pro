"use client";

import { useEffect, useState } from "react";
import { Shield, User, Building2, RefreshCcw, AlertTriangle, CheckCircle2, Lock, Users } from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, refreshAccessToken, isTokenExpired, logout } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import OrgSelector, { type Org } from "@/components/OrgSelector";

type MeResponse = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  tier?: string;
  estado?: string;
  organizationId?: string | null;
  organization_id?: string | null;
};

type MfaStatus = {
  enabled: boolean;
  enrolled?: boolean;
  lastVerifiedAt?: string | null;
};

type SimpleUser = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  tier?: string;
  estado?: string;
  organizationId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export default function AdminSettingsPage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [mfa, setMfa] = useState<MfaStatus | null>(null);
  const [orgFromProfile, setOrgFromProfile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    let token = getAccessToken();
    // Si no hay token, intentamos con cookies (Render envía token en header?); si hay token expirado, refrescamos.
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
      const res = await fetch(buildApiUrl("/auth/me"), {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
        credentials: "include",
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload) throw new Error(payload?.error || payload?.message || "No se pudo cargar el perfil");
      const data =
        (payload.data && (payload.data.user || payload.data)) ||
        payload.user ||
        payload;
      setMe(data);
      setOrgFromProfile(data.organizationId || data.organization_id || null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar perfil";
      setError(msg);
      setMe(null);
    } finally {
      setLoading(false);
    }
  };

  const loadMfa = async () => {
    setMfaError(null);
    let token = getAccessToken();
    if (token && isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        setMfaError("Sesión expirada. Vuelve a iniciar sesión.");
        return;
      }
    }
    try {
      const res = await fetch(buildApiUrl("/mfa/status"), {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
        credentials: "include",
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload) throw new Error(payload?.error || payload?.message || "No se pudo cargar MFA");
      const data = payload.data || payload;
      setMfa({
        enabled: Boolean(data.enabled ?? data.mfaEnabled),
        enrolled: data.enrolled,
        lastVerifiedAt: data.lastVerifiedAt || data.last_verified_at || null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar MFA";
      setMfaError(msg);
      setMfa(null);
    }
  };

  useEffect(() => {
    loadProfile();
    loadMfa();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    let token = getAccessToken();
    if (token && isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        setUsersError("Sesión expirada. Vuelve a iniciar sesión.");
        setUsersLoading(false);
        return;
      }
    }
    try {
      const res = await fetch(buildApiUrl("/users"), {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
        credentials: "include",
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload) throw new Error(payload?.error || payload?.message || "No se pudieron cargar usuarios");
      const arr = payload.data?.users || payload.users || payload.data || [];
      setUsers(Array.isArray(arr) ? arr : []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar usuarios";
      setUsersError(msg);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="w-full space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Configuración</p>
            <h1 className="text-3xl font-medium text-foreground">Ajustes del panel</h1>
            <p className="text-sm text-muted-foreground">
              Perfil, seguridad y organización para administradores.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadProfile} disabled={loading}>
              <RefreshCcw className="w-4 h-4" />
              Refrescar
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-foreground" />
              <p className="text-sm font-medium text-foreground">Cuenta</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cuenta (ID)</p>
                <p className="text-foreground font-mono text-xs">{me?.id || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Nombre</p>
                <p className="text-foreground">{me?.nombre || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Correo</p>
                <p className="text-foreground">{me?.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rol</p>
                <p className="text-foreground">{me?.rol || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tier</p>
                <p className="text-foreground">{me?.tier || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Estado</p>
                <p className="text-foreground">{me?.estado || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Org. asignada</p>
                <p className="text-foreground">{orgFromProfile || "—"}</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-foreground" />
              <p className="text-sm font-medium text-foreground">Seguridad (MFA)</p>
            </div>
            {mfaError && (
              <p className="text-xs text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {mfaError}
              </p>
            )}
            <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Estado MFA</p>
                    <p className="text-foreground">
                      {mfa ? (mfa.enabled ? "Habilitado" : "Deshabilitado") : "—"}
                    </p>
                  </div>
                  {mfa?.enabled ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
              </div>
              {mfa?.lastVerifiedAt && (
                <p className="text-xs text-muted-foreground">
                  Última verificación: {new Date(mfa.lastVerifiedAt).toLocaleString()}
                </p>
              )}
            </div>
          </Card>
        </div>

        <Card className="space-y-3 p-5">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-foreground" />
            <p className="text-sm font-medium text-foreground">Organización activa (UI)</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Cambia la organización con la que trabajas en el panel. Esto usa los datos reales de /api/organizations.
          </p>
          <OrgSelector
            label="Selecciona organización"
            onChange={(org: Org | null) => setOrgFromProfile(org?.id || null)}
          />
        </Card>

        <Card className="space-y-3 p-5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-foreground" />
            <p className="text-sm font-medium text-foreground">Usuarios (admin)</p>
          </div>
          {usersError && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
              <AlertTriangle className="w-4 h-4" />
              {usersError}
            </div>
          )}
          {usersLoading ? (
            <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left py-2 pr-3">Cuenta</th>
                    <th className="text-left py-2 pr-3">Nombre</th>
                    <th className="text-left py-2 pr-3">Correo</th>
                    <th className="text-left py-2 pr-3">Rol</th>
                    <th className="text-left py-2 pr-3">Tier</th>
                    <th className="text-left py-2 pr-3">Estado</th>
                    <th className="text-left py-2">Org</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">
                        {u.id.slice(0, 6)}…
                      </td>
                      <td className="py-2 pr-3">{u.nombre || "—"}</td>
                      <td className="py-2 pr-3">{u.email}</td>
                      <td className="py-2 pr-3">{u.rol}</td>
                      <td className="py-2 pr-3">{u.tier || "—"}</td>
                      <td className="py-2 pr-3">{u.estado || "—"}</td>
                      <td className="py-2">{u.organizationId || "—"}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td className="py-3 text-sm text-muted-foreground" colSpan={7}>
                        No hay usuarios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
