"use client";

import { PartnerCommissions } from "@/components/partners/PartnerCommissions";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

export default function PartnerCommissionsPage() {
  const t = useTranslationsSafe("partners.commissions");

  return (
    <div className="space-y-6">
      <PartnerCommissions />
    </div>
  );
}

