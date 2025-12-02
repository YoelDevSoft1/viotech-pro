"use client";

import { useSessions, useCloseSession, useCloseAllOtherSessions } from "@/lib/hooks/useSessions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Monitor, MapPin, Globe, Clock, LogOut, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";

export function ActiveSessionsList() {
  const { data: sessions = [], isLoading, error } = useSessions();
  const closeSession = useCloseSession();
  const closeAllOther = useCloseAllOtherSessions();
  const [sessionToClose, setSessionToClose] = useState<string | null>(null);
  const tSessions = useTranslationsSafe("common.sessions");
  const tCommon = useTranslationsSafe("common");
  const { formatDate, locale } = useI18n();

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return tSessions("timeAgo.lessThanMinute");
    if (diffMins < 60) {
      const plural = diffMins > 1 ? "s" : "";
      return tSessions("timeAgo.minutes", { count: diffMins, plural });
    }
    if (diffHours < 24) {
      const plural = diffHours > 1 ? "s" : "";
      return tSessions("timeAgo.hours", { count: diffHours, plural });
    }
    if (diffDays < 7) {
      const plural = diffDays > 1 ? "s" : "";
      return tSessions("timeAgo.days", { count: diffDays, plural });
    }

    return formatDate(date, "PPpp");
  };

  const handleCloseSession = async (sessionId: string) => {
    await closeSession.mutateAsync(sessionId);
    setSessionToClose(null);
  };

  const handleCloseAllOther = async () => {
    await closeAllOther.mutateAsync();
  };

  const currentSession = sessions.find((s) => s.isCurrent);
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{tSessions("title")}</CardTitle>
          <CardDescription>{tSessions("loading")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{tSessions("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {(error as Error)?.message || tSessions("error")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              {tSessions("title")}
            </CardTitle>
            <CardDescription>
              {tSessions("description")}
            </CardDescription>
          </div>
          {otherSessions.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  {tSessions("closeAllOthers")} ({otherSessions.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{tSessions("closeAllOthersConfirm")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {tSessions("closeAllOthersDescription", { count: otherSessions.length })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCloseAllOther}
                    disabled={closeAllOther.isPending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {closeAllOther.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {tSessions("closing")}
                      </>
                    ) : (
                      tSessions("closeAll")
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentSession && (
          <div className="rounded-lg border-2 border-green-500/50 bg-green-50 dark:bg-green-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-green-600" />
                <span className="font-medium">{currentSession.deviceName}</span>
                <Badge variant="default" className="bg-green-600">
                  {tSessions("currentSession")}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
              {currentSession.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{currentSession.location}</span>
                </div>
              )}
              {currentSession.ipAddress && (
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  <span>{currentSession.ipAddress}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{formatTimeAgo(currentSession.lastActivity)}</span>
              </div>
            </div>
          </div>
        )}

        {otherSessions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              {tSessions("otherSessions")} ({otherSessions.length})
            </h3>
            {otherSessions.map((session) => (
              <div
                key={session.id}
                className="rounded-lg border bg-card p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{session.deviceName}</span>
                  </div>
                  <AlertDialog
                    open={sessionToClose === session.id}
                    onOpenChange={(open) => setSessionToClose(open ? session.id : null)}
                  >
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <LogOut className="h-4 w-4 mr-2" />
                        {tSessions("closeSession")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{tSessions("closeSessionConfirm")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {tSessions("closeSessionDescription", { deviceName: session.deviceName })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleCloseSession(session.id)}
                          disabled={closeSession.isPending}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {closeSession.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {tSessions("closing")}
                            </>
                          ) : (
                            tSessions("closeSession")
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                  {session.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>{session.location}</span>
                    </div>
                  )}
                  {session.ipAddress && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-4 w-4" />
                      <span>{session.ipAddress}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimeAgo(session.lastActivity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {sessions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{tSessions("noSessions")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

