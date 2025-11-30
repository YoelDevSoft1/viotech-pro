"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { 
  LayoutDashboard, 
  Ticket, 
  Package, 
  CreditCard, 
  LifeBuoy,
  BrainCircuit,
  Users,
  Settings,
  HeartPulse,
  FolderKanban,
  Shield,
  FileText,
  MessageSquare,
  Bell,
  History,
  UserCog,
  BarChart3
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { SidebarUser } from "@/components/dashboard/sidebar-user";
import { getAccessToken } from "@/lib/auth";
import { buildApiUrl } from "@/lib/api";

// Tipos para items del sidebar
type SidebarItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

export function AppSidebar() {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  const isExpanded = state === "expanded" && !isMobile;
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const t = useTranslationsSafe();

  // Obtener el rol del usuario
  useEffect(() => {
    const fetchUserRole = async () => {
      const token = getAccessToken();
      if (!token) return;

      try {
        const res = await fetch(buildApiUrl("/auth/me"), {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok || !payload) return;
        const data = payload.data || payload;
        const user = data.user || data;
        const role = user?.rol || user?.role || null;
        setUserRole(role);
      } catch {
        // ignore role errors
      }
    };

    fetchUserRole();
  }, []);

  // Funciones para obtener items (dentro del componente para tener acceso a t)
  const getClientSidebarItems = (): SidebarItem[] => [
    {
      title: t("navigation.dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("sidebar.myTickets"),
      href: "/client/tickets",
      icon: Ticket,
    },
    {
      title: t("sidebar.myServices"),
      href: "/services",
      icon: Package,
    },
    {
      title: t("sidebar.artificialIntelligence"),
      href: "/client/ia/asistente",
      icon: BrainCircuit,
      badge: "Beta"
    },
    {
      title: t("sidebar.payments"),
      href: "/client/payments",
      icon: CreditCard,
    },
  ];

  const getAdminSidebarItems = (): SidebarItem[] => [
    {
      title: t("navigation.dashboard"),
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: t("navigation.tickets"),
      href: "/admin/tickets",
      icon: Ticket,
    },
    {
      title: t("sidebar.users"),
      href: "/admin/users",
      icon: Users,
    },
    {
      title: t("navigation.projects"),
      href: "/admin/services",
      icon: Package,
    },
    {
      title: t("sidebar.health"),
      href: "/admin/health",
      icon: HeartPulse,
    },
    {
      title: t("sidebar.blog"),
      href: "/admin/blog",
      icon: FileText,
    },
    {
      title: t("sidebar.comments"),
      href: "/admin/blog/comments",
      icon: MessageSquare,
    },
    {
      title: t("navigation.notifications"),
      href: "/admin/notifications",
      icon: Bell,
    },
    {
      title: t("sidebar.auditLog"),
      href: "/admin/audit-log",
      icon: History,
    },
    {
      title: t("navigation.resources"),
      href: "/admin/resources",
      icon: UserCog,
    },
    {
      title: t("navigation.reports"),
      href: "/admin/reports",
      icon: BarChart3,
    },
    {
      title: t("navigation.settings"),
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  const getInternalSidebarItems = (): SidebarItem[] => [
    {
      title: t("navigation.dashboard"),
      href: "/internal",
      icon: LayoutDashboard,
    },
    {
      title: t("navigation.tickets"),
      href: "/internal/tickets",
      icon: Ticket,
    },
    {
      title: t("navigation.projects"),
      href: "/internal/projects",
      icon: FolderKanban,
    },
    {
      title: t("navigation.notifications"),
      href: "/internal/notifications",
      icon: Bell,
    },
    {
      title: t("navigation.resources"),
      href: "/internal/resources",
      icon: UserCog,
    },
    {
      title: t("navigation.reports"),
      href: "/internal/reports",
      icon: BarChart3,
    },
  ];

  // Determinar qué items mostrar según la ruta Y el rol del usuario
  const getSidebarItems = (): SidebarItem[] => {
    // Si está en ruta de admin, mostrar items de admin
    if (pathname?.startsWith("/admin")) {
      return getAdminSidebarItems();
    }
    // Si está en ruta de interno, mostrar items de interno
    if (pathname?.startsWith("/internal")) {
      return getInternalSidebarItems();
    }
    // Si el usuario es admin pero está en otra ruta, mostrar items de admin
    if (userRole === "admin" || userRole === "superadmin" || userRole === "ops" || userRole === "support" || userRole === "soporte") {
      return getAdminSidebarItems();
    }
    // Si el usuario es agente pero está en otra ruta, mostrar items de interno
    if (userRole === "agente") {
      return getInternalSidebarItems();
    }
    // Para /dashboard y cualquier otra ruta de cliente
    return getClientSidebarItems();
  };

  const sidebarItems = getSidebarItems();
  const isAdmin = pathname?.startsWith("/admin") || (userRole === "admin" || userRole === "superadmin" || userRole === "ops" || userRole === "support" || userRole === "soporte");
  const isInternal = pathname?.startsWith("/internal") || userRole === "agente";

  // Determinar el título del grupo principal
  const getMainGroupLabel = () => {
    if (isAdmin) return t("sidebar.administration");
    if (isInternal) return t("sidebar.operations");
    return t("sidebar.controlPanel");
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b h-16 flex items-center p-4 group-data-[collapsible=icon]:p-3">
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 flex-1">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:rounded-md">
              {isAdmin ? (
                <Shield className="size-4 group-data-[collapsible=icon]:size-5" />
              ) : (
                <LayoutDashboard className="size-4 group-data-[collapsible=icon]:size-5" />
              )}
            </div>
            <div className="flex flex-col text-left min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold leading-none truncate">VioTech</span>
              <span className="text-xs text-sidebar-foreground/70 leading-none mt-0.5 truncate">Solutions</span>
            </div>
          </div>
          {isExpanded && (
            <SidebarTrigger className="-mr-1" />
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2 group-data-[collapsible=icon]:p-1.5">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-medium text-sidebar-foreground/70 mb-1">
            {getMainGroupLabel()}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.length > 0 ? (
                (() => {
                  // Ordenar items por longitud de href (más largos primero) para priorizar rutas más específicas
                  const sortedItems = [...sidebarItems].sort((a, b) => b.href.length - a.href.length);
                  
                  // Encontrar el item activo más específico
                  const activeItem = sortedItems.find((item) => {
                    if (!pathname) return false;
                    // Coincidencia exacta
                    if (pathname === item.href) return true;
                    // Coincidencia de prefijo válido (seguido de / o al final)
                    return pathname.startsWith(item.href + "/") || pathname.startsWith(item.href + "?");
                  });
                  
                  return sortedItems.map((item) => {
                    const isActive = activeItem?.href === item.href;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive} 
                          tooltip={item.title}
                          className={cn(
                            "relative",
                            isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                          )}
                        >
                          <Link href={item.href} className="flex items-center gap-2.5 w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:items-center">
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full group-data-[collapsible=icon]:h-9" />
                            )}
                            <item.icon className="size-4 shrink-0 group-data-[collapsible=icon]:size-5" />
                            <span className="group-data-[collapsible=icon]:hidden flex-1 text-left">{item.title}</span>
                            {item.badge && (
                              <SidebarMenuBadge className="group-data-[collapsible=icon]:hidden ml-auto">{item.badge}</SidebarMenuBadge>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  });
                })()
              ) : (
                <div className="px-2 py-4 text-xs text-muted-foreground">{t("ui.noItemsAvailable")}</div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {!isAdmin && !isInternal && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="px-2 text-xs font-medium text-sidebar-foreground/70 mb-1">
              {t("sidebar.help")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={t("sidebar.technicalSupport")}>
                    <Link href="/contact" className="flex items-center gap-2.5 w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
                      <LifeBuoy className="size-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden flex-1 text-left">{t("sidebar.technicalSupport")}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t p-0">
        <SidebarUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
