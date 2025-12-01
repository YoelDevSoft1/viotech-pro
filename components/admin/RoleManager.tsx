"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Shield, ShieldCheck, ShieldOff, ShieldQuestion, Search, Users as UsersIcon, Handshake } from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, isTokenExpired, refreshAccessToken } from "@/lib/auth";
import OrgSelector, { type Org } from "@/components/common/OrgSelector";
import { useOrg } from "@/lib/hooks/useOrg";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";
import { useRegisterPartner } from "@/lib/hooks/usePartnersAdmin";
import { usePartnersList } from "@/lib/hooks/usePartnersAdmin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  isPartner?: boolean;
  partnerId?: string;
};

type PendingAction =
  | { type: "role"; userId: string }
  | { type: "tier"; userId: string }
  | { type: "state"; userId: string }
  | { type: "org"; userId: string }
  | null;

// ROLE_OPTIONS se define dentro del componente para usar traducciones

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
  const [userToMakePartner, setUserToMakePartner] = useState<string | null>(null);
  const tUsers = useTranslationsSafe("users");
  const tPartners = useTranslationsSafe("partners.admin");
  const { formatDate } = useI18n();
  const registerPartner = useRegisterPartner();
  const { data: partners } = usePartnersList();

  const ROLE_OPTIONS: { value: Role; label: string; description: string }[] = [
    { value: "admin", label: tUsers("roles.admin"), description: tUsers("roles.adminDescription") },
    { value: "agente", label: tUsers("roles.agente"), description: tUsers("roles.agenteDescription") },
    { value: "cliente", label: tUsers("roles.cliente"), description: tUsers("roles.clienteDescription") },
  ];

  const apiBase = useMemo(() => buildApiUrl("").replace(/\/+$/, ""), []);

  const getValidToken = useCallback(async () => {
    let token = getAccessToken();
    if (!token) throw new Error(tUsers("errors.notAuthenticated"));
    if (isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) throw new Error(tUsers("errors.sessionExpired"));
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
          throw new Error(payload?.error || payload?.message || tUsers("errors.loadError"));
        }

        const dataRaw = payload.data || payload.users || payload || [];
        const list = Array.isArray(dataRaw?.users)
          ? dataRaw.users
          : Array.isArray(dataRaw)
            ? dataRaw
            : Array.isArray(dataRaw.data)
              ? dataRaw.data
              : [];

        // Mapear usuarios y verificar si son partners
        const partnersMap = new Map(
          partners?.map((p) => [p.userId, p.id]) || []
        );
        
        setUsers(
          list.map(
            (u: any): UserRecord => {
              const normalizedRole = (u.rol || u.role || "cliente").toLowerCase() as Role;
              const userId = String(u.id);
              const isPartner = partnersMap.has(userId);
              return {
                id: userId,
                nombre: u.nombre || u.name || tUsers("noName"),
                email: u.email || "sin-email",
                rol: normalizedRole,
                estado: u.estado || u.state || "activo",
                tier: u.tier || "standard",
                organizationId: u.organizationId || u.organization_id || "",
                permisos: u.permisos || u.permissions || [],
                ultimoAcceso: u.ultimoAcceso || u.lastLogin,
                isPartner,
                partnerId: isPartner ? partnersMap.get(userId) : undefined,
              };
            },
          ),
        );
      } catch (err) {
        if (controller.signal.aborted) return;
        const msg = err instanceof Error ? err.message : tUsers("errors.loadError");
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
  }, [apiBase, getValidToken, orgId, partners]);

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
      setFeedback(tUsers("feedback.mockChanges"));
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
        throw new Error(data?.error || data?.message || tUsers("errors.updateError"));
      }
      setFeedback(tUsers("feedback.changesSaved"));
    } catch (err) {
      // Revertir si falla
      setUsers(previous);
      setFeedback(null);
      setError(err instanceof Error ? err.message : tUsers("errors.genericUpdateError"));
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
      setFeedback(tUsers("feedback.mockChanges"));
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
        throw new Error(data?.error || data?.message || tUsers("errors.updateTierError"));
      }
      setFeedback(tUsers("feedback.tierUpdated"));
    } catch (err) {
      setUsers(prev);
      setFeedback(null);
      setError(err instanceof Error ? err.message : tUsers("errors.updateTierError"));
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
      setFeedback(tUsers("feedback.mockChanges"));
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
        throw new Error(data?.error || data?.message || tUsers("errors.updateStateError"));
      }
      setFeedback(tUsers("feedback.stateUpdated"));
    } catch (err) {
      setUsers(prev);
      setFeedback(null);
      setError(err instanceof Error ? err.message : tUsers("errors.updateStateError"));
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
      setFeedback(tUsers("feedback.mockChanges"));
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
        throw new Error(data?.error || data?.message || tUsers("errors.updateOrgError"));
      }
      setFeedback(tUsers("feedback.orgAssigned"));
    } catch (err) {
      setUsers(prev);
      setFeedback(null);
      setError(err instanceof Error ? err.message : tUsers("errors.updateOrgError"));
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

  const handleMakePartner = async (userId: string) => {
    try {
      await registerPartner.mutateAsync({
        userId,
        status: "active",
        tier: "bronze",
        commissionRate: 10.0,
      });
      setUserToMakePartner(null);
      // Refrescar lista de usuarios
      window.location.reload();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  return (
    <div className="space-y-6" aria-live="polite">
      {/* Header */}
      <div className="space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{tUsers("title")}</h1>
          <p className="text-muted-foreground">
            {tUsers("description")}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="sm:w-64">
            <OrgSelector
              onChange={(org: Org | null) => setOrgId(org?.id || "")}
              label={tUsers("organization")}
            />
          </div>
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={tUsers("searchPlaceholder")}
              className="pl-9"
              aria-label={tUsers("searchLabel")}
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
                <EmptyState title={tUsers("noResults")} message={tUsers("noResultsMessage")} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" />
                  {tUsers("usersList")} ({filtered.length})
                </CardTitle>
                <CardDescription>{tUsers("usersListDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tUsers("user")}</TableHead>
                        <TableHead>{tUsers("role")}</TableHead>
                        <TableHead>{tUsers("tier")}</TableHead>
                        <TableHead>{tUsers("state")}</TableHead>
                        <TableHead>{tUsers("organization")}</TableHead>
                        <TableHead>{tUsers("lastAccess")}</TableHead>
                        <TableHead>Partner</TableHead>
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
                                  <SelectItem value="activo">{tUsers("states.activo")}</SelectItem>
                                  <SelectItem value="inactivo">{tUsers("states.inactivo")}</SelectItem>
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
                                  <SelectItem value="none">{tUsers("unassigned")}</SelectItem>
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
                                  {formatDate(user.ultimoAcceso, "PPp")}
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {user.isPartner ? (
                                <Badge variant="default" className="gap-1.5">
                                  <Handshake className="h-3 w-3" />
                                  {tPartners("status.active")}
                                </Badge>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setUserToMakePartner(user.id)}
                                  disabled={registerPartner.isPending || isPending}
                                  className="gap-1.5"
                                >
                                  <Handshake className="h-3 w-3" />
                                  {tPartners("actions.makePartner")}
                                </Button>
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

      {/* Modal de confirmación para hacer partner */}
      <AlertDialog open={!!userToMakePartner} onOpenChange={(open) => !open && setUserToMakePartner(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tPartners("confirm.makePartnerTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tPartners("confirm.makePartnerDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tPartners("confirm.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => userToMakePartner && handleMakePartner(userToMakePartner)}>
              {tPartners("confirm.makePartner")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
