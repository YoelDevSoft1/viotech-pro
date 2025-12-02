"use client";

import { PartnerMarketing } from "@/components/partners/PartnerMarketing";
import PartnerGate from "@/components/partners/PartnerGate";

export default function PartnerMarketingPage() {
  return (
    <PartnerGate>
      <div className="space-y-6">
        <PartnerMarketing />
      </div>
    </PartnerGate>
  );
}


