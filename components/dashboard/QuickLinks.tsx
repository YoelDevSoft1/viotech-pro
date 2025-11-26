"use client";

import { ArrowRight, HelpCircle, FileText, MessageCircle } from "lucide-react";

type LinkItem = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

const links: LinkItem[] = [
  {
    title: "Guía de integración",
    description: "Checklist técnico para nuevos despliegues.",
    href: "https://viotech.ai/docs",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    title: "Canal de soporte",
    description: "Habla con tu squad prioritario en minutos.",
    href: "https://wa.link/1r4ul7",
    icon: <MessageCircle className="w-4 h-4" />,
  },
  {
    title: "FAQ de seguridad",
    description: "Controles, cifrado y cumplimiento vigentes.",
    href: "https://viotech.ai/security",
    icon: <HelpCircle className="w-4 h-4" />,
  },
];

export function QuickLinks() {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/80 p-6 space-y-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Accesos rápidos</p>
        <h2 className="text-2xl font-medium text-foreground">Documentación y soporte</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {links.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-border/70 bg-background/60 p-4 flex items-start gap-3 hover:bg-muted/40 transition-colors"
          >
            <div className="mt-1 text-muted-foreground">{item.icon}</div>
            <div className="space-y-1 text-sm">
              <div className="inline-flex items-center gap-2 text-foreground font-medium">
                {item.title}
                <ArrowRight className="w-3 h-3" />
              </div>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
