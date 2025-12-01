"use client";

import { PartnerLeads } from "@/components/partners/PartnerLeads";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

export default function PartnerLeadsPage() {
  const t = useTranslationsSafe("partners.leads");

  return (
    <div className="space-y-6">
      <PartnerLeads />
    </div>
  );
}

