"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { OnboardingStep } from "@/lib/types/onboarding";

export interface TourPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface TooltipPosition {
  top: number;
  left: number;
  placement: "top" | "bottom" | "left" | "right";
}

interface UseNativeTourOptions {
  steps: OnboardingStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

export function useNativeTour({ steps, onComplete, onSkip }: UseNativeTourOptions) {
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [spotlightPosition, setSpotlightPosition] = useState<TourPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [isActive, setIsActive] = useState(false);
  const targetElementRef = useRef<HTMLElement | null>(null);

  // Calcular posición del spotlight (elemento target)
  const calculateSpotlightPosition = useCallback((target: string): TourPosition | null => {
    if (typeof window === "undefined") return null;

    const element = document.querySelector<HTMLElement>(target);
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    const padding = 16; // Padding alrededor del elemento

    return {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };
  }, []);

  // Calcular posición del tooltip según el placement
  const calculateTooltipPosition = useCallback(
    (
      spotlightPos: TourPosition,
      placement: OnboardingStep["placement"] = "auto"
    ): TooltipPosition => {
      const tooltipWidth = 420;
      const tooltipHeight = 280;
      const spacing = 24;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Determinar placement automático si es necesario
      let finalPlacement: "top" | "bottom" | "left" | "right" = "right";

      if (placement === "auto" || !placement) {
        // Auto: elegir el mejor lugar según espacio disponible
        const spaceRight = viewportWidth - (spotlightPos.left + spotlightPos.width);
        const spaceLeft = spotlightPos.left;
        const spaceBottom = viewportHeight - (spotlightPos.top + spotlightPos.height);
        const spaceTop = spotlightPos.top;

        if (spaceRight >= tooltipWidth + spacing) {
          finalPlacement = "right";
        } else if (spaceLeft >= tooltipWidth + spacing) {
          finalPlacement = "left";
        } else if (spaceBottom >= tooltipHeight + spacing) {
          finalPlacement = "bottom";
        } else {
          finalPlacement = "top";
        }
      } else {
        finalPlacement = placement as "top" | "bottom" | "left" | "right";
      }

      // Calcular posición según placement
      let top = 0;
      let left = 0;

      switch (finalPlacement) {
        case "right":
          top = spotlightPos.top + spotlightPos.height / 2 - tooltipHeight / 2;
          left = spotlightPos.left + spotlightPos.width + spacing;
          break;
        case "left":
          top = spotlightPos.top + spotlightPos.height / 2 - tooltipHeight / 2;
          left = spotlightPos.left - tooltipWidth - spacing;
          break;
        case "bottom":
          top = spotlightPos.top + spotlightPos.height + spacing;
          left = spotlightPos.left + spotlightPos.width / 2 - tooltipWidth / 2;
          break;
        case "top":
          top = spotlightPos.top - tooltipHeight - spacing;
          left = spotlightPos.left + spotlightPos.width / 2 - tooltipWidth / 2;
          break;
      }

      // Asegurar que el tooltip no salga de la ventana
      top = Math.max(16, Math.min(top, viewportHeight - tooltipHeight - 16));
      left = Math.max(16, Math.min(left, viewportWidth - tooltipWidth - 16));

      return {
        top,
        left,
        placement: finalPlacement,
      };
    },
    []
  );

  // Iniciar el tour
  const start = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
  }, []);

  // Ir al siguiente paso
  const next = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tour completado
      setIsActive(false);
      setCurrentStep(-1);
      onComplete?.();
    }
  }, [currentStep, steps.length, onComplete]);

  // Ir al paso anterior
  const prev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Saltar el tour
  const skip = useCallback(() => {
    setIsActive(false);
    setCurrentStep(-1);
    onSkip?.();
  }, [onSkip]);

  // Cerrar el tour
  const close = useCallback(() => {
    setIsActive(false);
    setCurrentStep(-1);
  }, []);

  // Actualizar posiciones cuando cambia el paso o la ventana
  useEffect(() => {
    if (!isActive || currentStep < 0 || currentStep >= steps.length) {
      setSpotlightPosition(null);
      setTooltipPosition(null);
      targetElementRef.current = null;
      return;
    }

    const step = steps[currentStep];
    const element = document.querySelector<HTMLElement>(step.target);

    if (!element) {
      console.warn(`Tour step target not found: ${step.target}`);
      return;
    }

    targetElementRef.current = element;

    // Calcular posiciones
    const spotlightPos = calculateSpotlightPosition(step.target);
    if (!spotlightPos) return;

    const tooltipPos = calculateTooltipPosition(spotlightPos, step.placement);

    setSpotlightPosition(spotlightPos);
    setTooltipPosition(tooltipPos);

    // Scroll suave al elemento
    setTimeout(() => {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }, 100);
  }, [currentStep, isActive, steps, calculateSpotlightPosition, calculateTooltipPosition]);

  // Recalcular posiciones en resize
  useEffect(() => {
    if (!isActive) return;

    const handleResize = () => {
      if (currentStep >= 0 && currentStep < steps.length) {
        const step = steps[currentStep];
        const spotlightPos = calculateSpotlightPosition(step.target);
        if (spotlightPos) {
          const tooltipPos = calculateTooltipPosition(spotlightPos, step.placement);
          setSpotlightPosition(spotlightPos);
          setTooltipPosition(tooltipPos);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [isActive, currentStep, steps, calculateSpotlightPosition, calculateTooltipPosition]);

  const currentStepData = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  return {
    isActive,
    currentStep,
    currentStepData,
    spotlightPosition,
    tooltipPosition,
    targetElement: targetElementRef.current,
    isFirstStep,
    isLastStep,
    progress,
    totalSteps: steps.length,
    start,
    next,
    prev,
    skip,
    close,
  };
}

