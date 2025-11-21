"use client";

import { useMemo, useState } from "react";
import { Loader2, Shield, Sparkles } from "lucide-react";

type PredictionPayload = {
  serviceType: string;
  complexity: "low" | "medium" | "high";
  features: string[];
  estimatedHours: number;
  teamSize: number;
  techStack: string[];
};

type PredictionResponse = {
  predictedDays: number;
  confidenceInterval: [number, number];
  confidence: number;
  estimatedCost: {
    min: number;
    max: number;
    expected: number;
  };
  riskFactors: { label: string; recommendation: string }[];
  modelVersion?: string;
};

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

const getPredictorApiBase = () => {
  const env =
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://viotech-main.onrender.com";
  const trimmed = env.replace(/\/+$/, "");
  return trimmed.toLowerCase().endsWith("/api") ? trimmed : `${trimmed}/api`;
};

export default function TimelinePredictor() {
  const [input, setInput] = useState<PredictionPayload>({
    serviceType: "web_app",
    complexity: "medium",
    features: ["auth", "dashboard"],
    estimatedHours: 160,
    teamSize: 2,
    techStack: ["nextjs", "node", "postgres"],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const apiBase = useMemo(() => getPredictorApiBase(), []);

  const handleChange = (field: keyof PredictionPayload, value: string) => {
    setInput((prev) => ({
      ...prev,
      [field]: ["estimatedHours", "teamSize"].includes(field)
        ? Number(value)
        : value,
    }) as PredictionPayload);
  };

  const handleListChange = (field: "features" | "techStack", value: string) => {
    const list = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    setInput((prev) => ({ ...prev, [field]: list }));
  };

  const submit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch(`${apiBase}/predictions/project-timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "No se pudo obtener la predicción");
      }
      setResult(data.data as PredictionResponse);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const confidenceLabel = useMemo(() => {
    if (!result) return null;
    if (result.confidence >= 0.88) return "Alta confianza";
    if (result.confidence >= 0.8) return "Confianza media";
    return "Confianza vigilada";
  }, [result]);

  return (
    <div className="rounded-3xl border border-border/70 bg-background/80 p-6 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          <Sparkles className="w-4 h-4" />
          IA · Predicción
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
          <Shield className="w-4 h-4" />
          Piloto controlado
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Tipo de servicio
          </label>
          <input
            className="w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/30"
            value={input.serviceType}
            onChange={(e) => handleChange("serviceType", e.target.value)}
            placeholder="ej: web_app, ecommerce, landing"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Complejidad
          </label>
          <select
            className="w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/30"
            value={input.complexity}
            onChange={(e) =>
              handleChange("complexity", e.target.value as PredictionPayload["complexity"])
            }
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Horas estimadas
          </label>
          <input
            type="number"
            min={1}
            className="w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/30"
            value={input.estimatedHours}
            onChange={(e) => handleChange("estimatedHours", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Equipo (personas)
          </label>
          <input
            type="number"
            min={1}
            className="w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/30"
            value={input.teamSize}
            onChange={(e) => handleChange("teamSize", e.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Features clave (coma separada)
          </label>
          <input
            className="w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/30"
            value={input.features.join(", ")}
            onChange={(e) => handleListChange("features", e.target.value)}
            placeholder="auth, pagos, realtime, dashboards"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Stack tecnológico (coma separada)
          </label>
          <input
            className="w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/30"
            value={input.techStack.join(", ")}
            onChange={(e) => handleListChange("techStack", e.target.value)}
            placeholder="nextjs, node, postgres, supabase, wompi"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Calculando...
            </>
          ) : (
            "Calcular predicción"
          )}
        </button>
        <p className="text-xs text-muted-foreground">
          Resultado heurístico; listo para conectar a TensorFlow.js/pgvector.
        </p>
      </div>

      {result && (
        <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Días estimados
              </p>
              <p className="text-3xl font-medium text-foreground">
                {result.predictedDays} días
              </p>
              <p className="text-xs text-muted-foreground">
                Rango: {result.confidenceInterval[0]} - {result.confidenceInterval[1]} días
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Confianza
              </p>
              <p className="text-3xl font-medium text-foreground">
                {(result.confidence * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">{confidenceLabel}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Costo esperado
              </p>
              <p className="text-3xl font-medium text-foreground">
                {formatCOP(result.estimatedCost.expected)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCOP(result.estimatedCost.min)} - {formatCOP(result.estimatedCost.max)}
              </p>
            </div>
          </div>
          {result.riskFactors.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Riesgos detectados
              </p>
              <ul className="space-y-2 text-sm">
                {result.riskFactors.map((risk, idx) => (
                  <li
                    key={`${risk.label}-${idx}`}
                    className="rounded-xl border border-border/60 bg-background/70 px-3 py-2"
                  >
                    <p className="font-medium text-foreground">{risk.label}</p>
                    <p className="text-muted-foreground text-xs">{risk.recommendation}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.modelVersion && (
            <p className="text-xs text-muted-foreground">
              Modelo: {result.modelVersion} · Latencia &lt; 200ms (mock)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
