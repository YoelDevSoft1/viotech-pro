"use client";

import { useState } from "react";
import { Users, Calendar, TrendingUp, Award, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceCalendar } from "@/components/resources/ResourceCalendar";
import { ResourceWorkload } from "@/components/resources/ResourceWorkload";
import { useOrg } from "@/lib/hooks/useOrg";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

export default function AdminResourcesPage() {
  const { orgId } = useOrg();
  const tResources = useTranslationsSafe("resources");

  return (
    <main className="min-h-screen bg-background px-6 py-10 md:py-12">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {tResources("management")}
          </p>
          <h1 className="text-3xl font-semibold text-foreground">
            {tResources("title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tResources("description")}
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calendar">
              <Calendar className="h-4 w-4 mr-2" />
              {tResources("calendar")}
            </TabsTrigger>
            <TabsTrigger value="workload">
              <TrendingUp className="h-4 w-4 mr-2" />
              {tResources("workload")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <ResourceCalendar organizationId={orgId || undefined} />
          </TabsContent>

          <TabsContent value="workload" className="space-y-6">
            <ResourceWorkload organizationId={orgId || undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

