"use client";

import { useState } from "react";
import RoleManager from "@/components/admin/RoleManager";
import { PartnersList } from "@/components/admin/PartnersList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Handshake } from "lucide-react";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<"users" | "partners">("users");
  const t = useTranslationsSafe("users");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "users" | "partners")}>
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            {t("usersList")}
          </TabsTrigger>
          <TabsTrigger value="partners">
            <Handshake className="h-4 w-4 mr-2" />
            Partners
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <RoleManager />
        </TabsContent>

        <TabsContent value="partners" className="mt-6">
          <PartnersList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
