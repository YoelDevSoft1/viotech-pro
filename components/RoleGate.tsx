"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, isTokenExpired, refreshAccessToken, logout } from "@/lib/auth";
import { buildApiUrl } from "@/lib/api";

type Props = {
  allowedRoles: string[];
  children: React.ReactNode;
  fallbackHref?: string;
};

type MePayload = {
  rol?: string;
  role?: string;
};

export default function RoleGate({ allowedRoles, children, fallbackHref }: Props) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "denied" | "ready">("checking");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      let token = getAccessToken();
      if (!token) {
        setMessage("No autenticado.");
        setState("denied");
        router.replace(`/login?from=${fallbackHref || "/"}`);
        return;
      }

      if (isTokenExpired(token)) {
        const refreshed = await refreshAccessToken();
        if (refreshed) token = refreshed;
        else {
          await logout();
          router.replace(`/login?from=${fallbackHref || "/"}`);
          return;
        }
      }

      try {
        const res = await fetch(buildApiUrl("/auth/me"), {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok || !payload) throw new Error("No autorizado");
        const data: MePayload = payload.data || payload;
        const role = String(data.rol || data.role || "").toLowerCase();
        if (!role || !allowedRoles.includes(role)) {
          setMessage("No tienes permisos para ver esta sección.");
          setState("denied");
          return;
        }
        setState("ready");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Error de acceso.");
        setState("denied");
      }
    };
    verify();
  }, [allowedRoles, fallbackHref, router]);

  if (state === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Verificando permisos...
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-border/70 bg-muted/20 p-6 text-center space-y-2">
          <p className="text-lg font-medium text-foreground">Acceso restringido</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
