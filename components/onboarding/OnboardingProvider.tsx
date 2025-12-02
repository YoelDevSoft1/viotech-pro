"use client";

import { useEffect, useState, useRef } from "react";
import { useOnboardingConfig, useOnboardingTours, useOnboardingProgress } from "@/lib/hooks/useOnboarding";
import { NativeOnboardingTour } from "@/components/onboarding/NativeOnboardingTour";
import { usePathname } from "next/navigation";
import { logger } from "@/lib/logger";

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
    if (hasStartedTour.current) return;

    // Esperar a que los datos estén listos
    // Si config está undefined, significa que aún está cargando
    // Si tours está vacío, también esperar
    if (config === undefined || tours.length === 0) return;

    // Si el usuario ha saltado el onboarding explícitamente, no iniciar tours
    if (config.skipOnboarding === true) return;

    // Si hay un tour configurado para iniciar automáticamente
    if (config.autoStartTour) {
      const tour = tours.find((t) => t.id === config.autoStartTour && t.enabled);
      if (tour) {
        // Verificar que el tour no esté completado o saltado
        const isCompleted = progress?.toursCompleted?.includes(tour.id) ?? false;
        const isSkipped = progress?.skippedTours?.includes(tour.id) ?? false;
        
        if (!isCompleted && !isSkipped) {
          hasStartedTour.current = true;
          // Esperar a que el DOM esté listo
          const timer = setTimeout(() => {
            // Verificar que los elementos del tour existan en el DOM
            const firstStep = tour.steps[0];
            if (firstStep?.target) {
              const element = document.querySelector(firstStep.target);
              if (element || pathname === "/dashboard") {
                setActiveTour(tour.id);
              }
            } else {
              setActiveTour(tour.id);
            }
          }, 2000); // Aumentar delay para asegurar que el DOM esté listo
          return () => clearTimeout(timer);
        }
      }
    } 
    // Si NO hay autoStartTour configurado, iniciar el primer tour disponible para usuarios nuevos
    else {
      // Verificar si el usuario es nuevo (sin progreso o sin tours completados)
      const isNewUser = !progress || 
        (progress.toursCompleted?.length === 0 && progress.skippedTours?.length === 0);
      
      if (isNewUser) {
        // Buscar el primer tour habilitado para el rol del usuario
        // Priorizar el tour del dashboard si estamos en esa página
        const dashboardTour = tours.find((t) => t.id === "dashboard-welcome" && t.enabled);
        const firstTour = dashboardTour || tours.find((t) => t.enabled);
        
        if (firstTour) {
          hasStartedTour.current = true;
          // Esperar a que el DOM esté listo, especialmente si estamos en el dashboard
          const timer = setTimeout(() => {
            // Verificar que los elementos del tour existan en el DOM
            const firstStep = firstTour.steps[0];
            if (firstStep?.target) {
              const element = document.querySelector(firstStep.target);
              // Si estamos en dashboard o el elemento existe, iniciar el tour
              if (element || pathname === "/dashboard") {
                logger.info("Starting onboarding tour", {
                  tourId: firstTour.id,
                  pathname,
                  hasElement: !!element,
                });
                setActiveTour(firstTour.id);
              } else {
                logger.debug("Tour target element not found, waiting...", {
                  tourId: firstTour.id,
                  target: firstStep.target,
                  pathname,
                });
              }
            } else {
              logger.info("Starting tour without target check", {
                tourId: firstTour.id,
                pathname,
              });
              setActiveTour(firstTour.id);
            }
          }, 2000); // Aumentar delay para asegurar que el DOM esté listo
          return () => clearTimeout(timer);
        } else {
          logger.debug("No enabled tours found", {
            toursCount: tours.length,
            role: config?.role,
            pathname,
          });
        }
      } else {
        logger.debug("User is not new, skipping auto-start", {
          toursCompleted: progress?.toursCompleted?.length ?? 0,
          skippedTours: progress?.skippedTours?.length ?? 0,
        });
      }
    }
  }, [config, tours, progress, pathname]);

  const activeTourData = tours.find((t) => t.id === activeTour);

  return (
    <>
      {children}
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

