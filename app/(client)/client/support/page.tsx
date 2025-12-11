"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LifeBuoy,
  Phone,
  Sparkles,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { getAccessToken } from "@/lib/auth";
import { SupportChat } from "@/components/support/SupportChat";

export default function ClientSupportPage() {
  const router = useRouter();
  const t = useTranslationsSafe("support");

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login?from=/client/support");
    }
  }, [router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("backToDashboard", { defaultValue: "Volver al dashboard" })}
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <LifeBuoy className="h-8 w-8 text-primary" />
              {t("title", { defaultValue: "Soporte técnico" })}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("description", { defaultValue: "Crea y gestiona tickets, o chatea con soporte en tiempo real." })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button asChild>
              <Link href="/client/tickets">
                <Ticket className="h-4 w-4 mr-2" />
                {t("viewTickets", { defaultValue: "Ver mis tickets" })}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/client/tickets">
                <Sparkles className="h-4 w-4 mr-2" />
                {t("newTicket", { defaultValue: "Crear ticket" })}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Chat en vivo estilo messenger */}
      <SupportChat />

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              {t("tickets", { defaultValue: "Tickets" })}
            </CardTitle>
            <CardDescription>
              {t("ticketsDesc", { defaultValue: "Abre, gestiona y sigue tus solicitudes de soporte." })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("ticketsInfo", { defaultValue: "Usa filtros por estado/prioridad para encontrar tus casos rápidamente." })}
            </p>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/client/tickets">
                  {t("goToTickets", { defaultValue: "Ir a tickets" })}
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/client/tickets">
                  {t("createTicket", { defaultValue: "Crear ticket" })}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              {t("contact", { defaultValue: "Contacto prioritario" })}
            </CardTitle>
            <CardDescription>
              {t("contactDesc", { defaultValue: "Escala casos críticos con nuestro equipo." })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("contactInfo", { defaultValue: "Si no puedes usar el chat, abre un ticket y marca alta prioridad." })}
            </p>
            <Button variant="outline" asChild>
              <Link href="/client/tickets">
                {t("openPriorityTicket", { defaultValue: "Abrir ticket prioritario" })}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
