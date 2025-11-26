"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Package,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { getAccessToken, logout, refreshAccessToken, isTokenExpired } from "@/lib/auth";
import {
  fetchServiceCatalog,
  type ServicePlan,
  formatPrice,
} from "@/lib/services";
import CheckoutModal from "@/components/CheckoutModal";

export default function CatalogPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Verificar autenticación
      let token = getAccessToken();
      if (!token) {
        router.replace("/login?from=/services/catalog");
        return;
      }

      if (isTokenExpired(token)) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          token = newToken;
        } else {
          await logout();
          router.replace("/login?from=/services/catalog&reason=token_expired");
          return;
        }
      }

      const data = await fetchServiceCatalog();
      setPlans(data);
    } catch (err: any) {
      console.error("Error fetching catalog:", err);
      setError(err.message || "Error al cargar catálogo de servicios");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const handleBuyClick = (plan: ServicePlan) => {
    setSelectedPlan(plan);
    setCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
    setCheckoutOpen(false);
    setSelectedPlan(null);
    // Redirigir a servicios después de pago exitoso
    router.push("/services?payment=success");
  };

  const handleCheckoutError = () => {
    setCheckoutOpen(false);
    // Mantener plan seleccionado para reintentar
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando catálogo...
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-background px-6 py-24">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Servicios
            </Link>
            <div>
              <h1 className="text-3xl font-medium text-foreground">
                Catálogo de Servicios
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Elige el servicio que mejor se adapte a tus necesidades
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-500">Error</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <button
                onClick={fetchCatalog}
                className="ml-auto px-4 py-2 rounded-lg border border-red-500/50 text-red-500 text-sm font-medium hover:bg-red-500/10 transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Plans Grid */}
          {plans.length === 0 ? (
            <div className="rounded-3xl border border-border/70 bg-muted/20 p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No hay servicios disponibles
              </h3>
              <p className="text-sm text-muted-foreground">
                Por favor contacta a soporte para más información
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan, index) => {
                const isPopular = index === 1; // Segundo plan es "popular"

                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl border p-6 space-y-6 relative ${
                      isPopular
                        ? "border-primary/50 bg-primary/5 scale-105"
                        : "border-border/70 bg-background/70"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                          <Sparkles className="w-3 h-3" />
                          Más Popular
                        </span>
                      </div>
                    )}

                    {/* Header */}
                    <div>
                      <h3 className="text-xl font-medium text-foreground mb-2">
                        {plan.nombre}
                      </h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {plan.tipo}
                      </p>
                    </div>

                    {/* Price */}
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-medium text-foreground">
                          {formatPrice(plan.precio, plan.currency)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Válido por {plan.durationDays} días
                      </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground">
                        Incluye:
                      </p>
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => handleBuyClick(plan)}
                      className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-transform ${
                        isPopular
                          ? "bg-foreground text-background hover:scale-105"
                          : "border border-border text-foreground hover:bg-muted/30"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Comprar Ahora
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Info */}
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-6">
            <h3 className="text-sm font-medium text-foreground mb-2">
              ¿Necesitas ayuda para elegir?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Nuestro equipo está listo para ayudarte a encontrar el servicio
              perfecto para tu negocio.
            </p>
            <div className="flex gap-3">
              <a
                href="https://wa.link/1r4ul7"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors"
              >
                Contactar por WhatsApp
              </a>
              <a
                href="https://calendly.com/viotech/demo"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:scale-105 transition-transform"
              >
                Agendar Demo
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Checkout Modal */}
      {selectedPlan && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => {
            setCheckoutOpen(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          onSuccess={handleCheckoutSuccess}
          onError={handleCheckoutError}
        />
      )}
    </>
  );
}

