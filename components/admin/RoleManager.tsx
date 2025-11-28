"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Shield, ShieldCheck, ShieldOff, ShieldQuestion, Search, Users as UsersIcon } from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, isTokenExpired, refreshAccessToken } from "@/lib/auth";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { useOrg } from "@/lib/hooks/useOrg";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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

  const getRoleBadge = (role: Role) => {
    const config = {
      admin: { icon: Shield, variant: "default" as const, label: "Admin" },
      agente: { icon: ShieldCheck, variant: "secondary" as const, label: "Agente" },
      cliente: { icon: ShieldQuestion, variant: "outline" as const, label: "Cliente" },
    };
    const { icon: Icon, variant, label } = config[role] || { icon: ShieldOff, variant: "outline" as const, label: role };
    return (
      <Badge variant={variant} className="gap-1.5">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getEstadoBadge = (estado: string) => {
    return (
      <Badge variant={estado === "activo" ? "default" : "secondary"}>
        {estado || "activo"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6" aria-live="polite">
      {/* Header */}
      <div className="space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Controla accesos sensibles y estados de cuentas. Filtra por organización para aplicar cambios puntuales.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="sm:w-64">
            <OrgSelector
              onChange={(org: Org | null) => setOrgId(org?.id || "")}
              label="Organización"
            />
          </div>
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar por nombre, email o rol"
              className="pl-9"
              aria-label="Buscar usuarios por nombre, email o rol"
            />
          </div>
        </div>

        {feedback && (
          <Alert className="bg-green-500/10 border-green-500/20">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{feedback}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {ROLE_OPTIONS.map((role) => {
          const count = users.filter((u) => u.rol === role.value).length;
          return (
            <Card key={role.value}>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs">{role.label}</CardDescription>
                <CardTitle className="text-3xl font-bold">
                  {loading ? "—" : count || "0"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{role.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Error State */}
      {error && !loading && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <EmptyState title="Sin resultados" message="No se encontraron usuarios con ese criterio u organización." />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" />
                  Usuarios ({filtered.length})
                </CardTitle>
                <CardDescription>Lista de todos los usuarios del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Organización</TableHead>
                        <TableHead>Último Acceso</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((user) => {
                        const isPending = pending?.userId === user.id;
                        return (
                          <TableRow key={user.id} className={cn(isPending && "opacity-50")}>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-medium">{user.nombre}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                <p className="text-xs text-muted-foreground font-mono">#{user.id.slice(0, 8)}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={user.rol}
                                onValueChange={(value) => handleRoleChange(user.id, value as Role)}
                                disabled={isPending}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ROLE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={user.tier || ""}
                                onChange={(e) => handleTierChange(user.id, e.target.value)}
                                disabled={isPending}
                                className="w-24"
                                placeholder="standard"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={user.estado || "activo"}
                                onValueChange={(value) => handleStateChange(user.id, value)}
                                disabled={isPending}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="activo">Activo</SelectItem>
                                  <SelectItem value="inactivo">Inactivo</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={user.organizationId || "none"}
                                onValueChange={(value) => handleOrgChange(user.id, value === "none" ? "" : value)}
                                disabled={isPending}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Sin asignar</SelectItem>
                                  {orgs.map((org) => (
                                    <SelectItem key={org.id} value={org.id}>
                                      {org.nombre}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {user.ultimoAcceso ? (
                                <span className="text-sm text-muted-foreground">
                                  {new Date(user.ultimoAcceso).toLocaleDateString("es-CO", {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
