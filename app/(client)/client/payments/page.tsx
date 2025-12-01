"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Package, Calendar, AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";
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

export default function ClientPaymentsPage() {
  const router = useRouter();
  const { services, loading: servicesLoading, error: servicesError } = useServices();
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalog, setCatalog] = useState<ServicePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const t = useTranslationsSafe();

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
        const rawData = Array.isArray(data) ? data : (data?.data || []);
        setCatalog(rawData);
      } catch (error) {
        console.error("Error cargando catálogo:", error);
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

  const handleCheckoutSuccess = () => {
    setCheckoutOpen(false);
    setSelectedPlan(null);
    // Recargar servicios después de pago exitoso
    window.location.reload();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("common.backToDashboard") || "Volver al Dashboard"}
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <CreditCard className="h-8 w-8" />
              {t("sidebar.payments") || "Pagos"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona tus pagos y servicios activos
            </p>
          </div>
        </div>
      </div>

      {/* Servicios Activos */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Mis Servicios Activos
            </CardTitle>
            <CardDescription>
              Servicios que has adquirido y su estado de pago
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
                <p className="text-sm text-red-500">{servicesError}</p>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  No tienes servicios activos. Explora el catálogo para adquirir uno.
                </p>
              </div>
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

                            <div className="flex items-center gap-6 text-sm">
                              {service.fecha_compra && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>Comprado: {new Date(service.fecha_compra).toLocaleDateString()}</span>
                                </div>
                              )}
                              {service.fecha_expiracion && (
                                <div className={`flex items-center gap-2 ${isExpiringSoon || isExpired ? "text-yellow-600" : "text-muted-foreground"}`}>
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    {isExpired
                                      ? "Expirado"
                                      : isExpiringSoon
                                      ? `Expira en ${daysLeft} días`
                                      : `Expira: ${new Date(service.fecha_expiracion).toLocaleDateString()}`}
                                  </span>
                                </div>
                              )}
                              {service.precio && (
                                <div className="text-muted-foreground">
                                  {formatPrice(service.precio, "COP")}
                                </div>
                              )}
                            </div>

                            {isExpiringSoon && (
                              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                <p className="text-sm text-yellow-600">
                                  Tu servicio expira pronto. Considera renovarlo.
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
                                  const plan = catalog.find(p => p.nombre === service.nombre);
                                  if (plan) {
                                    handlePurchase(plan);
                                  }
                                }}
                              >
                                Renovar
                              </Button>
                            )}
                            {isExpiringSoon && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const plan = catalog.find(p => p.nombre === service.nombre);
                                  if (plan) {
                                    handlePurchase(plan);
                                  }
                                }}
                              >
                                Renovar Ahora
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
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Catálogo de Servicios</CardTitle>
            <CardDescription>
              Explora y adquiere nuevos servicios
            </CardDescription>
          </CardHeader>
          <CardContent>
            {catalogLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : catalog.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  No hay servicios disponibles en el catálogo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catalog.map((plan) => (
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
                          <p className="text-xs font-medium text-muted-foreground">Características:</p>
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
                        Comprar Ahora
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
}

