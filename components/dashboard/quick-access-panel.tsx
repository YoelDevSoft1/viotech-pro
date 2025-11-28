"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, HelpCircle, BookOpen, ArrowRight } from "lucide-react";

export function QuickAccessPanel() {
  const quickLinks = [
    {
      title: "Guía de integración",
      description: "Checklist técnico para nuevos despliegues",
      icon: BookOpen,
      href: "/docs/integration",
    },
    {
      title: "Canal de soporte",
      description: "Habla con tu squad prioritario en minutos",
      icon: MessageSquare,
      href: "https://wa.link/1r4ul7",
    },
    {
      title: "FAQ de seguridad",
      description: "Controles, cifrado y cumplimiento vigentes",
      icon: HelpCircle,
      href: "/docs/security",
    },
    {
      title: "Documentación",
      description: "Guías completas y recursos técnicos",
      icon: FileText,
      href: "/docs",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Accesos rápidos</CardTitle>
        <CardDescription className="mt-1">Documentación y soporte</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <a
              key={link.title}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="group rounded-lg border border-border/70 bg-muted/30 p-4 hover:bg-muted/50 hover:border-border transition-all flex items-start gap-3"
            >
              <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors shrink-0">
                <link.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight">{link.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {link.description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

