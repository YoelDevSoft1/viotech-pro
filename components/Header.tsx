"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LogOut,
  LogIn,
  Home,
  Wrench,
  LayoutDashboard,
  Ticket,
  User,
} from "lucide-react";
import clsx from "clsx";
import { getAccessToken, logout } from "@/lib/auth";

type NavItem = { label: string; href: string; icon?: React.ReactNode };

const PUBLIC_NAV: NavItem[] = [
  { label: "Inicio", href: "/", icon: <Home className="w-4 h-4" /> },
  { label: "Servicios", href: "/services", icon: <Wrench className="w-4 h-4" /> },
];

const AUTH_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Tickets", href: "/client/tickets", icon: <Ticket className="w-4 h-4" /> },
  { label: "Admin", href: "/admin", icon: <User className="w-4 h-4" /> },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    setIsAuthenticated(Boolean(token));
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    router.push("/login");
  };

  const navItems = isAuthenticated ? [...PUBLIC_NAV, ...AUTH_NAV] : PUBLIC_NAV;

  const renderLink = (item: NavItem, isMobile = false) => {
    const active = pathname === item.href;
    const base =
      "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors";
    const desktop = active
      ? "border-foreground bg-foreground text-background"
      : "border-transparent text-muted-foreground hover:text-foreground";
    const mobile = active
      ? "bg-muted/60 text-foreground"
      : "text-muted-foreground hover:text-foreground";

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`${base} ${isMobile ? "w-full border-none px-2 py-2" : desktop} ${
          isMobile ? mobile : ""
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        {item.icon}
        {item.label}
      </Link>
    );
  };

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 bg-background/30 backdrop-blur border-b border-transparent",
        isScrolled && "bg-background/60 backdrop-blur-sm border-border/60",
      )}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-medium tracking-tight text-foreground">
          VioTech Solutions
        </Link>

        <nav className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
          {navItems.map((item) => renderLink(item))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                aria-label="Ingresar"
              >
                <LogIn className="w-4 h-4" />
                Ingresar
              </Link>
              <a
                href="https://wa.link/1r4ul7"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-muted transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
              <a
                href="https://calendly.com/viotech/demo"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background shadow-lg shadow-foreground/10 transition-transform hover:scale-105"
                target="_blank"
                rel="noreferrer"
              >
                Agendar demo
              </a>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          )}
        </div>

        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded-full border border-border text-foreground"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Abrir menú"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-border/70 bg-background">
          <div className="px-6 py-4 space-y-4 text-sm">
            {navItems.map((item) => renderLink(item, true))}
            {!isAuthenticated ? (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                Ingresar
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            )}
            <a
              href="https://wa.link/1r4ul7"
              className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-medium"
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsMenuOpen(false)}
            >
              WhatsApp
            </a>
            <a
              href="https://calendly.com/viotech/demo"
              className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background"
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsMenuOpen(false)}
            >
              Agendar demo
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
