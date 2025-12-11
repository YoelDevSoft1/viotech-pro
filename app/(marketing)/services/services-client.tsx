"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Package,
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { useServices } from "@/lib/hooks/useServices";
import { PageShell } from "@/components/ui/shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

// Helpers visuales
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status.toLowerCase()) {
    case "activo": return "default";
    case "pendiente": return "secondary";
    case "expirado": return "destructive";
    default: return "outline";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "activo":
      return CheckCircle2;
    case "expirado":
      return AlertTriangle;
    default:
      return Sparkles;
  }
};

const getDaysUntilExpiration = (fechaExpiracion: string | null | undefined): number | null => {
  if (!fechaExpiracion) return null;
  const exp = new Date(fechaExpiracion);
  const now = new Date();
  const diff = exp.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

function ServicesSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-20" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export function ServicesPageClient() {
  const { services, loading, error, refresh } = useServices();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const t = useTranslationsSafe("services");
  const { formatDate } = useI18n();

  // Filtrado en cliente
  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchSearch = s.nombre.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || s.estado === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [services, search, statusFilter]);

  const activeServices = useMemo(
    () => services.filter((s) => s.estado.toLowerCase() === "activo").length,
    [services]
  );
  const expiringSoon = useMemo(
    () =>
      services.filter((s) => {
        const days = getDaysUntilExpiration(s.fecha_expiracion);
        return days !== null && days > 0 && days <= 30;
      }).length,
    [services]
  );

  return (
    <PageShell className="max-w-none mx-0 space-y-6">
      <div className="flex flex-col gap-6">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t("backToDashboard")}
              </Link>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">{t("myServices")}</h1>
              </div>
              <p className="text-muted-foreground mt-1">{t("myServicesDescription")}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {activeServices > 0 && (
                <Badge variant="secondary" className="gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  {activeServices} {t("active")}
                </Badge>
              )}
              {expiringSoon > 0 && (
                <Badge variant="outline" className="gap-1.5 border-yellow-500/50 text-yellow-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {expiringSoon} {t("expiringSoon")}
                </Badge>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => refresh()} aria-label={t("refresh")}>
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("refresh")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Link href="/services/catalog">
                <Button>
                  <Plus className="w-4 h-4 mr-2" /> {t("hireNew")}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-muted/20 p-4 rounded-lg border">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearch("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder={t("status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all")}</SelectItem>
              <SelectItem value="activo">{t("active")}</SelectItem>
              <SelectItem value="pendiente">{t("pending")}</SelectItem>
              <SelectItem value="expirado">{t("expired")}</SelectItem>
            </SelectContent>
          </Select>
          {(search || statusFilter !== "all") && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}>
                    <X className="h-4 w-4 mr-2" />
                    {t("clearFilters")}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("clearFilters")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Content Area */}
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("errorLoading")}</AlertTitle>
            <AlertDescription>
              {error}. <Button variant="link" className="p-0 h-auto font-normal text-destructive underline" onClick={() => refresh()}>{t("retry")}</Button>
            </AlertDescription>
          </Alert>
        ) : loading ? (
          <ServicesSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title={t("noServicesFound")}
            description={search || statusFilter !== "all" ? t("tryChangingFilters") : t("noServicesYet")}
            action={
              services.length === 0
                ? {
                    label: t("goToCatalog"),
                    onClick: () => (window.location.href = "/services/catalog"),
                    variant: "outline" as const,
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((service) => (
              <Card key={service.id} className="flex flex-col overflow-hidden transition-all hover:border-primary/50 hover:shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-semibold leading-tight line-clamp-1">
                      {service.nombre}
                    </CardTitle>
                    <Badge
                      variant={getStatusVariant(service.estado)}
                      className={cn("capitalize shrink-0 gap-1.5", service.estado.toLowerCase() === "expirado" && "text-destructive")}
                    >
                      {(() => {
                        const Icon = getStatusIcon(service.estado);
                        return <Icon className="h-3.5 w-3.5" />;
                      })()}
                      {service.estado}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{service.tipo || t("service")}</p>
                </CardHeader>

                <CardContent className="flex-1 pb-4 space-y-4">
                  {/* Dates */}
                  <div className="space-y-2 text-sm">
                    {service.fecha_compra && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {t("startDate")}</span>
                        <span>{formatDate(new Date(service.fecha_compra), "PP")}</span>
                      </div>
                    )}
                    {service.fecha_expiracion && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {t("expires")}</span>
                        <span>{formatDate(new Date(service.fecha_expiracion), "PP")}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress (si aplica) */}
                  {service.progreso !== null && service.progreso !== undefined && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{t("progress")}</span>
                        <span className="font-medium">{service.progreso}%</span>
                      </div>
                      <Progress value={service.progreso} className="h-1.5" />
                    </div>
                  )}

                  {/* Alertas de expiracion */}
                  {(() => {
                    const daysLeft = getDaysUntilExpiration(service.fecha_expiracion);
                    if (daysLeft !== null && daysLeft <= 7 && daysLeft > 0) {
                      return (
                        <Alert className="py-2 bg-yellow-500/10 border-yellow-500/40">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-xs text-yellow-700">
                            {t("expiresSoon", { days: daysLeft })}
                          </AlertDescription>
                        </Alert>
                      );
                    }
                    if (daysLeft !== null && daysLeft <= 0) {
                      return (
                        <Alert className="py-2 bg-red-500/10 border-red-500/30">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-xs text-red-700">
                            {t("expiredStatus")}
                          </AlertDescription>
                        </Alert>
                      );
                    }
                    return null;
                  })()}
                </CardContent>

                <CardFooter className="pt-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="secondary" className="w-full" size="sm">
                          {t("viewDetails")}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("viewDetails")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
