"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Briefcase,
  Clock,
  Calendar,
  TrendingUp,
  Award,
  Settings,
  MapPin,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResource, useResourceWorkload } from "@/lib/hooks/useResources";
import { ResourceWorkload } from "./ResourceWorkload";
import { ResourceAvailability } from "./ResourceAvailability";
import { ResourceSkills } from "./ResourceSkills";
import { ResourceCalendar } from "./ResourceCalendar";
import type { Resource } from "@/lib/types/resources";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";

interface ResourceDetailProps {
  resourceId: string;
  backHref?: string;
}

export function ResourceDetail({ resourceId, backHref = "/internal/resources" }: ResourceDetailProps) {
  const tResources = useTranslationsSafe("resources");
  const [activeTab, setActiveTab] = useState("workload");

  const { data: resource, isLoading, isError } = useResource(resourceId);

  // Calcular fechas de la semana actual para workload
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const { data: workload, isLoading: workloadLoading } = useResourceWorkload(
    resourceId,
    weekStart,
    weekEnd
  );

  // Validar currentWorkload basado en datos reales de workload
  const validatedCurrentWorkload = useMemo(() => {
    if (!resource) return 0;
    
    const backendWorkload = resource.currentWorkload || 0;
    
    // Si tenemos datos de workload, validar contra ellos (fuente de verdad)
    if (workload) {
      const hasTasks = workload.totalHours > 0 || 
        workload.dailyWorkload.some(day => day.tasks && day.tasks.length > 0);
      
      // Si no hay tareas, el currentWorkload debe ser 0
      if (!hasTasks) {
        return 0;
      }
      
      // Si hay tareas, usar el valor calculado del workload
      const calculatedWorkload = workload.averageUtilization || workload.maxUtilization || 0;
      return Math.min(calculatedWorkload, resource.maxWorkload || 100);
    }
    
    // Si está cargando, mostrar 0 temporalmente
    if (workloadLoading) {
      return 0;
    }
    
    return Math.max(0, backendWorkload);
  }, [resource, workload, workloadLoading]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500";
      case "unavailable":
        return "bg-red-500";
      case "on_leave":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return tResources("status.available");
      case "busy":
        return tResources("status.busy");
      case "unavailable":
        return tResources("status.unavailable");
      case "on_leave":
        return tResources("status.onLeave");
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !resource) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <User className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold">{tResources("resourceNotFound")}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {tResources("resourceNotFoundDescription")}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {tResources("backToResources")}
          </Link>
        </Button>
      </div>
    );
  }

  const initials = resource.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={backHref}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={resource.avatar || undefined} alt={resource.userName} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background",
                getStatusColor(resource.availability.status)
              )}
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold">{resource.userName}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Mail className="h-4 w-4" />
              <span>{resource.userEmail}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="capitalize">
                {resource.role}
              </Badge>
              <Badge
                className={cn(
                  getStatusColor(resource.availability.status),
                  "text-white"
                )}
              >
                {getStatusLabel(resource.availability.status)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de carga */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {tResources("workloadSummary")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Carga actual */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{tResources("currentWorkload")}</span>
                <span
                  className={cn(
                    "font-semibold",
                    validatedCurrentWorkload >= 90
                      ? "text-red-600"
                      : validatedCurrentWorkload >= 70
                      ? "text-yellow-600"
                      : "text-green-600"
                  )}
                >
                  {validatedCurrentWorkload.toFixed(0)}%
                </span>
              </div>
              <Progress value={validatedCurrentWorkload} className="h-2" />
            </div>

            {/* Horas esta semana */}
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">
                {workload?.totalHours.toFixed(1) || "0"}h
              </div>
              <div className="text-xs text-muted-foreground">{tResources("hoursThisWeek")}</div>
            </div>

            {/* Utilización promedio */}
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">
                {workload?.averageUtilization.toFixed(0) || "0"}%
              </div>
              <div className="text-xs text-muted-foreground">{tResources("avgUtilization")}</div>
            </div>

            {/* Conflictos */}
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div
                className={cn(
                  "text-2xl font-bold",
                  (workload?.conflicts.length || 0) > 0 && "text-red-600"
                )}
              >
                {workload?.conflicts.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">{tResources("conflicts")}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de contenido */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="workload" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {tResources("workload")}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            {tResources("calendar")}
          </TabsTrigger>
          <TabsTrigger value="availability" className="gap-2">
            <Clock className="h-4 w-4" />
            {tResources("availability")}
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-2">
            <Award className="h-4 w-4" />
            {tResources("skillsAndCertifications")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workload" className="mt-6">
          <ResourceWorkload organizationId={resource.organizationId} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <ResourceCalendar organizationId={resource.organizationId} />
        </TabsContent>

        <TabsContent value="availability" className="mt-6">
          <ResourceAvailability resourceId={resourceId} />
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <ResourceSkills resourceId={resourceId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

