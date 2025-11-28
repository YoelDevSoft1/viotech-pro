"use client";

import type { ReactNode } from "react";
import RoleGate from "@/components/RoleGate";
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
          <HeaderContent />
          <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGate>
  );
}

