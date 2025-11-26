"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  XCircle,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  const message = searchParams.get("message");
  const reference = searchParams.get("reference");

  const handleRetry = () => {
    setRetrying(true);
    // Volver al catálogo para intentar nuevamente
    setTimeout(() => {
      router.push("/services/catalog");
    }, 500);
  };

  return (
    <main className="min-h-screen bg-background px-6 py-24">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-3xl border border-border/70 bg-background/70 p-12 space-y-8 text-center">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-red-500/10 p-6">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl font-medium text-foreground mb-2">
              Error en el Pago
            </h1>
            <p className="text-muted-foreground">
              No se pudo procesar tu pago correctamente
            </p>
          </div>

          {/* Error Message */}
          {message && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
              <p className="text-sm text-red-500 font-medium mb-1">
                Detalles del error:
              </p>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          )}

          {/* Reference */}
          {reference && (
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-6 space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Referencia
              </p>
              <p className="text-sm font-mono text-foreground">{reference}</p>
            </div>
          )}

          {/* Common Reasons */}
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-6 text-left space-y-3">
            <p className="text-sm font-medium text-foreground mb-3">
              Posibles causas:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span>Fondos insuficientes en la tarjeta</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span>Tarjeta bloqueada o expirada</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span>Datos de pago incorrectos</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span>Problema temporal con la pasarela de pagos</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:scale-105 transition-transform disabled:opacity-60"
            >
              {retrying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirigiendo...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Intentar Nuevamente
                </>
              )}
            </button>
            <Link
              href="/services/catalog"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Catálogo
            </Link>
          </div>

          {/* Support */}
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-3">
              Si el problema persiste, contáctanos:
            </p>
            <div className="flex gap-3 justify-center">
              <a
                href="https://wa.link/1r4ul7"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors"
              >
                Soporte WhatsApp
              </a>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors"
              >
                Crear Ticket
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentErrorPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background px-6 py-24">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              Cargando...
            </div>
          </div>
        </main>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}

