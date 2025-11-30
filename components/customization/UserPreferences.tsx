"use client";

import { useState } from "react";
import { Settings, Palette, Bell, Monitor, Sun, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  useUserPreferences,
  useUpdateUserPreferences,
} from "@/lib/hooks/useCustomization";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";

export function UserPreferences() {
  const { data: preferences, isLoading } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();
  const { theme, setTheme } = useTheme();

  const [localTheme, setLocalTheme] = useState<string>(theme || "system");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preferencias</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return null;
  }

  const handleThemeChange = (newTheme: string) => {
    setLocalTheme(newTheme);
    setTheme(newTheme);
    updatePreferences.mutate({ theme: newTheme as any });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    updatePreferences.mutate({
      notifications: {
        ...preferences.notifications,
        [key]: value,
      },
    });
  };

  const handleDateFormatChange = (format: string) => {
    updatePreferences.mutate({ dateFormat: format });
  };

  const handleTimeFormatChange = (format: "12h" | "24h") => {
    updatePreferences.mutate({ timeFormat: format });
  };

  const handleTimezoneChange = (tz: string) => {
    updatePreferences.mutate({ timezone: tz });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Preferencias de Usuario
        </CardTitle>
        <CardDescription>
          Personaliza tu experiencia en la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="appearance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              Apariencia
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="regional">
              <Monitor className="h-4 w-4 mr-2" />
              Regional
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <Select value={localTheme} onValueChange={handleThemeChange}>
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Claro
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Oscuro
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Sistema
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                  <p className="text-xs text-muted-foreground">
                    Recibe notificaciones importantes por correo electrónico
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.notifications.email}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("email", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Notificaciones Push</Label>
                  <p className="text-xs text-muted-foreground">
                    Recibe notificaciones en tiempo real en tu navegador
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={preferences.notifications.push}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("push", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="in-app-notifications">Notificaciones en App</Label>
                  <p className="text-xs text-muted-foreground">
                    Muestra notificaciones dentro de la aplicación
                  </p>
                </div>
                <Switch
                  id="in-app-notifications"
                  checked={preferences.notifications.inApp}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("inApp", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="digest-notifications">Resumen Diario</Label>
                  <p className="text-xs text-muted-foreground">
                    Recibe un resumen diario de actividades
                  </p>
                </div>
                <Switch
                  id="digest-notifications"
                  checked={preferences.notifications.digest}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("digest", checked)
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="regional" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Zona Horaria</Label>
              <Select
                value={preferences.timezone}
                onValueChange={handleTimezoneChange}
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Bogota">Bogotá (GMT-5)</SelectItem>
                  <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                  <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Los Ángeles (GMT-8)</SelectItem>
                  <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-format">Formato de Fecha</Label>
              <Select
                value={preferences.dateFormat}
                onValueChange={handleDateFormatChange}
              >
                <SelectTrigger id="date-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-format">Formato de Hora</Label>
              <Select
                value={preferences.timeFormat}
                onValueChange={(value) => handleTimeFormatChange(value as "12h" | "24h")}
              >
                <SelectTrigger id="time-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 horas</SelectItem>
                  <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

