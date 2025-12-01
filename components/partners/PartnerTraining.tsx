"use client";

import { useState } from "react";
import { usePartnerTrainings, usePartnerCertifications, useStartTraining, useCompleteTraining } from "@/lib/hooks/usePartners";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";
import { BookOpen, Award, Play, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PartnerTraining() {
  const [activeTab, setActiveTab] = useState<"trainings" | "certifications">("trainings");
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const t = useTranslationsSafe("partners.training");
  const { formatDate } = useI18n();

  const { data: trainings, isLoading: trainingsLoading } = usePartnerTrainings();
  const { data: certifications, isLoading: certsLoading } = usePartnerCertifications();
  const startTraining = useStartTraining();
  const completeTraining = useCompleteTraining();

  const getLevelBadge = (level: string) => {
    const styles = {
      beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return styles[level as keyof typeof styles] || styles.beginner;
  };

  const getCertStatusBadge = (status: string) => {
    const styles = {
      not_started: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return styles[status as keyof typeof styles] || styles.not_started;
  };

  const handleStartTraining = async (trainingId: string) => {
    try {
      await startTraining.mutateAsync(trainingId);
      setSelectedTraining(null);
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleCompleteTraining = async (trainingId: string) => {
    try {
      await completeTraining.mutateAsync(trainingId);
      setSelectedTraining(null);
    } catch (error) {
      // Error manejado por el hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "trainings" | "certifications")}>
        <TabsList>
          <TabsTrigger value="trainings">
            <BookOpen className="h-4 w-4 mr-2" />
            {t("trainings")}
          </TabsTrigger>
          <TabsTrigger value="certifications">
            <Award className="h-4 w-4 mr-2" />
            {t("certifications")}
          </TabsTrigger>
        </TabsList>

        {/* Trainings Tab */}
        <TabsContent value="trainings" className="space-y-6">
          {trainingsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : !trainings || trainings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  {t("noTrainings")}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trainings.map((training) => (
                <Card key={training.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle>{training.name}</CardTitle>
                      <Badge className={getLevelBadge(training.level)}>
                        {t(`level.${training.level}`)}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {training.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t("progress")}</span>
                          <span className="font-medium">
                            {training.progress || 0}%
                          </span>
                        </div>
                        <Progress value={training.progress || 0} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {training.duration} {t("minutes")}
                        </div>
                        {training.required && (
                          <Badge variant="outline" className="text-xs">
                            {t("required")}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {training.status === "not_started" ? (
                          <Button
                            className="flex-1"
                            onClick={() => handleStartTraining(training.id)}
                            disabled={startTraining.isPending}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {t("start")}
                          </Button>
                        ) : training.status === "in_progress" ? (
                          <Button
                            className="flex-1"
                            variant="outline"
                            onClick={() => setSelectedTraining(training)}
                          >
                            {t("continue")}
                          </Button>
                        ) : (
                          <Button
                            className="flex-1"
                            variant="outline"
                            disabled
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {t("completed")}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedTraining(training)}
                        >
                          {t("details")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-6">
          {certsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : !certifications || certifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  {t("noCertifications")}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certifications.map((cert) => (
                <Card key={cert.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle>{cert.name}</CardTitle>
                      <Badge className={getCertStatusBadge(cert.status)}>
                        {t(`certStatus.${cert.status}`)}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {cert.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cert.status === "completed" && cert.completedAt && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>
                            {t("completedOn")}: {formatDate(cert.completedAt, "PP")}
                          </span>
                        </div>
                      )}
                      {cert.expiresAt && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span>
                            {t("expires")}: {formatDate(cert.expiresAt, "PP")}
                          </span>
                        </div>
                      )}
                      {cert.requiredTraining && (
                        <div className="text-sm">
                          <p className="text-muted-foreground mb-1">{t("requiredTraining")}</p>
                          <p className="font-medium">{cert.requiredTraining}</p>
                        </div>
                      )}
                      <Button
                        className="w-full"
                        variant={cert.status === "completed" ? "outline" : "default"}
                        onClick={() => setSelectedTraining(cert)}
                      >
                        {cert.status === "completed" ? t("viewCertificate") : t("startCertification")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Detalle */}
      <Dialog open={!!selectedTraining} onOpenChange={() => setSelectedTraining(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTraining?.name}</DialogTitle>
            <DialogDescription>
              {selectedTraining?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedTraining && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("level.label")}</p>
                  <Badge className={getLevelBadge(selectedTraining.level || "beginner")}>
                    {t(`level.${selectedTraining.level || "beginner"}`)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("duration")}</p>
                  <p className="text-sm">{selectedTraining.duration} {t("minutes")}</p>
                </div>
              </div>
              {selectedTraining.content && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {t("content")}
                  </p>
                  <div className="text-sm whitespace-pre-line bg-muted p-4 rounded-md">
                    {selectedTraining.content}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                {selectedTraining.status === "not_started" && (
                  <Button
                    className="flex-1"
                    onClick={() => handleStartTraining(selectedTraining.id)}
                    disabled={startTraining.isPending}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {t("start")}
                  </Button>
                )}
                {selectedTraining.status === "in_progress" && (
                  <Button
                    className="flex-1"
                    onClick={() => handleCompleteTraining(selectedTraining.id)}
                    disabled={completeTraining.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t("complete")}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedTraining(null)}
                >
                  {t("close")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

