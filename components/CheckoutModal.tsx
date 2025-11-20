"use client";

import { useEffect, useState, useRef } from "react";
import { X, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { createWompiTransaction } from "@/lib/payments";
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
    Wompi?: any;
    wompi?: any;
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
  const widgetInitialized = useRef(false);

  // Ya no necesitamos cargar el script del widget, usamos redirect directamente

  // Ya no necesitamos preparar datos del widget, usamos create-transaction directamente

  // Reset del estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      widgetInitialized.current = false;
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

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
                setLoading(false);
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

        {/* Método Redirect (método principal y más confiable) */}
        {!loading && !error && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border/70 bg-muted/20 p-6 space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Serás redirigido a la página de pago segura de Wompi
                </p>
                <p className="text-xs text-muted-foreground">
                  Completa el pago en la página de Wompi y serás redirigido automáticamente de vuelta.
                </p>
              </div>
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError(null);
                    console.log("Creando transacción de pago para plan:", plan.id);
                    const transaction = await createWompiTransaction(plan.id);
                    console.log("Transacción creada exitosamente:", transaction);
                    // Redirigir a checkout de Wompi
                    if (transaction.checkout_url) {
                      window.location.href = transaction.checkout_url;
                    } else {
                      throw new Error("No se recibió URL de checkout de Wompi");
                    }
                  } catch (err: any) {
                    console.error("Error creando transacción:", err);
                    const errorMessage = err.message || "Error al crear transacción de pago";
                    setError(errorMessage);
                    setLoading(false);
                    // Si el error es 422, puede ser un problema de validación
                    if (err.message?.includes('422') || err.message?.includes('Unprocessable')) {
                      setError("Error de validación. Por favor verifica que el plan sea válido y que estés autenticado correctamente.");
                    }
                  }
                }}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preparando pago...
                  </>
                ) : (
                  <>
                    Continuar al Checkout de Wompi
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
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

