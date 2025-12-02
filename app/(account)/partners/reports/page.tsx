"use client";

import { PartnerReports } from "@/components/partners/PartnerReports";
import PartnerGate from "@/components/partners/PartnerGate";

export default function PartnerReportsPage() {
  return (
    <PartnerGate>
      <div className="space-y-6">
        <PartnerReports />
      </div>
    </PartnerGate>
  );
}


