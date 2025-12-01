"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  Package, 
  Plus, 
  Calendar, 
  Clock, 
  AlertCircle 
} from "lucide-react";

import { useServices, type Service } from "@/lib/hooks/useServices";
import { PageHeader, PageShell } from "@/components/ui/shell";
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

// Helpers visuales
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status.toLowerCase()) {
    case "activo": return "default";
    case "pendiente": return "secondary";
    case "expirado": return "destructive";
    default: return "outline";
  }
};

export function ServicesPageClient() {
  const { services, loading, error, refresh } = useServices();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const t = useTranslationsSafe("services");
  const { formatDate } = useI18n();

  // Filtrado en cliente
  const filtered = services.filter(s => {
    const matchSearch = s.nombre.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.estado === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <PageShell>
      <div className="flex flex-col gap-6">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t("backToDashboard")}
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t("myServices")}</h1>
              <p className="text-muted-foreground">{t("myServicesDescription")}</p>
            </div>
            <Link href="/services/catalog">
              <Button>
                <Plus className="w-4 h-4 mr-2" /> {t("hireNew")}
              </Button>
            </Link>
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-muted/10 border-dashed">
            <Package className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">{t("noServicesFound")}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              {search || statusFilter !== 'all' ? t("tryChangingFilters") : t("noServicesYet")}
            </p>
            {services.length === 0 && (
              <Link href="/services/catalog">
                <Button variant="outline">{t("goToCatalog")}</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((service) => (
              <Card key={service.id} className="flex flex-col overflow-hidden transition-all hover:border-primary/50 hover:shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-semibold leading-tight line-clamp-1">
                      {service.nombre}
                    </CardTitle>
                    <Badge variant={getStatusVariant(service.estado)} className="capitalize shrink-0">
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
                </CardContent>

                <CardFooter className="pt-0">
                  <Button variant="secondary" className="w-full" size="sm">
                    {t("viewDetails")}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

