"use client";

import clsx from "clsx";

export type BadgeTone = "default" | "success" | "warning" | "danger" | "info";

type Props = {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
};

const toneClasses: Record<BadgeTone, string> = {
  default: "bg-border text-muted-foreground",
  success: "bg-green-500/15 text-green-700 border border-green-500/30",
  warning: "bg-amber-500/15 text-amber-700 border border-amber-500/30",
  danger: "bg-red-500/15 text-red-700 border border-red-500/30",
  info: "bg-blue-500/15 text-blue-700 border border-blue-500/30",
};

export function Badge({ tone = "default", children, className }: Props) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
