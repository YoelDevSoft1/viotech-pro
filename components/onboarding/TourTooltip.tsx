"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Sparkles,
  Menu,
  Bell,
  TrendingUp,
  Package,
  Calendar,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import type { TooltipPosition } from "@/lib/hooks/useNativeTour";
import type { OnboardingStep } from "@/lib/types/onboarding";

interface TourTooltipProps {
  step: OnboardingStep;
  position: TooltipPosition | null;
  currentStep: number;
  totalSteps: number;
  progress: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
  className?: string;
}

// Mapeo de iconos según el ID del paso
const stepIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sidebar: Menu,
  header: Bell,
  kpis: TrendingUp,
  "services-panel": Package,
  roadmap: Calendar,
  charts: BarChart3,
};

export function TourTooltip({
  step,
  position,
  currentStep,
  totalSteps,
  progress,
  isFirstStep,
  isLastStep,
  onNext,
  onPrev,
  onSkip,
  onClose,
  className,
}: TourTooltipProps) {
  const tOnboarding = useTranslationsSafe("onboarding");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (position) {
      const timer = setTimeout(() => setIsVisible(true), 150);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [position]);

  if (!position) return null;

  // Icono del step (usar mapeo o Sparkles como fallback)
  const StepIcon = stepIconMap[step.id] || Sparkles;

  // Animación según el placement
  const animationClasses = {
    right: isVisible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
    left: isVisible ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0",
    top: isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
    bottom: isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
  };

  return (
    <div
      className={cn(
        "fixed z-[9999] w-[420px] transition-all duration-300",
        animationClasses[position.placement],
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`tour-step-${step.id}-title`}
      aria-describedby={`tour-step-${step.id}-description`}
    >
      <Card className="shadow-2xl border-2">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <StepIcon className="h-4 w-4 text-primary" />
              </div>
              <CardTitle id={`tour-step-${step.id}-title`} className="text-lg font-semibold leading-tight">
                {step.title}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={onClose}
              aria-label={tOnboarding("tour.close")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <CardDescription
            id={`tour-step-${step.id}-description`}
            className="text-sm text-muted-foreground leading-relaxed"
          >
            {typeof step.content === "string" ? <p>{step.content}</p> : step.content}
          </CardDescription>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-0">
          {/* Progress bar */}
          <div className="w-full space-y-2">
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-muted-foreground text-center">
              {tOnboarding("tour.stepProgress", {
                current: currentStep + 1,
                total: totalSteps,
              })}
            </p>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button variant="ghost" size="sm" onClick={onPrev} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  {tOnboarding("tour.back")}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onSkip} className="text-xs">
                {tOnboarding("skipTour")}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={onNext}
                className="gap-2"
              >
                {isLastStep ? (
                  <>
                    {tOnboarding("tour.finish")}
                    <Check className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    {tOnboarding("tour.next")}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Flecha que apunta al elemento */}
      <div
        className={cn(
          "absolute w-0 h-0 border-[8px] border-transparent",
          position.placement === "right" && "left-[-16px] top-1/2 -translate-y-1/2 border-r-card",
          position.placement === "left" && "right-[-16px] top-1/2 -translate-y-1/2 border-l-card",
          position.placement === "bottom" && "top-[-16px] left-1/2 -translate-x-1/2 border-b-card",
          position.placement === "top" && "bottom-[-16px] left-1/2 -translate-x-1/2 border-t-card"
        )}
      />
    </div>
  );
}

