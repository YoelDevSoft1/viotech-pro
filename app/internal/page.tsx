"use client";

import Link from "next/link";
import { Ticket, Users, FolderKanban, AlertTriangle } from "lucide-react";
import OrgSelector from "@/components/OrgSelector";

export default function InternalHome() {
  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Panel interno
          </p>
          <h1 className="text-3xl font-medium text-foreground">Operaciones y soporte</h1>
          <p className="text-sm text-muted-foreground">
            Accede a tickets de todos los clientes, proyectos y alertas críticas.
          </p>
        </div>

        <OrgSelector />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/internal/tickets"
            className="rounded-2xl border border-border/70 bg-background/80 p-5 space-y-2 hover:border-border transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Ticket className="w-4 h-4" />
              Tickets globales
            </div>
            <p className="text-xs text-muted-foreground">
              Visualiza y gestiona tickets de todos los clientes.
            </p>
          </Link>
          <Link
            href="/admin/users"
            className="rounded-2xl border border-border/70 bg-background/80 p-5 space-y-2 hover:border-border transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Users className="w-4 h-4" />
              Usuarios/roles
            </div>
            <p className="text-xs text-muted-foreground">Cambia roles y verifica cuentas.</p>
          </Link>
          <Link
            href="/internal/projects"
            className="rounded-2xl border border-border/70 bg-background/80 p-5 space-y-2 hover:border-border transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FolderKanban className="w-4 h-4" />
              Proyectos
            </div>
            <p className="text-xs text-muted-foreground">Ver proyectos activos y sus tickets.</p>
          </Link>
        </div>

        <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
            <AlertTriangle className="w-4 h-4" />
            Alertas
          </div>
          <p className="text-sm text-amber-800">
            Integra aquí el feed de alertas críticas (SLA, salud de servicios, IA, pagos).
          </p>
        </div>
      </div>
    </main>
  );
}
