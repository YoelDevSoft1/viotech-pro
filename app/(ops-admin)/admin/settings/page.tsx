"use client";

import { useEffect, useState } from "react";
import { User, Building2, RefreshCcw, AlertTriangle, CheckCircle2, Lock, Users, Mail, KeyRound } from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, refreshAccessToken, isTokenExpired, logout } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import OrgSelector, { type Org } from "@/components/common/OrgSelector";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";
import Link from "next/link";

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
  const tSettings = useTranslationsSafe("admin.settings");
  const { formatDate } = useI18n();

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
        setError(tSettings("errors.sessionExpired"));
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
      if (!res.ok || !payload) throw new Error(payload?.error || payload?.message || tSettings("errors.couldNotLoadProfile"));
      const data =
        (payload.data && (payload.data.user || payload.data)) ||
        payload.user ||
        payload;
      setMe(data);
      setOrgFromProfile(data.organizationId || data.organization_id || null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : tSettings("errors.loadProfileError");
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
        setMfaError(tSettings("errors.sessionExpired"));
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
      if (!res.ok || !payload) throw new Error(payload?.error || payload?.message || tSettings("errors.couldNotLoadMFA"));
      const data = payload.data || payload;
      setMfa({
        enabled: Boolean(data.enabled ?? data.mfaEnabled),
        enrolled: data.enrolled,
        lastVerifiedAt: data.lastVerifiedAt || data.last_verified_at || null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : tSettings("errors.loadMFAError");
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
        setUsersError(tSettings("errors.sessionExpired"));
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
      if (!res.ok || !payload) throw new Error(payload?.error || payload?.message || tSettings("errors.couldNotLoadUsers"));
      const arr = payload.data?.users || payload.users || payload.data || [];
      setUsers(Array.isArray(arr) ? arr : []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : tSettings("errors.loadUsersError");
      setUsersError(msg);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{tSettings("title")}</h1>
            <p className="text-muted-foreground">
              {tSettings("description")}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadProfile} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {tSettings("refresh")}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Profile and Security Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {tSettings("accountInfo")}
            </CardTitle>
            <CardDescription>{tSettings("accountInfoDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{tSettings("accountId")}</p>
                  <p className="text-sm font-mono text-foreground break-all">{me?.id || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{tSettings("name")}</p>
                  <p className="text-sm font-medium text-foreground">{me?.nombre || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{tSettings("email")}</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <p className="text-sm text-foreground">{me?.email || "—"}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{tSettings("role")}</p>
                  <Badge variant="outline" className="capitalize">
                    {me?.rol || "—"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{tSettings("tier")}</p>
                  <Badge variant="secondary" className="capitalize">
                    {me?.tier || "—"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{tSettings("status")}</p>
                  <Badge variant={me?.estado === "activo" ? "default" : "secondary"} className="capitalize">
                    {me?.estado || "—"}
                  </Badge>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{tSettings("assignedOrganization")}</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                    <p className="text-sm font-mono text-foreground break-all">
                      {orgFromProfile || "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {tSettings("securityMFA")}
            </CardTitle>
            <CardDescription>{tSettings("securityMFADescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mfaError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">{mfaError}</AlertDescription>
              </Alert>
            )}
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{tSettings("mfaStatus")}</p>
                <p className="text-sm font-medium text-foreground">
                  {mfa ? (mfa.enabled ? tSettings("enabled") : tSettings("disabled")) : tSettings("loading")}
                </p>
              </div>
              {mfa?.enabled ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              )}
            </div>
            {mfa?.lastVerifiedAt && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <KeyRound className="h-3 w-3" />
                <span>
                  {tSettings("lastVerification")}: {formatDate(mfa.lastVerifiedAt, "PPpp")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Organization Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {tSettings("activeOrganization")}
          </CardTitle>
          <CardDescription>
            {tSettings("activeOrganizationDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrgSelector
            label={tSettings("selectOrganization")}
            onChange={(org: Org | null) => setOrgFromProfile(org?.id || null)}
          />
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {tSettings("systemUsers")}
          </CardTitle>
          <CardDescription>{tSettings("systemUsersDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {usersError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{usersError}</AlertDescription>
            </Alert>
          )}
          {usersLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {tSettings("noUsers")}
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>{tSettings("name")}</TableHead>
                    <TableHead>{tSettings("email")}</TableHead>
                    <TableHead>{tSettings("role")}</TableHead>
                    <TableHead>{tSettings("tier")}</TableHead>
                    <TableHead>{tSettings("status")}</TableHead>
                    <TableHead>{tSettings("assignedOrganization")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          {u.id.slice(0, 8)}...
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{u.nombre || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{u.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {u.rol}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {u.tier || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.estado === "activo" ? "default" : "secondary"} className="capitalize">
                          {u.estado || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          {u.organizationId ? `${u.organizationId.slice(0, 8)}...` : "—"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
