"use client";

import clsx from "clsx";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("overflow-hidden rounded-2xl border border-border/70", className)}>{children}</div>;
}

export function THead({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-12 bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{children}</div>;
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-border/70">{children}</div>;
}

export function TR({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("grid grid-cols-12 px-4 py-3 text-sm hover:bg-muted/30", className)}>{children}</div>;
}

export function TH({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("col-span-3", className)}>{children}</div>;
}

export function TD({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("col-span-3 text-foreground", className)}>{children}</div>;
}
