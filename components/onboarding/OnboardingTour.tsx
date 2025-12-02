"use client";

import { useState, useEffect, useCallback } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { Sparkles } from "lucide-react";
import { useCompleteTour } from "@/lib/hooks/useOnboarding";
import type { OnboardingStep } from "@/lib/types/onboarding";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { cn } from "@/lib/utils";

// Estilo global para que el spotlight se vea claro (sin blur ni oscurecimiento)
// El overlay oscuro y borroso se aplica al resto de la página automáticamente
if (typeof document !== "undefined") {
  // Verificar si el estilo ya existe para no duplicarlo
  if (!document.getElementById("joyride-spotlight-style")) {
    const style = document.createElement("style");
    style.id = "joyride-spotlight-style";
    style.textContent = `
      /* El spotlight debe ser completamente transparente - el elemento destacado se ve claro */
      .react-joyride__spotlight {
        background: transparent !important;
        background-color: transparent !important;
        mix-blend-mode: normal !important;
        pointer-events: none !important;
        /* Sin blur ni efectos en el spotlight - el elemento se ve nítido */
        filter: none !important;
        backdrop-filter: none !important;
        /* Borde visible para que se vea claramente que envuelve el elemento */
        border: 3px solid hsl(var(--primary)) !important;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 
                    0 0 0 3px hsl(var(--primary) / 0.3),
                    0 0 20px hsl(var(--primary) / 0.2) !important;
      }
      /* El contenido dentro del spotlight debe verse claro y ser interactivo */
      .react-joyride__spotlight * {
        pointer-events: auto !important;
        filter: none !important;
      }
      /* El overlay NO debe cubrir toda la página - solo el spotlight tiene efecto */
      /* Removemos el fondo oscuro del overlay para que no cubra toda la página */
      .react-joyride__overlay {
        background-color: transparent !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        pointer-events: none !important;
      }
      /* Solo el área alrededor del spotlight debe tener efecto visual */
      /* Esto se logra con el box-shadow del spotlight, no con el overlay */
    `;
    document.head.appendChild(style);
  }
}

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
      const { status, type, index, action } = data;

      // Scroll automático al elemento cuando cambia el step
      if (action === "next" || action === "prev" || action === "update") {
        const currentStep = steps[index];
        if (currentStep?.target) {
          setTimeout(() => {
            const element = document.querySelector(currentStep.target);
            if (element) {
              element.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest",
              });
            }
          }, 300);
        }
      }

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
    [tourId, completeTour, onComplete, onSkip, steps]
  );

  // Transformar steps a formato de react-joyride con mejoras
  const joyrideSteps: Step[] = steps.map((step, index) => ({
    target: step.target,
    content: (
      <div className="space-y-3">
        {step.title && (
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
            <h3 className="font-semibold text-base text-foreground">
              {step.title}
            </h3>
          </div>
        )}
        <div className="text-sm text-muted-foreground leading-relaxed">
          {typeof step.content === "string" ? (
            <p>{step.content}</p>
          ) : (
            step.content
          )}
        </div>
        {showProgress && steps.length > 1 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              {tOnboarding("tour.stepProgress", {
                current: index + 1,
                total: steps.length,
              })}
            </p>
          </div>
        )}
      </div>
    ),
    placement: step.placement || "auto",
    disableBeacon: step.disableBeacon ?? true,
    disableOverlayClose: step.disableOverlayClose ?? false,
    spotlightClicks: step.spotlightClicks ?? false,
    disableScrolling: false, // Permitir scroll para mejor UX
    disableScrollParentFix: false,
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
      scrollToFirstStep={true}
      spotlightPadding={16}
      disableOverlay={false}
      disableOverlayClose={false}
      disableScrolling={false}
      floaterProps={{
        disableAnimation: false,
        styles: {
          arrow: {
            length: 8,
            spread: 16,
          },
        },
      }}
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          textColor: "hsl(var(--foreground))",
          backgroundColor: "hsl(var(--card))",
          overlayColor: "transparent",
          arrowColor: "hsl(var(--card))",
          zIndex: 10000,
          width: 420,
        },
        tooltip: {
          borderRadius: 12,
          padding: 0,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
          border: "1px solid hsl(var(--border))",
        },
        tooltipContainer: {
          textAlign: "left",
          padding: 20,
        },
        tooltipTitle: {
          fontSize: 16,
          fontWeight: 600,
          marginBottom: 8,
        },
        tooltipContent: {
          padding: 0,
          fontSize: 14,
          lineHeight: 1.6,
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
          borderRadius: 8,
          padding: "10px 20px",
          fontSize: 14,
          fontWeight: 600,
          border: "none",
          transition: "all 0.2s",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
        buttonBack: {
          color: "hsl(var(--muted-foreground))",
          marginRight: 10,
          padding: "10px 16px",
          fontSize: 14,
          fontWeight: 500,
          backgroundColor: "transparent",
          border: "none",
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
          fontSize: 13,
          fontWeight: 500,
          padding: "8px 12px",
        },
        overlay: {
          mixBlendMode: "normal",
          backgroundColor: "transparent",
          backdropFilter: "none",
        },
        spotlight: {
          borderRadius: 12,
          backgroundColor: "transparent",
          mixBlendMode: "normal",
          pointerEvents: "none",
          // Sin efectos visuales en el spotlight - el elemento se ve claro
          filter: "none",
          backdropFilter: "none",
          // Borde visible para que se vea claramente que envuelve el elemento
          border: "3px solid hsl(var(--primary))",
          // Box-shadow para crear el efecto de oscurecimiento alrededor del spotlight
          // Incluye sombra del borde primario para mejor visibilidad
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 3px hsl(var(--primary) / 0.3), 0 0 20px hsl(var(--primary) / 0.2)",
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

