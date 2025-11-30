"use client";

import { useState } from "react";
import { Play, SkipForward, CheckCircle2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import {
  useOnboardingTours,
  useOnboardingConfig,
  useUpdateOnboardingConfig,
  useCompleteTour,
} from "@/lib/hooks/useOnboarding";
import { useOnboardingProgress } from "@/lib/hooks/useOnboarding";

export function OnboardingManager() {
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { data: config } = useOnboardingConfig();
  const { data: progress } = useOnboardingProgress();
  const { data: tours = [] } = useOnboardingTours(config?.role);
  const updateConfig = useUpdateOnboardingConfig();
  const completeTour = useCompleteTour();

  const availableTours = tours.filter((tour) => tour.enabled);
  const activeTourData = tours.find((t) => t.id === activeTour);

  const handleStartTour = (tourId: string) => {
    setActiveTour(tourId);
  };

  const handleSkipTour = () => {
    if (activeTour) {
      completeTour.mutate({ tourId: activeTour, skipped: true });
      setActiveTour(null);
    }
  };

  const handleToggleTips = (enabled: boolean) => {
    updateConfig.mutate({ showTips: enabled });
  };

  const handleToggleChecklist = (enabled: boolean) => {
    updateConfig.mutate({ showChecklist: enabled });
  };

  const handleSkipOnboarding = (skip: boolean) => {
    updateConfig.mutate({ skipOnboarding: skip });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Onboarding</CardTitle>
              <CardDescription>
                Completa los tours y la configuración inicial para aprovechar al máximo la
                plataforma
              </CardDescription>
            </div>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configuración de Onboarding</DialogTitle>
                  <DialogDescription>
                    Personaliza tu experiencia de onboarding
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="skip-onboarding">Saltar onboarding</Label>
                    <Switch
                      id="skip-onboarding"
                      checked={config?.skipOnboarding || false}
                      onCheckedChange={handleSkipOnboarding}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-tips">Mostrar tips contextuales</Label>
                    <Switch
                      id="show-tips"
                      checked={config?.showTips !== false}
                      onCheckedChange={handleToggleTips}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-checklist">Mostrar checklist</Label>
                    <Switch
                      id="show-checklist"
                      checked={config?.showChecklist !== false}
                      onCheckedChange={handleToggleChecklist}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tours disponibles */}
          {availableTours.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Tours Guiados</h3>
              <div className="grid gap-2">
                {availableTours.map((tour) => {
                  const isCompleted = progress?.toursCompleted.includes(tour.id);
                  const isSkipped = progress?.skippedTours.includes(tour.id);

                  return (
                    <div
                      key={tour.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{tour.name}</h4>
                          {isCompleted && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                          {isSkipped && (
                            <SkipForward className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        {tour.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {tour.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant={isCompleted ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleStartTour(tour.id)}
                        disabled={activeTour === tour.id}
                      >
                        {isCompleted ? (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Repetir
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Iniciar
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Checklist */}
          {config?.showChecklist !== false && <OnboardingChecklist />}
        </CardContent>
      </Card>

      {/* Tour activo */}
      {activeTourData && (
        <OnboardingTour
          tourId={activeTourData.id}
          steps={activeTourData.steps}
          run={activeTour === activeTourData.id}
          onComplete={() => setActiveTour(null)}
          onSkip={handleSkipTour}
        />
      )}
    </>
  );
}

