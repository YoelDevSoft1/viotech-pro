import Link from "next/link";
import { Plus, FileText, CreditCard, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function QuickLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Accesos Rápidos
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Link href="/client/tickets">
          <Button variant="outline" className="w-full justify-start gap-2">
            <Plus className="h-4 w-4 text-primary" /> Nuevo Ticket
          </Button>
        </Link>
        <Link href="/services/catalog">
          <Button variant="outline" className="w-full justify-start gap-2">
            <CreditCard className="h-4 w-4 text-primary" /> Comprar Servicio
          </Button>
        </Link>
        <Link href="/client/ia/asistente">
          <Button variant="outline" className="w-full justify-start gap-2">
            <MessageSquare className="h-4 w-4 text-primary" /> Consultar Asistente
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}