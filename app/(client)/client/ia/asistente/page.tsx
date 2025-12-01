"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AITicketAssistant from "@/components/common/AITicketAssistant";
import { getAccessToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

export default function AsistentePage() {
  const [token, setToken] = useState<string | null>(null);
  const tIA = useTranslationsSafe("client.ia.asistente");

  useEffect(() => {
    setToken(getAccessToken());
  }, []);

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            {tIA("backToDashboard")}
          </Link>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {tIA("title")}
          </p>
          <h1 className="text-3xl font-medium text-foreground">{tIA("pageTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            {tIA("description")}
          </p>
        </div>

      <div className="rounded-3xl border border-border/70 bg-background/80 p-6">
        <AITicketAssistant authToken={token} />
      </div>
    </div>
  );
}
