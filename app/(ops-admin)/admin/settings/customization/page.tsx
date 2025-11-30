"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPreferences } from "@/components/customization/UserPreferences";
import { SavedViews } from "@/components/customization/SavedViews";
import { KeyboardShortcuts } from "@/components/customization/KeyboardShortcuts";
import { OrganizationBranding } from "@/components/customization/OrganizationBranding";
import { Settings, Palette, Eye, Keyboard, Building2 } from "lucide-react";

export default function AdminCustomizationPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 md:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Configuración
          </p>
          <h1 className="text-3xl font-semibold text-foreground">Personalización</h1>
          <p className="text-sm text-muted-foreground">
            Personaliza tu experiencia en la plataforma
          </p>
        </div>

        <Tabs defaultValue="preferences" className="space-y-6">
          <TabsList>
            <TabsTrigger value="preferences">
              <Settings className="h-4 w-4 mr-2" />
              Preferencias
            </TabsTrigger>
            <TabsTrigger value="views">
              <Eye className="h-4 w-4 mr-2" />
              Vistas Guardadas
            </TabsTrigger>
            <TabsTrigger value="shortcuts">
              <Keyboard className="h-4 w-4 mr-2" />
              Atajos de Teclado
            </TabsTrigger>
            <TabsTrigger value="branding">
              <Building2 className="h-4 w-4 mr-2" />
              Branding
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preferences">
            <UserPreferences />
          </TabsContent>

          <TabsContent value="views">
            <SavedViews />
          </TabsContent>

          <TabsContent value="shortcuts">
            <KeyboardShortcuts />
          </TabsContent>

          <TabsContent value="branding">
            <OrganizationBranding />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

