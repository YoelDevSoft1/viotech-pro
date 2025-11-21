"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, isTokenExpired, refreshAccessToken, logout } from "@/lib/auth";
import { buildApiUrl } from "@/lib/api";

type Props = {
  children: React.ReactNode;
};

type MeResponse = {
  role?: string;
  rol?: string;
  permisos?: string[];
  permissions?: string[];
};

const ENABLE_ADMIN = process.env.NEXT_PUBLIC_ENABLE_ADMIN === "true";
const ADMIN_ROLES = ["admin", "superadmin", "ops", "support", "soporte"];

export default function AdminGate({ children }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "denied" | "ready">("checking");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!ENABLE_ADMIN) {
        setMessage("Panel administrativo deshabilitado.");
        setStatus("denied");
        return;
      }

      let token = getAccessToken();
      if (!token) {
        router.replace("/login?from=/admin");
        return;
      }

      if (isTokenExpired(token)) {
        const newToken = await refreshAccessToken();
        if (newToken) token = newToken;
        else {
          await logout();
          router.replace("/login?from=/admin&reason=token_expired");
          return;
        }
      }

      try {
        const res = await fetch(buildApiUrl("/auth/me"), {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok || !payload) {
          throw new Error(payload?.error || payload?.message || "No autorizado");
        }
        const data: MeResponse = payload.data || payload;
        const role = data.role || data.rol || "";
        const hasAccess = ADMIN_ROLES.includes(role.toLowerCase());
        if (!hasAccess) {
          setMessage("No tienes permisos para acceder al panel administrativo.");
          setStatus("denied");
          return;
        }
        setStatus("ready");
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "No se pudo verificar tu sesión."
        );
        setStatus("denied");
      }
    };

    checkAccess();
  }, [router]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="rounded-2xl border border-border/70 bg-muted/20 px-6 py-4 text-sm text-muted-foreground">
          Verificando acceso al panel...
        </div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border/70 bg-muted/20 p-6 space-y-3 text-center">
          <p className="text-lg font-medium text-foreground">Acceso restringido</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
