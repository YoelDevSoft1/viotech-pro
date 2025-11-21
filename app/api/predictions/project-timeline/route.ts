import { NextResponse } from "next/server";

type Complexity = "low" | "medium" | "high";

type PredictionInput = {
  serviceType: string;
  complexity: Complexity;
  features: string[];
  estimatedHours: number;
  teamSize: number;
  techStack: string[];
};

const complexityFactor: Record<Complexity, number> = {
  low: 0.9,
  medium: 1,
  high: 1.25,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const parseStringArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const validatePayload = (payload: unknown): PredictionInput => {
  if (typeof payload !== "object" || payload === null) {
    throw new Error("Formato inválido");
  }

  const data = payload as Record<string, unknown>;

  const serviceType = String(data.serviceType || data.type || "").trim();
  if (!serviceType) {
    throw new Error("serviceType es requerido");
  }

  const complexity = String(data.complexity || "medium").toLowerCase() as Complexity;
  if (!["low", "medium", "high"].includes(complexity)) {
    throw new Error("complexity debe ser low, medium o high");
  }

  const estimatedHours = Number(data.estimatedHours ?? data.hours ?? 0);
  if (!Number.isFinite(estimatedHours) || estimatedHours <= 0) {
    throw new Error("estimatedHours debe ser un número mayor a 0");
  }

  const teamSize = Number(data.teamSize ?? data.team ?? 1);
  if (!Number.isFinite(teamSize) || teamSize <= 0) {
    throw new Error("teamSize debe ser un número mayor a 0");
  }

  return {
    serviceType,
    complexity,
    features: parseStringArray(data.features),
    estimatedHours,
    teamSize,
    techStack: parseStringArray(data.techStack),
  };
};

const buildRiskFactors = (input: PredictionInput) => {
  const risks: { label: string; recommendation: string }[] = [];

  if (input.complexity === "high") {
    risks.push({
      label: "Complejidad alta",
      recommendation: "Agregar buffer de QA y hardening de seguridad.",
    });
  }

  if (input.features.length >= 6) {
    risks.push({
      label: "Alcance amplio",
      recommendation: "Dividir entregables en hitos y acordar criterios de aceptación.",
    });
  }

  if (input.techStack.some((s) => /payments|wompi|stripe/i.test(s))) {
    risks.push({
      label: "Pasarelas de pago",
      recommendation: "Planificar pruebas end-to-end y tokens de aceptación anticipados.",
    });
  }

  if (input.teamSize < 2) {
    risks.push({
      label: "Equipo reducido",
      recommendation: "Asignar backup y pactar ventanas de entrega más amplias.",
    });
  }

  return risks;
};

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const input = validatePayload(payload);

    // Cálculo heurístico simple (placeholder hasta integrar modelo real)
    const baseVelocityPerDevDay = 6; // horas productivas por dev/día
    const rawDays = input.estimatedHours / (Math.max(input.teamSize, 1) * baseVelocityPerDevDay);
    const featureLoad = clamp(input.features.length * 0.2, 0, 3);
    const stackLoad = clamp(input.techStack.length * 0.1, 0, 2);

    const adjustedDays = rawDays * complexityFactor[input.complexity] + featureLoad + stackLoad;
    const predictedDays = Math.max(1, Math.round(adjustedDays));

    const spread = clamp(predictedDays * 0.2, 1, 10);
    const confidence = clamp(
      0.9 -
        (input.complexity === "high" ? 0.1 : 0) -
        (input.features.length > 8 ? 0.05 : 0),
      0.65,
      0.92,
    );

    const ratePerDay = 350_000; // COP, placeholder
    const estimatedCostExpected = predictedDays * ratePerDay;

    const response = {
      predictedDays,
      confidenceInterval: [Math.max(1, predictedDays - spread), predictedDays + spread],
      confidence,
      estimatedCost: {
        min: Math.round(estimatedCostExpected * 0.9),
        max: Math.round(estimatedCostExpected * 1.25),
        expected: Math.round(estimatedCostExpected),
      },
      riskFactors: buildRiskFactors(input),
      modelVersion: "mock-0.1",
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error procesando la predicción";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
