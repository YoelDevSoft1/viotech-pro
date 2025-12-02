/**
 * Grid responsive de servicios con skeleton loading
 */

"use client";

import { ServiceCard } from "./ServiceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Search } from "lucide-react";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import type { ServicePlanExtended } from "@/lib/types/services";
import { cn } from "@/lib/utils";

interface ServiceGridProps {
  services?: ServicePlanExtended[];
  loading?: boolean;
  onBuy?: (service: ServicePlanExtended) => void;
  className?: string;
}

export function ServiceGrid({ services = [], loading = false, onBuy, className }: ServiceGridProps) {
  const t = useTranslationsSafe("services.catalog");
  
  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="flex flex-col">
            <Skeleton className="h-48 w-full rounded-t-lg" />
            <div className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-1/3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-10 w-full mt-4" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title={t("noResults") || "No se encontraron servicios"}
        description={t("noResultsDescription") || "Prueba ajustando los filtros o la búsqueda para encontrar más opciones."}
      />
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onBuy={onBuy}
        />
      ))}
    </div>
  );
}

