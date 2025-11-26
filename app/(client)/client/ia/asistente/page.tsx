"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AITicketAssistant from "@/components/AITicketAssistant";
import { getAccessToken } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function AsistentePage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(getAccessToken());
  }, []);

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al dashboard
          </Link>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            IA · Asistente de tickets
          </p>
          <h1 className="text-3xl font-medium text-foreground">Crea tickets con IA</h1>
          <p className="text-sm text-muted-foreground">
            Conversa con el asistente y genera tickets automáticamente con el modelo configurado.
          </p>
        </div>

        <div className="rounded-3xl border border-border/70 bg-background/80 p-6">
          <AITicketAssistant authToken={token} />
        </div>
      </div>
    </main>
  );
}
