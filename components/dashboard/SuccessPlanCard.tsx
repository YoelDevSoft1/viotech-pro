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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  FolderKanban,
  Plus,
  Target,
  Rocket,
  RefreshCcw,
  Shield,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useSuccessPlans,
  useSuccessPlanTemplates,
  useCreatePlanFromTemplate,
  useUpdateSuccessPlan,
} from "@/lib/hooks/useHealthScore";
import type {
  SuccessPlan,
  SuccessPlanTemplate,
  SuccessPlanType,
  MilestoneStatus,
} from "@/lib/types/customerSuccess";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale/es";
import Link from "next/link";
import { toast } from "sonner";

// ============================================
// CONFIGURACIÓN
// ============================================

const planTypeConfig: Record<SuccessPlanType, { icon: typeof Rocket; label: string; color: string }> = {
  onboarding: { icon: Rocket, label: "Onboarding", color: "text-blue-500" },
  adoption: { icon: Target, label: "Adopción", color: "text-purple-500" },
  expansion: { icon: FolderKanban, label: "Expansión", color: "text-green-500" },
  recovery: { icon: RefreshCcw, label: "Recuperación", color: "text-orange-500" },
  custom: { icon: FileText, label: "Personalizado", color: "text-gray-500" },
};

const statusConfig = {
  active: { color: "bg-green-500", label: "Activo" },
  completed: { color: "bg-blue-500", label: "Completado" },
  paused: { color: "bg-yellow-500", label: "Pausado" },
  cancelled: { color: "bg-gray-500", label: "Cancelado" },
};

const milestoneStatusConfig: Record<MilestoneStatus, { color: string; icon: typeof CheckCircle2 }> = {
  pending: { color: "text-gray-400", icon: Clock },
  in_progress: { color: "text-blue-500", icon: Clock },
  completed: { color: "text-green-500", icon: CheckCircle2 },
  skipped: { color: "text-gray-300", icon: CheckCircle2 },
};

// ============================================
// COMPONENTE DE ITEM DE PLAN
// ============================================

interface PlanItemProps {
  plan: SuccessPlan;
  compact?: boolean;
  onViewDetails?: () => void;
}

function PlanItem({ plan, compact = false, onViewDetails }: PlanItemProps) {
  const typeConfig = planTypeConfig[plan.type];
  const TypeIcon = typeConfig.icon;
  const status = statusConfig[plan.status];

  if (compact) {
    return (
      <div
        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={onViewDetails}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <TypeIcon className={cn("h-4 w-4", typeConfig.color)} />
          </div>
          <div>
            <p className="text-sm font-medium">{plan.organizationName}</p>
            <p className="text-xs text-muted-foreground">{plan.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={plan.progress} className="w-16 h-1.5" />
          <span className="text-xs text-muted-foreground w-8">{plan.progress}%</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <Card className="mb-3">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <TypeIcon className={cn("h-5 w-5", typeConfig.color)} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">{plan.organizationName}</h4>
                <Badge variant="outline" className="text-xs">
                  {typeConfig.label}
                </Badge>
                <div className={cn("h-2 w-2 rounded-full", status.color)} />
              </div>
              <p className="text-sm text-muted-foreground">{plan.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onViewDetails}>
            Ver detalles
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Progreso */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium">{plan.progress}%</span>
          </div>
          <Progress value={plan.progress} className="h-2" />
        </div>

        {/* Hitos resumidos */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {plan.milestones.slice(0, 4).map((milestone) => {
            const config = milestoneStatusConfig[milestone.status];
            const Icon = config.icon;
            return (
              <Badge
                key={milestone.id}
                variant="outline"
                className={cn("text-xs gap-1", config.color)}
              >
                <Icon className="h-3 w-3" />
                {milestone.name}
              </Badge>
            );
          })}
          {plan.milestones.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{plan.milestones.length - 4}
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {plan.csmName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Vence: {format(new Date(plan.targetEndDate), "PP", { locale: es })}
            </span>
          </div>
          <span>
            Actualizado {formatDistanceToNow(new Date(plan.updatedAt), { addSuffix: true, locale: es })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// DIALOG CREAR PLAN
// ============================================

interface CreatePlanDialogProps {
  organizationId: string;
  organizationName?: string;
  trigger?: React.ReactNode;
  onCreated?: () => void;
}

export function CreatePlanDialog({
  organizationId,
  organizationName,
  trigger,
  onCreated,
}: CreatePlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [mainGoal, setMainGoal] = useState("");
  const [csmName, setCsmName] = useState("");

  const { data: templates, isLoading: templatesLoading } = useSuccessPlanTemplates();
  const createPlan = useCreatePlanFromTemplate();

  const handleCreate = () => {
    if (!selectedTemplate || !mainGoal) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    createPlan.mutate(
      {
        templateId: selectedTemplate,
        organizationId,
        csmId: "current-user", // En producción, obtener del contexto de auth
        csmName: csmName || "CSM",
        mainGoal,
      },
      {
        onSuccess: () => {
          toast.success("Plan creado exitosamente");
          setOpen(false);
          setSelectedTemplate("");
          setMainGoal("");
          onCreated?.();
        },
        onError: () => {
          toast.error("Error al crear el plan");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Nuevo Plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Success Plan</DialogTitle>
          <DialogDescription>
            {organizationName
              ? `Crear un plan de éxito para ${organizationName}`
              : "Selecciona una plantilla para comenzar"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Plantilla</Label>
            {templatesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <span>{template.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {template.durationDays} días
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Objetivo principal *</Label>
            <Textarea
              placeholder="¿Cuál es el objetivo principal de este plan?"
              value={mainGoal}
              onChange={(e) => setMainGoal(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>CSM asignado</Label>
            <Input
              placeholder="Nombre del CSM"
              value={csmName}
              onChange={(e) => setCsmName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={createPlan.isPending}>
            {createPlan.isPending ? "Creando..." : "Crear Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface SuccessPlanCardProps {
  variant?: "full" | "compact" | "mini";
  organizationId?: string;
  maxItems?: number;
  className?: string;
}

export function SuccessPlanCard({
  variant = "full",
  organizationId,
  maxItems = 5,
  className,
}: SuccessPlanCardProps) {
  const { data: plans, isLoading, error } = useSuccessPlans({
    organizationId,
    status: "active",
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-5 w-5" />
            Success Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
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
            <Target className="h-5 w-5" />
            Success Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Error al cargar planes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayPlans = plans?.slice(0, maxItems) || [];
  const hasMore = plans && plans.length > maxItems;

  // Variante mini
  if (variant === "mini") {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-4 w-4" />
            Plans Activos
          </h3>
          <Badge variant="secondary">{plans?.length || 0}</Badge>
        </div>
        {displayPlans.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Sin planes activos
          </p>
        ) : (
          <div className="space-y-2">
            {displayPlans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{plan.organizationName}</span>
                <div className="flex items-center gap-2">
                  <Progress value={plan.progress} className="w-12 h-1" />
                  <span className="text-xs text-muted-foreground">{plan.progress}%</span>
                </div>
              </div>
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
              <Target className="h-5 w-5" />
              Success Plans
            </CardTitle>
            <div className="flex items-center gap-2">
              {organizationId && (
                <CreatePlanDialog
                  organizationId={organizationId}
                  trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Plus className="h-4 w-4" />
                    </Button>
                  }
                />
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/customer-success/plans">
                  Ver todos
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {displayPlans.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sin planes activos</p>
            </div>
          ) : (
            displayPlans.map((plan) => (
              <PlanItem key={plan.id} plan={plan} compact />
            ))
          )}
        </CardContent>
      </Card>
    );
  }

  // Variante full
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Success Plans
            </CardTitle>
            <CardDescription>
              Planes de éxito activos para clientes
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {organizationId && (
              <CreatePlanDialog organizationId={organizationId} />
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/customer-success/plans">
                Ver todos
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {displayPlans.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Sin planes activos</p>
            <p className="text-xs">Crea un plan de éxito para comenzar</p>
          </div>
        ) : (
          <>
            {displayPlans.map((plan) => (
              <PlanItem key={plan.id} plan={plan} />
            ))}
            {hasMore && (
              <div className="text-center pt-2">
                <Button variant="link" size="sm" asChild>
                  <Link href="/admin/customer-success/plans">
                    Ver {plans!.length - maxItems} planes más
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default SuccessPlanCard;


