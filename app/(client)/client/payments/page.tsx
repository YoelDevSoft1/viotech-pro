"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Package, Calendar, AlertCircle, CheckCircle2, Clock, Loader2, Phone, Search, Filter } from "lucide-react";
import { getAccessToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function ClientPaymentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { services, loading: servicesLoading, error: servicesError, refresh: refreshServices } = useServices();
  const [catalogLoading, setCatalogLoading] = useState(false);
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
        
        // Asegurar que siempre sea un array
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
        // En caso de error, establecer array vacío
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

  const handleCheckoutSuccess = (serviceName?: string) => {
    setCheckoutOpen(false);
    setSelectedPlan(null);
    
    // Invalidar y refrescar servicios sin recargar la página
    queryClient.invalidateQueries({ queryKey: ["services"] });
    refreshServices();
    
    // Toast de éxito con acción
    toast.success(
      serviceName 
        ? `¡Pago procesado exitosamente! Tu servicio ${serviceName} está activo.`
        : "¡Pago procesado exitosamente! Tu servicio está activo.",
      {
        action: {
          label: "Ver Servicios",
          onClick: () => {
            // Scroll suave a la sección de servicios activos
            document.getElementById("active-services")?.scrollIntoView({ behavior: "smooth" });
          },
        },
      }
    );
  };

  const getServiceStatusBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "activo":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Activo</Badge>;
      case "expirado":
        return <Badge variant="destructive">Expirado</Badge>;
      case "pendiente":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pendiente</Badge>;
      default:
        return <Badge variant="outline">{estado || "Desconocido"}</Badge>;
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <CreditCard className="h-8 w-8" />
              {tSidebar("payments")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {tServices("payments.pageDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* Servicios Activos */}
      <section id="active-services">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {tServices("payments.myServices.title")}
            </CardTitle>
            <CardDescription>
              {tServices("payments.myServices.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {servicesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : servicesError ? (
              <div className="flex items-center gap-3 p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm text-red-500 font-medium">{servicesError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => refreshServices()}
                  >
                    {tCommon("retry")}
                  </Button>
                </div>
              </div>
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
                      // TODO: Implementar agendamiento de llamada
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

                  return (
                    <Card key={service.id} className="border-border/70">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold">{service.nombre}</h3>
                              {getServiceStatusBadge(service.estado)}
                            </div>
                            
                            {service.tipo && (
                              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                                {service.tipo}
                              </p>
                            )}

                            {/* Información agrupada visualmente */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                              {service.fecha_compra && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">{tServices("payments.myServices.purchased")}</p>
                                    <p className="text-sm font-medium">{new Date(service.fecha_compra).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              )}
                              {service.fecha_expiracion && (
                                <div className={`flex items-center gap-2 ${isExpiringSoon || isExpired ? "text-red-600" : ""}`}>
                                  <Clock className={`h-4 w-4 ${isExpiringSoon || isExpired ? "text-red-600" : "text-muted-foreground"}`} />
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      {isExpired ? tServices("payments.myServices.expired") : tServices("payments.myServices.expires")}
                                    </p>
                                    <p className={`text-sm font-medium ${isExpiringSoon || isExpired ? "text-red-600" : ""}`}>
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
                                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">{tServices("payments.myServices.price")}</p>
                                    <p className="text-sm font-medium">{formatPrice(service.precio, "COP")}</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Alerta de urgencia mejorada */}
                            {isExpiringSoon && (
                              <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                                daysLeft && daysLeft <= 7 
                                  ? "bg-red-500/10 border-red-500/30" 
                                  : "bg-yellow-500/10 border-yellow-500/20"
                              }`}>
                                <AlertCircle className={`h-4 w-4 ${daysLeft && daysLeft <= 7 ? "text-red-600" : "text-yellow-600"}`} />
                                <p className={`text-sm font-medium ${daysLeft && daysLeft <= 7 ? "text-red-600" : "text-yellow-600"}`}>
                                  {tServices("payments.myServices.expiringSoon")}
                                </p>
                              </div>
                            )}
                            {isExpired && (
                              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <p className="text-sm font-medium text-red-600">
                                  {tServices("payments.myServices.expired")}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            {isExpired && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  // Buscar el plan en el catálogo para renovar
                                  const plan = Array.isArray(catalog) ? catalog.find(p => p.nombre === service.nombre) : undefined;
                                  if (plan) {
                                    handlePurchase(plan);
                                  }
                                }}
                              >
                                {tServices("payments.myServices.renew")}
                              </Button>
                            )}
                            {isExpiringSoon && (
                              <Button
                                variant={daysLeft && daysLeft <= 7 ? "default" : "outline"}
                                size="sm"
                                className={daysLeft && daysLeft <= 7 ? "bg-red-600 hover:bg-red-700" : ""}
                                onClick={() => {
                                  const plan = Array.isArray(catalog) ? catalog.find(p => p.nombre === service.nombre) : undefined;
                                  if (plan) {
                                    handlePurchase(plan);
                                  }
                                }}
                              >
                                {tServices("payments.myServices.renewNow")}
                              </Button>
                            )}
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
            <CardTitle>{tServices("payments.catalog.title")}</CardTitle>
            <CardDescription>
              {tServices("payments.catalog.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {catalogLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
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
                    icon={Package}
                    title={tServices("emptyStates.noActiveServices.title")}
                    description={tServices("emptyStates.noActiveServices.description")}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCatalog.map((plan) => (
                  <Card key={plan.id} className="border-border/70 hover:border-border transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg">{plan.nombre}</CardTitle>
                      <CardDescription className="uppercase tracking-wide">
                        {plan.tipo}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">
                          {formatPrice(plan.precio, plan.currency)}
                        </span>
                      </div>
                      
                      {plan.features && plan.features.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">{tServices("payments.catalog.features")}:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {plan.features.slice(0, 3).map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button
                        className="w-full"
                        onClick={() => handlePurchase(plan)}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {tServices("payments.catalog.buyNow")}
                      </Button>
                    </CardContent>
                  </Card>
                    ))}
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

