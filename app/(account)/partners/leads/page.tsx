"use client";

import { PartnerLeads } from "@/components/partners/PartnerLeads";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import PartnerGate from "@/components/partners/PartnerGate";

export default function PartnerLeadsPage() {
  const t = useTranslationsSafe("partners.leads");

  return (
    <PartnerGate>
      <div className="space-y-6">
        <PartnerLeads />
      </div>
    </PartnerGate>
  );
}

