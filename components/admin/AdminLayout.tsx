"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Settings, HeartPulse, ChevronRight } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/health", label: "Salud", icon: HeartPulse },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/tickets", label: "Tickets", icon: FileText },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const breadcrumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const items: Array<{ href: string; label: string }> = [];
    segments.reduce((acc, segment) => {
      const href = `${acc}/${segment}`;
      const navMatch = navItems.find((n) => n.href === href);
      items.push({ href, label: navMatch?.label || segment });
      return href;
    }, "");
    return items;
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="w-64 border-r border-border/60 bg-background/80 hidden md:flex flex-col">
        <div className="px-5 py-4 border-b border-border/60">
          <p className="text-sm font-semibold">Panel administrativo</p>
          <p className="text-xs text-muted-foreground">Control centralizado</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1">
        <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Admin</p>
              <div className="flex items-center gap-2 text-sm text-foreground">
                {breadcrumbs.map((item, idx) => (
                  <span key={item.href} className="flex items-center gap-2">
                    {idx > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                    <span className={idx === breadcrumbs.length - 1 ? "font-medium" : "text-muted-foreground"}>
                      {item.label}
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("es-CO", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </header>

        <div className="w-full px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
