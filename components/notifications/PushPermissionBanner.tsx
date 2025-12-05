"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";
import { cn } from "@/lib/utils";

/**
 * Props para el componente PushPermissionBanner
 */
interface PushPermissionBannerProps {
  /** Variante de presentación */
  variant?: "banner" | "modal" | "inline" | "compact";
  /** Si se puede cerrar */
  dismissible?: boolean;
  /** Callback cuando se cierra */
  onDismiss?: () => void;
  /** Callback cuando se suscribe exitosamente */
  onSubscribed?: () => void;
  /** Mostrar solo si nunca se ha pedido permiso */
  showOnlyOnPrompt?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente para solicitar permisos de notificaciones push
 * 
 * @example
 * ```tsx
 * // Banner flotante
 * <PushPermissionBanner variant="banner" dismissible />
 * 
 * // Modal
 * <PushPermissionBanner variant="modal" />
 * 
 * // Inline en settings
 * <PushPermissionBanner variant="inline" />
 * ```
 */
export function PushPermissionBanner({
  variant = "banner",
  dismissible = true,
  onDismiss,
  onSubscribed,
  showOnlyOnPrompt = false,
  className,
}: PushPermissionBannerProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const [isDismissed, setIsDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Verificar localStorage para no mostrar si ya se descartó
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("push-banner-dismissed");
      if (dismissed === "true") {
        setIsDismissed(true);
      }
    }
  }, []);

  // Cerrar modal si se suscribe exitosamente
  useEffect(() => {
    if (isSubscribed && showModal) {
      setShowModal(false);
      onSubscribed?.();
    }
  }, [isSubscribed, showModal, onSubscribed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("push-banner-dismissed", "true");
    onDismiss?.();
  };

  const handleSubscribe = async () => {
    await subscribe();
    if (variant === "modal") {
      setShowModal(false);
    }
  };

  // No mostrar si:
  // - No soportado
  // - Ya suscrito
  // - Ya descartado
  // - Solo mostrar en prompt y no es prompt
  if (!isSupported) return null;
  if (isSubscribed && variant !== "inline") return null;
  if (isDismissed && variant !== "inline" && variant !== "modal") return null;
  if (showOnlyOnPrompt && permission !== "prompt") return null;

  // Si el permiso está denegado, mostrar mensaje de ayuda
  if (permission === "denied") {
    if (variant === "inline") {
      return (
        <Alert variant="destructive" className={className}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Notificaciones bloqueadas</AlertTitle>
          <AlertDescription>
            Has bloqueado las notificaciones push. Para habilitarlas, ve a la configuración de tu
            navegador y permite las notificaciones para este sitio.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  }

  // Variante modal
  if (variant === "modal") {
    return (
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Activar notificaciones push
            </DialogTitle>
            <DialogDescription>
              Recibe notificaciones instantáneas sobre actualizaciones de tickets, proyectos y
              alertas importantes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Actualizaciones en tiempo real</p>
                <p className="text-xs text-muted-foreground">
                  Entérate inmediatamente de cambios en tus tickets
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Alertas importantes</p>
                <p className="text-xs text-muted-foreground">
                  Recibe avisos de SLA y eventos críticos
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Control total</p>
                <p className="text-xs text-muted-foreground">
                  Puedes desactivarlas en cualquier momento
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={isLoading}>
              Ahora no
            </Button>
            <Button onClick={handleSubscribe} disabled={isLoading}>
              {isLoading ? "Activando..." : "Activar notificaciones"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Variante inline (para settings)
  if (variant === "inline") {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isSubscribed ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <BellOff className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="font-medium text-sm">
                  {isSubscribed ? "Notificaciones activas" : "Notificaciones desactivadas"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isSubscribed
                    ? "Recibirás notificaciones push en este dispositivo"
                    : "Activa las notificaciones para no perderte nada"}
                </p>
              </div>
            </div>
            <Button
              variant={isSubscribed ? "outline" : "default"}
              size="sm"
              onClick={isSubscribed ? unsubscribe : handleSubscribe}
              disabled={isLoading}
            >
              {isLoading
                ? "..."
                : isSubscribed
                  ? "Desactivar"
                  : "Activar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Variante compact (para usar en sidebar o header)
  if (variant === "compact") {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn("gap-2", className)}
        onClick={handleSubscribe}
        disabled={isLoading}
      >
        <Bell className="h-4 w-4" />
        {isLoading ? "..." : "Activar notificaciones"}
      </Button>
    );
  }

  // Variante banner (default) - Banner flotante en la parte inferior
  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md",
        "animate-in slide-in-from-bottom-5 duration-300",
        className
      )}
    >
      <Card className="shadow-lg border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">¿Activar notificaciones?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Recibe alertas sobre tickets, proyectos y actualizaciones importantes.
                  </p>
                </div>
                {dismissible && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={handleDismiss}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Cerrar</span>
                  </Button>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleSubscribe} disabled={isLoading}>
                  {isLoading ? "Activando..." : "Activar"}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss}>
                  No, gracias
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Hook para mostrar el modal de push notifications programáticamente
 */
export function usePushPermissionModal() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const Modal = () => (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <PushPermissionBannerContent onClose={closeModal} />
      </DialogContent>
    </Dialog>
  );

  return { openModal, closeModal, Modal };
}

/**
 * Contenido interno del banner/modal (para reutilizar)
 */
function PushPermissionBannerContent({ onClose }: { onClose?: () => void }) {
  const { isLoading, subscribe } = usePushNotifications();

  const handleSubscribe = async () => {
    await subscribe();
    onClose?.();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Activar notificaciones push
        </DialogTitle>
        <DialogDescription>
          Recibe notificaciones instantáneas sobre actualizaciones de tickets, proyectos y alertas
          importantes.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 py-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Actualizaciones en tiempo real</p>
            <p className="text-xs text-muted-foreground">
              Entérate inmediatamente de cambios en tus tickets
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Alertas importantes</p>
            <p className="text-xs text-muted-foreground">Recibe avisos de SLA y eventos críticos</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Control total</p>
            <p className="text-xs text-muted-foreground">
              Puedes desactivarlas en cualquier momento
            </p>
          </div>
        </div>
      </div>

      <DialogFooter className="flex-col sm:flex-row gap-2">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Ahora no
        </Button>
        <Button onClick={handleSubscribe} disabled={isLoading}>
          {isLoading ? "Activando..." : "Activar notificaciones"}
        </Button>
      </DialogFooter>
    </>
  );
}

