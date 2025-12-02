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
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";

export function UserPreferences() {
  const { data: preferences, isLoading } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();
  const { theme, setTheme } = useTheme();
  const tCustomization = useTranslationsSafe("customization");

  const [localTheme, setLocalTheme] = useState<string>(theme || "system");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{tCustomization("preferences")}</CardTitle>
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
          {tCustomization("userPreferences")}
        </CardTitle>
        <CardDescription>
          {tCustomization("description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="appearance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              {tCustomization("appearance")}
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              {tCustomization("notifications")}
            </TabsTrigger>
            <TabsTrigger value="regional">
              <Monitor className="h-4 w-4 mr-2" />
              {tCustomization("regional")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">{tCustomization("theme")}</Label>
              <Select value={localTheme} onValueChange={handleThemeChange}>
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      {tCustomization("themeLight")}
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      {tCustomization("themeDark")}
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      {tCustomization("themeSystem")}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <NotificationPreferences />
          </TabsContent>

          <TabsContent value="regional" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">{tCustomization("timezone")}</Label>
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
              <Label htmlFor="date-format">{tCustomization("dateFormat")}</Label>
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
              <Label htmlFor="time-format">{tCustomization("timeFormat")}</Label>
              <Select
                value={preferences.timeFormat}
                onValueChange={(value) => handleTimeFormatChange(value as "12h" | "24h")}
              >
                <SelectTrigger id="time-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">{tCustomization("timeFormat24h")}</SelectItem>
                  <SelectItem value="12h">{tCustomization("timeFormat12h")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

