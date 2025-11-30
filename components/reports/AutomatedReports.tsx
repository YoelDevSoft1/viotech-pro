"use client";

import { useState } from "react";
import { Calendar, Plus, Trash2, Mail, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAutomatedReports, useSaveAutomatedReport } from "@/lib/hooks/useReports";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { AutomatedReport } from "@/lib/types/reports";

interface AutomatedReportsProps {
  organizationId?: string;
}

const reportSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(["daily", "weekly", "monthly"]),
  recipients: z.array(z.string()).min(1, "Al menos un destinatario es requerido"),
  format: z.enum(["pdf", "excel", "both"]),
  schedule: z.object({
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato HH:mm"),
    timezone: z.string(),
    dayOfWeek: z.number().optional(),
    dayOfMonth: z.number().optional(),
  }),
  enabled: z.boolean(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

const dayLabels: Record<number, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

export function AutomatedReports({ organizationId }: AutomatedReportsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<AutomatedReport | null>(null);

  const { data: reports = [], isLoading } = useAutomatedReports(organizationId);
  const saveReport = useSaveAutomatedReport();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      name: "",
      type: "weekly",
      recipients: [],
      format: "pdf",
      schedule: {
        time: "09:00",
        timezone: "America/Bogota",
        dayOfWeek: 1,
        dayOfMonth: 1,
      },
      enabled: true,
    },
  });

  const onSubmit = async (values: ReportFormValues) => {
    try {
      await saveReport.mutateAsync({
        reportId: editingReport?.id,
        report: {
          name: values.name,
          type: values.type,
          recipients: values.recipients,
          format: values.format,
          schedule: values.schedule,
          enabled: values.enabled,
          organizationId,
        },
      });
      setDialogOpen(false);
      setEditingReport(null);
      form.reset();
    } catch (error) {
      console.error("Error al guardar reporte automático:", error);
    }
  };

  const handleEdit = (report: AutomatedReport) => {
    setEditingReport(report);
    form.reset({
      name: report.name,
      type: report.type,
      recipients: report.recipients,
      format: report.format,
      schedule: report.schedule,
      enabled: report.enabled,
    });
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reportes Automáticos</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reportes Automáticos
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => {
                setEditingReport(null);
                form.reset();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Reporte Automático
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingReport ? "Editar Reporte Automático" : "Crear Reporte Automático"}
                </DialogTitle>
                <DialogDescription>
                  Configura un reporte que se generará y enviará automáticamente
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="report-name">Nombre</Label>
                  <Input
                    id="report-name"
                    {...form.register("name")}
                    placeholder="Ej: Reporte Semanal Ejecutivo"
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-red-600">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-type">Tipo</Label>
                    <Select
                      value={form.watch("type")}
                      onValueChange={(value) => form.setValue("type", value as ReportFormValues["type"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diario</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="report-format">Formato</Label>
                    <Select
                      value={form.watch("format")}
                      onValueChange={(value) => form.setValue("format", value as ReportFormValues["format"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="both">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-time">Hora</Label>
                    <Input
                      id="schedule-time"
                      type="time"
                      {...form.register("schedule.time")}
                    />
                    {form.formState.errors.schedule?.time && (
                      <p className="text-xs text-red-600">
                        {form.formState.errors.schedule.time.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schedule-timezone">Zona Horaria</Label>
                    <Input
                      id="schedule-timezone"
                      {...form.register("schedule.timezone")}
                      placeholder="America/Bogota"
                    />
                  </div>
                </div>

                {form.watch("type") === "weekly" && (
                  <div className="space-y-2">
                    <Label htmlFor="schedule-day-of-week">Día de la Semana</Label>
                    <Select
                      value={String(form.watch("schedule.dayOfWeek") || 1)}
                      onValueChange={(value) =>
                        form.setValue("schedule.dayOfWeek", parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((day) => (
                          <SelectItem key={day} value={String(day)}>
                            {dayLabels[day]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {form.watch("type") === "monthly" && (
                  <div className="space-y-2">
                    <Label htmlFor="schedule-day-of-month">Día del Mes</Label>
                    <Input
                      id="schedule-day-of-month"
                      type="number"
                      min="1"
                      max="31"
                      {...form.register("schedule.dayOfMonth", { valueAsNumber: true })}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="report-enabled">Habilitado</Label>
                  <Switch
                    id="report-enabled"
                    checked={form.watch("enabled")}
                    onCheckedChange={(checked) => form.setValue("enabled", checked)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setEditingReport(null);
                      form.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saveReport.isPending}>
                    {editingReport ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No hay reportes automáticos configurados
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{report.name}</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {report.type === "daily"
                        ? "Diario"
                        : report.type === "weekly"
                          ? "Semanal"
                          : "Mensual"}
                    </Badge>
                    <Badge variant={report.enabled ? "default" : "secondary"} className="text-xs">
                      {report.enabled ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {report.type === "daily"
                      ? `Diario a las ${report.schedule.time}`
                      : report.type === "weekly"
                        ? `${dayLabels[report.schedule.dayOfWeek || 1]} a las ${report.schedule.time}`
                        : `Día ${report.schedule.dayOfMonth || 1} a las ${report.schedule.time}`}
                  </div>
                  {report.lastGenerated && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Última generación:{" "}
                      {format(new Date(report.lastGenerated), "PPpp", { locale: es })}
                    </div>
                  )}
                  {report.nextGeneration && (
                    <div className="text-xs text-muted-foreground">
                      Próxima generación:{" "}
                      {format(new Date(report.nextGeneration), "PPpp", { locale: es })}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(report)}
                  >
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

