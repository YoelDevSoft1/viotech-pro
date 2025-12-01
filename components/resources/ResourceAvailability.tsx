"use client";

import { useState, useMemo } from "react";
import { Calendar, Plus, X, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useResource, useCreateVacation, useUpdateResourceAvailability } from "@/lib/hooks/useResources";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Vacation, Resource } from "@/lib/types/resources";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";

interface ResourceAvailabilityProps {
  resourceId: string;
}

// Esquema de validación - se actualizará dinámicamente con traducciones
const getVacationSchema = (t: (key: string) => string) => z.object({
  startDate: z.string().min(1, t("validation.startDateRequired")),
  endDate: z.string().min(1, t("validation.endDateRequired")),
  type: z.enum(["vacation", "sick_leave", "personal", "other"]),
  description: z.string().optional(),
});

type VacationFormValues = z.infer<ReturnType<typeof getVacationSchema>>;

export function ResourceAvailability({ resourceId }: ResourceAvailabilityProps) {
  const tResources = useTranslationsSafe("resources");
  const tCommon = useTranslationsSafe("common");
  const { formatDate } = useI18n();

  // Crear labels de días usando traducciones
  const dayLabels = useMemo(() => {
    return {
      0: tResources("days.sunday"),
      1: tResources("days.monday"),
      2: tResources("days.tuesday"),
      3: tResources("days.wednesday"),
      4: tResources("days.thursday"),
      5: tResources("days.friday"),
      6: tResources("days.saturday"),
    } as Record<number, string>;
  }, [tResources]);

  const [vacationDialogOpen, setVacationDialogOpen] = useState(false);

  const { data: resource, isLoading } = useResource(resourceId);
  const createVacation = useCreateVacation();
  const updateAvailability = useUpdateResourceAvailability();

  const vacationForm = useForm<VacationFormValues>({
    resolver: zodResolver(getVacationSchema(tResources)),
    defaultValues: {
      startDate: "",
      endDate: "",
      type: "vacation",
      description: "",
    },
  });

  const onVacationSubmit = async (values: VacationFormValues) => {
    try {
      await createVacation.mutateAsync({
        resourceId,
        vacation: {
          startDate: values.startDate,
          endDate: values.endDate,
          type: values.type,
          description: values.description,
        },
      });
      setVacationDialogOpen(false);
      vacationForm.reset();
    } catch (error) {
      console.error("Error al crear vacación:", error);
    }
  };

  const handleWorkingDaysChange = (day: number, enabled: boolean) => {
    if (!resource) return;

    const currentDays = resource.availability.workingDays || [];
    const newDays = enabled
      ? [...currentDays, day].sort()
      : currentDays.filter((d) => d !== day);

    updateAvailability.mutate({
      resourceId,
      availability: {
        workingDays: newDays,
      },
    });
  };

  const handleStatusChange = (status: Resource["availability"]["status"]) => {
    updateAvailability.mutate({
      resourceId,
      availability: {
        status,
      },
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Disponibilidad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-muted animate-pulse rounded" />
            <div className="h-20 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!resource) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Recurso no encontrado
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estado y Horario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Disponibilidad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estado */}
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={resource.availability.status}
              onValueChange={(value) =>
                handleStatusChange(value as Resource["availability"]["status"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="busy">Ocupado</SelectItem>
                <SelectItem value="unavailable">No disponible</SelectItem>
                <SelectItem value="on_leave">En vacaciones</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Horario de trabajo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hora de inicio</Label>
              <Input
                type="time"
                value={resource.availability.workingHours.start}
                onChange={(e) =>
                  updateAvailability.mutate({
                    resourceId,
                    availability: {
                      workingHours: {
                        ...resource.availability.workingHours,
                        start: e.target.value,
                      },
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Hora de fin</Label>
              <Input
                type="time"
                value={resource.availability.workingHours.end}
                onChange={(e) =>
                  updateAvailability.mutate({
                    resourceId,
                    availability: {
                      workingHours: {
                        ...resource.availability.workingHours,
                        end: e.target.value,
                      },
                    },
                  })
                }
              />
            </div>
          </div>

          {/* Días de trabajo */}
          <div className="space-y-2">
            <Label>Días de trabajo</Label>
            <div className="grid grid-cols-7 gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                const isEnabled = resource.availability.workingDays.includes(day);
                return (
                  <div key={day} className="space-y-1">
                    <div className="text-xs text-center text-muted-foreground">
                      {dayLabels[day].slice(0, 3)}
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => handleWorkingDaysChange(day, checked)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Zona horaria */}
          <div className="space-y-2">
            <Label>Zona horaria</Label>
            <Input
              value={resource.availability.workingHours.timezone}
              onChange={(e) =>
                updateAvailability.mutate({
                  resourceId,
                  availability: {
                    workingHours: {
                      ...resource.availability.workingHours,
                      timezone: e.target.value,
                    },
                  },
                })
              }
              placeholder="America/Bogota"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vacaciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Vacaciones y Ausencias
            </CardTitle>
            <Dialog open={vacationDialogOpen} onOpenChange={setVacationDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {tResources("addVacation")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{tResources("addVacation")}</DialogTitle>
                  <DialogDescription>
                    Registra un período de vacaciones o ausencia
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={vacationForm.handleSubmit(onVacationSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vacation-start">Fecha de inicio</Label>
                      <Input
                        id="vacation-start"
                        type="date"
                        {...vacationForm.register("startDate")}
                      />
                      {vacationForm.formState.errors.startDate && (
                        <p className="text-xs text-red-600">
                          {vacationForm.formState.errors.startDate.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vacation-end">Fecha de fin</Label>
                      <Input
                        id="vacation-end"
                        type="date"
                        {...vacationForm.register("endDate")}
                      />
                      {vacationForm.formState.errors.endDate && (
                        <p className="text-xs text-red-600">
                          {vacationForm.formState.errors.endDate.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vacation-type">Tipo</Label>
                    <Select
                      value={vacationForm.watch("type")}
                      onValueChange={(value) =>
                        vacationForm.setValue("type", value as VacationFormValues["type"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vacation">Vacaciones</SelectItem>
                        <SelectItem value="sick_leave">Licencia médica</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vacation-description">Descripción (opcional)</Label>
                    <Input
                      id="vacation-description"
                      {...vacationForm.register("description")}
                      placeholder="Motivo de la ausencia"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setVacationDialogOpen(false)}
                    >
                      {tResources("cancel")}
                    </Button>
                    <Button type="submit" disabled={createVacation.isPending}>
                      {tResources("add")}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {resource.availability.vacations && resource.availability.vacations.length > 0 ? (
            <div className="space-y-2">
              {resource.availability.vacations.map((vacation) => (
                <div
                  key={vacation.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatDate(vacation.startDate, "PP")} - {formatDate(vacation.endDate, "PP")}
                      </span>
                      <Badge
                        variant={vacation.approved ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {vacation.approved ? tCommon("vacationStatus.approved") : tCommon("vacationStatus.pending")}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {vacation.type === "vacation"
                          ? tCommon("vacationTypes.vacation")
                          : vacation.type === "sick_leave"
                            ? tCommon("vacationTypes.sick_leave")
                            : vacation.type === "personal"
                              ? tCommon("vacationTypes.personal")
                              : tCommon("vacationTypes.other")}
                      </Badge>
                    </div>
                    {vacation.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {vacation.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No hay vacaciones registradas
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

