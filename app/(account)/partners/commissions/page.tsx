"use client";

import { PartnerCommissions } from "@/components/partners/PartnerCommissions";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import PartnerGate from "@/components/partners/PartnerGate";

export default function PartnerCommissionsPage() {
  const t = useTranslationsSafe("partners.commissions");

  return (
    <PartnerGate>
      <div className="space-y-6">
        <PartnerCommissions />
      </div>
    </PartnerGate>
  );
}

