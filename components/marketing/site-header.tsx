"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Moon, Sun, Monitor, User, LogOut, ChevronDown, Building2 } from "lucide-react";
import { useTheme } from "next-themes";
import { getAccessToken, logout } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const routes = [
  { href: "/", label: "Inicio" },
  { href: "/services", label: "Servicios" },
  { href: "/blog", label: "Blog" },
  { href: "/case-studies", label: "Casos de Éxito" },
  { href: "/about", label: "Sobre Nosotros" },
  { href: "/contact", label: "Contacto" },
];

const serviceRoutes = [
  { href: "/services/desarrollo-software", label: "Desarrollo de Software" },
  { href: "/services/consultoria-ti", label: "Consultoría TI" },
  { href: "/services/soporte-tecnico", label: "Soporte Técnico" },
  { href: "/services/catalog", label: "Catálogo y Precios" },
];

const industryRoutes = [
  { href: "/industries/fintech", label: "Fintech" },
  { href: "/industries/retail", label: "Retail" },
  { href: "/industries/healthcare", label: "Salud" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Evitar errores de hidratación - solo renderizar en cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detectar autenticación
  useEffect(() => {
    if (!mounted) return;
    const token = getAccessToken();
    setIsAuthenticated(Boolean(token));
  }, [pathname, mounted]); // Re-evaluar cuando cambie la ruta

  // Solo cargar usuario si está autenticado y montado
  const { data: currentUser } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await apiClient.get("/auth/me");
      return data?.data?.user || data?.user || null;
    },
    enabled: mounted && isAuthenticated, // Solo si está montado y hay token
    staleTime: Infinity,
    retry: false,
  });

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    router.push("/");
  };

  const getUserInitials = () => {
    if (!currentUser) return "U";
    const name = currentUser.nombre || currentUser.name || "";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  const getUserName = () => {
    if (!currentUser) return "Usuario";
    const fullName = currentUser.nombre || currentUser.name || "Usuario";
    // Extraer solo el primer nombre
    return fullName.split(" ")[0] || "Usuario";
  };

  const getUserAvatar = () => {
    if (!currentUser) return undefined;
    return currentUser.avatar || undefined;
  };

  // Evitar renderizar hasta que esté montado en cliente (previene errores de hidratación)
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-7xl mx-auto items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight">VioTech</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9" /> {/* Placeholder para theme toggle */}
            <div className="h-9 w-20" /> {/* Placeholder para auth buttons */}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl mx-auto items-center justify-between px-4 sm:px-8">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tight">VioTech</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === route.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {route.label}
            </Link>
          ))}
          
          {/* Servicios Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
                  pathname.startsWith("/services")
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                Servicios
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {serviceRoutes.map((route) => (
                <DropdownMenuItem key={route.href} asChild>
                  <Link href={route.href} className="cursor-pointer">
                    {route.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Industrias Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
                  pathname.startsWith("/industries")
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                Industrias
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {industryRoutes.map((route) => (
                <DropdownMenuItem key={route.href} asChild>
                  <Link href={route.href} className="cursor-pointer">
                    {route.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Actions (Theme + Auth) */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Cambiar tema</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" /> Claro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" /> Oscuro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" /> Sistema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth Section */}
          <div className="hidden md:flex gap-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getUserAvatar()} alt={getUserName()} />
                      <AvatarFallback className="text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline-block max-w-[120px] truncate">
                      {getUserName()}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {getUserName()}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser?.email || ""}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/client/dashboard" className="flex items-center">
                      <Building2 className="mr-2 h-4 w-4" />
                      Portal Cliente
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/client/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Ingresar
                  </Button>
                </Link>
                <Link href="/client/dashboard">
                  <Button size="sm">Portal Cliente</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col p-0">
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {/* User Info (if authenticated) */}
                {isAuthenticated && currentUser && (
                  <div className="mb-6 pb-6 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={getUserAvatar()} alt={getUserName()} />
                        <AvatarFallback>
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {getUserName()}
                        </p>
                        {currentUser?.email && (
                          <p className="text-xs text-muted-foreground truncate">
                            {currentUser.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="space-y-1 mb-6">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                        pathname === route.href
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {route.label}
                    </Link>
                  ))}
                </nav>
                
                {/* Services Section */}
                <div className="mb-6">
                  <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Servicios
                  </p>
                  <nav className="space-y-1">
                    {serviceRoutes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                          "block px-3 py-2 rounded-md text-sm transition-colors",
                          pathname === route.href
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {route.label}
                      </Link>
                    ))}
                  </nav>
                </div>
                
                {/* Industries Section */}
                <div className="mb-6">
                  <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Industrias
                  </p>
                  <nav className="space-y-1">
                    {industryRoutes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                          "block px-3 py-2 rounded-md text-sm transition-colors",
                          pathname === route.href
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {route.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Fixed Bottom Section - Auth Actions */}
              <div className="border-t px-6 py-4 space-y-2 bg-muted/30">
                {isAuthenticated ? (
                  <>
                    <Link href="/client/dashboard" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Building2 className="mr-2 h-4 w-4" />
                        Portal Cliente
                      </Button>
                    </Link>
                    <Link href="/client/profile" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        Mi Perfil
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block">
                      <Button variant="outline" className="w-full">
                        Ingresar
                      </Button>
                    </Link>
                    <Link href="/client/dashboard" className="block">
                      <Button className="w-full">Portal Cliente</Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
