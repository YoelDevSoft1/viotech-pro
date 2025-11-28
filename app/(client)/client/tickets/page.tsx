"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { getAccessToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { TicketsPanel } from "@/components/dashboard/TicketsPanel";

export default function ClientTicketsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = getAccessToken();
    if (!stored) {
      router.replace("/login?from=/client/tickets");
      return;
    }
    setToken(stored);
  }, [router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al panel
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <MessageSquare className="h-8 w-8" />
              Tickets y Soporte
            </h1>
            <p className="text-muted-foreground mt-1">
              Crea, comenta, adjunta evidencias y revisa el estado de tus solicitudes.
            </p>
          </div>
        </div>
      </div>

      {/* Tickets Panel */}
      <section>
        <TicketsPanel token={token} onRequireAuth={() => router.replace("/login?from=/client/tickets")} />
      </section>
    </div>
  );
}
