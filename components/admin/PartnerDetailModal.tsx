"use client";

import { usePartnerDetail } from "@/lib/hooks/usePartnersAdmin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";

interface PartnerDetailModalProps {
  partnerId: string;
  onClose: () => void;
}

export function PartnerDetailModal({ partnerId, onClose }: PartnerDetailModalProps) {
  const { data: partner, isLoading } = usePartnerDetail(partnerId);
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("detail.title")}</DialogTitle>
          <DialogDescription>{t("detail.description")}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : !partner ? (
          <p className="text-center text-muted-foreground py-4">{t("detail.notFound")}</p>
        ) : (
          <div className="space-y-6">
            {/* Información del Usuario */}
            <Card>
              <CardHeader>
                <CardTitle>{t("detail.userInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">{t("detail.name")}: </span>
                  <span className="font-medium">{partner.user?.nombre || "N/A"}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">{t("detail.email")}: </span>
                  <span className="font-medium">{partner.user?.email || "N/A"}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">{t("detail.role")}: </span>
                  <span className="font-medium">{partner.user?.rol || "N/A"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Información del Partner */}
            <Card>
              <CardHeader>
                <CardTitle>{t("detail.partnerInfo")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("detail.status")}</p>
                    <Badge className={getStatusBadge(partner.status)}>
                      {t(`status.${partner.status}`)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("detail.tier")}</p>
                    <Badge className={getTierBadge(partner.tier)}>
                      {t(`tiers.${partner.tier}`)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("detail.commissionRate")}</p>
                    <p className="font-medium">{partner.commissionRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("detail.performanceScore")}</p>
                    <p className="font-medium">{partner.performanceScore}/100</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle>{t("detail.stats")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">{t("detail.totalLeads")}</p>
                    <p className="text-2xl font-bold">{formatNumber(partner.stats.totalLeads)}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">{t("detail.convertedLeads")}</p>
                    <p className="text-2xl font-bold">{formatNumber(partner.stats.convertedLeads)}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">{t("detail.totalRevenue")}</p>
                    <p className="text-2xl font-bold">{formatCurrency(partner.totalRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comisiones */}
            <Card>
              <CardHeader>
                <CardTitle>{t("detail.commissions")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("detail.totalCommissions")}</p>
                    <p className="font-medium">{formatNumber(partner.stats.totalCommissions)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("detail.pendingCommissions")}</p>
                    <p className="font-medium text-yellow-600 dark:text-yellow-400">
                      {formatNumber(partner.stats.pendingCommissions)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("detail.paidCommissions")}</p>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      {formatNumber(partner.stats.paidCommissions)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("detail.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

