"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, isTokenExpired, refreshAccessToken } from "@/lib/auth";
import { logout } from "@/lib/auth";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

type MeResponse = {
  data?: {
    user?: {
      rol?: string;
      role?: string;
    };
    rol?: string;
    role?: string;
  };
  user?: {
    rol?: string;
    role?: string;
  };
  rol?: string;
  role?: string;
};

interface PartnerGateProps {
  children: React.ReactNode;
}

export default function PartnerGate({ children }: PartnerGateProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "denied" | "ready">("checking");
  const [message, setMessage] = useState<string | null>(null);
  const t = useTranslationsSafe("partners");

  useEffect(() => {
    const checkAccess = async () => {
      let token = getAccessToken();
      if (!token) {
        setMessage(t("error.unauthorized"));
        setStatus("denied");
        router.replace(`/login?from=/partners`);
        return;
      }

      if (isTokenExpired(token)) {
        const refreshed = await refreshAccessToken();
        if (refreshed) token = refreshed;
        else {
          await logout();
          router.replace(`/login?from=/partners`);
          return;
        }
      }

      try {
        // Verificar autenticación básica
        const res = await fetch(buildApiUrl("/auth/me"), {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok || !payload) {
          throw new Error(payload?.error || payload?.message || "No autorizado");
        }
        
        // No verificamos el rol aquí - dejamos que el backend decida
        // El backend puede tener lógica diferente (ej: verificar tabla partners)
        // Si el backend retorna 403, lo manejaremos en los componentes
        setStatus("ready");
      } catch (error) {
        // Solo bloquear si es un error de autenticación (401)
        if (error instanceof Error && error.message.includes("No autorizado")) {
          setMessage(t("error.unauthorized"));
          setStatus("denied");
          router.replace(`/login?from=/partners`);
          return;
        }
        
        // Para otros errores, permitir acceso y dejar que el backend decida
        setStatus("ready");
      }
    };

    checkAccess();
  }, [router, t]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="rounded-2xl border border-border/70 bg-muted/20 px-6 py-4 text-sm text-muted-foreground">
          {t("error.loading")}...
        </div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border/70 bg-muted/20 p-6 space-y-3 text-center">
          <p className="text-lg font-medium text-foreground">{t("error.forbidden")}</p>
          <p className="text-sm text-muted-foreground">{message}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-primary hover:underline"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

