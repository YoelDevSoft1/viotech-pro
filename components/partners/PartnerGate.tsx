"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Handshake } from "lucide-react";
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
      // Delay mínimo para que la animación se vea bien (2.5 segundos)
      const [_, verificationResult] = await Promise.all([
        new Promise(resolve => setTimeout(resolve, 2500)),
        (async () => {
          let token = getAccessToken();
          if (!token) {
            return { status: "denied" as const, message: t("error.unauthorized"), redirect: `/login?from=/partners` };
          }

          if (isTokenExpired(token)) {
            const refreshed = await refreshAccessToken();
            if (refreshed) token = refreshed;
            else {
              await logout();
              return { status: "denied" as const, message: t("error.unauthorized"), redirect: `/login?from=/partners` };
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
            return { status: "ready" as const };
          } catch (error) {
            // Solo bloquear si es un error de autenticación (401)
            if (error instanceof Error && error.message.includes("No autorizado")) {
              return { status: "denied" as const, message: t("error.unauthorized"), redirect: `/login?from=/partners` };
            }
            
            // Para otros errores, permitir acceso y dejar que el backend decida
            return { status: "ready" as const };
          }
        })()
      ]);

      // Aplicar el resultado después del delay mínimo
      if (verificationResult.redirect) {
        setMessage(verificationResult.message || null);
        setStatus(verificationResult.status);
        router.replace(verificationResult.redirect);
      } else {
        setStatus(verificationResult.status);
      }
    };

    checkAccess();
  }, [router, t]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-md w-full"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl shadow-2xl p-8 md:p-10 text-center space-y-6 relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
            
            {/* Icon with animation */}
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-10 h-10 text-primary" />
                </motion.div>
              </motion.div>
            </div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl md:text-3xl font-bold text-foreground relative z-10"
            >
              {t("loading.title", { defaultValue: "Cargando Portal de Partners" })}
            </motion.h1>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-base md:text-lg leading-relaxed relative z-10"
            >
              {t("loading.message", { defaultValue: "Verificando acceso y cargando información..." })}
            </motion.p>

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground relative z-10"
            >
              <Handshake className="w-4 h-4 animate-pulse" />
              <span>{t("loading.pleaseWait", { defaultValue: "Por favor espera" })}</span>
            </motion.div>
          </motion.div>
        </motion.div>
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

