"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  const hasPrev = page > 0;
  const hasNext = page < pageCount - 1;

  const go = (next: number) => {
    if (next < 0 || next >= pageCount) return;
    onPageChange(next);
  };

  return (
    <div className={clsx("flex items-center gap-3 text-sm text-muted-foreground", className)}>
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={!hasPrev}
        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 disabled:opacity-50 hover:bg-muted/40"
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
        Anterior
      </button>
      <span className="text-xs">
        {page + 1} / {Math.max(pageCount, 1)}
      </span>
      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={!hasNext}
        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 disabled:opacity-50 hover:bg-muted/40"
        aria-label="Página siguiente"
      >
        Siguiente
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
