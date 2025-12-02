/**
 * Tabla de Comparación de Servicios
 */

"use client";

import { useState } from "react";
import { X, Plus, GitCompare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServiceRating } from "./ServiceRating";
import { useCompareServices, useServiceCatalog } from "@/lib/hooks/useServicesMarketplace";
import { formatPrice } from "@/lib/services";
import type { ServicePlanExtended } from "@/lib/types/services";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { EmptyState } from "@/components/ui/empty-state";

interface ServiceComparisonProps {
  initialServiceIds?: string[];
  onServiceSelect?: (service: ServicePlanExtended) => void;
  className?: string;
}

export function ServiceComparison({
  initialServiceIds = [],
  onServiceSelect,
  className,
}: ServiceComparisonProps) {
  const t = useTranslationsSafe("services.marketplace.comparison");
  const [selectedIds, setSelectedIds] = useState<string[]>(initialServiceIds);

  const { data: comparisonData, isLoading } = useCompareServices(selectedIds);
  const { data: catalogData } = useServiceCatalog({ limit: 100 });

  const availableServices = catalogData?.services || [];

  const handleAddService = (serviceId: string) => {
    if (selectedIds.length >= 4) {
      toast.error(t("maxServices"));
      return;
    }
    if (selectedIds.includes(serviceId)) {
      toast.error(t("serviceAlreadyAdded"));
      return;
    }
    setSelectedIds([...selectedIds, serviceId]);
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedIds(selectedIds.filter((id) => id !== serviceId));
  };

  const services = comparisonData?.services || [];
  const differences = comparisonData?.differences || [];

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex justify-center py-12">
            <div className="text-muted-foreground">{t("loading") || "Cargando comparación..."}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedIds.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={GitCompare}
            title={t("noServices")}
            description={t("noServicesDescription")}
          >
            {availableServices.length > 0 ? (
              <div className="mt-4 w-full max-w-md mx-auto">
                <Select
                  value=""
                  onValueChange={handleAddService}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("addServicePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableServices.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.nombre} - {formatPrice(service.precio, service.currency)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-4">
                {t("noServicesAvailable") || "No hay servicios disponibles para comparar"}
              </p>
            )}
          </EmptyState>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Selector de servicios */}
      <Card>
        <CardHeader>
          <CardTitle>{t("servicesToCompare", { count: selectedIds.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center gap-2 p-3 border rounded-lg"
              >
                <div className="flex-1 min-w-[200px]">
                  <p className="font-semibold">{service.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(service.precio, service.currency)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveService(service.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {selectedIds.length < 4 && (
              <Select
                value=""
                onValueChange={handleAddService}
              >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("addService")} />
              </SelectTrigger>
                <SelectContent>
                  {availableServices
                    .filter((s) => !selectedIds.includes(s.id))
                    .map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de comparación */}
      <Card>
        <CardHeader>
          <CardTitle>{t("detailedComparison")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">{t("characteristic")}</TableHead>
                  {services.map((service) => (
                    <TableHead key={service.id} className="min-w-[200px]">
                      {service.nombre}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Precio */}
                <TableRow>
                  <TableCell className="font-medium">{t("price")}</TableCell>
                  {services.map((service) => {
                    const hasDiscount = service.metadata?.discount;
                    const finalPrice = hasDiscount
                      ? service.precio * (1 - hasDiscount.percentage / 100)
                      : service.precio;
                    return (
                      <TableCell key={service.id}>
                        <div>
                          {hasDiscount && (
                            <span className="text-sm text-muted-foreground line-through mr-2">
                              {formatPrice(service.precio, service.currency)}
                            </span>
                          )}
                          <span className="font-semibold">
                            {formatPrice(finalPrice, service.currency)}
                          </span>
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>

                {/* Rating */}
                <TableRow>
                  <TableCell className="font-medium">{t("rating")}</TableCell>
                  {services.map((service) => (
                    <TableCell key={service.id}>
                      {service.rating && service.rating.count > 0 ? (
                        <ServiceRating
                          rating={service.rating.average}
                          count={service.rating.count}
                          size="sm"
                        />
                      ) : (
                        <span className="text-muted-foreground">{t("noRatings")}</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Categorías */}
                <TableRow>
                  <TableCell className="font-medium">{t("categories")}</TableCell>
                  {services.map((service) => (
                    <TableCell key={service.id}>
                      <div className="flex flex-wrap gap-1">
                        {service.categorias?.slice(0, 2).map((cat) => (
                          <Badge key={cat.id} variant="outline" className="text-xs">
                            {cat.nombre}
                          </Badge>
                        ))}
                        {service.categorias && service.categorias.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{service.categorias.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Features */}
                <TableRow>
                  <TableCell className="font-medium">{t("features")}</TableCell>
                  {services.map((service) => (
                    <TableCell key={service.id}>
                      <ul className="space-y-1 text-sm">
                        {service.features.slice(0, 5).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {service.features.length > 5 && (
                          <li className="text-xs text-muted-foreground">
                            +{service.features.length - 5} {t("more") || "más"}
                          </li>
                        )}
                      </ul>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Diferencias destacadas */}
                {differences.map((diff, idx) => (
                  <TableRow key={idx} className="bg-muted/50">
                    <TableCell className="font-medium">
                      {diff.field
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())
                        .trim()}
                    </TableCell>
                    {services.map((service) => (
                      <TableCell key={service.id}>
                        {String(diff.values[service.id] ?? "N/A")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* CTAs */}
      <div className="flex flex-wrap gap-4 justify-center">
        {services.map((service) => (
          <Button
            key={service.id}
            variant="outline"
            onClick={() => onServiceSelect?.(service)}
          >
            {t("viewDetails", { name: service.nombre })}
          </Button>
        ))}
      </div>
    </div>
  );
}

