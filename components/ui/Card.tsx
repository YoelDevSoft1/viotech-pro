"use client";

import clsx from "clsx";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: Props) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-border/70 bg-background/80 p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
