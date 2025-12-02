/**
 * Panel de filtros lateral para el catálogo
 */

"use client";

import { useState, useEffect, useCallback } from "react";
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

  // Debounce para el slider de precios (evita refrescos constantes)
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentMin = priceRange?.min ?? 0;
      const currentMax = priceRange?.max ?? 1000000;
      
      // Solo actualizar si los valores realmente cambiaron
      const newMinPrice = priceValues[0] !== currentMin ? priceValues[0] : undefined;
      const newMaxPrice = priceValues[1] !== currentMax ? priceValues[1] : undefined;
      
      // Comparar con los filtros actuales para evitar actualizaciones innecesarias
      if (
        newMinPrice !== localFilters.minPrice ||
        newMaxPrice !== localFilters.maxPrice
      ) {
        const newFilters = {
          ...localFilters,
          minPrice: newMinPrice,
          maxPrice: newMaxPrice,
        };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
      }
    }, 500); // 500ms de debounce

    return () => clearTimeout(timer);
  }, [priceValues]); // Solo dependemos de priceValues

  const handlePriceChange = useCallback((values: number[]) => {
    // Solo actualizar el estado local inmediatamente para feedback visual
    // El useEffect con debounce se encargará de actualizar los filtros después de 500ms
    setPriceValues([values[0], values[1]]);
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
  useEffect(() => {
    if (priceRange) {
      setPriceValues([
        filters.minPrice ?? priceRange.min,
        filters.maxPrice ?? priceRange.max,
      ]);
    }
  }, [filters.minPrice, filters.maxPrice, priceRange]);

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
        <div className="text-sm text-muted-foreground">
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
      {categories.length > 0 && (
        <div>
          <Label className="text-base font-semibold mb-3 block">{t("categories") || "Categorías"}</Label>
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
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {category.nombre}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <Label className="text-base font-semibold mb-3 block">{t("tags") || "Tags"}</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isSelected = localFilters.tags?.includes(tag.slug);
              return (
                <Badge
                  key={tag.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag.slug)}
                >
                  {tag.nombre}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Rango de precios */}
      {priceRange && (
        <div>
          <Label className="text-base font-semibold mb-3 block">
            {t("price") || "Precio"}
          </Label>
          <div className="space-y-4">
            <Slider
              min={priceRange.min}
              max={priceRange.max}
              step={10000}
              value={priceValues}
              onValueChange={handlePriceChange}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatPrice(priceValues[0], "COP")}</span>
              <span>{formatPrice(priceValues[1], "COP")}</span>
            </div>
          </div>
        </div>
      )}

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
              <span className="text-sm text-muted-foreground">{t("andMore") || "y más"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: Panel lateral */}
      <Card className={cn("hidden lg:block", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t("filters")}
          </CardTitle>
        </CardHeader>
        <CardContent>
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

