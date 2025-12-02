"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServices } from "@/lib/hooks/useServices";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ExpiringService {
  id: string;
  nombre: string;
  daysLeft: number;
  fecha_expiracion: string;
}

export function UrgencyBanner() {
  const { services, loading } = useServices();
  const tServices = useTranslationsSafe("client.services");
  const [dismissed, setDismissed] = useState<string[]>([]);

  // Calcular servicios próximos a vencer
  const expiringServices = useMemo<ExpiringService[]>(() => {
    if (!services || services.length === 0) return [];

    const now = new Date();
    const expiring: ExpiringService[] = [];

    services.forEach((service) => {
      if (!service.fecha_expiracion) return;

      const expDate = new Date(service.fecha_expiracion);
      const diff = expDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

      // Mostrar servicios que expiran en 30 días o menos (y no están expirados)
      if (daysLeft <= 30 && daysLeft >= 0 && service.estado !== "expirado") {
        expiring.push({
          id: service.id,
          nombre: service.nombre,
          daysLeft,
          fecha_expiracion: service.fecha_expiracion,
        });
      }
    });

    // Ordenar por urgencia (menos días primero)
    return expiring.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [services]);

  // Filtrar servicios no descartados
  const visibleServices = expiringServices.filter(
    (s) => !dismissed.includes(s.id)
  );

  if (loading || visibleServices.length === 0) return null;

  // Servicio más urgente
  const mostUrgent = visibleServices[0];
  const isCritical = mostUrgent.daysLeft <= 7;
  const isWarning = mostUrgent.daysLeft <= 15;

  return (
    <div
      role="alert"
      aria-live={isCritical ? "assertive" : "polite"}
      aria-atomic="true"
      className={cn(
        "relative rounded-lg border p-4 mb-6 animate-in slide-in-from-top-2 duration-300",
        isCritical
          ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
          : isWarning
          ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400"
          : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          aria-hidden="true"
          className={cn(
            "h-5 w-5 shrink-0 mt-0.5",
            isCritical ? "text-red-600" : isWarning ? "text-yellow-600" : "text-amber-600"
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm">
              {visibleServices.length === 1
                ? tServices("payments.myServices.expiringSoon")
                : `${visibleServices.length} ${tServices("payments.myServices.expiringSoon")}`}
            </p>
            {isCritical && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-600/20 text-red-600">
                {tServices("payments.myServices.expiresIn")
                  .replace("{days}", String(mostUrgent.daysLeft))}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {visibleServices.length === 1
              ? `${mostUrgent.nombre} ${tServices("payments.myServices.expiresIn")
                  .replace("{days}", String(mostUrgent.daysLeft))}`
              : `${mostUrgent.nombre} y ${visibleServices.length - 1} más ${tServices("payments.myServices.expiresIn")
                  .replace("{days}", String(mostUrgent.daysLeft))}`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isCritical ? "default" : "outline"}
              className={cn(
                isCritical && "bg-red-600 hover:bg-red-700 text-white"
              )}
              asChild
            >
              <Link href="/client/payments">
                {tServices("payments.myServices.renewNow")}
              </Link>
            </Button>
            {visibleServices.length > 1 && (
              <Button
                size="sm"
                variant="ghost"
                asChild
              >
                <Link href="/client/payments">
                  {tServices("payments.myServices.viewAll")} ({visibleServices.length})
                </Link>
              </Button>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={() => setDismissed([...dismissed, mostUrgent.id])}
          aria-label={tServices("payments.myServices.dismissBanner") || "Descartar aviso"}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

