"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingTours, useOnboardingConfig } from "@/lib/hooks/useOnboarding";
import { NativeOnboardingTour } from "@/components/onboarding/NativeOnboardingTour";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { dashboardTour } from "@/lib/config/dashboard-tour";

export function TourButton() {
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const { data: config } = useOnboardingConfig();
  const { data: tours = [] } = useOnboardingTours(config?.role);
  const tOnboarding = useTranslationsSafe("onboarding");

  // Siempre usar el tour local como fallback garantizado
  const dashboardTourFromBackend = Array.isArray(tours) ? tours.find((t) => t.id === "dashboard-welcome" && t.enabled) : null;
  const tourToUse = dashboardTourFromBackend || dashboardTour;

  const handleStartTour = () => {
    setActiveTour(tourToUse.id);
  };

  const activeTourData = Array.isArray(tours) && tours.find((t) => t.id === activeTour) || (activeTour === dashboardTour.id ? dashboardTour : null);

  // El botón siempre se muestra porque siempre tenemos dashboardTour como fallback
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleStartTour}
        className="h-9 w-9"
        title={tOnboarding("startTour")}
      >
        <Sparkles className="h-4 w-4" />
        <span className="sr-only">{tOnboarding("startTour")}</span>
      </Button>
      {activeTourData && (
        <NativeOnboardingTour
          tourId={activeTourData.id}
          steps={activeTourData.steps}
          run={activeTour === activeTourData.id}
          onComplete={() => setActiveTour(null)}
          onSkip={() => setActiveTour(null)}
        />
      )}
    </>
  );
}

