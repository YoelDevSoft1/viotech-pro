"use client";

import { Shield, Users, Ticket, Cpu, Activity } from "lucide-react";

const cards = [
  {
    title: "Usuarios",
    value: "—",
    description: "Total usuarios activos",
    icon: Users,
  },
  {
    title: "Tickets",
    value: "—",
    description: "Abiertos / SLA crítico",
    icon: Ticket,
  },
  {
    title: "Seguridad",
    value: "—",
    description: "MFA habilitado / roles admin",
    icon: Shield,
  },
  {
    title: "IA",
    value: "—",
    description: "Modelo activo / consultas recientes",
    icon: Cpu,
  },
];

export default function AdminDashboardPage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Resumen
        </p>
        <h1 className="text-2xl font-medium text-foreground">Panel administrativo</h1>
        <p className="text-sm text-muted-foreground">
          Supervisión centralizada de usuarios, tickets y servicios.
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-2xl border border-border/70 bg-background/80 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {card.title}
                </p>
                <Icon className="w-4 h-4 text-foreground" />
              </div>
              <p className="text-3xl font-semibold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-border/70 bg-background/80 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-foreground" />
          <p className="text-sm font-medium text-foreground">Actividades recientes</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Integra aquí una lista de auditoría o alertas críticas. Por ahora es un placeholder.
        </p>
      </section>
    </main>
  );
}
