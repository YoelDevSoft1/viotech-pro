"use client";

import { ShieldAlert, ShieldCheck, RefreshCcw } from "lucide-react";
import { ModelStatus } from "@/lib/hooks/useModelStatus";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/State";

type Props = {
  modelStatus: ModelStatus | null;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
};

export function SecurityPanel({ modelStatus, loading, error, onRefresh }: Props) {
  if (loading) return <LoadingState title="Verificando estado de seguridad..." />;
  if (error) return <ErrorState message={error} />;
  if (!modelStatus) return <EmptyState title="Sin datos de seguridad" message="No pudimos obtener el estado del modelo." />;

  const statusBadge = modelStatus.healthy ? "text-green-700 bg-green-100 border border-green-200" : "text-amber-700 bg-amber-100 border border-amber-200";

  return (
    <section className="rounded-3xl border border-border/70 bg-background/80 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Seguridad y modelo</p>
          <h2 className="text-2xl font-medium text-foreground">Estado del modelo IA</h2>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted/40 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Refrescar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div className="rounded-2xl border border-border/70 bg-background/60 p-4 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Estado</p>
          <div className="inline-flex items-center gap-2">
            {modelStatus.healthy ? (
              <ShieldCheck className="w-4 h-4 text-green-600" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            )}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge}`}>
              {modelStatus.healthy ? "OK" : "En observación"}
            </span>
          </div>
          <p className="text-muted-foreground">{modelStatus.enabled ? "Modelo habilitado" : "Modelo deshabilitado"}</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/60 p-4 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Versión</p>
          <p className="text-xl font-medium text-foreground">{modelStatus.modelVersion || "Desconocida"}</p>
          <p className="text-muted-foreground">Seguimiento de despliegues y regresiones.</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/60 p-4 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Notas</p>
          <p className="text-sm text-foreground">
            {modelStatus.notes || "Sin observaciones. Monitoreo continuo activo."}
          </p>
        </div>
      </div>
    </section>
  );
}
