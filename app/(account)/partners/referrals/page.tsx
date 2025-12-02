"use client";

import { PartnerReferrals } from "@/components/partners/PartnerReferrals";
import PartnerGate from "@/components/partners/PartnerGate";

export default function PartnerReferralsPage() {
  return (
    <PartnerGate>
      <div className="space-y-6">
        <PartnerReferrals />
      </div>
    </PartnerGate>
  );
}


