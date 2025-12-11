"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Package,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Phone,
  Search,
  Filter,
  ShoppingCart,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { getAccessToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useServices } from "@/lib/hooks/useServices";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { formatPrice } from "@/lib/services";
import CheckoutModal from "@/components/payments/CheckoutModal";
import type { ServicePlan } from "@/lib/services";
import { apiClient } from "@/lib/apiClient";
import { logger } from "@/lib/logger";
import { EmptyState } from "@/components/ui/empty-state";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

function ServicesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <Card key={i} className="border-border/70">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-24" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border/70">
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ServiceStatusBadge({ estado }: { estado: string }) {
  switch (estado?.toLowerCase()) {
    case "activo":
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Activo
        </Badge>
      );
    case "expirado":
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Expirado
        </Badge>
      );
    case "pendiente":
      return (
        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 gap-1">
          <Clock className="h-3 w-3" />
          Pendiente
        </Badge>
      );
    default:
      return <Badge variant="outline">{estado || "Desconocido"}</Badge>;
  }
}

export default function ClientPaymentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { services, loading: servicesLoading, error: servicesError, refresh: refreshServices } = useServices();
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalog, setCatalog] = useState<ServicePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const tCommon = useTranslationsSafe("common");
  const tSidebar = useTranslationsSafe("sidebar");
  const tServices = useTranslationsSafe("client.services");

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login?from=/client/payments");
      return;
    }
  }, [router]);

  // Cargar catálogo de servicios
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setCatalogLoading(true);
        const { data } = await apiClient.get("/services/catalog");

        let rawData: any = data?.data || data;

        if (!Array.isArray(rawData)) {
          logger.warn("Catalog data is not an array", { rawData });
          rawData = [];
        }

        setCatalog(rawData);
      } catch (error) {
        logger.error("Error loading service catalog", error, {
          endpoint: "/services/catalog",
          apiError: true,
        });
        setCatalog([]);
      } finally {
        setCatalogLoading(false);
      }
    };

    loadCatalog();
  }, []);

  const handlePurchase = (plan: ServicePlan) => {
    setSelectedPlan(plan);
    setCheckoutOpen(true);
  };

  const handleCheckoutSuccess = async (serviceName?: string) => {
    setCheckoutOpen(false);
    setSelectedPlan(null);

    queryClient.invalidateQueries({ queryKey: ["services"] });

    try {
      await refreshServices();

      toast.success(
        serviceName
          ? `¡Pago procesado exitosamente! Tu servicio ${serviceName} está activo.`
          : "¡Pago procesado exitosamente! Tu servicio está activo.",
        {
          action: {
            label: "Ver Servicios",
            onClick: () => {
              document.getElementById("active-services")?.scrollIntoView({ behavior: "smooth" });
            },
          },
        }
      );
    } catch (error) {
      console.warn("Error al refrescar servicios después del pago:", error);
      toast.success(
        "¡Pago procesado exitosamente! Los servicios se actualizarán en breve.",
        {
          description: "Si no ves tu servicio, recarga la página.",
        }
      );
    }
  };

  const getDaysUntilExpiration = (fechaExpiracion: string | null | undefined): number | null => {
    if (!fechaExpiracion) return null;
    const exp = new Date(fechaExpiracion);
    const now = new Date();
    const diff = exp.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Filtrar catálogo por búsqueda y tipo
  const filteredCatalog = Array.isArray(catalog) ? catalog.filter((plan) => {
    const matchesSearch = searchQuery === "" ||
      plan.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plan.tipo && plan.tipo.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === "all" || plan.tipo === typeFilter;

    return matchesSearch && matchesType;
  }) : [];

  // Obtener tipos únicos del catálogo
  const availableTypes = Array.isArray(catalog)
    ? Array.from(new Set(catalog.map(p => p.tipo).filter(Boolean)))
    : [];

  // Contadores
  const activeServicesCount = services.filter(s => s.estado?.toLowerCase() === "activo").length;
  const expiringServicesCount = services.filter(s => {
    const days = getDaysUntilExpiration(s.fecha_expiracion);
    return days !== null && days > 0 && days <= 30;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {tServices("backToDashboard")}
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <CreditCard className="h-8 w-8" />
              {tSidebar("payments")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {tServices("payments.pageDescription")}
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-2">
            {activeServicesCount > 0 && (
              <Badge variant="secondary" className="gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                {activeServicesCount} {activeServicesCount === 1 ? "servicio activo" : "servicios activos"}
              </Badge>
            )}
            {expiringServicesCount > 0 && (
              <Badge variant="outline" className="gap-1.5 border-yellow-500/50 text-yellow-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {expiringServicesCount} por expirar
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Servicios Activos */}
      <section id="active-services">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {tServices("payments.myServices.title")}
              </CardTitle>
              <CardDescription>
                {tServices("payments.myServices.description")}
              </CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => refreshServices()}
                    disabled={servicesLoading}
                  >
                    <RefreshCw className={cn("h-4 w-4", servicesLoading && "animate-spin")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Actualizar servicios</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {servicesLoading ? (
              <ServicesSkeleton />
            ) : servicesError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{servicesError}</span>
                  <Button variant="outline" size="sm" onClick={() => refreshServices()}>
                    {tCommon("retry")}
                  </Button>
                </AlertDescription>
              </Alert>
            ) : services.length === 0 ? (
              <EmptyState
                icon={Package}
                title={tServices("emptyStates.noActiveServices.title")}
                description={tServices("emptyStates.noActiveServices.description")}
                action={{
                  label: tServices("emptyStates.noActiveServices.actionExplore"),
                  onClick: () => {
                    document.getElementById("service-catalog")?.scrollIntoView({ behavior: "smooth" });
                  },
                  variant: "default" as const,
                }}
              >
                <div className="mt-4 flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.info("Funcionalidad de agendamiento próximamente disponible");
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {tServices("emptyStates.noActiveServices.actionSchedule")}
                  </Button>
                </div>
              </EmptyState>
            ) : (
              <div className="space-y-4">
                {services.map((service) => {
                  const daysLeft = getDaysUntilExpiration(service.fecha_expiracion);
                  const isExpiringSoon = daysLeft !== null && daysLeft <= 30 && daysLeft > 0;
                  const isExpired = daysLeft !== null && daysLeft <= 0;
                  const isUrgent = daysLeft !== null && daysLeft <= 7;

                  return (
                    <Card
                      key={service.id}
                      className={cn(
                        "border-border/70 transition-all",
                        isExpired && "border-red-500/30 bg-red-500/5",
                        isExpiringSoon && !isExpired && "border-yellow-500/30 bg-yellow-500/5"
                      )}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-lg font-semibold">{service.nombre}</h3>
                              <ServiceStatusBadge estado={service.estado} />
                              {isExpiringSoon && !isExpired && (
                                <Badge variant="outline" className="border-yellow-500/50 text-yellow-600 text-xs">
                                  {daysLeft} días restantes
                                </Badge>
                              )}
                            </div>

                            {service.tipo && (
                              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                                {service.tipo}
                              </p>
                            )}

                            {/* Información agrupada */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                              {service.fecha_compra && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">{tServices("payments.myServices.purchased")}</p>
                                    <p className="text-sm font-medium">{new Date(service.fecha_compra).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              )}
                              {service.fecha_expiracion && (
                                <div className={cn(
                                  "flex items-center gap-2",
                                  (isExpiringSoon || isExpired) && "text-red-600"
                                )}>
                                  <Clock className={cn(
                                    "h-4 w-4 flex-shrink-0",
                                    isExpiringSoon || isExpired ? "text-red-600" : "text-muted-foreground"
                                  )} />
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      {isExpired ? tServices("payments.myServices.expired") : tServices("payments.myServices.expires")}
                                    </p>
                                    <p className={cn(
                                      "text-sm font-medium",
                                      (isExpiringSoon || isExpired) && "text-red-600"
                                    )}>
                                      {isExpired
                                        ? tServices("payments.myServices.expired")
                                        : isExpiringSoon
                                        ? tServices("payments.myServices.expiresIn").replace("{days}", String(daysLeft))
                                        : new Date(service.fecha_expiracion).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {service.precio && (
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">{tServices("payments.myServices.price")}</p>
                                    <p className="text-sm font-medium">{formatPrice(service.precio, "COP")}</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Alertas */}
                            {isExpiringSoon && !isExpired && (
                              <Alert className={cn(
                                "py-2",
                                isUrgent ? "bg-red-500/10 border-red-500/30" : "bg-yellow-500/10 border-yellow-500/20"
                              )}>
                                <AlertCircle className={cn("h-4 w-4", isUrgent ? "text-red-600" : "text-yellow-600")} />
                                <AlertDescription className={cn("text-sm", isUrgent ? "text-red-600" : "text-yellow-600")}>
                                  {tServices("payments.myServices.expiringSoon")}
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>

                          {/* Botones de acción */}
                          <div className="flex flex-col gap-2">
                            <TooltipProvider>
                              {(isExpired || isExpiringSoon) && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant={isExpired || isUrgent ? "default" : "outline"}
                                      size="sm"
                                      className={cn(
                                        isExpired && "bg-red-600 hover:bg-red-700",
                                        isUrgent && !isExpired && "bg-yellow-600 hover:bg-yellow-700"
                                      )}
                                      onClick={() => {
                                        const plan = Array.isArray(catalog) ? catalog.find(p => p.nombre === service.nombre) : undefined;
                                        if (plan) {
                                          handlePurchase(plan);
                                        }
                                      }}
                                    >
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      {isExpired ? tServices("payments.myServices.renew") : tServices("payments.myServices.renewNow")}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Renovar este servicio</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </TooltipProvider>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Catálogo de Servicios */}
      <section id="service-catalog">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  {tServices("payments.catalog.title")}
                </CardTitle>
                <CardDescription>
                  {tServices("payments.catalog.description")}
                </CardDescription>
              </div>
              {!catalogLoading && catalog.length > 0 && (
                <Badge variant="secondary">
                  {catalog.length} {catalog.length === 1 ? "servicio" : "servicios"} disponibles
                </Badge>
              )}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {catalogLoading ? (
              <>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-full sm:w-[200px]" />
                </div>
                <CatalogSkeleton />
              </>
            ) : !Array.isArray(catalog) || catalog.length === 0 ? (
              <EmptyState
                icon={Package}
                title={tServices("emptyStates.catalogEmpty.title")}
                description={tServices("emptyStates.catalogEmpty.description")}
                action={{
                  label: tServices("emptyStates.catalogEmpty.actionContact"),
                  onClick: () => {
                    router.push("/contact");
                  },
                  variant: "default" as const,
                }}
              />
            ) : (
              <>
                {/* Búsqueda y Filtros */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={tServices("payments.catalog.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {availableTypes.length > 0 && (
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder={tServices("payments.catalog.filterByType")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{tServices("payments.catalog.allTypes")}</SelectItem>
                        {availableTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Resultados */}
                {filteredCatalog.length === 0 ? (
                  <EmptyState
                    icon={Search}
                    title="No se encontraron servicios"
                    description="Intenta con otros términos de búsqueda o quita los filtros"
                    action={{
                      label: "Limpiar filtros",
                      onClick: () => {
                        setSearchQuery("");
                        setTypeFilter("all");
                      },
                      variant: "outline" as const,
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCatalog.map((plan) => {
                      const isOwned = services.some(s => s.nombre === plan.nombre && s.estado?.toLowerCase() === "activo");

                      return (
                        <Card
                          key={plan.id}
                          className={cn(
                            "border-border/70 hover:border-primary/50 transition-all hover:shadow-md",
                            isOwned && "border-green-500/30 bg-green-500/5"
                          )}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{plan.nombre}</CardTitle>
                                <CardDescription className="uppercase tracking-wide text-xs mt-1">
                                  {plan.tipo}
                                </CardDescription>
                              </div>
                              {isOwned && (
                                <Badge className="bg-green-500/10 text-green-600 border-green-500/20 gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Activo
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold">
                                {formatPrice(plan.precio, plan.currency)}
                              </span>
                            </div>

                            {plan.features && plan.features.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">{tServices("payments.catalog.features")}:</p>
                                <ul className="text-sm text-muted-foreground space-y-1.5">
                                  {plan.features.slice(0, 4).map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                  {plan.features.length > 4 && (
                                    <li className="text-xs text-muted-foreground pl-6">
                                      +{plan.features.length - 4} más...
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    className="w-full"
                                    variant={isOwned ? "outline" : "default"}
                                    onClick={() => handlePurchase(plan)}
                                  >
                                    {isOwned ? (
                                      <>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Renovar
                                      </>
                                    ) : (
                                      <>
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        {tServices("payments.catalog.buyNow")}
                                      </>
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{isOwned ? "Renovar este servicio" : "Proceder al pago"}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Modal de Checkout */}
      {selectedPlan && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => {
            setCheckoutOpen(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          onSuccess={() => handleCheckoutSuccess(selectedPlan?.nombre)}
        />
      )}
    </div>
  );
}
