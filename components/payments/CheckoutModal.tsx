"use client";

import { useEffect, useState, useRef } from "react";
import { X, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { createWompiTransaction } from "@/lib/payments";
import type { ServicePlan } from "@/lib/services";
import { formatPrice } from "@/lib/services";
import { logger } from "@/lib/logger";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useModalFocus } from "@/lib/hooks/useModalFocus";

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
  const t = useTranslationsSafe("payment.checkout");
  const tCommon = useTranslationsSafe("common");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetInitialized = useRef(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management
  useModalFocus({
    isOpen,
    onClose,
    modalRef,
    initialFocusRef: closeButtonRef,
    restoreFocus: true,
  });

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

  // Generar IDs únicos para aria attributes
  const modalId = `checkout-modal-${plan.id}`;
  const titleId = `${modalId}-title`;
  const descriptionId = `${modalId}-description`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm px-4"
      onClick={(e) => {
        // Cerrar al hacer click fuera del modal
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-2xl rounded-3xl border border-border bg-background p-8 space-y-6 max-h-[90vh] overflow-y-auto focus:outline-none"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {t("label")}
            </p>
            <h3 id={titleId} className="text-2xl font-medium text-foreground">
              {t("title")}
            </h3>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
            aria-label={tCommon("close")}
          >
            <X className="w-5 h-5" />
            <span className="sr-only">{tCommon("close")}</span>
          </button>
        </div>

        {/* Plan Summary */}
        <div id={descriptionId} className="rounded-2xl border border-border/70 bg-muted/20 p-6 space-y-4">
          <div>
            <h4 className="text-lg font-medium text-foreground mb-1">
              {plan.nombre}
            </h4>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              {plan.tipo}
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <span className="text-sm text-muted-foreground">{t("totalToPay")}</span>
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
              <p className="text-sm font-medium text-red-500">{tCommon("error.occurred")}</p>
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
              {tCommon("retry")}
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {t("preparing")}
            </span>
          </div>
        )}

        {/* Método Redirect (método principal y más confiable) */}
        {!loading && !error && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border/70 bg-muted/20 p-6 space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {t("redirectMessage")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("redirectDescription")}
                </p>
              </div>
              <button
                ref={continueButtonRef}
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError(null);
                    logger.info("Creating payment transaction", {
                      planId: plan.id,
                      planName: plan.nombre,
                      amount: plan.precio,
                      businessEvent: true,
                    });
                    const transaction = await createWompiTransaction(plan.id);
                    logger.info("Payment transaction created successfully", {
                      planId: plan.id,
                      transactionId: transaction.transaction_id,
                      businessEvent: true,
                    });
                    // Redirigir a checkout de Wompi
                    if (transaction.checkout_url) {
                      window.location.href = transaction.checkout_url;
                    } else {
                      throw new Error(t("error.noCheckoutUrl"));
                    }
                  } catch (err: any) {
                    const errorMessage = err.message || t("error.createTransaction");
                    logger.error("Error creating payment transaction", err, {
                      planId: plan.id,
                      planName: plan.nombre,
                      businessEvent: true,
                    });
                    setError(errorMessage);
                    setLoading(false);
                    // Si el error es 422, puede ser un problema de validación
                    if (err.message?.includes('422') || err.message?.includes('Unprocessable')) {
                      setError(t("error.validation"));
                      logger.warn("Payment validation error", {
                        planId: plan.id,
                        error: errorMessage,
                      });
                    }
                    // Notificar callback de error si existe
                    onError?.();
                  }
                }}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("preparingPayment")}
                  </>
                ) : (
                  <>
                    {t("continueToCheckout")}
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
            {t("securePayment")}
          </p>
        </div>
      </div>
    </div>
  );
}

