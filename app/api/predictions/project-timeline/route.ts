import { NextResponse } from "next/server";

type Complexity = "low" | "medium" | "high";

const normalizeBase = (value: string) => {
  const trimmed = value.replace(/\/+$/, "");
  return trimmed.toLowerCase().endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const getBackendApiBase = () => {
  const envBase =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    "https://viotech-main.onrender.com/api";
  return normalizeBase(envBase);
};

const normalizePayload = (payload: Record<string, unknown>) => {
  const parseStr = (value: unknown) => (value == null ? "" : String(value).trim());
  const parseStrArray = (value: unknown) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
    if (typeof value === "string") {
      return value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
    return [];
  };
  const parseNum = (value: unknown) => Number(value ?? 0);

  const complexity = String(
    payload.complexity ?? payload.complejidad ?? payload.level ?? "medium",
  ).toLowerCase() as Complexity;

  return {
    serviceType:
      parseStr(payload.serviceType ?? payload.service_type ?? payload.tipo ?? ""),
    complexity: ["low", "medium", "high"].includes(complexity) ? complexity : "medium",
    features: parseStrArray(payload.features ?? payload.caracteristicas ?? payload.funcionalidades),
    estimatedHours: parseNum(payload.estimatedHours ?? payload.estimated_hours ?? payload.horas),
    teamSize: parseNum(payload.teamSize ?? payload.team_size ?? payload.team ?? 1),
    techStack: parseStrArray(payload.techStack ?? payload.tech_stack ?? payload.stack),
    actualDays: payload.actualDays ?? payload.actual_days ?? null,
  };
};

export async function POST(req: Request) {
  const backend = getBackendApiBase();

  try {
    const body = await req.json();
    const normalized = normalizePayload(body ?? {});

    const response = await fetch(`${backend}/predictions/project-timeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized),
    });

    const data = await response.json().catch(() => null);

    if (response.ok && data) {
      return NextResponse.json(data, { status: response.status });
    }

    const message =
      (data && (data.error || data.message)) ||
      `El backend respondió ${response.status}`;

    return NextResponse.json({ success: false, error: message }, { status: 502 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
