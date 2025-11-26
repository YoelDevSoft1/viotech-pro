"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";

export type Crumb = { href: string; label: string };

export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={clsx("text-sm text-muted-foreground", className)}>
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((item, idx) => (
          <li key={item.href} className="flex items-center gap-2">
            {idx > 0 && <ChevronRight className="w-3 h-3" />}
            {idx === items.length - 1 ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
