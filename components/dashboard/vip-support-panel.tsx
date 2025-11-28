"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Calendar, ArrowRight } from "lucide-react";

export function VipSupportPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Mesa de soporte VIP</CardTitle>
        <CardDescription className="mt-1">
          Respuesta prioritaria en menos de 2 minutos vía WhatsApp o canal privado de Slack. Tu squad está disponible 24/7.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="https://wa.link/1r4ul7"
            target="_blank"
            rel="noreferrer"
            className="group rounded-lg border border-border/70 bg-muted/30 p-5 hover:bg-muted/50 hover:border-border transition-all flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Canal WhatsApp</p>
                <p className="text-xs text-muted-foreground mt-0.5">Contacto directo con tu equipo</p>
              </div>
            </div>
          </a>
          
          <a
            href="https://calendly.com/viotech/demo"
            target="_blank"
            rel="noreferrer"
            className="group rounded-lg border border-border/70 bg-muted/30 p-5 hover:bg-muted/50 hover:border-border transition-all flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Agendar sesión</p>
                <p className="text-xs text-muted-foreground mt-0.5">Coordina con tu PM dedicado</p>
              </div>
            </div>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

