"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "@/lib/logger";
import { ErrorBoundaryUI } from "./ErrorBoundaryUI";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  variant?: "default" | "auth" | "payment";
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * 
 * Captura errores de JavaScript en cualquier parte del árbol de componentes,
 * registra esos errores y muestra una UI de fallback.
 * 
 * Uso:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Actualizar el estado para que la próxima renderización muestre la UI de fallback
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Registrar el error con logger
    logger.error(
      "React Error Boundary caught an error",
      error,
      {
        componentStack: errorInfo.componentStack,
        route: typeof window !== "undefined" ? window.location.pathname : undefined,
        variant: this.props.variant || "default",
      }
    );

    // Enviar a Sentry si está disponible
    if (typeof window !== "undefined") {
      try {
        // Importar Sentry dinámicamente (solo si está instalado)
        // Usar tipo any para evitar errores de TypeScript si no está instalado
        const SentryModule = await import("@sentry/nextjs" as string).catch(() => null);
        if (SentryModule && typeof SentryModule === 'object' && 'captureException' in SentryModule) {
          const Sentry = SentryModule as any;
          Sentry.captureException(error, {
            tags: {
              errorBoundary: true,
              variant: this.props.variant || "default",
            },
            contexts: {
              react: {
                componentStack: errorInfo.componentStack,
              },
            },
            extra: {
              route: window.location.pathname,
              variant: this.props.variant || "default",
            },
          });
        }
      } catch {
        // Sentry no está disponible, continuar normalmente
      }
    }

    // Llamar callback opcional
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
  };

  render() {
    if (this.state.hasError) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de fallback usando componente con i18n
      // Usamos ErrorBoundaryWrapper para poder usar hooks dentro
      return (
        <ErrorBoundaryWrapper
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
          variant={this.props.variant || "default"}
        />
      );
    }

    return this.props.children;
  }
}

// Wrapper funcional para poder usar hooks (i18n) en la UI
function ErrorBoundaryWrapper({
  error,
  errorInfo,
  onReset,
  onReload,
  onGoHome,
  variant,
}: {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  onReload: () => void;
  onGoHome: () => void;
  variant?: "default" | "auth" | "payment";
}) {
  return (
    <ErrorBoundaryUI
      error={error}
      errorInfo={errorInfo}
      onReset={onReset}
      onReload={onReload}
      onGoHome={onGoHome}
      variant={variant}
    />
  );
}

