"use client";

import { useState } from "react";
import { usePartnerCommissions } from "@/lib/hooks/usePartners";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";
import { Download, Filter, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function PartnerCommissions() {
  const [filters, setFilters] = useState({
    status: "all",
    period: "all",
  });
  const t = useTranslationsSafe("partners.commissions");
  const { formatCurrency, formatDate } = useI18n();

  // Convertir "all" a undefined para el hook
  const commissionFilters = {
    status: filters.status === "all" ? undefined : filters.status,
    period: filters.period === "all" ? undefined : filters.period,
  };
  const { data: commissions, isLoading } = usePartnerCommissions(commissionFilters);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      approved: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  // Calcular totales
  const totals = commissions?.reduce(
    (acc, commission) => {
      if (commission.status === "paid") {
        acc.paid += commission.amount;
      } else if (commission.status === "pending" || commission.status === "approved") {
        acc.pending += commission.amount;
      }
      acc.total += commission.amount;
      return acc;
    },
    { paid: 0, pending: 0, total: 0 }
  ) || { paid: 0, pending: 0, total: 0 };

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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t("stats.total")}</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totals.total)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t("stats.pending")}</CardDescription>
            <CardTitle className="text-2xl text-yellow-600 dark:text-yellow-400">
              {formatCurrency(totals.pending)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t("stats.paid")}</CardDescription>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
              {formatCurrency(totals.paid)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.allStatuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.allStatuses")}</SelectItem>
                  <SelectItem value="pending">{t("status.pending")}</SelectItem>
                  <SelectItem value="approved">{t("status.approved")}</SelectItem>
                  <SelectItem value="paid">{t("status.paid")}</SelectItem>
                  <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={filters.period}
                onValueChange={(value) => setFilters({ ...filters, period: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.allPeriods")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.allPeriods")}</SelectItem>
                  <SelectItem value="2024-12">Diciembre 2024</SelectItem>
                  <SelectItem value="2024-11">Noviembre 2024</SelectItem>
                  <SelectItem value="2024-10">Octubre 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                {t("export")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Comisiones */}
      <Card>
        <CardHeader>
          <CardTitle>{t("commissionsList")}</CardTitle>
          <CardDescription>
            {t("totalCommissions", { count: commissions?.length || 0 })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.amount")}</TableHead>
                  <TableHead>{t("table.rate")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead>{t("table.period")}</TableHead>
                  <TableHead>{t("table.paidAt")}</TableHead>
                  <TableHead>{t("table.created")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!commissions || commissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="text-center py-12">
                        <DollarSign className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">{t("emptyCommissions.title")}</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                          {t("emptyCommissions.description")}
                        </p>
                        <Link href="/partners/leads">
                          <Button variant="outline" size="sm">
                            {t("emptyCommissions.action")}
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell className="font-medium">
                        {formatCurrency(commission.amount)}
                      </TableCell>
                      <TableCell>{commission.rate}%</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(commission.status)}>
                          {t(`status.${commission.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>{commission.period}</TableCell>
                      <TableCell>
                        {commission.paidAt
                          ? formatDate(commission.paidAt, "PP")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(commission.createdAt, "PP")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

