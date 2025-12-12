"use client";

import Link from "next/link";
import { User, Mail, Briefcase, Clock, MapPin, Award, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Resource } from "@/lib/types/resources";
import { cn } from "@/lib/utils";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

interface ResourceCardProps {
  resource: Resource;
  href?: string;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
}

export function ResourceCard({
  resource,
  href,
  onClick,
  selected = false,
  compact = false,
}: ResourceCardProps) {
  const tResources = useTranslationsSafe("resources");

  const initials = resource.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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

  const getWorkloadColor = (workload: number, max: number) => {
    const percentage = (workload / max) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  const content = (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-200 cursor-pointer group",
        selected && "ring-2 ring-primary",
        compact && "p-2"
      )}
      onClick={onClick}
    >
      <CardHeader className={cn("pb-3", compact && "p-3")}>
        <div className="flex items-start gap-3">
          {/* Avatar con indicador de estado */}
          <div className="relative">
            <Avatar className={cn("h-12 w-12", compact && "h-10 w-10")}>
              <AvatarImage src={resource.avatar || undefined} alt={resource.userName} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                    getStatusColor(resource.availability.status)
                  )}
                />
              </TooltipTrigger>
              <TooltipContent>
                {getStatusLabel(resource.availability.status)}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Información del recurso */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
              {resource.userName}
            </h3>
            <p className="text-xs text-muted-foreground truncate">{resource.userEmail}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs capitalize">
                {resource.role}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      {!compact && (
        <CardContent className="pt-0 space-y-3">
          {/* Carga de trabajo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{tResources("workload")}</span>
              <span className={cn("font-medium", getWorkloadColor(resource.currentWorkload, resource.maxWorkload))}>
                {resource.currentWorkload.toFixed(0)}% / {resource.maxWorkload}%
              </span>
            </div>
            <Progress value={resource.currentWorkload} className="h-1.5" />
          </div>

          {/* Horario */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {resource.availability.workingHours.start} - {resource.availability.workingHours.end}
            </span>
          </div>

          {/* Skills */}
          {resource.skills && resource.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {resource.skills.slice(0, 3).map((skill) => (
                <Badge
                  key={skill.id}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0"
                >
                  {skill.name}
                  {skill.verified && (
                    <CheckCircle2 className="h-2.5 w-2.5 ml-1 text-green-600" />
                  )}
                </Badge>
              ))}
              {resource.skills.length > 3 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  +{resource.skills.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Certificaciones */}
          {resource.certifications && resource.certifications.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Award className="h-3 w-3" />
              <span>
                {resource.certifications.length} {tResources("certifications")}
              </span>
            </div>
          )}

          {/* Vacaciones pendientes */}
          {resource.availability.vacations && resource.availability.vacations.length > 0 && (
            <div className="text-xs text-orange-600 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {resource.availability.vacations.length} {tResources("vacationsScheduled")}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

