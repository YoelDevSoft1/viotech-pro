"use client";

type BaseProps = {
  title?: string;
  message?: string;
  children?: React.ReactNode;
};

export function LoadingState({ title = "Cargando…", message }: BaseProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">{title}</p>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}

export function ErrorState({ title = "Ocurrió un error", message, children }: BaseProps) {
  return (
    <div className="rounded-2xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
      <p className="font-medium">{title}</p>
      {message && <p className="text-xs">{message}</p>}
      {children}
    </div>
  );
}

export function EmptyState({ title = "Sin resultados", message, children }: BaseProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">{title}</p>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
      {children}
    </div>
  );
}
