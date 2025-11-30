"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExecutiveDashboard } from "@/components/reports/ExecutiveDashboard";
import { AutomatedReports } from "@/components/reports/AutomatedReports";
import { BarChart3, Calendar } from "lucide-react";
import { useOrg } from "@/lib/hooks/useOrg";

export default function InternalReportsPage() {
  const { orgId } = useOrg();

  return (
    <main className="min-h-screen bg-background px-6 py-10 md:py-12">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Reportes Ejecutivos
          </p>
          <h1 className="text-3xl font-semibold text-foreground">Dashboard Ejecutivo</h1>
          <p className="text-sm text-muted-foreground">
            KPIs, métricas y análisis de rendimiento del negocio
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="automated">
              <Calendar className="h-4 w-4 mr-2" />
              Reportes Automáticos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <ExecutiveDashboard organizationId={orgId || undefined} />
          </TabsContent>

          <TabsContent value="automated" className="space-y-6">
            <AutomatedReports organizationId={orgId || undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

