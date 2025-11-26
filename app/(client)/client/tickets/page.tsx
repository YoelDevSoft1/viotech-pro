"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { getAccessToken } from "@/lib/auth";
import { useOrg } from "@/lib/useOrg";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { TicketsPanel } from "@/components/dashboard/TicketsPanel";

export default function ClientTicketsPage() {
  const router = useRouter();
  const { setOrgId } = useOrg();
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
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-8">
        <aside className="space-y-4 rounded-2xl border border-border/70 bg-background/80 p-4 lg:sticky lg:top-20 h-fit">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Portal cliente</p>
            <h2 className="text-lg font-medium text-foreground">Tickets</h2>
          </div>
          <Breadcrumb items={[{ href: "/client", label: "Inicio" }, { href: "/client/tickets", label: "Tickets" }]} />
          <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "") } label="Organización" />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Atajos</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/dashboard" className="rounded-xl border border-border px-3 py-2 hover:bg-muted/40">Dashboard</Link>
              <Link href="/services" className="rounded-xl border border-border px-3 py-2 hover:bg-muted/40">Servicios</Link>
            </div>
          </div>
          <Button onClick={() => router.push("/client/tickets")} className="w-full" variant="primary" size="sm">
            <Plus className="w-4 h-4" />
            Crear ticket
          </Button>
        </aside>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tickets & soporte</p>
              <h1 className="text-3xl font-medium text-foreground">Gestiona tus tickets</h1>
              <p className="text-sm text-muted-foreground">Crea, comenta y adjunta evidencias con tu squad.</p>
            </div>
            <Link
              href="/client"
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al panel cliente
            </Link>
          </div>

          <TicketsPanel token={token} onRequireAuth={() => router.replace("/login?from=/client/tickets") } />
        </section>
      </div>
    </main>
  );
}
