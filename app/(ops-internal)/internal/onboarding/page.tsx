"use client";

import { OnboardingManager } from "@/components/onboarding/OnboardingManager";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 md:py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Onboarding
          </p>
          <h1 className="text-3xl font-semibold text-foreground">Configuración Inicial</h1>
          <p className="text-sm text-muted-foreground">
            Completa los tours guiados y la checklist para aprovechar al máximo la plataforma
          </p>
        </div>

        <OnboardingManager />
      </div>
    </main>
  );
}

