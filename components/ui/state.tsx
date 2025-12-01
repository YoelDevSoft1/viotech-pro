"use client";

import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

type BaseProps = {
  title?: string;
  message?: string;
  children?: React.ReactNode;
};

export function LoadingState({ title, message }: BaseProps) {
  const tCommon = useTranslationsSafe("common");
  const defaultTitle = title || tCommon("loading");
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">{defaultTitle}</p>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}

export function ErrorState({ title, message, children }: BaseProps) {
  const tCommon = useTranslationsSafe("common");
  const defaultTitle = title || tCommon("error.occurred");
  
  return (
    <div className="rounded-2xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
      <p className="font-medium">{defaultTitle}</p>
      {message && <p className="text-xs">{message}</p>}
      {children}
    </div>
  );
}

export function EmptyState({ title, message, children }: BaseProps) {
  const tCommon = useTranslationsSafe("common");
  const defaultTitle = title || tCommon("empty.noResults");
  
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">{defaultTitle}</p>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
      {children}
    </div>
  );
}
