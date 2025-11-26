"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Shield, ShieldCheck, ShieldOff, ShieldQuestion } from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, isTokenExpired, refreshAccessToken } from "@/lib/auth";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { useOrg } from "@/lib/useOrg";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/State";

type Role = "admin" | "agente" | "cliente";

type UserRecord = {
  id: string;
  nombre: string;
  email: string;
  rol: Role;
  estado?: string;
  tier?: string;
  organizationId?: string;
  permisos?: string[];
  ultimoAcceso?: string;
};

type PendingAction =
  | { type: "role"; userId: string }
  | { type: "tier"; userId: string }
  | { type: "state"; userId: string }
  | { type: "org"; userId: string }
  | null;

const ROLE_OPTIONS: { value: Role; label: string; description: string }[] = [
  { value: "admin", label: "Admin", description: "Acceso total al panel y datos críticos." },
  { value: "agente", label: "Agente", description: "Gestiona tickets de todos los usuarios." },
  { value: "cliente", label: "Cliente", description: "Solo sus propios tickets." },
];

const MOCK_USERS: UserRecord[] = [
  {
    id: "1",
    nombre: "Ana Torres",
    email: "ana@example.com",
    rol: "admin",
    permisos: ["usuarios:write", "tickets:write", "pagos:write"],
  },
  {
    id: "2",
    nombre: "Luis Pérez",
    email: "luis@example.com",
    rol: "agente",
    permisos: ["tickets:write"],
    ultimoAcceso: new Date().toISOString(),
  },
  {
    id: "3",
    nombre: "Marta Díaz",
    email: "marta@example.com",
    rol: "cliente",
    permisos: ["tickets:read"],
  },
];

const ADMIN_MOCK = process.env.NEXT_PUBLIC_ADMIN_MOCK === "true";

/**
 * RoleManager muestra y gestiona roles de usuarios admins.
 * - Mobile first: cards apiladas; tabla solo en md+.
 * - Accesible: labels explícitos, aria-live para feedback, focus visible.
 * - Rendimiento: fetch con AbortController, memo de filtros y estado optimista.
 */
export default function RoleManager() {
  const { orgId, setOrgId } = useOrg();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [orgs, setOrgs] = useState<{ id: string; nombre: string }[]>([]);

  const apiBase = useMemo(() => buildApiUrl("").replace(/\/+$/, ""), []);

  const getValidToken = useCallback(async () => {
    let token = getAccessToken();
    if (!token) throw new Error("No autenticado");
    if (isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) throw new Error("Sesión expirada");
      token = refreshed;
    }
    return token;
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      setFeedback(null);

      // Permite probar UI sin backend
      if (ADMIN_MOCK) {
        setUsers(MOCK_USERS);
        setLoading(false);
        return;
      }

      try {
        const token = await getValidToken();
        // Backend: usa /api/users para listar, admin puede ver todos
        const response = await fetch(orgId ? `${apiBase}/users?organizationId=${orgId}` : `${apiBase}/users`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: controller.signal,
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload) {
          throw new Error(payload?.error || payload?.message || "No se pudo cargar usuarios");
        }

        const dataRaw = payload.data || payload.users || payload || [];
        const list = Array.isArray(dataRaw?.users)
          ? dataRaw.users
          : Array.isArray(dataRaw)
            ? dataRaw
            : Array.isArray(dataRaw.data)
              ? dataRaw.data
              : [];

        setUsers(
          list.map(
            (u: any): UserRecord => {
              const normalizedRole = (u.rol || u.role || "cliente").toLowerCase() as Role;
              return {
                id: String(u.id),
                nombre: u.nombre || u.name || "Sin nombre",
                email: u.email || "sin-email",
                rol: normalizedRole,
                estado: u.estado || u.state || "activo",
                tier: u.tier || "standard",
                organizationId: u.organizationId || u.organization_id || "",
                permisos: u.permisos || u.permissions || [],
                ultimoAcceso: u.ultimoAcceso || u.lastLogin,
              };
            },
          ),
        );
      } catch (err) {
        if (controller.signal.aborted) return;
        const msg = err instanceof Error ? err.message : "Error al cargar usuarios";
        setError(msg);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    const fetchOrgs = async () => {
      try {
        const token = await getValidToken();
        const res = await fetch(`${apiBase}/organizations`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok || !payload) return;
        const raw = payload.data || payload.organizations || payload || [];
        const list = Array.isArray(raw?.organizations)
          ? raw.organizations
          : Array.isArray(raw)
            ? raw
            : Array.isArray(raw.data)
              ? raw.data
              : [];
        setOrgs(
          list.map((o: any) => ({
            id: String(o.id),
            nombre: o.nombre || o.name || o.id,
          })),
        );
      } catch {
        // ignore org errors for now
      }
    };

    fetchUsers();
    fetchOrgs();
    return () => controller.abort();
  }, [apiBase, getValidToken, orgId]);

  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.nombre.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.rol.toLowerCase().includes(term),
    );
  }, [filter, users]);

  const mutateUser = async (userId: string, payload: { rol: Role }, action: PendingAction) => {
    const previous = users;
    setPending(action);
    setFeedback(null);

    // Estado optimista para una UI más ágil
    setUsers((current) =>
      current.map((u) =>
        u.id === userId
          ? {
              ...u,
              rol: payload.rol ?? u.rol,
            }
          : u,
      ),
    );

    if (ADMIN_MOCK) {
      setPending(null);
      setFeedback("Cambios simulados en modo mock.");
      return;
    }

    try {
      const token = await getValidToken();
      const response = await fetch(`${apiBase}/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || data?.message || "No se pudo actualizar el usuario");
      }
      setFeedback("Cambios guardados.");
    } catch (err) {
      // Revertir si falla
      setUsers(previous);
      setFeedback(null);
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setPending(null);
    }
  };

  const handleRoleChange = (userId: string, newRole: Role) => {
    mutateUser(userId, { rol: newRole }, { type: "role", userId });
  };

  const handleTierChange = async (userId: string, tier: string) => {
    const prev = users;
    setPending({ type: "tier", userId });
    setUsers((curr) => curr.map((u) => (u.id === userId ? { ...u, tier } : u)));
    if (ADMIN_MOCK) {
      setPending(null);
      setFeedback("Cambios simulados en modo mock.");
      return;
    }
    try {
      const token = await getValidToken();
      const res = await fetch(`${apiBase}/users/${userId}/tier`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || data?.message || "No se pudo actualizar el tier");
      }
      setFeedback("Tier actualizado.");
    } catch (err) {
      setUsers(prev);
      setFeedback(null);
      setError(err instanceof Error ? err.message : "Error al actualizar tier");
    } finally {
      setPending(null);
    }
  };

  const handleStateChange = async (userId: string, estado: string) => {
    const prev = users;
    setPending({ type: "state", userId });
    setUsers((curr) => curr.map((u) => (u.id === userId ? { ...u, estado } : u)));
    if (ADMIN_MOCK) {
      setPending(null);
      setFeedback("Cambios simulados en modo mock.");
      return;
    }
    try {
      const token = await getValidToken();
      const res = await fetch(`${apiBase}/users/${userId}/state`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || data?.message || "No se pudo actualizar estado");
      }
      setFeedback("Estado actualizado.");
    } catch (err) {
      setUsers(prev);
      setFeedback(null);
      setError(err instanceof Error ? err.message : "Error al actualizar estado");
    } finally {
      setPending(null);
    }
  };

  const handleOrgChange = async (userId: string, organizationId: string) => {
    const prev = users;
    setPending({ type: "org", userId });
    setUsers((curr) => curr.map((u) => (u.id === userId ? { ...u, organizationId } : u)));
    if (ADMIN_MOCK) {
      setPending(null);
      setFeedback("Cambios simulados en modo mock.");
      return;
    }
    try {
      const token = await getValidToken();
      const res = await fetch(`${apiBase}/users/${userId}/organization`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organizationId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || data?.message || "No se pudo actualizar la organización");
      }
      setFeedback("Organización asignada.");
    } catch (err) {
      setUsers(prev);
      setFeedback(null);
      setError(err instanceof Error ? err.message : "Error al actualizar organización");
    } finally {
      setPending(null);
    }
  };

  const rolePill = (role: Role) => {
    const icon =
      role === "admin" ? (
        <Shield className="w-3.5 h-3.5" />
      ) : role === "agente" ? (
        <ShieldCheck className="w-3.5 h-3.5" />
      ) : role === "cliente" ? (
        <ShieldQuestion className="w-3.5 h-3.5" />
      ) : (
        <ShieldOff className="w-3.5 h-3.5" />
      );

    const tone =
      role === "admin"
        ? "bg-foreground text-background"
        : role === "agente"
          ? "bg-muted text-foreground"
          : role === "cliente"
            ? "bg-amber-500/20 text-amber-600"
            : "bg-border text-muted-foreground";

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs ${tone}`}>
        {icon}
        {role}
      </span>
    );
  };

  return (
    <section className="space-y-5" aria-live="polite">
      <header className="space-y-2">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Roles</p>
            <h1 className="text-xl font-semibold text-foreground">Sistema de roles</h1>
            <p className="text-sm text-muted-foreground">
              Controla accesos sensibles y estados de cuentas. Filtra por organización para aplicar cambios puntuales.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="sm:w-64">
              <OrgSelector
                onChange={(org: Org | null) => setOrgId(org?.id || "")}
                label="Organización"
              />
            </div>
            <div className="relative w-full sm:w-72">
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
                placeholder="Buscar por nombre, email o rol"
                aria-label="Buscar usuarios por nombre, email o rol"
              />
            </div>
          </div>
        </div>

        {feedback && (
          <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            {feedback}
          </div>
        )}
      </header>

      {loading && <LoadingState title="Cargando usuarios y roles..." />}
      {error && !loading && <ErrorState message={error} />}

      {!loading && !error && (
      <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ROLE_OPTIONS.map((role) => {
          const count = users.filter((u) => u.rol === role.value).length;
          return (
            <div
              key={role.value}
              className="rounded-2xl border border-border/70 bg-background/70 p-3"
            >
              <p className="text-xs text-muted-foreground">{role.label}</p>
              <p className="text-2xl font-semibold">{loading ? "—" : count || "0"}</p>
              <p className="text-[11px] text-muted-foreground">{role.description}</p>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Sin resultados" message="No se encontraron usuarios con ese criterio u organización." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-busy={Boolean(pending)}>
          {filtered.map((user) => (
            <article
              key={user.id}
              className="rounded-2xl border border-border/70 bg-background/80 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">{user.nombre}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-[11px] text-muted-foreground">ID: {user.id}</p>
                  {user.ultimoAcceso && (
                    <p className="text-[11px] text-muted-foreground">
                      Último acceso:{" "}
                      {new Date(user.ultimoAcceso).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {rolePill(user.rol)}
                  <span className="text-[11px] rounded-full border border-border px-2 py-0.5 text-muted-foreground">
                    Estado: {user.estado || "activo"}
                  </span>
                  <span className="text-[11px] rounded-full border border-border px-2 py-0.5 text-muted-foreground">
                    Tier: {user.tier || "standard"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                  Rol
                  <select
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
                    value={user.rol}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                    disabled={pending?.userId === user.id}
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                  Tier
                  <input
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
                    value={user.tier || ""}
                    onChange={(e) => handleTierChange(user.id, e.target.value)}
                    disabled={pending?.userId === user.id}
                  />
                </label>

                <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                  Estado
                  <select
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
                    value={user.estado || "activo"}
                    onChange={(e) => handleStateChange(user.id, e.target.value)}
                    disabled={pending?.userId === user.id}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </label>

                <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                  Organización
                  <select
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
                    value={user.organizationId || ""}
                    onChange={(e) => handleOrgChange(user.id, e.target.value)}
                    disabled={pending?.userId === user.id}
                  >
                    <option value="">Sin asignar</option>
                    {orgs.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </article>
          ))}
        </div>
      )}
      </>
      )}
    </section>
  );
}
