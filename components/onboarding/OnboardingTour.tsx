"use client";

import { useState, useEffect, useCallback } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { X, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompleteTour } from "@/lib/hooks/useOnboarding";
import type { OnboardingStep } from "@/lib/types/onboarding";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

interface OnboardingTourProps {
  tourId: string;
  steps: OnboardingStep[];
  run?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  continuous?: boolean;
  showProgress?: boolean;
  showSkipButton?: boolean;
}

export function OnboardingTour({
  tourId,
  steps,
  run = true,
  onComplete,
  onSkip,
  continuous = true,
  showProgress = true,
  showSkipButton = true,
}: OnboardingTourProps) {
  const [runTour, setRunTour] = useState(run);
  const completeTour = useCompleteTour();
  const tOnboarding = useTranslationsSafe("onboarding");

  useEffect(() => {
    setRunTour(run);
  }, [run]);

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status, type } = data;

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setRunTour(false);
        
        // Marcar tour como completado o saltado
        completeTour.mutate({
          tourId,
          skipped: status === STATUS.SKIPPED,
        });

        if (status === STATUS.FINISHED) {
          onComplete?.();
        } else {
          onSkip?.();
        }
      }
    },
    [tourId, completeTour, onComplete, onSkip]
  );

  // Transformar steps a formato de react-joyride
  const joyrideSteps: Step[] = steps.map((step) => ({
    target: step.target,
    content: step.content,
    placement: step.placement || "auto",
    disableBeacon: step.disableBeacon || false,
    disableOverlayClose: step.disableOverlayClose || false,
    spotlightClicks: step.spotlightClicks || false,
    styles: step.styles,
  }));

  return (
    <Joyride
      steps={joyrideSteps}
      run={runTour}
      continuous={continuous}
      showProgress={showProgress}
      showSkipButton={showSkipButton}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          textColor: "hsl(var(--foreground))",
          backgroundColor: "hsl(var(--background))",
          overlayColor: "rgba(0, 0, 0, 0.5)",
          arrowColor: "hsl(var(--primary))",
          zIndex: 10000,
          width: 400,
        },
        tooltip: {
          borderRadius: 8,
          padding: 20,
        },
        tooltipContainer: {
          textAlign: "left",
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
          borderRadius: 6,
          padding: "8px 16px",
          fontSize: 14,
          fontWeight: 500,
        },
        buttonBack: {
          color: "hsl(var(--muted-foreground))",
          marginRight: 10,
          padding: "8px 16px",
          fontSize: 14,
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
          fontSize: 14,
        },
        overlay: {
          mixBlendMode: "normal",
        },
        spotlight: {
          borderRadius: 8,
        },
      }}
      locale={{
        back: tOnboarding("tour.back"),
        close: tOnboarding("tour.close"),
        last: tOnboarding("tour.finish"),
        next: tOnboarding("tour.next"),
        open: tOnboarding("tour.open"),
        skip: tOnboarding("skipTour"),
      }}
    />
  );
}

