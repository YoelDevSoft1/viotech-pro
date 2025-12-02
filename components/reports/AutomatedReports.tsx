"use client";

import { useState, useMemo } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { AutomatedReport } from "@/lib/types/reports";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";

interface AutomatedReportsProps {
  organizationId?: string;
}

// Esquema de validación - se actualizará dinámicamente con traducciones
const getReportSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(1, t("validation.nameRequired")),
  type: z.enum(["daily", "weekly", "monthly"]),
  recipients: z.array(z.string()).min(1, t("validation.recipientsRequired")),
  format: z.enum(["pdf", "excel", "both"]),
  schedule: z.object({
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, t("validation.timeFormat")),
    timezone: z.string(),
    dayOfWeek: z.number().optional(),
    dayOfMonth: z.number().optional(),
  }),
  enabled: z.boolean(),
});

type ReportFormValues = z.infer<ReturnType<typeof getReportSchema>>;

export function AutomatedReports({ organizationId }: AutomatedReportsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<AutomatedReport | null>(null);
  const tReports = useTranslationsSafe("reports");
  const { formatDate } = useI18n();

  const { data: reports = [], isLoading } = useAutomatedReports(organizationId);
  const saveReport = useSaveAutomatedReport();

  // Crear labels de días usando traducciones
  const dayLabels = useMemo(() => {
    return {
      0: tReports("days.sunday"),
      1: tReports("days.monday"),
      2: tReports("days.tuesday"),
      3: tReports("days.wednesday"),
      4: tReports("days.thursday"),
      5: tReports("days.friday"),
      6: tReports("days.saturday"),
    } as Record<number, string>;
  }, [tReports]);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(getReportSchema(tReports)),
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
                {tReports("createAutomatedReport")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingReport ? tReports("editAutomatedReport") : tReports("createAutomatedReport")}
                </DialogTitle>
                <DialogDescription>
                  {tReports("automatedReportDescription")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="report-name">{tReports("name")}</Label>
                  <Input
                    id="report-name"
                    {...form.register("name")}
                    placeholder={tReports("namePlaceholder")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-red-600">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-type">{tReports("type")}</Label>
                    <Select
                      value={form.watch("type")}
                      onValueChange={(value) => form.setValue("type", value as ReportFormValues["type"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">{tReports("daily")}</SelectItem>
                        <SelectItem value="weekly">{tReports("weekly")}</SelectItem>
                        <SelectItem value="monthly">{tReports("monthly")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="report-format">{tReports("format")}</Label>
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
                    {tReports("cancel")}
                  </Button>
                  <Button type="submit" disabled={saveReport.isPending}>
                    {editingReport ? tReports("update") : tReports("create")}
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
            {tReports("noAutomatedReports")}
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
                        ? tReports("daily")
                        : report.type === "weekly"
                          ? tReports("weekly")
                          : tReports("monthly")}
                    </Badge>
                    <Badge variant={report.enabled ? "default" : "secondary"} className="text-xs">
                      {report.enabled ? tReports("active") : tReports("inactive")}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {report.type === "daily"
                      ? tReports("schedule.dailyAt", { time: report.schedule.time })
                      : report.type === "weekly"
                        ? tReports("schedule.weeklyOn", { day: dayLabels[report.schedule.dayOfWeek || 1], time: report.schedule.time })
                        : tReports("schedule.monthlyOn", { day: report.schedule.dayOfMonth || 1, time: report.schedule.time })}
                  </div>
                  {report.lastGenerated && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {tReports("lastGeneration")}: {formatDate(report.lastGenerated, "PPpp")}
                    </div>
                  )}
                  {report.nextGeneration && (
                    <div className="text-xs text-muted-foreground">
                      {tReports("nextGeneration")}: {formatDate(report.nextGeneration, "PPpp")}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(report)}
                  >
                    {tReports("edit")}
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

