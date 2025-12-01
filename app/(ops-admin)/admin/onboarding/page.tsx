"use client";

import { OnboardingManager } from "@/components/onboarding/OnboardingManager";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

export default function AdminOnboardingPage() {
  const tOnboarding = useTranslationsSafe("onboarding");
  
  return (
    <main className="min-h-screen bg-background px-6 py-10 md:py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {tOnboarding("title")}
          </p>
          <h1 className="text-3xl font-semibold text-foreground">{tOnboarding("initialSetup")}</h1>
          <p className="text-sm text-muted-foreground">
            {tOnboarding("description")}
          </p>
        </div>

        <OnboardingManager />
      </div>
    </main>
  );
}

