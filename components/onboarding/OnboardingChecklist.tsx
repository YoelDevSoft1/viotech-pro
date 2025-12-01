"use client";

import { CheckCircle2, Circle, ExternalLink, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOnboardingChecklist, useCompleteChecklistItem } from "@/lib/hooks/useOnboarding";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { OnboardingChecklistItem } from "@/lib/types/onboarding";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

const categoryColors: Record<string, string> = {
  profile: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  organization: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  features: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  settings: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export function OnboardingChecklist() {
  const { data: checklist, isLoading } = useOnboardingChecklist();
  const completeItem = useCompleteChecklistItem();
  const tOnboarding = useTranslationsSafe("onboarding");

  const categoryLabels: Record<string, string> = {
    profile: tOnboarding("categories.profile"),
    organization: tOnboarding("categories.organization"),
    features: tOnboarding("categories.features"),
    settings: tOnboarding("categories.settings"),
    other: tOnboarding("categories.other"),
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{tOnboarding("initialSetup")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!checklist || checklist.items.length === 0) {
    return null;
  }

  const handleComplete = (item: OnboardingChecklistItem) => {
    if (!item.completed) {
      completeItem.mutate(item.id);
    }
  };

  // Agrupar items por categoría
  const groupedItems = checklist.items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, OnboardingChecklistItem[]>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{tOnboarding("initialSetup")}</CardTitle>
            <CardDescription>
              {tOnboarding("checklistDescription")}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            {checklist.progress.toFixed(0)}% {tOnboarding("completed")}
          </Badge>
        </div>
        <Progress value={checklist.progress} className="mt-4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {categoryLabels[category] || category}
              </h4>
              <div className="space-y-2">
                {items
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                        item.completed
                          ? "bg-muted/50 border-muted"
                          : "bg-background border-border hover:bg-muted/30"
                      )}
                    >
                      <button
                        onClick={() => handleComplete(item)}
                        className={cn(
                          "mt-0.5 transition-colors",
                          item.completed
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {item.completed ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h5
                              className={cn(
                                "text-sm font-medium",
                                item.completed && "line-through text-muted-foreground"
                              )}
                            >
                              {item.title}
                            </h5>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                          {item.required && !item.completed && (
                            <Badge variant="destructive" className="text-xs">
                              {tOnboarding("required")}
                            </Badge>
                          )}
                        </div>
                        {item.actionUrl && !item.completed && (
                          <div className="mt-2">
                            <Link href={item.actionUrl}>
                              <Button variant="outline" size="sm" className="text-xs">
                                {item.actionLabel || tOnboarding("goToSettings")}
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        {checklist.completed && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">
                {tOnboarding("initialSetupCompleted")}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

