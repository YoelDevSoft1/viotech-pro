/**
 * Panel de filtros lateral para el catálogo
 */

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ServiceRating } from "./ServiceRating";
import type { ServiceCategory, ServiceTag, ServiceCatalogFilters } from "@/lib/types/services";
import { formatPrice } from "@/lib/services";
import { cn } from "@/lib/utils";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

interface ServiceFiltersProps {
  categories?: ServiceCategory[];
  tags?: ServiceTag[];
  priceRange?: { min: number; max: number };
  filters: ServiceCatalogFilters;
  onFiltersChange: (filters: ServiceCatalogFilters) => void;
  resultCount?: number;
  className?: string;
}

export function ServiceFilters({
  categories = [],
  tags = [],
  priceRange,
  filters,
  onFiltersChange,
  resultCount,
  className,
}: ServiceFiltersProps) {
  const t = useTranslationsSafe("services.catalog");
  const [localFilters, setLocalFilters] = useState<ServiceCatalogFilters>(filters);
  
  // Estado local para el slider (para feedback visual inmediato)
  const [priceValues, setPriceValues] = useState<[number, number]>(() => [
    filters.minPrice ?? priceRange?.min ?? 0,
    filters.maxPrice ?? priceRange?.max ?? 1000000,
  ]);

  const handleCategoryToggle = (categorySlug: string) => {
    const newFilters = {
      ...localFilters,
      category: localFilters.category === categorySlug ? undefined : categorySlug,
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleTagToggle = (tagSlug: string) => {
    const currentTags = localFilters.tags || [];
    const newTags = currentTags.includes(tagSlug)
      ? currentTags.filter(t => t !== tagSlug)
      : [...currentTags, tagSlug];
    
    const newFilters = {
      ...localFilters,
      tags: newTags.length > 0 ? newTags : undefined,
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Ref para el timer del debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Ref para evitar actualizaciones cuando el componente se desmonta
  const isMountedRef = useRef(true);
  // Ref para mantener la referencia estable de onFiltersChange
  const onFiltersChangeRef = useRef(onFiltersChange);
  // Ref para marcar cuando el cambio viene del slider interno (evitar loops)
  const isInternalUpdateRef = useRef(false);
  
  // Actualizar ref cuando cambia onFiltersChange
  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange;
  }, [onFiltersChange]);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounce para el slider de precios (evita refrescos constantes)
  useEffect(() => {
    // Limpiar timer anterior si existe
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      const currentMin = priceRange?.min ?? 0;
      const currentMax = priceRange?.max ?? 1000000;
      
      // Solo actualizar si los valores realmente cambiaron
      const newMinPrice = priceValues[0] !== currentMin ? priceValues[0] : undefined;
      const newMaxPrice = priceValues[1] !== currentMax ? priceValues[1] : undefined;
      
      // Comparar con los filtros actuales para evitar actualizaciones innecesarias
      // Usar una función de actualización para evitar dependencias
      setLocalFilters((prevFilters) => {
        if (
          newMinPrice !== prevFilters.minPrice ||
          newMaxPrice !== prevFilters.maxPrice
        ) {
          // Marcar que este es un cambio interno del slider
          isInternalUpdateRef.current = true;
          
          const newFilters = {
            ...prevFilters,
            minPrice: newMinPrice,
            maxPrice: newMaxPrice,
          };
          // Llamar onFiltersChange solo si realmente cambió usando el ref
          onFiltersChangeRef.current(newFilters);
          return newFilters;
        }
        return prevFilters;
      });
    }, 500); // 500ms de debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [priceValues, priceRange?.min, priceRange?.max]); // Removemos onFiltersChange y localFilters de las dependencias

  const handlePriceChange = useCallback((values: number[]) => {
    // Asegurar que los valores estén ordenados correctamente (min <= max)
    const sortedValues: [number, number] = [
      Math.min(values[0], values[1]),
      Math.max(values[0], values[1])
    ];
    // Solo actualizar el estado local inmediatamente para feedback visual
    // El useEffect con debounce se encargará de actualizar los filtros después de 500ms
    setPriceValues(sortedValues);
  }, []);

  const handleRatingChange = (rating: number) => {
    const newFilters = {
      ...localFilters,
      rating: localFilters.rating === rating ? undefined : rating,
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const cleared: ServiceCatalogFilters = {
      page: 1,
      limit: filters.limit,
    };
    setLocalFilters(cleared);
    setPriceValues([
      priceRange?.min ?? 0,
      priceRange?.max ?? 1000000,
    ]);
    onFiltersChange(cleared);
  };

  // Sincronizar priceValues cuando cambian los filtros externos
  // Solo sincronizar si los valores realmente cambiaron para evitar loops
  // IMPORTANTE: No sincronizar si el cambio viene del slider mismo (evitar loops)
  useEffect(() => {
    // Si el cambio viene del slider interno, no sincronizar (evitar que desaparezca)
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }
    
    if (priceRange) {
      const newMin = filters.minPrice ?? priceRange.min;
      const newMax = filters.maxPrice ?? priceRange.max;
      
      // Asegurar que los valores estén ordenados correctamente
      const sortedMin = Math.min(newMin, newMax);
      const sortedMax = Math.max(newMin, newMax);
      
      // Solo actualizar si realmente cambió (evitar re-renders innecesarios)
      setPriceValues((prev) => {
        if (prev[0] !== sortedMin || prev[1] !== sortedMax) {
          return [sortedMin, sortedMax];
        }
        return prev;
      });
    }
  }, [filters.minPrice, filters.maxPrice, priceRange?.min, priceRange?.max]);

  const hasActiveFilters = !!(
    localFilters.category ||
    (localFilters.tags && localFilters.tags.length > 0) ||
    localFilters.minPrice ||
    localFilters.maxPrice ||
    localFilters.rating
  );

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Resultados */}
      {resultCount !== undefined && (
        <div className="text-sm text-muted-foreground break-words overflow-wrap-anywhere">
          {t("resultsCount", { count: resultCount })}
        </div>
      )}

      {/* Limpiar filtros */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          {t("clearFilters")}
        </Button>
      )}

      {/* Categorías */}
      <div>
        <Label className="text-base font-semibold mb-3 block">{t("categories") || "Categorías"}</Label>
        {categories.length > 0 ? (
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={localFilters.category === category.slug}
                  onCheckedChange={() => handleCategoryToggle(category.slug)}
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="text-sm font-normal cursor-pointer flex-1 break-words overflow-wrap-anywhere"
                >
                  {category.nombre}
                </Label>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-2 break-words overflow-wrap-anywhere">
            {t("noCategoriesAvailable") || "No hay categorías disponibles"}
          </p>
        )}
      </div>

      {/* Tags */}
      <div>
        <Label className="text-base font-semibold mb-3 block">{t("tags") || "Tags"}</Label>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isSelected = localFilters.tags?.includes(tag.slug);
              return (
                <Badge
                  key={tag.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer break-words max-w-full"
                  onClick={() => handleTagToggle(tag.slug)}
                >
                  {tag.nombre}
                </Badge>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-2 break-words overflow-wrap-anywhere">
            {t("noTagsAvailable") || "No hay tags disponibles"}
          </p>
        )}
      </div>

      {/* Rango de precios */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          {t("price") || "Precio"}
        </Label>
        <div className="space-y-4">
          {priceRange ? (
            <Slider
              min={priceRange.min}
              max={priceRange.max}
              step={10000}
              value={[priceValues[0]]}
              onValueChange={(values) => {
                // Mantener el máximo fijo y solo cambiar el mínimo
                handlePriceChange([values[0], priceValues[1]]);
              }}
              className="w-full"
            />
          ) : (
            <div className="h-6 w-full bg-muted rounded-full animate-pulse" />
          )}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{priceRange ? formatPrice(priceValues[0], "COP") : "..."}</span>
            <span>{priceRange ? formatPrice(priceValues[1], "COP") : "..."}</span>
          </div>
        </div>
      </div>

      {/* Rating mínimo */}
      <div>
        <Label className="text-base font-semibold mb-3 block">{t("minRating") || "Rating mínimo"}</Label>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div
              key={rating}
              className={cn(
                "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                localFilters.rating === rating
                  ? "bg-primary/10 border border-primary"
                  : "hover:bg-muted"
              )}
              onClick={() => handleRatingChange(rating)}
            >
              <ServiceRating rating={rating} size="sm" />
              <span className="text-sm text-muted-foreground whitespace-nowrap">{t("andMore")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: Panel lateral */}
      <Card className={cn("hidden lg:block overflow-hidden", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 flex-shrink-0" />
            <span className="break-words overflow-wrap-anywhere">{t("filters")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <FilterContent />
        </CardContent>
      </Card>

      {/* Mobile: Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="lg:hidden">
            <Filter className="h-4 w-4 mr-2" />
            {t("filters")}
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {[
                  localFilters.category ? 1 : 0,
                  localFilters.tags?.length ?? 0,
                  localFilters.minPrice || localFilters.maxPrice ? 1 : 0,
                  localFilters.rating ? 1 : 0,
                ].reduce((a, b) => a + b, 0)}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>{t("filters")}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

