"use client";

import Link from "next/link";
import { ArrowRight, Ticket, Package, CalendarDays } from "lucide-react";
import OrgSelector from "@/components/common/OrgSelector";

export default function ClientHome() {
  return (
    <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Panel cliente
          </p>
          <h1 className="text-3xl font-medium text-foreground">Bienvenido a tu Command Center</h1>
          <p className="text-sm text-muted-foreground">
            Visualiza tus tickets, servicios y renovaciones en un solo lugar.
          </p>
        </div>

        <OrgSelector />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard"
            className="rounded-2xl border border-border/70 bg-background/80 p-5 space-y-2 hover:border-border transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Ticket className="w-4 h-4" />
              Mis tickets
            </div>
            <p className="text-xs text-muted-foreground">
              Crea y da seguimiento a tus casos de soporte.
            </p>
          </Link>
          <Link
            href="/services"
            className="rounded-2xl border border-border/70 bg-background/80 p-5 space-y-2 hover:border-border transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Package className="w-4 h-4" />
              Servicios
            </div>
            <p className="text-xs text-muted-foreground">Consulta tus licencias y proyectos.</p>
          </Link>
          <Link
            href="/dashboard"
            className="rounded-2xl border border-border/70 bg-background/80 p-5 space-y-2 hover:border-border transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CalendarDays className="w-4 h-4" />
              Renovaciones
            </div>
            <p className="text-xs text-muted-foreground">Revisa fechas clave y próximos hitos.</p>
          </Link>
        </div>

        <div className="rounded-3xl border border-border/70 bg-muted/20 p-6 space-y-3">
          <p className="text-sm font-medium text-foreground">Acciones rápidas</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/dashboard?tab=tickets"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-background hover:scale-[1.02] transition-transform"
            >
              Crear ticket
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-foreground hover:bg-muted/40 transition-colors"
            >
              Ver métricas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
    </div>
  );
}
