"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  Shield,
  ShieldCheck,
  ShieldOff,
  ShieldQuestion,
} from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, isTokenExpired, refreshAccessToken } from "@/lib/auth";

type Role = "admin" | "ops" | "support" | "viewer";
type UserStatus = "activo" | "suspendido" | "bloqueado";

type UserRecord = {
  id: string;
  nombre: string;
  email: string;
  rol: Role;
  estado: UserStatus;
  permisos?: string[];
  ultimoAcceso?: string;
};

type PendingAction =
  | { type: "role"; userId: string }
  | { type: "estado"; userId: string }
  | null;

const ROLE_OPTIONS: { value: Role; label: string; description: string }[] = [
  { value: "admin", label: "Admin", description: "Acceso total al panel y datos críticos." },
  { value: "ops", label: "Operaciones", description: "Gestiona servicios y pagos." },
  { value: "support", label: "Soporte", description: "Resuelve tickets y ve historial." },
  { value: "viewer", label: "Solo lectura", description: "Monitorea métricas sin editar." },
];

const MOCK_USERS: UserRecord[] = [
  {
    id: "1",
    nombre: "Ana Torres",
    email: "ana@example.com",
    rol: "admin",
    estado: "activo",
    permisos: ["usuarios:write", "tickets:write", "pagos:write"],
  },
  {
    id: "2",
    nombre: "Luis Pérez",
    email: "luis@example.com",
    rol: "ops",
    estado: "activo",
    permisos: ["servicios:write", "pagos:write"],
    ultimoAcceso: new Date().toISOString(),
  },
  {
    id: "3",
    nombre: "Marta Díaz",
    email: "marta@example.com",
    rol: "support",
    estado: "suspendido",
    permisos: ["tickets:read"],
  },
];

const ADMIN_MOCK = process.env.NEXT_PUBLIC_ADMIN_MOCK === "true";

/**
 * RoleManager muestra y gestiona roles/estados de usuarios admins.
 * - Mobile first: cards apiladas; tabla solo en md+.
 * - Accesible: labels explícitos, aria-live para feedback, focus visible.
 * - Rendimiento: fetch con AbortController, memo de filtros y estado optimista.
 */
export default function RoleManager() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

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
        const response = await fetch(`${apiBase}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: controller.signal,
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload) {
          throw new Error(payload?.error || payload?.message || "No se pudo cargar usuarios");
        }

        const data = payload.data || payload.users || [];
        setUsers(
          data.map(
            (u: any): UserRecord => {
              const normalizedRole = (u.rol || u.role || "viewer").toLowerCase() as Role;
              const normalizedStatus = (u.estado || u.status || "activo").toLowerCase() as UserStatus;
              return {
                id: String(u.id),
                nombre: u.nombre || u.name || "Sin nombre",
                email: u.email || "sin-email",
                rol: normalizedRole,
                estado: normalizedStatus,
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

    fetchUsers();
    return () => controller.abort();
  }, [apiBase, getValidToken]);

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

  const mutateUser = async (
    userId: string,
    payload: { rol?: Role; estado?: UserStatus },
    action: PendingAction,
  ) => {
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
              estado: payload.estado ?? u.estado,
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
      const response = await fetch(`${apiBase}/admin/users/${userId}`, {
        method: "PATCH",
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

  const handleStatusChange = (userId: string, nextStatus: UserStatus) => {
    mutateUser(userId, { estado: nextStatus }, { type: "estado", userId });
  };

  const rolePill = (role: Role) => {
    const icon =
      role === "admin" ? (
        <Shield className="w-3.5 h-3.5" />
      ) : role === "ops" ? (
        <ShieldCheck className="w-3.5 h-3.5" />
      ) : role === "support" ? (
        <ShieldQuestion className="w-3.5 h-3.5" />
      ) : (
        <ShieldOff className="w-3.5 h-3.5" />
      );

    const tone =
      role === "admin"
        ? "bg-foreground text-background"
        : role === "ops"
          ? "bg-muted text-foreground"
          : role === "support"
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Roles</p>
            <h1 className="text-xl font-semibold text-foreground">Sistema de roles</h1>
            <p className="text-sm text-muted-foreground">
              Controla accesos sensibles y estados de cuentas.
            </p>
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

        {feedback && (
          <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            {feedback}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </header>

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

      {loading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando usuarios y roles...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          No se encontraron usuarios con ese criterio.
        </div>
      ) : (
        <>
          {/* Vista mobile: cards apiladas para lectura rápida */}
          <div className="space-y-3 md:hidden" aria-busy={Boolean(pending)}>
            {filtered.map((user) => (
              <article
                key={user.id}
                className="rounded-2xl border border-border/70 bg-background/80 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-foreground">{user.nombre}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">ID: {user.id}</p>
                  </div>
                  {rolePill(user.rol)}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`rounded-full px-2 py-1 ${
                      user.estado === "activo"
                        ? "bg-green-500/10 text-green-600"
                        : user.estado === "suspendido"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-red-500/10 text-red-600"
                    }`}
                  >
                    {user.estado}
                  </span>
                  {user.ultimoAcceso && (
                    <span className="text-muted-foreground">
                      Último acceso:{" "}
                      {new Date(user.ultimoAcceso).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Rol
                    <select
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
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

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(user.id, "activo")}
                      className="flex-1 rounded-xl border border-border px-3 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-60"
                      disabled={pending?.userId === user.id || user.estado === "activo"}
                    >
                      <RefreshCcw className="inline h-4 w-4 mr-1" />
                      Reactivar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(user.id, "suspendido")}
                      className="flex-1 rounded-xl border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 hover:bg-amber-500/20 transition-colors disabled:opacity-60"
                      disabled={pending?.userId === user.id || user.estado === "suspendido"}
                    >
                      <Ban className="inline h-4 w-4 mr-1" />
                      Suspender
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Vista escritorio: tabla densa con controles inline */}
          <div className="hidden md:block rounded-2xl border border-border/70 bg-background/80 overflow-hidden">
            <div className="grid grid-cols-[1.6fr,1.4fr,1fr,1fr,1.4fr] bg-muted/30 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <span>Usuario</span>
              <span>Email</span>
              <span>Rol</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>

            <div aria-busy={Boolean(pending)}>
              {filtered.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-[1.6fr,1.4fr,1fr,1fr,1.4fr] items-center gap-2 border-t border-border/60 px-4 py-3 text-sm"
                >
                  <div className="space-y-0.5">
                    <p className="text-foreground font-medium">{user.nombre}</p>
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

                  <p className="text-muted-foreground">{user.email}</p>
                  {rolePill(user.rol)}

                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`rounded-full px-2 py-1 ${
                        user.estado === "activo"
                          ? "bg-green-500/10 text-green-600"
                          : user.estado === "suspendido"
                            ? "bg-amber-500/10 text-amber-700"
                            : "bg-red-500/10 text-red-600"
                      }`}
                    >
                      {user.estado}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="sr-only" htmlFor={`role-${user.id}`}>
                      Cambiar rol de {user.nombre}
                    </label>
                    <select
                      id={`role-${user.id}`}
                      className="w-32 rounded-xl border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-foreground/40"
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

                    <button
                      type="button"
                      onClick={() => handleStatusChange(user.id, "activo")}
                      className="rounded-xl border border-border px-2 py-1 text-xs hover:bg-muted transition-colors disabled:opacity-60"
                      disabled={pending?.userId === user.id || user.estado === "activo"}
                    >
                      <RefreshCcw className="inline h-4 w-4 mr-1" />
                      Reactivar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(user.id, "suspendido")}
                      className="rounded-xl border border-amber-500/60 bg-amber-500/10 px-2 py-1 text-xs text-amber-700 hover:bg-amber-500/20 transition-colors disabled:opacity-60"
                      disabled={pending?.userId === user.id || user.estado === "suspendido"}
                    >
                      <Ban className="inline h-4 w-4 mr-1" />
                      Suspender
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
