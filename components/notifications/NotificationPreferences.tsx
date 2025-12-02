"use client";

import { useState, useEffect } from "react";
import { Bell, Mail, Smartphone, Volume2, Monitor, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useTestNotification,
} from "@/lib/hooks/useNotificationPreferences";
import type { NotificationType } from "@/lib/types/notifications";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { toast } from "sonner";

// Agrupar tipos de notificación por categoría
const notificationTypeGroups = {
  tickets: [
    "ticket_created",
    "ticket_updated",
    "ticket_assigned",
    "ticket_commented",
    "ticket_status_changed",
  ] as NotificationType[],
  projects: [
    "project_created",
    "project_updated",
    "project_assigned",
  ] as NotificationType[],
  comments: [
    "comment_approved",
    "comment_rejected",
  ] as NotificationType[],
  system: [
    "system",
    "info",
    "warning",
    "error",
  ] as NotificationType[],
};

const typeLabels: Record<NotificationType, string> = {
  ticket_created: "Ticket Creado",
  ticket_updated: "Ticket Actualizado",
  ticket_assigned: "Ticket Asignado",
  ticket_commented: "Comentario en Ticket",
  ticket_status_changed: "Cambio de Estado",
  project_created: "Proyecto Creado",
  project_updated: "Proyecto Actualizado",
  project_assigned: "Proyecto Asignado",
  comment_approved: "Comentario Aprobado",
  comment_rejected: "Comentario Rechazado",
  system: "Sistema",
  info: "Información",
  warning: "Advertencia",
  error: "Error",
};

export function NotificationPreferences() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const testNotification = useTestNotification();
  const tNotifications = useTranslationsSafe("notifications");
  const tCustomization = useTranslationsSafe("customization");

  const [localPreferences, setLocalPreferences] = useState<typeof preferences>(preferences);

  // Sincronizar estado local cuando cambian las preferencias
  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  if (isLoading || !preferences || !localPreferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {tCustomization("notifications")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const handleGlobalChange = (key: keyof typeof preferences, value: boolean) => {
    if (!localPreferences) return;
    const updated: typeof preferences = {
      ...localPreferences,
      [key]: value,
    } as typeof preferences;
    setLocalPreferences(updated);
    updatePreferences.mutate(updated);
  };

  const handleTypeChange = (
    type: NotificationType,
    channel: "email" | "push" | "inApp",
    value: boolean
  ) => {
    if (!localPreferences) return;
    const updated: typeof preferences = {
      ...localPreferences,
      byType: {
        ...localPreferences.byType,
        [type]: {
          ...(localPreferences.byType?.[type] || {}),
          [channel]: value,
        },
      },
    } as typeof preferences;
    setLocalPreferences(updated);
    updatePreferences.mutate(updated);
  };

  const handleDigestChange = (key: string, value: any) => {
    if (!localPreferences) return;
    const updated: typeof preferences = {
      ...localPreferences,
      digest: {
        ...localPreferences.digest,
        [key]: value,
      },
    } as typeof preferences;
    setLocalPreferences(updated);
    updatePreferences.mutate(updated);
  };

  const getTypePreference = (type: NotificationType, channel: "email" | "push" | "inApp") => {
    if (!localPreferences) return false;
    const typePref = localPreferences.byType?.[type];
    if (typePref && typePref[channel] !== undefined) {
      return typePref[channel];
    }
    // Si no hay preferencia específica, usar la global
    return localPreferences[channel] ?? false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {tCustomization("notifications")}
        </CardTitle>
        <CardDescription>
          Configura cómo y cuándo recibir notificaciones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="global" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="global">
              <Settings className="h-4 w-4 mr-2" />
              Global
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <Bell className="h-4 w-4 mr-2" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="projects">
              <Bell className="h-4 w-4 mr-2" />
              Proyectos
            </TabsTrigger>
            <TabsTrigger value="system">
              <Bell className="h-4 w-4 mr-2" />
              Sistema
            </TabsTrigger>
          </TabsList>

          {/* Preferencias Globales */}
          <TabsContent value="global" className="space-y-6">
            {/* Canales Globales */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Canales de Notificación</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-global" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Recibir notificaciones por correo electrónico
                  </p>
                </div>
                <Switch
                  id="email-global"
                  checked={localPreferences?.email ?? false}
                  onCheckedChange={(checked) => handleGlobalChange("email", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-global" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Push Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Notificaciones push en tu dispositivo
                  </p>
                </div>
                <Switch
                  id="push-global"
                  checked={localPreferences?.push ?? false}
                  onCheckedChange={(checked) => handleGlobalChange("push", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="inapp-global" className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    En la Aplicación
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Notificaciones dentro de la plataforma
                  </p>
                </div>
                <Switch
                  id="inapp-global"
                  checked={localPreferences?.inApp ?? false}
                  onCheckedChange={(checked) => handleGlobalChange("inApp", checked)}
                />
              </div>
            </div>

            {/* Preferencias Adicionales */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold">Preferencias Adicionales</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound" className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Sonidos
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Reproducir sonido al recibir notificaciones
                  </p>
                </div>
                <Switch
                  id="sound"
                  checked={localPreferences?.sound ?? false}
                  onCheckedChange={(checked) => handleGlobalChange("sound", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="desktop" className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Notificaciones de Escritorio
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Mostrar notificaciones del sistema operativo
                  </p>
                </div>
                <Switch
                  id="desktop"
                  checked={localPreferences?.desktop ?? false}
                  onCheckedChange={(checked) => handleGlobalChange("desktop", checked)}
                />
              </div>
            </div>

            {/* Email Digest */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold">Resumen por Email</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="digest-enabled">Habilitar Resumen</Label>
                  <p className="text-xs text-muted-foreground">
                    Recibir un resumen de notificaciones no leídas
                  </p>
                </div>
                <Switch
                  id="digest-enabled"
                  checked={localPreferences?.digest?.enabled ?? false}
                  onCheckedChange={(checked) => handleDigestChange("enabled", checked)}
                />
              </div>

              {localPreferences?.digest?.enabled && (
                <div className="space-y-3 pl-4 border-l-2">
                  <div className="space-y-2">
                    <Label htmlFor="digest-frequency">Frecuencia</Label>
                    <Select
                      value={localPreferences?.digest?.frequency ?? "never"}
                      onValueChange={(value) => handleDigestChange("frequency", value)}
                    >
                      <SelectTrigger id="digest-frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diario</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="never">Nunca</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {localPreferences?.digest?.frequency === "daily" && (
                    <div className="space-y-2">
                      <Label htmlFor="digest-time">Hora</Label>
                      <Select
                        value={localPreferences?.digest?.time || "09:00"}
                        onValueChange={(value) => handleDigestChange("time", value)}
                      >
                        <SelectTrigger id="digest-time">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = String(i).padStart(2, "0");
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botón de Prueba */}
            <div className="flex gap-2 border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => testNotification.mutate("inApp")}
                disabled={testNotification.isPending}
              >
                Probar Notificación
              </Button>
            </div>
          </TabsContent>

          {/* Preferencias por Tipo - Tickets */}
          <TabsContent value="tickets" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Configura notificaciones específicas para tickets
            </p>
            {notificationTypeGroups.tickets.map((type) => (
              <div key={type} className="space-y-3 border rounded-lg p-4">
                <h4 className="text-sm font-medium">{typeLabels[type]}</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Email</Label>
                    <Switch
                      checked={getTypePreference(type, "email")}
                      onCheckedChange={(checked) => handleTypeChange(type, "email", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Push</Label>
                    <Switch
                      checked={getTypePreference(type, "push")}
                      onCheckedChange={(checked) => handleTypeChange(type, "push", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">En App</Label>
                    <Switch
                      checked={getTypePreference(type, "inApp")}
                      onCheckedChange={(checked) => handleTypeChange(type, "inApp", checked)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Preferencias por Tipo - Proyectos */}
          <TabsContent value="projects" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Configura notificaciones específicas para proyectos
            </p>
            {notificationTypeGroups.projects.map((type) => (
              <div key={type} className="space-y-3 border rounded-lg p-4">
                <h4 className="text-sm font-medium">{typeLabels[type]}</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Email</Label>
                    <Switch
                      checked={getTypePreference(type, "email")}
                      onCheckedChange={(checked) => handleTypeChange(type, "email", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Push</Label>
                    <Switch
                      checked={getTypePreference(type, "push")}
                      onCheckedChange={(checked) => handleTypeChange(type, "push", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">En App</Label>
                    <Switch
                      checked={getTypePreference(type, "inApp")}
                      onCheckedChange={(checked) => handleTypeChange(type, "inApp", checked)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Preferencias por Tipo - Sistema */}
          <TabsContent value="system" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Configura notificaciones del sistema
            </p>
            {notificationTypeGroups.system.map((type) => (
              <div key={type} className="space-y-3 border rounded-lg p-4">
                <h4 className="text-sm font-medium">{typeLabels[type]}</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Email</Label>
                    <Switch
                      checked={getTypePreference(type, "email")}
                      onCheckedChange={(checked) => handleTypeChange(type, "email", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Push</Label>
                    <Switch
                      checked={getTypePreference(type, "push")}
                      onCheckedChange={(checked) => handleTypeChange(type, "push", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">En App</Label>
                    <Switch
                      checked={getTypePreference(type, "inApp")}
                      onCheckedChange={(checked) => handleTypeChange(type, "inApp", checked)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

