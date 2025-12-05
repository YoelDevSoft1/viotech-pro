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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Shield,
  BarChart3,
  Activity,
  Bug,
  Users,
  Info,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AnalyticsPrivacySettings } from "@/lib/types/analytics";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import Link from "next/link";

// ============================================
// DATOS QUE RECOPILAMOS
// ============================================

const dataCollectionInfo = [
  {
    category: "Uso de la aplicación",
    icon: BarChart3,
    items: [
      "Páginas visitadas (sin contenido)",
      "Funciones utilizadas",
      "Tiempo de sesión",
      "Frecuencia de uso",
    ],
  },
  {
    category: "Dispositivo y navegador",
    icon: Activity,
    items: [
      "Tipo de dispositivo (móvil/desktop)",
      "Navegador utilizado",
      "Idioma configurado",
      "Zona horaria",
    ],
  },
  {
    category: "Rendimiento",
    icon: Activity,
    items: [
      "Tiempos de carga de páginas",
      "Métricas de rendimiento (Web Vitals)",
      "Latencia de red",
    ],
  },
  {
    category: "Errores",
    icon: Bug,
    items: [
      "Errores de la aplicación (sin datos personales)",
      "Fallos de funcionalidades",
      "Problemas de conectividad",
    ],
  },
];

const notCollectedData = [
  "Contenido de tickets o mensajes",
  "Contraseñas o datos de autenticación",
  "Información financiera detallada",
  "Datos personales identificables en analytics",
  "Historial de navegación fuera de VioTech",
];

// ============================================
// COMPONENTE MODAL DE INFORMACIÓN
// ============================================

function DataCollectionModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
          Ver qué datos recopilamos
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Datos que recopilamos
          </DialogTitle>
          <DialogDescription>
            Información detallada sobre qué datos recopilamos para mejorar VioTech Pro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Lo que SÍ recopilamos */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Lo que recopilamos:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataCollectionInfo.map((section) => (
                <div
                  key={section.category}
                  className="rounded-lg border p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <section.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{section.category}</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Lo que NO recopilamos */}
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-4 w-4" />
              Lo que NUNCA recopilamos:
            </h3>
            <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
              {notCollectedData.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cómo usamos los datos */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Cómo usamos estos datos:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Mejorar el rendimiento y estabilidad de la plataforma</li>
              <li>• Identificar y corregir errores más rápido</li>
              <li>• Entender qué funciones son más útiles</li>
              <li>• Priorizar mejoras basadas en uso real</li>
              <li>• Detectar problemas antes de que afecten a más usuarios</li>
            </ul>
          </div>

          {/* Link a política completa */}
          <div className="text-center pt-4 border-t">
            <Button variant="outline" size="sm" asChild>
              <Link href="/privacy">
                Ver Política de Privacidad completa
                <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface PrivacyAnalyticsSettingsProps {
  className?: string;
}

export function PrivacyAnalyticsSettings({ className }: PrivacyAnalyticsSettingsProps) {
  const [localSettings, setLocalSettings] = useState<AnalyticsPrivacySettings | null>(null);

  // Query para obtener configuración actual
  const { data: settings, isLoading } = useQuery({
    queryKey: ["analytics", "privacy-settings"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<{ data: AnalyticsPrivacySettings }>(
          "/analytics/privacy-settings"
        );
        return data.data;
      } catch {
        // Defaults si falla
        return {
          usageAnalyticsEnabled: true,
          performanceMonitoringEnabled: true,
          errorTrackingEnabled: true,
          shareAnonymousData: false,
        } as AnalyticsPrivacySettings;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const queryClient = useQueryClient();
  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<AnalyticsPrivacySettings>) => {
      const { data } = await apiClient.patch<{ data: AnalyticsPrivacySettings }>(
        "/analytics/privacy-settings",
        updates
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics", "privacy-settings"] });
    },
  });

  // Sincronizar estado local
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleToggle = (key: keyof AnalyticsPrivacySettings, value: boolean) => {
    if (!localSettings) return;

    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);

    updateSettings.mutate(
      { [key]: value },
      {
        onSuccess: () => {
          toast.success("Preferencias actualizadas");
        },
        onError: () => {
          // Revertir en caso de error
          setLocalSettings(localSettings);
          toast.error("Error al actualizar preferencias");
        },
      }
    );
  };

  if (isLoading || !localSettings) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5" />
            Privacidad y Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-5 w-5" />
          Privacidad y Analytics
        </CardTitle>
        <CardDescription>
          Controla qué datos compartimos para mejorar la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analytics de uso */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <Label
              htmlFor="usage-analytics"
              className="flex items-center gap-2 cursor-pointer"
            >
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Analytics de uso
            </Label>
            <p className="text-xs text-muted-foreground">
              Nos ayuda a entender qué funciones son más útiles y priorizar mejoras
            </p>
          </div>
          <Switch
            id="usage-analytics"
            checked={localSettings.usageAnalyticsEnabled}
            onCheckedChange={(checked) =>
              handleToggle("usageAnalyticsEnabled", checked)
            }
            disabled={updateSettings.isPending}
          />
        </div>

        {/* Monitoreo de rendimiento */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <Label
              htmlFor="performance"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Activity className="h-4 w-4 text-muted-foreground" />
              Monitoreo de rendimiento
            </Label>
            <p className="text-xs text-muted-foreground">
              Detecta y corrige problemas de velocidad automáticamente
            </p>
          </div>
          <Switch
            id="performance"
            checked={localSettings.performanceMonitoringEnabled}
            onCheckedChange={(checked) =>
              handleToggle("performanceMonitoringEnabled", checked)
            }
            disabled={updateSettings.isPending}
          />
        </div>

        {/* Tracking de errores */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <Label
              htmlFor="error-tracking"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Bug className="h-4 w-4 text-muted-foreground" />
              Reporte de errores
            </Label>
            <p className="text-xs text-muted-foreground">
              Reporta errores automáticamente para que podamos solucionarlos rápido
            </p>
          </div>
          <Switch
            id="error-tracking"
            checked={localSettings.errorTrackingEnabled}
            onCheckedChange={(checked) =>
              handleToggle("errorTrackingEnabled", checked)
            }
            disabled={updateSettings.isPending}
          />
        </div>

        {/* Compartir datos anonimizados */}
        <div className="flex items-start justify-between gap-4 border-t pt-4">
          <div className="space-y-0.5">
            <Label
              htmlFor="share-anonymous"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Users className="h-4 w-4 text-muted-foreground" />
              Contribuir a mejoras globales
            </Label>
            <p className="text-xs text-muted-foreground">
              Comparte datos anonimizados para ayudar a mejorar VioTech para todos
            </p>
          </div>
          <Switch
            id="share-anonymous"
            checked={localSettings.shareAnonymousData}
            onCheckedChange={(checked) =>
              handleToggle("shareAnonymousData", checked)
            }
            disabled={updateSettings.isPending}
          />
        </div>

        {/* Info adicional */}
        <div className="rounded-lg bg-muted/50 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Tu privacidad es importante.</strong> Nunca vendemos tus datos
                ni los compartimos con terceros para publicidad.
              </p>
              <p>
                Los datos que recopilamos son anonimizados y se usan exclusivamente
                para mejorar la plataforma.
              </p>
            </div>
          </div>
          <DataCollectionModal />
        </div>
      </CardContent>
    </Card>
  );
}

export default PrivacyAnalyticsSettings;

