"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  AlertTriangle,
  Bell,
  BellOff,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Eye,
  MoreVertical,
  Phone,
  Mail,
  UserMinus,
  XCircle,
  Zap,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCSAlerts, useUpdateCSAlert, useDismissCSAlert } from "@/lib/hooks/useHealthScore";
import type { CSAlert, CSAlertType, CSAlertSeverity, CSAlertStatus } from "@/lib/types/customerSuccess";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale/es";
import Link from "next/link";
import { toast } from "sonner";

// ============================================
// CONFIGURACIÓN
// ============================================

const alertTypeConfig: Record<CSAlertType, { icon: typeof AlertTriangle; label: string; color: string }> = {
  inactivity: { icon: UserMinus, label: "Inactividad", color: "text-orange-500" },
  health_drop: { icon: TrendingDown, label: "Caída de Health", color: "text-red-500" },
  sla_breach: { icon: AlertCircle, label: "SLA Incumplido", color: "text-red-500" },
  feature_unused: { icon: Zap, label: "Feature sin usar", color: "text-yellow-500" },
  trial_ending: { icon: Clock, label: "Trial por terminar", color: "text-blue-500" },
  payment_failed: { icon: CreditCard, label: "Pago fallido", color: "text-red-500" },
  churn_risk: { icon: XCircle, label: "Riesgo de Churn", color: "text-red-600" },
  expansion_opportunity: { icon: CheckCircle2, label: "Oportunidad", color: "text-green-500" },
};

const severityConfig: Record<CSAlertSeverity, { color: string; bgColor: string; label: string }> = {
  low: { color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30", label: "Baja" },
  medium: { color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-900/30", label: "Media" },
  high: { color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900/30", label: "Alta" },
  critical: { color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/30", label: "Crítica" },
};

const statusConfig: Record<CSAlertStatus, { color: string; label: string }> = {
  new: { color: "bg-blue-500", label: "Nueva" },
  acknowledged: { color: "bg-yellow-500", label: "Reconocida" },
  in_progress: { color: "bg-purple-500", label: "En Proceso" },
  resolved: { color: "bg-green-500", label: "Resuelta" },
  dismissed: { color: "bg-gray-500", label: "Descartada" },
};

// ============================================
// COMPONENTE DE ITEM DE ALERTA
// ============================================

interface AlertItemProps {
  alert: CSAlert;
  onAction: (alertId: string, action: "acknowledge" | "resolve" | "dismiss" | "view") => void;
  compact?: boolean;
}

function AlertItem({ alert, onAction, compact = false }: AlertItemProps) {
  const typeConfig = alertTypeConfig[alert.type];
  const TypeIcon = typeConfig.icon;
  const severity = severityConfig[alert.severity];

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", severity.bgColor)}>
            <TypeIcon className={cn("h-4 w-4", typeConfig.color)} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{alert.organizationName}</p>
            <p className="text-xs text-muted-foreground truncate">{alert.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-xs", severity.color, severity.bgColor)}>
            {severity.label}
          </Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onAction(alert.id, "view")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="mb-3">
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          {/* Icono */}
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", severity.bgColor)}>
            <TypeIcon className={cn("h-5 w-5", typeConfig.color)} />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">{alert.organizationName}</h4>
                  <Badge variant="outline" className={cn("text-xs", severity.color, severity.bgColor)}>
                    {severity.label}
                  </Badge>
                  <div className={cn("h-2 w-2 rounded-full", statusConfig[alert.status].color)} />
                </div>
                <p className="text-sm font-medium mt-1">{alert.title}</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onAction(alert.id, "view")}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalles
                  </DropdownMenuItem>
                  {alert.status === "new" && (
                    <DropdownMenuItem onClick={() => onAction(alert.id, "acknowledge")}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Reconocer
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onAction(alert.id, "resolve")}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar resuelta
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onAction(alert.id, "dismiss")} className="text-muted-foreground">
                    <BellOff className="h-4 w-4 mr-2" />
                    Descartar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2">{alert.description}</p>

            {/* Señales */}
            {alert.signals && alert.signals.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {alert.signals.slice(0, 3).map((signal, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {signal}
                  </Badge>
                ))}
                {alert.signals.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{alert.signals.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Metadata y acciones */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {alert.metadata.mrr && (
                  <span>MRR: ${alert.metadata.mrr}/mes</span>
                )}
                {alert.metadata.healthScore && (
                  <span>Health: {alert.metadata.healthScore}</span>
                )}
                <span>
                  {formatDistanceToNow(new Date(alert.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                  <a href={`mailto:${alert.metadata.email || ""}`}>
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <Phone className="h-3 w-3 mr-1" />
                  Llamar
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Agendar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface CustomerAlertsProps {
  variant?: "full" | "compact" | "sidebar";
  maxItems?: number;
  className?: string;
  organizationId?: string;
}

export function CustomerAlerts({
  variant = "full",
  maxItems,
  className,
  organizationId,
}: CustomerAlertsProps) {
  const [selectedAlert, setSelectedAlert] = useState<CSAlert | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"resolve" | "dismiss" | null>(null);
  const [notes, setNotes] = useState("");

  const { data: alerts, isLoading, error } = useCSAlerts({
    status: "new",
    organizationId,
    limit: maxItems,
  });

  const updateAlert = useUpdateCSAlert();
  const dismissAlert = useDismissCSAlert();

  const handleAction = (alertId: string, action: "acknowledge" | "resolve" | "dismiss" | "view") => {
    const alert = alerts?.find((a) => a.id === alertId);
    if (!alert) return;

    switch (action) {
      case "view":
        setSelectedAlert(alert);
        break;
      case "acknowledge":
        updateAlert.mutate(
          { alertId, updates: { status: "acknowledged" } },
          {
            onSuccess: () => toast.success("Alerta reconocida"),
          }
        );
        break;
      case "resolve":
        setSelectedAlert(alert);
        setActionType("resolve");
        setActionDialogOpen(true);
        break;
      case "dismiss":
        setSelectedAlert(alert);
        setActionType("dismiss");
        setActionDialogOpen(true);
        break;
    }
  };

  const handleConfirmAction = () => {
    if (!selectedAlert || !actionType) return;

    if (actionType === "dismiss") {
      dismissAlert.mutate(selectedAlert.id, {
        onSuccess: () => {
          toast.success("Alerta descartada");
          setActionDialogOpen(false);
          setSelectedAlert(null);
          setNotes("");
        },
      });
    } else {
      updateAlert.mutate(
        {
          alertId: selectedAlert.id,
          updates: { status: "resolved", notes },
        },
        {
          onSuccess: () => {
            toast.success("Alerta resuelta");
            setActionDialogOpen(false);
            setSelectedAlert(null);
            setNotes("");
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Customer Success
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Customer Success
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Error al cargar alertas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayAlerts = maxItems ? alerts?.slice(0, maxItems) : alerts;
  const hasMore = alerts && maxItems && alerts.length > maxItems;

  // Variante sidebar (muy compacta)
  if (variant === "sidebar") {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alertas
            {alerts && alerts.length > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                {alerts.length}
              </Badge>
            )}
          </h3>
          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
            <Link href="/admin/customer-success/alerts">
              Ver todas
            </Link>
          </Button>
        </div>

        {(!displayAlerts || displayAlerts.length === 0) ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Sin alertas pendientes
          </p>
        ) : (
          <div className="space-y-2">
            {displayAlerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onAction={handleAction}
                compact
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Variante compacta
  if (variant === "compact") {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5" />
              Alertas
              {alerts && alerts.length > 0 && (
                <Badge variant="destructive">{alerts.length}</Badge>
              )}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/customer-success/alerts">
                Ver todas
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {(!displayAlerts || displayAlerts.length === 0) ? (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50 text-green-500" />
              <p className="text-sm">Sin alertas pendientes</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              {displayAlerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onAction={handleAction}
                  compact
                />
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    );
  }

  // Variante full
  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas de Customer Success
                {alerts && alerts.length > 0 && (
                  <Badge variant="destructive">{alerts.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Clientes que requieren atención inmediata
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/customer-success/alerts">
                Ver todas
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(!displayAlerts || displayAlerts.length === 0) ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50 text-green-500" />
              <p className="text-sm font-medium">¡Excelente!</p>
              <p className="text-xs">No hay alertas pendientes</p>
            </div>
          ) : (
            <>
              {displayAlerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onAction={handleAction}
                />
              ))}
              {hasMore && (
                <div className="text-center pt-2">
                  <Button variant="link" size="sm" asChild>
                    <Link href="/admin/customer-success/alerts">
                      Ver {alerts!.length - maxItems!} alertas más
                    </Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmación */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "resolve" ? "Resolver alerta" : "Descartar alerta"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "resolve"
                ? "Agrega notas sobre cómo se resolvió esta alerta."
                : "¿Estás seguro de descartar esta alerta?"}
            </DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="py-4">
              <div className="rounded-lg bg-muted p-3 mb-4">
                <p className="text-sm font-medium">{selectedAlert.organizationName}</p>
                <p className="text-xs text-muted-foreground">{selectedAlert.title}</p>
              </div>

              {actionType === "resolve" && (
                <Textarea
                  placeholder="Notas sobre la resolución..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmAction}
              variant={actionType === "dismiss" ? "outline" : "default"}
            >
              {actionType === "resolve" ? "Resolver" : "Descartar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CustomerAlerts;
