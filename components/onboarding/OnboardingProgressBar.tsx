"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useOnboardingProgress } from "@/lib/hooks/useOnboarding";
import { Skeleton } from "@/components/ui/skeleton";

interface OnboardingProgressBarProps {
  showLabel?: boolean;
  className?: string;
}

export function OnboardingProgressBar({ showLabel = true, className }: OnboardingProgressBarProps) {
  const { data: progress, isLoading } = useOnboardingProgress();

  if (isLoading) {
    return <Skeleton className="h-2 w-full" />;
  }

  if (!progress) {
    return null;
  }

  // Calcular progreso total (tours + checklist)
  const totalProgress = Math.round(
    (progress.checklistProgress + (progress.toursCompleted.length * 20)) / 2
  );

  // Si está completo, no mostrar
  if (totalProgress >= 100) {
    return null;
  }

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Progreso de configuración</span>
          <Badge variant="outline" className="text-xs">
            {totalProgress}%
          </Badge>
        </div>
      )}
      <Progress value={totalProgress} className="h-2" />
    </div>
  );
}

