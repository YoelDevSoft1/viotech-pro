/**
 * Panel de filtros lateral para el catálogo
 */

"use client";

import { useState } from "react";
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
  const [localFilters, setLocalFilters] = useState<ServiceCatalogFilters>(filters);

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

  const handlePriceChange = (values: number[]) => {
    const newFilters = {
      ...localFilters,
      minPrice: values[0],
      maxPrice: values[1],
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

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
    onFiltersChange(cleared);
  };

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
          {resultCount} {resultCount === 1 ? "servicio encontrado" : "servicios encontrados"}
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
          Limpiar filtros
        </Button>
      )}

      {/* Categorías */}
      {categories.length > 0 && (
        <div>
          <Label className="text-base font-semibold mb-3 block">Categorías</Label>
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
          <Label className="text-base font-semibold mb-3 block">Tags</Label>
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
            Precio
          </Label>
          <div className="space-y-4">
            <Slider
              min={priceRange.min}
              max={priceRange.max}
              step={10000}
              value={[
                localFilters.minPrice ?? priceRange.min,
                localFilters.maxPrice ?? priceRange.max,
              ]}
              onValueChange={handlePriceChange}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatPrice(localFilters.minPrice ?? priceRange.min, "COP")}</span>
              <span>{formatPrice(localFilters.maxPrice ?? priceRange.max, "COP")}</span>
            </div>
          </div>
        </div>
      )}

      {/* Rating mínimo */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Rating mínimo</Label>
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
              <span className="text-sm text-muted-foreground">y más</span>
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
            Filtros
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
            Filtros
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
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

