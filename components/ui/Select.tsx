"use client";

import clsx from "clsx";
import { forwardRef, SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, className, children, ...props },
  ref,
) {
  // Garantiza accesibilidad: si no hay id proporcionado, generamos uno simple
  const selectId = props.id || (label ? `select-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

  return (
    <label className="flex flex-col gap-1 text-sm text-foreground">
      {label && (
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
      )}
      <select
        ref={ref}
        id={selectId}
        aria-label={label || props["aria-label"] || undefined}
        className={clsx(
          "rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
});
