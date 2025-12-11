"use client";

import type { ReactNode } from "react";
import RoleGate from "@/components/common/RoleGate";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { HeaderContent } from "@/components/dashboard/header-content";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function AccountLayout({ children }: { children: ReactNode }) {
  // Permitir todos los roles autenticados
  return (
    <RoleGate allowedRoles={["cliente", "agente", "admin"]}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col overflow-hidden">
          <div className="sticky top-0 z-50 bg-background">
            <HeaderContent />
          </div>
          <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGate>
  );
}

