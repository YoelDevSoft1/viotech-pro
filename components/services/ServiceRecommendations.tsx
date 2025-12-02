/**
 * Componente de Recomendaciones de Servicios
 */

"use client";

import Link from "next/link";
import { Sparkles, TrendingUp, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServiceGrid } from "./ServiceGrid";
import { useServiceRecommendations } from "@/lib/hooks/useServicesMarketplace";
import { useCurrentUser } from "@/lib/hooks/useResources";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { cn } from "@/lib/utils";

interface ServiceRecommendationsProps {
  serviceId?: string; // Para "servicios relacionados"
  limit?: number;
  className?: string;
}

export function ServiceRecommendations({
  serviceId,
  limit = 6,
  className,
}: ServiceRecommendationsProps) {
  const t = useTranslationsSafe("services.marketplace.recommendations");
  const { data: user } = useCurrentUser();
  const userId = user?.id;

  const { data: recommendations = [], isLoading } = useServiceRecommendations(
    userId,
    limit
  );

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="h-8 bg-muted animate-pulse rounded" />
        <ServiceGrid loading={true} />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">
            {userId ? t("forYou") : t("popular")}
          </h3>
        </div>
        <Link href="/services/catalog">
          <Button variant="ghost" size="sm">
            {t("viewAll")}
          </Button>
        </Link>
      </div>
      <ServiceGrid services={recommendations} />
    </div>
  );
}

/**
 * Sección de recomendaciones para página de detalle
 */
export function RelatedServices({ serviceId, limit = 4 }: { serviceId: string; limit?: number }) {
  const t = useTranslationsSafe("services.marketplace.recommendations");
  const { data: recommendations = [], isLoading } = useServiceRecommendations(
    undefined,
    limit
  );

  // Filtrar el servicio actual
  const related = recommendations.filter((s) => s.id !== serviceId).slice(0, limit);

  if (isLoading || related.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        {t("related")}
      </h3>
      <ServiceGrid services={related} />
    </div>
  );
}

