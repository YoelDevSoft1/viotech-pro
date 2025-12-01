"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { fetchUserServices } from "@/lib/services";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [serviceActivated, setServiceActivated] = useState(false);
  const tPayment = useTranslationsSafe("payment.success");

  const reference = searchParams.get("reference");
  const transactionId = searchParams.get("transaction_id");

  useEffect(() => {
    // Verificar si el servicio se activó correctamente
    const checkService = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          router.replace("/login?from=/payment/success");
          return;
        }

        // Esperar un momento para que el webhook procese
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const services = await fetchUserServices();
        // Buscar servicio con referencia o transaction_id
        const activatedService = services.find(
          (s) =>
            s.transaccion_id_wompi === transactionId ||
            (s.detalles &&
              (s.detalles.wompi_reference === reference ||
                s.detalles.wompi_transaction_id === transactionId))
        );

        if (activatedService && activatedService.estado === "activo") {
          setServiceActivated(true);
        }
      } catch (error) {
        console.error("Error checking service:", error);
      } finally {
        setLoading(false);
      }
    };

    if (reference || transactionId) {
      checkService();
    } else {
      setLoading(false);
    }
  }, [reference, transactionId, router]);

  return (
    <main className="min-h-screen bg-background px-6 py-24">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-3xl border border-border/70 bg-background/70 p-12 space-y-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-500/10 p-6">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl font-medium text-foreground mb-2">
              {tPayment("title")}
            </h1>
            <p className="text-muted-foreground">
              {tPayment("description")}
            </p>
          </div>

          {/* Details */}
          {reference && (
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-6 space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {tPayment("transactionReference")}
              </p>
              <p className="text-sm font-mono text-foreground">{reference}</p>
              {transactionId && (
                <>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mt-4">
                    {tPayment("transactionId")}
                  </p>
                  <p className="text-sm font-mono text-foreground">
                    {transactionId}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Service Status */}
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">{tPayment("verifying")}</span>
            </div>
          ) : serviceActivated ? (
            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-green-500">
                  {tPayment("serviceActivated")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tPayment("serviceActivatedDescription")}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-yellow-500">
                  {tPayment("processingActivation")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tPayment("processingActivationDescription")}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              href="/services"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:scale-105 transition-transform"
            >
              <Package className="w-4 h-4" />
              {tPayment("viewMyServices")}
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors"
            >
              {tPayment("goToDashboard")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Info */}
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              {tPayment("emailInfo")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function LoadingFallback() {
  const tPayment = useTranslationsSafe("payment.success");
  
  return (
    <main className="min-h-screen bg-background px-6 py-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{tPayment("loading")}</span>
        </div>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  );
}

