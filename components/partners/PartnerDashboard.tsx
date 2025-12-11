"use client";

import { usePartnerDashboard } from "@/lib/hooks/usePartners";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Award, 
  Target,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Gift,
  Plus,
  Ticket
} from "lucide-react";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PartnerDashboard() {
  const { data, isLoading, error } = usePartnerDashboard();
  const t = useTranslationsSafe("partners");
  const { formatCurrency, formatNumber } = useI18n();

  // No mostrar skeleton durante la carga inicial - PartnerGate maneja la carga
  // Solo mostrar contenido cuando hay datos o error
  // Si está cargando y no hay datos ni error, no mostrar nada (PartnerGate mostrará la carga)
  if (isLoading && !data && !error) {
    return null;
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : t("error.loading");
    const isForbidden = errorMessage.includes("permisos") || errorMessage.includes("403") || errorMessage.includes("acceso");
    const isUnauthorized = errorMessage.includes("sesión") || errorMessage.includes("401");
    // Detectar si el mensaje indica que no es partner registrado
    const isNotRegistered = errorMessage.toLowerCase().includes("partner registrado") || 
                            errorMessage.toLowerCase().includes("regístrate como partner") ||
                            errorMessage.toLowerCase().includes("no eres un partner");
    
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6 text-center py-8 px-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-3 max-w-md">
              <h3 className="text-xl font-semibold">
                {isNotRegistered
                  ? t("error.notRegistered", { defaultValue: "No estás registrado como Partner" })
                  : isForbidden 
                  ? t("error.forbidden") 
                  : isUnauthorized
                  ? t("error.unauthorized")
                  : t("error.loading")
                }
              </h3>
              <p className="text-sm text-muted-foreground">
                {isNotRegistered
                  ? t("error.notRegisteredMessage", {
                      defaultValue: "No estás registrado como Partner en el sistema. Si necesitas acceso al Portal de Partners, puedes solicitar el registro abriendo un ticket de soporte. Nuestro equipo revisará tu solicitud y te notificará cuando tu cuenta esté activa."
                    })
                  : isForbidden 
                  ? t("error.forbiddenMessage", {
                      defaultValue: "No tienes acceso al Portal de Partners. Si necesitas acceso, puedes solicitar permisos abriendo un ticket de soporte."
                    })
                  : errorMessage
                }
              </p>
              {(isForbidden || isNotRegistered) && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => window.location.href = "/client/tickets?subject=Solicitud de acceso a Partners"}
                    className="gap-2"
                  >
                    <Ticket className="h-4 w-4" />
                    {t("error.openTicket", { defaultValue: "Abrir ticket de soporte" })}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = "/dashboard"}
                  >
                    {t("error.backToDashboard", { defaultValue: "Volver al dashboard" })}
                  </Button>
                </div>
              )}
              {!isForbidden && !isUnauthorized && !isNotRegistered && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  {t("error.retry")}
                </Button>
              )}
              {isUnauthorized && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => window.location.href = "/login"}
                >
                  {t("error.goToLogin")}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>{t("noData")}</p>
        </CardContent>
      </Card>
    );
  }

  const { partner, stats, recentLeads, recentCommissions, upcomingTrainings, certifications } = data;

  const tierColors = {
    bronze: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    silver: "bg-gray-400/10 text-gray-700 dark:text-gray-400",
    gold: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    platinum: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  };

  return (
    <div className="space-y-6">
      {/* Header con información del partner */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {t("dashboard.title")}
                <Badge className={tierColors[partner.tier]}>
                  {t(`tiers.${partner.tier}`)}
                </Badge>
              </CardTitle>
              <CardDescription>
                {t("dashboard.subtitle", { joinedAt: new Date(partner.joinedAt).getFullYear().toString() })}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{t("performanceScore")}</p>
              <p className="text-2xl font-bold">{partner.performanceScore}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.totalLeads")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalLeads)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeLeads} {t("stats.active")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.conversionRate")}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {t("stats.trend")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.totalRevenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.pendingCommissions)} {t("stats.pending")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.commissions")}</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.paidCommissions)}</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.commissionRate", { rate: partner.commissionRate })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Leads Recientes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("recentLeads")}</CardTitle>
                <CardDescription>{t("recentLeadsDescription")}</CardDescription>
              </div>
              <Link href="/partners/leads">
                <Button variant="ghost" size="sm">{t("viewAll")}</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-sm font-medium mb-2">{t("empty.leads.title")}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  {t("empty.leads.description")}
                </p>
                <Link href="/partners/leads">
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("empty.leads.action")}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLeads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </div>
                    <Badge variant={
                      lead.status === "converted" ? "default" :
                      lead.status === "qualified" ? "secondary" :
                      "outline"
                    }>
                      {t(`leadStatus.${lead.status}`)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comisiones Recientes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("recentCommissions")}</CardTitle>
                <CardDescription>{t("recentCommissionsDescription")}</CardDescription>
              </div>
              <Link href="/partners/commissions">
                <Button variant="ghost" size="sm">{t("viewAll")}</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentCommissions.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-sm font-medium mb-2">{t("empty.commissions.title")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("empty.commissions.description")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCommissions.slice(0, 5).map((commission) => (
                  <div key={commission.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {formatCurrency(commission.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t(`commissionStatus.${commission.status}`)} • {commission.period}
                      </p>
                    </div>
                    <Badge variant={
                      commission.status === "paid" ? "default" :
                      commission.status === "approved" ? "secondary" :
                      "outline"
                    }>
                      {t(`commissionStatus.${commission.status}`)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trainings y Certificaciones */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("upcomingTrainings")}</CardTitle>
                <CardDescription>{t("upcomingTrainingsDescription")}</CardDescription>
              </div>
              <Link href="/partners/training">
                <Button variant="ghost" size="sm">{t("viewAll")}</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingTrainings.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-sm font-medium mb-2">{t("empty.trainings.title")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("empty.trainings.description")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTrainings.slice(0, 3).map((training) => (
                  <div key={training.id} className="flex items-start gap-3 p-2 rounded-lg border">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{training.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {t(`trainingLevel.${training.level}`)} • {training.duration} {t("minutes")}
                      </p>
                    </div>
                    {training.required && (
                      <Badge variant="destructive" className="text-xs">
                        {t("required")}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("certifications")}</CardTitle>
                <CardDescription>{t("certificationsDescription")}</CardDescription>
              </div>
              <Link href="/partners/certifications">
                <Button variant="ghost" size="sm">{t("viewAll")}</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {certifications.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-sm font-medium mb-2">{t("empty.certifications.title")}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  {t("empty.certifications.description")}
                </p>
                <Link href="/partners/training">
                  <Button size="sm" variant="outline">
                    {t("empty.certifications.action")}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {certifications.map((cert) => (
                  <div key={cert.id} className="flex items-start gap-3 p-2 rounded-lg border">
                    <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{cert.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {t(`certStatus.${cert.status}`)}
                        {cert.expiresAt && ` • ${t("expires")} ${new Date(cert.expiresAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    {cert.status === "completed" && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

