"use client";

import React, { ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

interface ErrorBoundaryUIProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  onReload: () => void;
  onGoHome: () => void;
  variant?: "default" | "auth" | "payment";
}

/**
 * UI component for Error Boundary
 * Separated from class component to allow using hooks (i18n)
 */
export function ErrorBoundaryUI({
  error,
  errorInfo,
  onReset,
  onReload,
  onGoHome,
  variant = "default",
}: ErrorBoundaryUIProps) {
  const tCommon = useTranslationsSafe("common");
  const tError = useTranslationsSafe("common.error.boundary");

  // Obtener textos según la variante
  const getTitle = () => {
    if (variant === "auth") return tError("auth.title");
    if (variant === "payment") return tError("payment.title");
    return tError("title");
  };

  const getDescription = () => {
    if (variant === "auth") return tError("auth.description");
    if (variant === "payment") return tError("payment.description");
    return tError("description");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle>{getTitle()}</CardTitle>
          </div>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && error && (
            <div className="rounded-lg border border-border bg-muted p-4">
              <p className="text-sm font-mono text-destructive mb-2">
                {error.name}: {error.message}
              </p>
              {error.stack && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer mb-2">{tError("stackTrace")}</summary>
                  <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={onReset} variant="default" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              {tError("retry")}
            </Button>
            <Button onClick={onReload} variant="outline" className="w-full">
              {tError("reload")}
            </Button>
            <Button onClick={onGoHome} variant="ghost" className="w-full">
              <Home className="h-4 w-4 mr-2" />
              {tError("goHome")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

