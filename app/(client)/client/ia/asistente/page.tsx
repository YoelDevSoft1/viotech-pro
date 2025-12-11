"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AITicketAssistant from "@/components/common/AITicketAssistant";
import { getAccessToken } from "@/lib/auth";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

export default function AsistentePage() {
  const [token, setToken] = useState<string | null>(null);
  const tIA = useTranslationsSafe("client.ia.asistente");

  useEffect(() => {
    setToken(getAccessToken());
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {tIA("backToDashboard")}
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Bot className="h-8 w-8" />
              {tIA("pageTitle")}
            </h1>
            <p className="text-muted-foreground mt-1">{tIA("description")}</p>
          </div>
          <Badge variant="secondary" className="w-fit flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {tIA("poweredByAI")}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {tIA("assistantTitle")}
          </CardTitle>
          <CardDescription>{tIA("assistantDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <AITicketAssistant authToken={token} />
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{tIA("tipsTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              {tIA("tip1")}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              {tIA("tip2")}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              {tIA("tip3")}
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
