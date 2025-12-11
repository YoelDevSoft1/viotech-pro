"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LogOut, User, Settings, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/lib/hooks/useResources";
import { logout } from "@/lib/auth";
import { useSentryUser } from "@/lib/hooks/useSentryUser";

export function SidebarUser() {
  const { data: user, isLoading } = useCurrentUser();
  const [mounted, setMounted] = useState(false);
  
  // Configurar usuario en Sentry para tracking
  useSentryUser(user || undefined);
  
  // Evitar hidratación incorrecta renderizando solo en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Calcular iniciales solo cuando tengamos datos
  const initials = user?.nombre
    ? user.nombre
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  // Si no está montado, mostrar skeleton sutil (solo para evitar hidratación)
  if (!mounted) {
    return (
      <div className="p-3 border-t group-data-[collapsible=icon]:p-3">
        <div className="w-full flex items-center gap-3 p-2 rounded-md group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:rounded-md">
          <Avatar className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
            <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold animate-pulse" suppressHydrationWarning>
              U
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="h-4 w-24 bg-muted rounded animate-pulse mb-1" />
            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }
  
  // Si está cargando Y no hay datos (ni del caché ni del backend), mostrar skeleton
  // Si hay datos (aunque esté cargando), mostrar los datos
  if (isLoading && !user) {
    return (
      <div className="p-3 border-t group-data-[collapsible=icon]:p-3">
        <div className="w-full flex items-center gap-3 p-2 rounded-md group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:rounded-md">
          <Avatar className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
            <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold animate-pulse" suppressHydrationWarning>
              U
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="h-4 w-24 bg-muted rounded animate-pulse mb-1" />
            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 border-t group-data-[collapsible=icon]:p-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:rounded-md">
            <Avatar className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
              <AvatarImage src={user?.avatar} alt={user?.nombre} />
              <AvatarFallback className="bg-green-500 text-white text-xs font-semibold" suppressHydrationWarning>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium leading-tight truncate">
                {user?.nombre || ""}
              </p>
              <p className="text-xs text-sidebar-foreground/70 leading-tight mt-0.5 truncate">
                {user?.email || ""}
              </p>
            </div>
            <MoreVertical className="h-4 w-4 text-sidebar-foreground/50 shrink-0 group-data-[collapsible=icon]:hidden" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" side="right" sideOffset={8}>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.nombre || ""}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || ""}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

