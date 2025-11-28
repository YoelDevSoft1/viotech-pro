"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Sparkles, AlertCircle, Loader2 } from "lucide-react";

import { apiClient } from "@/lib/apiClient";
import { formatPrice } from "@/lib/services"; // Tu helper existente
import { PageShell } from "@/components/ui/shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import CheckoutModal from "@/components/CheckoutModal"; // Mantenemos el legacy por ahora

// Tipos locales (o mover a @/lib/types/services.ts)
type ServicePlan = {
  id: string;
  nombre: string;
  tipo: string;
  precio: number;
  currency: string;
  durationDays: number;
  features: string[];
};

export default function CatalogPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // React Query para el catálogo
  const { data: plans = [], isLoading, isError, error } = useQuery({
    queryKey: ["catalog"],
    queryFn: async () => {
      const { data } = await apiClient.get("/services/catalog");
      return (data?.data || data || []) as ServicePlan[];
    },
    staleTime: 1000 * 60 * 30, // Catálogo fresco por 30 mins
  });

  const handleBuy = (plan: ServicePlan) => {
    // Aquí podrías validar auth antes de abrir modal
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  return (
    <PageShell>
      <div className="flex flex-col gap-8 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <Link href="/services" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Mis Servicios
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight">Catálogo de Servicios</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Elige el plan perfecto para escalar tu infraestructura tecnológica con soporte premium.
          </p>
        </div>

        {/* Error State */}
        {isError && (
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {(error as Error)?.message || "No se pudo cargar el catálogo."}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Plans Grid */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, idx) => {
              const isPopular = idx === 1; // Lógica simple para destacar el del medio
              return (
                <Card 
                  key={plan.id} 
                  className={`flex flex-col relative transition-all duration-200 ${
                    isPopular 
                      ? "border-primary shadow-lg scale-105 z-10" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground hover:bg-primary px-3">
                        <Sparkles className="w-3 h-3 mr-1" /> Más Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="text-xl">{plan.nombre}</CardTitle>
                    <CardDescription className="uppercase text-xs font-bold tracking-wider">
                      {plan.tipo}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        {formatPrice(plan.precio, plan.currency)}
                      </span>
                      {plan.durationDays > 0 && (
                        <span className="text-sm text-muted-foreground">
                          / {plan.durationDays} días
                        </span>
                      )}
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <Check className="h-5 w-5 text-primary shrink-0" />
                          <span className="leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button 
                      className="w-full" 
                      size="lg" 
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => handleBuy(plan)}
                    >
                      Contratar Ahora
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Checkout Modal Integration */}
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