"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Moon,
  Sun,
  Clock,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  AlertTriangle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { toast } from "sonner";

// ============================================
// TIPOS
// ============================================

export interface PushThrottleConfig {
  /** Máximo de push notifications por hora */
  maxPerHour: number;
  /** Agrupar notificaciones del mismo recurso */
  groupSameResource: boolean;
  /** Segundos mínimo entre notificaciones del mismo recurso */
  groupingWindowSeconds: number;
  /** Horario silencioso habilitado */
  quietHoursEnabled: boolean;
  /** Hora de inicio del horario silencioso (HH:mm) */
  quietHoursStart: string;
  /** Hora de fin del horario silencioso (HH:mm) */
  quietHoursEnd: string;
  /** Permitir urgentes durante horario silencioso */
  allowUrgentDuringQuietHours: boolean;
  /** Silenciar cuando el usuario está activo en la app */
  muteWhenActiveInApp: boolean;
}

const DEFAULT_CONFIG: PushThrottleConfig = {
  maxPerHour: 10,
  groupSameResource: true,
  groupingWindowSeconds: 300, // 5 minutos
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  allowUrgentDuringQuietHours: true,
  muteWhenActiveInApp: true,
};

interface PushThrottleSettingsProps {
  config?: PushThrottleConfig;
  onConfigChange?: (config: PushThrottleConfig) => void;
  isLoading?: boolean;
  className?: string;
}

// ============================================
// HELPERS
// ============================================

const generateTimeOptions = () => {
  const options = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = String(h).padStart(2, "0");
      const minute = String(m).padStart(2, "0");
      options.push(`${hour}:${minute}`);
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function PushThrottleSettings({
  config: externalConfig,
  onConfigChange,
  isLoading = false,
  className,
}: PushThrottleSettingsProps) {
  const [config, setConfig] = useState<PushThrottleConfig>(externalConfig || DEFAULT_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);
  const t = useTranslationsSafe("pushThrottle");

  // Sincronizar con config externo
  useEffect(() => {
    if (externalConfig) {
      setConfig(externalConfig);
      setHasChanges(false);
    }
  }, [externalConfig]);

  const updateConfig = <K extends keyof PushThrottleConfig>(
    key: K,
    value: PushThrottleConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onConfigChange?.(config);
    setHasChanges(false);
    toast.success("Configuración de throttling guardada");
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5" />
            Frecuencia de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-5 w-5" />
          Frecuencia de Notificaciones
        </CardTitle>
        <CardDescription>
          Controla cuántas y cuándo recibes notificaciones push
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Límite por hora */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Máximo por hora</Label>
              <p className="text-xs text-muted-foreground">
                Límite de notificaciones push por hora
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              {config.maxPerHour} / hora
            </Badge>
          </div>
          <Slider
            value={[config.maxPerHour]}
            onValueChange={([value]) => updateConfig("maxPerHour", value)}
            min={1}
            max={30}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Menos (1)</span>
            <span>Más (30)</span>
          </div>
        </div>

        {/* Agrupación */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="group-same" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Agrupar notificaciones
              </Label>
              <p className="text-xs text-muted-foreground">
                Combinar múltiples notificaciones del mismo ticket/proyecto
              </p>
            </div>
            <Switch
              id="group-same"
              checked={config.groupSameResource}
              onCheckedChange={(checked) => updateConfig("groupSameResource", checked)}
            />
          </div>

          {config.groupSameResource && (
            <div className="pl-6 space-y-2">
              <Label className="text-xs">Ventana de agrupación</Label>
              <Select
                value={String(config.groupingWindowSeconds)}
                onValueChange={(value) => updateConfig("groupingWindowSeconds", parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">1 minuto</SelectItem>
                  <SelectItem value="300">5 minutos</SelectItem>
                  <SelectItem value="600">10 minutos</SelectItem>
                  <SelectItem value="900">15 minutos</SelectItem>
                  <SelectItem value="1800">30 minutos</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Si llegas a recibir múltiples notificaciones del mismo recurso en este tiempo, se agruparán en una sola.
              </p>
            </div>
          )}
        </div>

        {/* Horario silencioso */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="quiet-hours" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Horario silencioso
              </Label>
              <p className="text-xs text-muted-foreground">
                No enviar push durante estas horas
              </p>
            </div>
            <Switch
              id="quiet-hours"
              checked={config.quietHoursEnabled}
              onCheckedChange={(checked) => updateConfig("quietHoursEnabled", checked)}
            />
          </div>

          {config.quietHoursEnabled && (
            <div className="pl-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    <Moon className="h-3 w-3" />
                    Desde
                  </Label>
                  <Select
                    value={config.quietHoursStart}
                    onValueChange={(value) => updateConfig("quietHoursStart", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    <Sun className="h-3 w-3" />
                    Hasta
                  </Label>
                  <Select
                    value={config.quietHoursEnd}
                    onValueChange={(value) => updateConfig("quietHoursEnd", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-urgent" className="text-xs flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3" />
                    Permitir urgentes
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Recibir alertas críticas incluso en horario silencioso
                  </p>
                </div>
                <Switch
                  id="allow-urgent"
                  checked={config.allowUrgentDuringQuietHours}
                  onCheckedChange={(checked) =>
                    updateConfig("allowUrgentDuringQuietHours", checked)
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Silenciar cuando activo */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mute-active" className="flex items-center gap-2">
                <VolumeX className="h-4 w-4" />
                Silenciar cuando estés activo
              </Label>
              <p className="text-xs text-muted-foreground">
                No enviar push si ya estás usando la aplicación
              </p>
            </div>
            <Switch
              id="mute-active"
              checked={config.muteWhenActiveInApp}
              onCheckedChange={(checked) => updateConfig("muteWhenActiveInApp", checked)}
            />
          </div>
        </div>

        {/* Info */}
        <div className="rounded-lg bg-muted/50 p-3 flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Las notificaciones que excedan el límite se guardarán en tu centro de notificaciones
            y podrás verlas cuando abras la aplicación.
          </p>
        </div>

        {/* Acciones */}
        {hasChanges && (
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Restablecer
            </Button>
            <Button size="sm" onClick={handleSave}>
              Guardar cambios
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PushThrottleSettings;


