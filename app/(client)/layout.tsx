"use client";

import type { ReactNode } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { HeaderContent } from "@/components/dashboard/header-content";
import { UrgencyBanner } from "@/components/dashboard/UrgencyBanner";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function ClientGroupLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-hidden">
        <HeaderContent />
        <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
          <UrgencyBanner />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
