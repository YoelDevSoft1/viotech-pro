"use client";

import { useState } from "react";
import { usePartnerPerformance } from "@/lib/hooks/usePartners";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";
import { Download, TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Link from "next/link";

export function PartnerReports() {
  const [period, setPeriod] = useState<string>("all");
  const t = useTranslationsSafe("partners.reports");
  const { formatCurrency, formatNumber, formatDate } = useI18n();

  // Convertir "all" a undefined para el hook
  const performancePeriod = period === "all" ? undefined : period;
  const { data: performance, isLoading } = usePartnerPerformance(performancePeriod);

  // Preparar datos para gráficos
  const chartData = performance?.map((p) => ({
    period: p.period,
    leads: p.leadsGenerated,
    converted: p.leadsConverted,
    revenue: p.revenue,
    commissions: p.commissions,
    conversionRate: p.conversionRate,
  })) || [];

  const latestPerformance = performance && performance.length > 0 ? performance[0] : null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("selectPeriod")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allPeriods")}</SelectItem>
              <SelectItem value="2024-12">Diciembre 2024</SelectItem>
              <SelectItem value="2024-11">Noviembre 2024</SelectItem>
              <SelectItem value="2024-10">Octubre 2024</SelectItem>
              <SelectItem value="2024-09">Septiembre 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t("export")}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      {latestPerformance && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{t("kpis.leadsGenerated")}</CardDescription>
              <CardTitle className="text-2xl">
                {formatNumber(latestPerformance.leadsGenerated)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestPerformance.trends.leads.length > 1 && (
                <div className="flex items-center gap-2 text-sm">
                  {latestPerformance.trends.leads[latestPerformance.trends.leads.length - 1] > latestPerformance.trends.leads[latestPerformance.trends.leads.length - 2] ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : latestPerformance.trends.leads[latestPerformance.trends.leads.length - 1] < latestPerformance.trends.leads[latestPerformance.trends.leads.length - 2] ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-muted-foreground">
                    {t("trend")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{t("kpis.conversionRate")}</CardDescription>
              <CardTitle className="text-2xl">
                {latestPerformance.conversionRate.toFixed(1)}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestPerformance.trends.conversions.length > 1 && (
                <div className="flex items-center gap-2 text-sm">
                  {latestPerformance.trends.conversions[latestPerformance.trends.conversions.length - 1] > latestPerformance.trends.conversions[latestPerformance.trends.conversions.length - 2] ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : latestPerformance.trends.conversions[latestPerformance.trends.conversions.length - 1] < latestPerformance.trends.conversions[latestPerformance.trends.conversions.length - 2] ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-muted-foreground">
                    {t("trend")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{t("kpis.revenue")}</CardDescription>
              <CardTitle className="text-2xl">
                {formatCurrency(latestPerformance.revenue)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestPerformance.trends.revenue.length > 1 && (
                <div className="flex items-center gap-2 text-sm">
                  {latestPerformance.trends.revenue[latestPerformance.trends.revenue.length - 1] > latestPerformance.trends.revenue[latestPerformance.trends.revenue.length - 2] ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : latestPerformance.trends.revenue[latestPerformance.trends.revenue.length - 1] < latestPerformance.trends.revenue[latestPerformance.trends.revenue.length - 2] ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-muted-foreground">
                    {t("trend")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{t("kpis.commissions")}</CardDescription>
              <CardTitle className="text-2xl">
                {formatCurrency(latestPerformance.commissions)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {latestPerformance.topPerformingService && (
                  <span>{t("topService")}: {latestPerformance.topPerformingService}</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Leads y Conversiones */}
        <Card>
          <CardHeader>
            <CardTitle>{t("charts.leadsAndConversions")}</CardTitle>
            <CardDescription>{t("charts.leadsAndConversionsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" fill="#8884d8" name={t("charts.leads")} />
                <Bar dataKey="converted" fill="#82ca9d" name={t("charts.converted")} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue y Comisiones */}
        <Card>
          <CardHeader>
            <CardTitle>{t("charts.revenueAndCommissions")}</CardTitle>
            <CardDescription>{t("charts.revenueAndCommissionsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name={t("charts.revenue")} />
                <Line type="monotone" dataKey="commissions" stroke="#82ca9d" name={t("charts.commissions")} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>{t("performanceTable")}</CardTitle>
          <CardDescription>{t("performanceTableDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!performance || performance.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">{t("emptyReports.title")}</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                {t("emptyReports.description")}
              </p>
              <Link href="/partners/leads">
                <Button variant="outline" size="sm">
                  {t("emptyReports.action")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">{t("table.period")}</th>
                    <th className="text-right p-2">{t("table.leads")}</th>
                    <th className="text-right p-2">{t("table.converted")}</th>
                    <th className="text-right p-2">{t("table.conversionRate")}</th>
                    <th className="text-right p-2">{t("table.revenue")}</th>
                    <th className="text-right p-2">{t("table.commissions")}</th>
                    <th className="text-right p-2">{t("table.avgDealSize")}</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.map((p) => (
                    <tr key={p.period} className="border-b">
                      <td className="p-2 font-medium">{p.period}</td>
                      <td className="p-2 text-right">{formatNumber(p.leadsGenerated)}</td>
                      <td className="p-2 text-right">{formatNumber(p.leadsConverted)}</td>
                      <td className="p-2 text-right">{p.conversionRate.toFixed(1)}%</td>
                      <td className="p-2 text-right">{formatCurrency(p.revenue)}</td>
                      <td className="p-2 text-right">{formatCurrency(p.commissions)}</td>
                      <td className="p-2 text-right">{formatCurrency(p.averageDealSize)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

