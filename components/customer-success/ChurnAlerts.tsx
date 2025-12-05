"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  MessageSquare,
  RefreshCw,
  TrendingDown,
  User,
  X,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ChurnAlert, ChurnAlertType, AlertSeverity, AlertStatus } from "@/lib/types/customer-success";
import { useUpdateAlertStatus } from "@/lib/hooks/useCustomerHealth";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Props del componente ChurnAlerts
 */
interface ChurnAlertsProps {
  /** Lista de alertas */
  alerts?: ChurnAlert[];
  /** Si está cargando */
  isLoading?: boolean;
  /** Variante de visualización */
  variant?: "list" | "compact" | "inline";
  /** Máximo de alertas a mostrar */
  maxItems?: number;
  /** Mostrar solo alertas activas */
  activeOnly?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Callback al resolver alerta */
  onResolve?: (alertId: string) => void;
  /** Callback al ver detalles */
  onViewDetails?: (alert: ChurnAlert) => void;
}

/**
 * Iconos por tipo de alerta
 */
const alertTypeIcons: Record<ChurnAlertType, typeof AlertTriangle> = {
  no_login: User,
  low_engagement: TrendingDown,
  support_issues: MessageSquare,
  payment_failed: CreditCard,
  negative_feedback: MessageSquare,
  service_expiring: Calendar,
  score_drop: TrendingDown,
  competitor_mention: AlertTriangle,
  custom: Bell,
};

/**
 * Labels de tipo de alerta
 */
const alertTypeLabels: Record<ChurnAlertType, string> = {
  no_login: "Sin actividad",
  low_engagement: "Bajo engagement",
  support_issues: "Problemas de soporte",
  payment_failed: "Fallo de pago",
  negative_feedback: "Feedback negativo",
  service_expiring: "Servicio por expirar",
  score_drop: "Caída de score",
  competitor_mention: "Mención de competidor",
  custom: "Alerta personalizada",
};

/**
 * Colores por severidad
 */
const severityColors: Record<AlertSeverity, { bg: string; text: string; border: string; icon: string }> = {
  info: {
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-500",
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-950",
    text: "text-yellow-700 dark:text-yellow-300",
    border: "border-yellow-200 dark:border-yellow-800",
    icon: "text-yellow-500",
  },
  urgent: {
    bg: "bg-orange-50 dark:bg-orange-950",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800",
    icon: "text-orange-500",
  },
  critical: {
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-500",
  },
};

/**
 * Labels de severidad
 */
const severityLabels: Record<AlertSeverity, string> = {
  info: "Info",
  warning: "Atención",
  urgent: "Urgente",
  critical: "Crítico",
};

/**
 * Labels de estado
 */
const statusLabels: Record<AlertStatus, string> = {
  active: "Activa",
  acknowledged: "Reconocida",
  resolved: "Resuelta",
  dismissed: "Descartada",
};

/**
 * Componente de lista de alertas de churn
 */
export function ChurnAlerts({
  alerts,
  isLoading,
  variant = "list",
  maxItems,
  activeOnly = false,
  className,
  onResolve,
  onViewDetails,
}: ChurnAlertsProps) {
  const [selectedAlert, setSelectedAlert] = useState<ChurnAlert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [showResolveDialog, setShowResolveDialog] = useState(false);

  const updateAlertStatus = useUpdateAlertStatus();

  // Filtrar alertas
  let filteredAlerts = alerts || [];
  if (activeOnly) {
    filteredAlerts = filteredAlerts.filter(
      (a) => a.status === "active" || a.status === "acknowledged"
    );
  }
  if (maxItems) {
    filteredAlerts = filteredAlerts.slice(0, maxItems);
  }

  const handleResolve = async () => {
    if (!selectedAlert) return;
    await updateAlertStatus.mutateAsync({
      alertId: selectedAlert.id,
      status: "resolved",
      notes: resolutionNotes,
    });
    setShowResolveDialog(false);
    setSelectedAlert(null);
    setResolutionNotes("");
    onResolve?.(selectedAlert.id);
  };

  const handleDismiss = async (alert: ChurnAlert) => {
    await updateAlertStatus.mutateAsync({
      alertId: alert.id,
      status: "dismissed",
    });
  };

  const handleAcknowledge = async (alert: ChurnAlert) => {
    await updateAlertStatus.mutateAsync({
      alertId: alert.id,
      status: "acknowledged",
    });
  };

  if (isLoading) {
    return <ChurnAlertsSkeleton variant={variant} className={className} />;
  }

  if (!filteredAlerts || filteredAlerts.length === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <BellOff className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No hay alertas de churn activas
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ¡Tu base de clientes está saludable!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Variante inline - fila simple
  if (variant === "inline") {
    return (
      <div className={cn("space-y-2", className)}>
        {filteredAlerts.map((alert) => (
          <AlertInlineItem
            key={alert.id}
            alert={alert}
            onAcknowledge={() => handleAcknowledge(alert)}
            onDismiss={() => handleDismiss(alert)}
            onResolve={() => {
              setSelectedAlert(alert);
              setShowResolveDialog(true);
            }}
          />
        ))}
      </div>
    );
  }

  // Variante compact - chips
  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {filteredAlerts.map((alert) => (
          <AlertCompactItem key={alert.id} alert={alert} onClick={() => onViewDetails?.(alert)} />
        ))}
      </div>
    );
  }

  // Variante list - lista completa
  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Alertas de Churn
              </CardTitle>
              <CardDescription>
                {filteredAlerts.length} alerta{filteredAlerts.length !== 1 ? "s" : ""} activa
                {filteredAlerts.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="divide-y">
              {filteredAlerts.map((alert) => (
                <AlertListItem
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={() => handleAcknowledge(alert)}
                  onDismiss={() => handleDismiss(alert)}
                  onResolve={() => {
                    setSelectedAlert(alert);
                    setShowResolveDialog(true);
                  }}
                  onViewDetails={() => onViewDetails?.(alert)}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Dialog de resolución */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver Alerta</DialogTitle>
            <DialogDescription>
              Marca esta alerta como resuelta y agrega notas sobre la resolución.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedAlert && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium text-sm">{selectedAlert.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedAlert.organizationName}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notas de resolución (opcional)</label>
              <Textarea
                placeholder="Describe las acciones tomadas para resolver esta alerta..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleResolve} disabled={updateAlertStatus.isPending}>
              {updateAlertStatus.isPending ? "Resolviendo..." : "Marcar como Resuelta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Item de alerta en lista
 */
function AlertListItem({
  alert,
  onAcknowledge,
  onDismiss,
  onResolve,
  onViewDetails,
}: {
  alert: ChurnAlert;
  onAcknowledge: () => void;
  onDismiss: () => void;
  onResolve: () => void;
  onViewDetails?: () => void;
}) {
  const colors = severityColors[alert.severity];
  const Icon = alertTypeIcons[alert.type] || Bell;

  return (
    <div className={cn("p-4 hover:bg-muted/50 transition-colors", colors.bg)}>
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 shrink-0", colors.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-sm">{alert.title}</p>
              <p className="text-xs text-muted-foreground">
                {alert.organizationName || "Organización"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className={cn("text-xs", colors.text)}>
                {severityLabels[alert.severity]}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onViewDetails && (
                    <DropdownMenuItem onClick={onViewDetails}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver detalles
                    </DropdownMenuItem>
                  )}
                  {alert.status === "active" && (
                    <DropdownMenuItem onClick={onAcknowledge}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Reconocer
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={onResolve}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolver
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDismiss} className="text-muted-foreground">
                    <X className="h-4 w-4 mr-2" />
                    Descartar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {alert.description}
          </p>
          {alert.recommendedAction && (
            <p className="text-xs text-primary mt-2 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {alert.recommendedAction}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(alert.createdAt), { locale: es, addSuffix: true })}
            </span>
            <Badge variant="secondary" className="text-xs">
              {alertTypeLabels[alert.type]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {statusLabels[alert.status]}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Item de alerta inline
 */
function AlertInlineItem({
  alert,
  onAcknowledge,
  onDismiss,
  onResolve,
}: {
  alert: ChurnAlert;
  onAcknowledge: () => void;
  onDismiss: () => void;
  onResolve: () => void;
}) {
  const colors = severityColors[alert.severity];
  const Icon = alertTypeIcons[alert.type] || Bell;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 p-3 rounded-lg border",
        colors.bg,
        colors.border
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon className={cn("h-4 w-4 shrink-0", colors.icon)} />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{alert.title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {alert.organizationName}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="sm" onClick={onResolve}>
          Resolver
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Item de alerta compacto (chip)
 */
function AlertCompactItem({ alert, onClick }: { alert: ChurnAlert; onClick?: () => void }) {
  const colors = severityColors[alert.severity];
  const Icon = alertTypeIcons[alert.type] || Bell;

  return (
    <Badge
      variant="outline"
      className={cn(
        "cursor-pointer hover:opacity-80 transition-opacity py-1.5 px-3 gap-2",
        colors.bg,
        colors.border,
        colors.text
      )}
      onClick={onClick}
    >
      <Icon className="h-3 w-3" />
      <span className="truncate max-w-[150px]">{alert.organizationName}</span>
      {alert.severity === "critical" && (
        <span className="animate-pulse">●</span>
      )}
    </Badge>
  );
}

/**
 * Skeleton de carga
 */
function ChurnAlertsSkeleton({
  variant,
  className,
}: {
  variant: "list" | "compact" | "inline";
  className?: string;
}) {
  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-7 w-32 rounded-full" />
        ))}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("space-y-2", className)}>
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-24 mt-1" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

