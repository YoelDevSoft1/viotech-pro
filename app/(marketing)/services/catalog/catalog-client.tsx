/**
 * Catálogo de Servicios - Cliente
 * Refactorizado con nuevos componentes del marketplace
 */

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, SlidersHorizontal } from "lucide-react";

import { PageShell } from "@/components/ui/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import CheckoutModal from "@/components/payments/CheckoutModal";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useServiceCatalog, useServiceCategories, useServiceTags } from "@/lib/hooks/useServicesMarketplace";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { ServiceFilters } from "@/components/services/ServiceFilters";
import type { ServicePlanExtended, ServiceCatalogFilters } from "@/lib/types/services";

export function CatalogPageClient() {
  const router = useRouter();
  const t = useTranslationsSafe("services.catalog");
  
  // Estado de filtros
  const [filters, setFilters] = useState<ServiceCatalogFilters>({
    page: 1,
    limit: 20,
    sortBy: "popular",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<ServicePlanExtended | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Queries
  const { data: catalogData, isLoading, isError, error } = useServiceCatalog(filters);
  const { data: categories = [] } = useServiceCategories();
  const { data: tags = [] } = useServiceTags();

  // Handlers
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setFilters((prev) => ({
      ...prev,
      search: value || undefined,
      page: 1, // Reset a primera página
    }));
  };

  const handleSortChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: value as ServiceCatalogFilters["sortBy"],
      page: 1,
    }));
  };

  const handleFiltersChange = useCallback((newFilters: ServiceCatalogFilters) => {
    setFilters((prev) => {
      // Solo actualizar si realmente cambió algo (evitar re-renders innecesarios)
      const hasChanged = 
        prev.category !== newFilters.category ||
        JSON.stringify(prev.tags) !== JSON.stringify(newFilters.tags) ||
        prev.minPrice !== newFilters.minPrice ||
        prev.maxPrice !== newFilters.maxPrice ||
        prev.rating !== newFilters.rating ||
        prev.search !== newFilters.search ||
        prev.sortBy !== newFilters.sortBy;
      
      if (!hasChanged) return prev;
      
      return {
        ...newFilters,
        page: 1, // Reset a primera página al cambiar filtros
      };
    });
  }, []);

  const handleBuy = (service: ServicePlanExtended) => {
    setSelectedPlan(service);
    setIsCheckoutOpen(true);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PageShell>
      <div className="flex flex-col gap-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/services"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> {t("backToServices")}
            </Link>
            <Link href="/services/catalog/compare">
              <Button variant="outline" size="sm">
                {t("compare")}
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">{t("title")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        {/* Búsqueda y Ordenamiento */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder={t("sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">{t("sortPopular")}</SelectItem>
              <SelectItem value="price">{t("sortPrice")}</SelectItem>
              <SelectItem value="price-desc">{t("sortPriceDesc")}</SelectItem>
              <SelectItem value="rating">{t("sortRating")}</SelectItem>
              <SelectItem value="newest">{t("sortNewest")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Layout: Filtros + Grid */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filtros (Desktop: lateral, Mobile: sheet) */}
          <div className="lg:w-64 shrink-0">
            <ServiceFilters
              categories={categories}
              tags={tags}
              priceRange={catalogData?.filters.priceRange}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              resultCount={catalogData?.pagination.total}
            />
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            {/* Error State */}
            {isError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("error")}</AlertTitle>
                <AlertDescription>
                  {(error as Error)?.message || t("errorLoading")}
                </AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {isLoading && <ServiceGrid services={[]} loading={true} />}

            {/* Services Grid */}
            {!isLoading && !isError && catalogData && (
              <>
                <ServiceGrid
                  services={catalogData.services}
                  onBuy={handleBuy}
                />

                {/* Paginación */}
                {catalogData.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(filters.page! - 1)}
                      disabled={filters.page === 1}
                    >
                      {t("previous")}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {t("page")} {catalogData.pagination.page} {t("of")} {catalogData.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(filters.page! + 1)}
                      disabled={filters.page === catalogData.pagination.totalPages}
                    >
                      {t("next")}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedPlan && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          onSuccess={() => {
            setIsCheckoutOpen(false);
            router.push("/services?payment=success");
          }}
          onError={() => setIsCheckoutOpen(false)}
        />
      )}
    </PageShell>
  );
}
