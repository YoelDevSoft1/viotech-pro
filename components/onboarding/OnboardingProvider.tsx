"use client";

import { useEffect, useState } from "react";
import { useOnboardingConfig, useOnboardingTours } from "@/lib/hooks/useOnboarding";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { usePathname } from "next/navigation";

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const pathname = usePathname();
  const { data: config } = useOnboardingConfig();
  const { data: tours = [] } = useOnboardingTours(config?.role);

  useEffect(() => {
    // Si hay un tour configurado para iniciar automáticamente y no se ha saltado
    if (config?.autoStartTour && !config.skipOnboarding) {
      const tour = tours.find((t) => t.id === config.autoStartTour && t.enabled);
      if (tour) {
        // Esperar un poco para que la página cargue completamente
        const timer = setTimeout(() => {
          setActiveTour(tour.id);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [config, tours]);

  const activeTourData = tours.find((t) => t.id === activeTour);

  return (
    <>
      {children}
      {activeTourData && (
        <OnboardingTour
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

