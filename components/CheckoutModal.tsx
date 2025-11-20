"use client";

import { useEffect, useState, useRef } from "react";
import { X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { prepareWompiWidget, type WompiWidgetData } from "@/lib/payments";
import type { ServicePlan } from "@/lib/services";
import { formatPrice } from "@/lib/services";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: ServicePlan;
  onSuccess?: () => void;
  onError?: () => void;
}

declare global {
  interface Window {
    WompiWidget?: (config: any) => void;
  }
}

export default function CheckoutModal({
  isOpen,
  onClose,
  plan,
  onSuccess,
  onError,
}: CheckoutModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [widgetData, setWidgetData] = useState<WompiWidgetData | null>(null);
  const widgetInitialized = useRef(false);

  // Cargar script de Wompi
  useEffect(() => {
    if (!isOpen) return;

    const script = document.createElement("script");
    script.src = "https://checkout.wompi.co/widget.js";
    script.async = true;
    script.id = "wompi-widget-script";

    // Verificar si ya existe
    if (document.getElementById("wompi-widget-script")) {
      return;
    }

    document.body.appendChild(script);

    return () => {
      const existing = document.getElementById("wompi-widget-script");
      if (existing) {
        document.body.removeChild(existing);
      }
    };
  }, [isOpen]);

  // Preparar datos del widget
  useEffect(() => {
    if (!isOpen || widgetInitialized.current) return;

    const prepareCheckout = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await prepareWompiWidget(plan.id);
        setWidgetData(data);
        widgetInitialized.current = true;
      } catch (err: any) {
        console.error("Error preparing checkout:", err);
        setError(err.message || "Error al preparar el pago");
      } finally {
        setLoading(false);
      }
    };

    prepareCheckout();
  }, [isOpen, plan.id]);

  // Inicializar widget cuando los datos estén listos
  useEffect(() => {
    if (!widgetData || !isOpen) return;

    // Esperar a que el script de Wompi esté cargado
    const checkWompiLoaded = setInterval(() => {
      if (window.WompiWidget) {
        clearInterval(checkWompiLoaded);
        
        try {
          // Limpiar contenedor anterior si existe
          const container = document.getElementById('wompi-widget-container');
          if (container) {
            container.innerHTML = '';
          }

          // Inicializar widget de Wompi
          window.WompiWidget({
            publicKey: widgetData.publicKey,
            currency: widgetData.currency,
            amountInCents: widgetData.amountInCents,
            reference: widgetData.reference,
            signature: widgetData.signature,
            customerEmail: widgetData.customerEmail,
            customerFullName: widgetData.customerFullName,
            redirectUrl: widgetData.redirectUrl,
            container: 'wompi-widget-container', // ID del contenedor donde se renderizará
            onSuccess: (transaction: any) => {
              console.log("Pago exitoso:", transaction);
              onSuccess?.();
              router.push(
                `/payment/success?reference=${widgetData.reference}&transaction_id=${transaction.id || transaction.transaction_id || ''}`
              );
            },
            onError: (error: any) => {
              console.error("Error en pago:", error);
              const errorMessage = error?.message || error?.error || "Error al procesar el pago";
              setError(errorMessage);
              onError?.();
            },
          });
        } catch (err: any) {
          console.error("Error initializing Wompi widget:", err);
          setError("Error al inicializar el widget de pago");
        }
      }
    }, 100);

    // Timeout después de 10 segundos
    setTimeout(() => {
      clearInterval(checkWompiLoaded);
      if (!window.WompiWidget) {
        setError("No se pudo cargar el widget de Wompi. Por favor recarga la página.");
      }
    }, 10000);

    return () => {
      clearInterval(checkWompiLoaded);
    };
  }, [widgetData, isOpen, router, onSuccess, onError]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-background p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Checkout
            </p>
            <h3 className="text-2xl font-medium text-foreground">
              Completar Pago
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Summary */}
        <div className="rounded-2xl border border-border/70 bg-muted/20 p-6 space-y-4">
          <div>
            <h4 className="text-lg font-medium text-foreground mb-1">
              {plan.nombre}
            </h4>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              {plan.tipo}
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <span className="text-sm text-muted-foreground">Total a pagar</span>
            <span className="text-2xl font-medium text-foreground">
              {formatPrice(plan.precio, plan.currency)}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-500">Error</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                widgetInitialized.current = false;
                setWidgetData(null);
              }}
              className="px-4 py-2 rounded-lg border border-red-500/50 text-red-500 text-sm font-medium hover:bg-red-500/10 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Preparando checkout...
            </span>
          </div>
        )}

        {/* Wompi Widget Container */}
        {widgetData && !loading && !error && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground mb-2">
                Completa el pago usando el formulario de Wompi:
              </p>
              {/* El widget de Wompi se renderizará aquí automáticamente */}
              <div id="wompi-widget-container" className="min-h-[400px]" />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Al completar el pago, serás redirigido automáticamente a la página
              de confirmación.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            Pago seguro procesado por Wompi. Tus datos están protegidos.
          </p>
        </div>
      </div>
    </div>
  );
}

