import type { ReactNode } from "react";
import Link from "next/link";
import { Radar, Ticket, FolderKanban } from "lucide-react";

export default function OpsInternalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-8">
        <aside className="hidden w-52 shrink-0 rounded-2xl border border-border/70 bg-background/80 p-4 text-sm md:block">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            <Radar className="h-4 w-4" />
            Interno
          </div>
          <nav className="space-y-2 text-muted-foreground">
            <Link className="flex items-center gap-2 rounded-lg px-2 py-1 hover:text-foreground" href="/internal">
              <Radar className="h-4 w-4" />
              Resumen
            </Link>
            <Link className="flex items-center gap-2 rounded-lg px-2 py-1 hover:text-foreground" href="/internal/tickets">
              <Ticket className="h-4 w-4" />
              Tickets
            </Link>
            <Link className="flex items-center gap-2 rounded-lg px-2 py-1 hover:text-foreground" href="/internal/projects">
              <FolderKanban className="h-4 w-4" />
              Proyectos
            </Link>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
