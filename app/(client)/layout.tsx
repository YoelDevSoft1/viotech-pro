"use client";

import type { ReactNode } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { HeaderContent } from "@/components/dashboard/header-content";
import { UrgencyBanner } from "@/components/dashboard/UrgencyBanner";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";

function FixedHeader() {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  // En móvil, el sidebar está oculto (Sheet), así que no debe haber marginLeft
  const marginLeft = isMobile ? "0" : (isCollapsed ? "var(--sidebar-width-icon)" : "var(--sidebar-width)");
  
  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 bg-background border-b shadow-sm transition-[margin-left] duration-200 ease-linear"
      style={{ marginLeft }}
    >
      <HeaderContent />
    </div>
  );
}

export default function ClientGroupLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col relative overflow-hidden">
        <FixedHeader />
        <div className="flex-1 overflow-y-auto pt-16">
          <div className="flex flex-col gap-6 p-6">
            <UrgencyBanner />
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
