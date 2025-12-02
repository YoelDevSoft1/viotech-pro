"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { LocaleSelector } from "@/components/i18n/LocaleSelector";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { usePathname } from "next/navigation";
import { HealthCheckBadge } from "@/components/admin/HealthCheckBadge";

export function HeaderContent() {
  const { state, isMobile } = useSidebar();
  const pathname = usePathname();
  const isCollapsed = state === "collapsed";
  const showTriggerInHeader = isMobile === true || (isMobile === false && isCollapsed) || (isMobile === undefined);
  const t = useTranslationsSafe("ui");
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4">
      {showTriggerInHeader && <SidebarTrigger className="-ml-1" />}
      <div className="flex flex-1 items-center justify-end gap-3">
        {isAdminRoute && <HealthCheckBadge />}
        <NotificationCenter />
        <LocaleSelector />
        <Button variant="ghost" size="sm" className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          <span className="hidden sm:inline">{t("refresh")}</span>
        </Button>
      </div>
    </header>
  );
}

