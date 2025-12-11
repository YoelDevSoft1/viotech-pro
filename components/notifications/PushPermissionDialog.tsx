"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bell,
  MessageSquare,
  FolderKanban,
  Ticket,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PushPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Contexto que dispara el diálogo (para analytics) */
  trigger?: "onboarding" | "first_ticket" | "settings" | "manual";
  /** Callback después de que el usuario toma una decisión */
  onComplete?: (result: "granted" | "denied" | "dismissed") => void;
}

type DialogStep = "benefits" | "requesting" | "success" | "denied" | "blocked";

export function PushPermissionDialog({
  open,
  onOpenChange,
  trigger = "manual",
  onComplete,
}: PushPermissionDialogProps) {
  const [step, setStep] = useState<DialogStep>("benefits");
  const {
    isSupported,
    permission,
    subscribe,
    isLoading,
  } = usePushNotifications();
  const t = useTranslationsSafe("pushPermission");

  // Reset step cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      if (permission === "denied") {
        setStep("blocked");
      } else {
        setStep("benefits");
      }
    }
  }, [open, permission]);

  const handleEnableClick = async () => {
    setStep("requesting");
    
    try {
      await subscribe();
      
      // Verificar resultado
      if (Notification.permission === "granted") {
        setStep("success");
        onComplete?.("granted");
        // Auto-cerrar después de 2 segundos
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
      } else if (Notification.permission === "denied") {
        setStep("denied");
        onComplete?.("denied");
      }
    } catch {
      setStep("denied");
      onComplete?.("denied");
    }
  };

  const handleDismiss = () => {
    onComplete?.("dismissed");
    onOpenChange(false);
  };

  const benefits = [
    {
      icon: Ticket,
      title: t("benefits.tickets.title"),
      description: t("benefits.tickets.description"),
    },
    {
      icon: MessageSquare,
      title: t("benefits.mentions.title"),
      description: t("benefits.mentions.description"),
    },
    {
      icon: FolderKanban,
      title: t("benefits.projects.title"),
      description: t("benefits.projects.description"),
    },
  ];

  // Si no soporta push, no mostrar nada
  if (!isSupported) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {/* Step: Beneficios */}
          {step === "benefits" && (
            <motion.div
              key="benefits"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Bell className="h-7 w-7 text-primary" />
                </div>
                <DialogTitle className="text-xl">
                  {t("title")}
                </DialogTitle>
                <DialogDescription className="text-center">
                  {t("subtitle")}
                </DialogDescription>
              </DialogHeader>

              <div className="my-6 space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <benefit.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{benefit.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <Button
                  onClick={handleEnableClick}
                  className="w-full"
                  size="lg"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  {t("enableButton")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDismiss}
                  className="w-full text-muted-foreground"
                >
                  {t("dismissButton")}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {/* Step: Solicitando permiso */}
          {step === "requesting" && (
            <motion.div
              key="requesting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-8 text-center"
            >
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">
                {t("requesting")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("requestingHint")}
              </p>
            </motion.div>
          )}

          {/* Step: Éxito */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
              </motion.div>
              <h3 className="mt-4 text-lg font-semibold">{t("success.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("success.description")}
              </p>
            </motion.div>
          )}

          {/* Step: Denegado (primera vez) */}
          {step === "denied" && (
            <motion.div
              key="denied"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <DialogHeader className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                  <AlertTriangle className="h-7 w-7 text-yellow-600" />
                </div>
                <DialogTitle>{t("denied.title")}</DialogTitle>
                <DialogDescription className="text-center">
                  {t("denied.description")}
                </DialogDescription>
              </DialogHeader>

              <Alert className="my-4">
                <AlertDescription className="text-xs">
                  {t("denied.howToEnable")}
                </AlertDescription>
              </Alert>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  className="w-full"
                >
                  {t("denied.understood")}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {/* Step: Bloqueado (permiso ya denegado previamente) */}
          {step === "blocked" && (
            <motion.div
              key="blocked"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <DialogHeader className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                  <XCircle className="h-7 w-7 text-red-600" />
                </div>
                <DialogTitle>{t("blocked.title")}</DialogTitle>
                <DialogDescription className="text-center">
                  {t("blocked.description")}
                </DialogDescription>
              </DialogHeader>

              <div className="my-4 rounded-lg bg-muted p-4">
                <p className="text-xs font-medium mb-2">{t("blocked.steps.title")}</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>{t("blocked.steps.step1")}</li>
                  <li>{t("blocked.steps.step2")}</li>
                  <li>{t("blocked.steps.step3")}</li>
                </ol>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  className="w-full"
                >
                  {t("blocked.close")}
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export default PushPermissionDialog;




