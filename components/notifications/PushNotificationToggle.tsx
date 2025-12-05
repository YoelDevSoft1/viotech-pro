"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { toast } from "sonner";

/**
 * Componente para activar/desactivar notificaciones push
 * Sprint 3.3 - VioTech Pro
 */
export function PushNotificationToggle() {
  const t = useTranslationsSafe();
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const [isToggling, setIsToggling] = useState(false);

  // Si no está soportado
  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-muted-foreground" />
            {t("notifications.push.title")}
          </CardTitle>
          <CardDescription>
            {t("notifications.push.notSupported")}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Si el permiso fue denegado
  if (permission === "denied") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-red-500" />
            {t("notifications.push.title")}
          </CardTitle>
          <CardDescription>
            {t("notifications.push.permissionDenied")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {t("notifications.push.enableInBrowser")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const handleToggle = async () => {
    if (isLoading || isToggling) return;

    setIsToggling(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
        toast.success(t("notifications.push.disabled"));
      } else {
        // Si el permiso es "prompt", solicitar permiso primero
        if (permission === "prompt") {
          const result = await Notification.requestPermission();
          if (result !== "granted") {
            toast.error(t("notifications.push.permissionRequired"));
            setIsToggling(false);
            return;
          }
        }
        await subscribe();
        toast.success(t("notifications.push.enabled"));
      }
    } catch (err) {
      console.error("Error cambiando suscripción:", err);
      toast.error(t("notifications.push.error"));
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? (
            <Bell className="h-5 w-5 text-green-500" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          {t("notifications.push.title", "Notificaciones Push")}
        </CardTitle>
        <CardDescription>
              {isSubscribed
                ? t("notifications.push.enabledDescription")
                : t("notifications.push.disabledDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {error.message || t("notifications.push.error")}
                </AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-muted-foreground">
              {isSubscribed
                ? t("notifications.push.statusEnabled")
                : t("notifications.push.statusDisabled")}
            </p>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={isLoading || isToggling}
            aria-label={t("notifications.push.toggle")}
          />
        </div>
      </CardContent>
    </Card>
  );
}


