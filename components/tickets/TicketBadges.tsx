import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils"; // Asegúrate de tener tu utilidad cn (clsx + tailwind-merge)

export function PriorityBadge({ priority }: { priority: string }) {
  const p = priority.toLowerCase();
  const isUrgent = p === "alta" || p === "critica";
  
  if (!isUrgent) return null;

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border bg-red-100 text-red-700 border-red-200">
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  
  const styles = {
    resuelto: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cerrado: "bg-slate-100 text-slate-700 border-slate-200",
    en_progreso: "bg-amber-100 text-amber-700 border-amber-200",
    abierto: "bg-blue-100 text-blue-700 border-blue-200",
  };

  const icons = {
    resuelto: CheckCircle2,
    cerrado: CheckCircle2,
    en_progreso: Clock,
    abierto: AlertCircle,
  };

  const Icon = icons[s as keyof typeof icons] || AlertCircle;
  const className = styles[s as keyof typeof styles] || styles.cerrado;

  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border", className)}>
      <Icon className="w-3 h-3" />
      <span className="capitalize">{status.replace("_", " ")}</span>
    </span>
  );
}