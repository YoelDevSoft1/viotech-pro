"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAccessToken } from "@/lib/auth";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
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
    <main className="min-h-screen bg-background px-6 py-6 md:py-8">
      <div className="max-w-7xl mx-auto space-y-4 px-2 md:px-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-3">
            <Breadcrumb items={[{ href: "/client", label: "Inicio" }, { href: "/client/tickets", label: "Tickets" }]} />
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Portal cliente</p>
              <h1 className="text-3xl font-medium text-foreground">Tickets y soporte</h1>
              <p className="text-sm text-muted-foreground">
                Crea, comenta, adjunta evidencias y revisa el estado de tus solicitudes.
              </p>
            </div>
          </div>
          <Link
            href="/client"
            className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al panel
          </Link>
        </div>

        <section className="space-y-4">
          <TicketsPanel token={token} onRequireAuth={() => router.replace("/login?from=/client/tickets")} />
        </section>
      </div>
    </main>
  );
}
