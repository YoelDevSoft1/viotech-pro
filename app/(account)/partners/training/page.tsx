"use client";

import { PartnerTraining } from "@/components/partners/PartnerTraining";
import PartnerGate from "@/components/partners/PartnerGate";

export default function PartnerTrainingPage() {
  return (
    <PartnerGate>
      <div className="space-y-6">
        <PartnerTraining />
      </div>
    </PartnerGate>
  );
}


