"use client";

import { useState } from "react";
import { usePartnersList, useActivatePartner, useSuspendPartner } from "@/lib/hooks/usePartnersAdmin";
import { RegisterPartnerModal } from "./RegisterPartnerModal";
import { PartnerDetailModal } from "./PartnerDetailModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";
import { Handshake, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function PartnersList() {
  const [filters, setFilters] = useState({
    status: "",
    tier: "",
    organizationId: "",
  });
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [partnerToActivate, setPartnerToActivate] = useState<string | null>(null);
  const [partnerToSuspend, setPartnerToSuspend] = useState<string | null>(null);

  const { data: partners, isLoading } = usePartnersList(filters);
  const activatePartner = useActivatePartner();
  const suspendPartner = useSuspendPartner();
  const t = useTranslationsSafe("partners.admin");
  const { formatCurrency, formatNumber } = useI18n();

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return styles[status as keyof typeof styles] || styles.inactive;
  };

  const getTierBadge = (tier: string) => {
    const styles = {
      bronze: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      silver: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      gold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      platinum: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };
    return styles[tier as keyof typeof styles] || styles.bronze;
  };

  const handleActivate = async (partnerId: string) => {
    await activatePartner.mutateAsync(partnerId);
    setPartnerToActivate(null);
  };

  const handleSuspend = async (partnerId: string) => {
    await suspendPartner.mutateAsync(partnerId);
    setPartnerToSuspend(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros y Botón de Registro */}
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("filters.status")}
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.allStatuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("filters.allStatuses")}</SelectItem>
                  <SelectItem value="active">{t("status.active")}</SelectItem>
                  <SelectItem value="pending">{t("status.pending")}</SelectItem>
                  <SelectItem value="suspended">{t("status.suspended")}</SelectItem>
                  <SelectItem value="inactive">{t("status.inactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("filters.tier")}
              </label>
              <Select
                value={filters.tier}
                onValueChange={(value) => setFilters({ ...filters, tier: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.allTiers")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("filters.allTiers")}</SelectItem>
                  <SelectItem value="bronze">{t("tiers.bronze")}</SelectItem>
                  <SelectItem value="silver">{t("tiers.silver")}</SelectItem>
                  <SelectItem value="gold">{t("tiers.gold")}</SelectItem>
                  <SelectItem value="platinum">{t("tiers.platinum")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 flex items-end">
              <Button
                onClick={() => setShowRegisterModal(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("registerNew")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Partners */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.user")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead>{t("table.tier")}</TableHead>
                  <TableHead>{t("table.commission")}</TableHead>
                  <TableHead>{t("table.leads")}</TableHead>
                  <TableHead>{t("table.revenue")}</TableHead>
                  <TableHead>{t("table.performance")}</TableHead>
                  <TableHead>{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!partners || partners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {t("noPartners")}
                    </TableCell>
                  </TableRow>
                ) : (
                  partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {partner.user?.nombre || "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {partner.user?.email || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(partner.status)}>
                          {t(`status.${partner.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTierBadge(partner.tier)}>
                          {t(`tiers.${partner.tier}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>{partner.commissionRate}%</TableCell>
                      <TableCell>{formatNumber(partner.totalLeads)}</TableCell>
                      <TableCell>{formatCurrency(partner.totalRevenue)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${partner.performanceScore}%` }}
                            />
                          </div>
                          <span className="text-sm">{partner.performanceScore}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPartner(partner.id)}
                          >
                            {t("actions.view")}
                          </Button>
                          {partner.status === "active" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPartnerToSuspend(partner.id)}
                              disabled={suspendPartner.isPending}
                            >
                              {t("actions.suspend")}
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPartnerToActivate(partner.id)}
                              disabled={activatePartner.isPending}
                            >
                              {t("actions.activate")}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      {showRegisterModal && (
        <RegisterPartnerModal onClose={() => setShowRegisterModal(false)} />
      )}

      {selectedPartner && (
        <PartnerDetailModal
          partnerId={selectedPartner}
          onClose={() => setSelectedPartner(null)}
        />
      )}

      {/* Alertas de confirmación */}
      <AlertDialog open={!!partnerToActivate} onOpenChange={(open) => !open && setPartnerToActivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm.activateTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirm.activateDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("confirm.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => partnerToActivate && handleActivate(partnerToActivate)}>
              {t("confirm.activate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!partnerToSuspend} onOpenChange={(open) => !open && setPartnerToSuspend(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm.suspendTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirm.suspendDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("confirm.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => partnerToSuspend && handleSuspend(partnerToSuspend)}>
              {t("confirm.suspend")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

