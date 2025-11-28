"use client";

import type { ReactNode } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";

function HeaderContent() {
  const { state, isMobile } = useSidebar();
  // En móvil siempre mostrar el botón en el header
  // En desktop solo cuando está colapsado
  const isCollapsed = state === "collapsed";
  // Si isMobile es true, siempre mostrar. Si es false, solo cuando está colapsado.
  // Si es undefined (durante la detección inicial), mostrar por defecto (asumiendo móvil)
  const showTriggerInHeader = isMobile === true || (isMobile === false && isCollapsed) || (isMobile === undefined);

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4">
      {showTriggerInHeader && <SidebarTrigger className="-ml-1" />}
      <div className="flex flex-1 items-center justify-end gap-3">
            <Button variant="default" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Quick Create</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
          </div>
        </header>
  );
}

export default function ClientGroupLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-hidden">
        <HeaderContent />
        <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
