"use client";

import { useEffect, useState, useRef } from "react";
import { useOnboardingConfig, useOnboardingTours, useOnboardingProgress } from "@/lib/hooks/useOnboarding";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { usePathname } from "next/navigation";

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const hasStartedTour = useRef(false);
  const pathname = usePathname();
  const { data: config } = useOnboardingConfig();
  const { data: progress } = useOnboardingProgress();
  const { data: tours = [] } = useOnboardingTours(config?.role);

  useEffect(() => {
    // Evitar iniciar múltiples veces
    if (hasStartedTour.current || !config || !tours.length) return;

    // Si el usuario ha saltado el onboarding, no iniciar tours
    if (config.skipOnboarding) return;

    // Si hay un tour configurado para iniciar automáticamente
    if (config.autoStartTour) {
      const tour = tours.find((t) => t.id === config.autoStartTour && t.enabled);
      if (tour) {
        // Verificar que el tour no esté completado o saltado
        const isCompleted = progress?.toursCompleted.includes(tour.id);
        const isSkipped = progress?.skippedTours.includes(tour.id);
        
        if (!isCompleted && !isSkipped) {
          hasStartedTour.current = true;
          const timer = setTimeout(() => {
            setActiveTour(tour.id);
          }, 1500);
          return () => clearTimeout(timer);
        }
      }
    } 
    // Si NO hay autoStartTour configurado, iniciar el primer tour disponible para usuarios nuevos
    else if (!progress || (progress.toursCompleted.length === 0 && progress.skippedTours.length === 0)) {
      // Buscar el primer tour habilitado para el rol del usuario
      const firstTour = tours.find((t) => t.enabled);
      
      if (firstTour) {
        hasStartedTour.current = true;
        const timer = setTimeout(() => {
          setActiveTour(firstTour.id);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [config, tours, progress]);

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

