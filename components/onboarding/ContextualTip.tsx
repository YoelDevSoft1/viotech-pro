"use client";

import { useState, useEffect, useRef } from "react";
import { HelpCircle, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { OnboardingTip } from "@/lib/types/onboarding";
import { cn } from "@/lib/utils";

interface ContextualTipProps {
  tip: OnboardingTip;
  children: React.ReactNode;
  show?: boolean;
  onDismiss?: () => void;
}

export function ContextualTip({ tip, children, show = true, onDismiss }: ContextualTipProps) {
  const [isVisible, setIsVisible] = useState(show);
  const [isDismissed, setIsDismissed] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(show && !isDismissed);
  }, [show, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    onDismiss?.();
  };

  if (!tip.enabled || isDismissed) {
    return <>{children}</>;
  }

  if (tip.trigger === "hover") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div ref={targetRef} className="inline-block">
              {children}
            </div>
          </TooltipTrigger>
          {isVisible && (
            <TooltipContent
              side={tip.placement || "top"}
              className="max-w-xs"
              onPointerDownOutside={handleDismiss}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm">{tip.title}</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={handleDismiss}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{tip.content}</p>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Para trigger "click" o "manual", mostrar un badge/icono
  return (
    <div className="relative inline-block">
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50",
            tip.placement === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
            tip.placement === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2",
            tip.placement === "left" && "right-full top-1/2 -translate-y-1/2 mr-2",
            tip.placement === "right" && "left-full top-1/2 -translate-y-1/2 ml-2"
          )}
        >
          <Card className="w-64 shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">{tip.title}</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={handleDismiss}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{tip.content}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

