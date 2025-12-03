"use client";

import { useEffect, useCallback } from "react";
import { TourSpotlight } from "./TourSpotlight";
import { TourTooltip } from "./TourTooltip";
import { TourOverlay } from "./TourOverlay";
import { useNativeTour } from "@/lib/hooks/useNativeTour";
import type { OnboardingStep } from "@/lib/types/onboarding";

interface NativeOnboardingTourProps {
  tourId: string;
  steps: OnboardingStep[];
  run?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function NativeOnboardingTour({
  tourId,
  steps,
  run = false,
  onComplete,
  onSkip,
}: NativeOnboardingTourProps) {
  const {
    isActive,
    currentStep,
    currentStepData,
    spotlightPosition,
    tooltipPosition,
    isFirstStep,
    isLastStep,
    progress,
    totalSteps,
    start,
    next,
    prev,
    skip,
    close,
  } = useNativeTour({
    steps,
    onComplete,
    onSkip,
  });

  // Iniciar tour cuando run cambia a true
  useEffect(() => {
    if (run && !isActive) {
      start();
    }
  }, [run, isActive, start]);

  // Manejar teclado (ESC para cerrar/saltar, Enter para siguiente, Arrow keys)
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        skip();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (isLastStep) {
          next(); // Esto completará el tour
        } else {
          next();
        }
      } else if (e.key === "ArrowRight" && !isLastStep) {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" && !isFirstStep) {
        e.preventDefault();
        prev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, isFirstStep, isLastStep, next, prev, skip]);

  // Bloquear scroll del body cuando el tour está activo
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isActive]);

  if (!isActive || !currentStepData || currentStep < 0) {
    return null;
  }

  return (
    <>
      {/* Overlay oscuro con blur que excluye el área del spotlight */}
      <TourOverlay spotlightPosition={spotlightPosition} isVisible={isActive} />

      {/* Spotlight que envuelve el elemento */}
      <TourSpotlight position={spotlightPosition} />

      {/* Tooltip con información */}
      {tooltipPosition && (
        <TourTooltip
          step={currentStepData}
          position={tooltipPosition}
          currentStep={currentStep}
          totalSteps={totalSteps}
          progress={progress}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          onNext={next}
          onPrev={prev}
          onSkip={skip}
          onClose={close}
        />
      )}
    </>
  );
}

