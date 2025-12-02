"use client";

import { PartnerDashboard } from "@/components/partners/PartnerDashboard";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import PartnerGate from "@/components/partners/PartnerGate";

export default function PartnersPage() {
  const t = useTranslationsSafe("partners");

  return (
    <PartnerGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground">
            {t("dashboard.subtitle", { joinedAt: new Date().getFullYear().toString() })}
          </p>
        </div>
        <PartnerDashboard />
      </div>
    </PartnerGate>
  );
}

