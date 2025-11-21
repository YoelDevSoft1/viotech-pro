export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

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

export async function GET() {
  const backend = getBackendApiBase();

  try {
    const response = await fetch(`${backend}/predictions/model-status`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await response.json();

    // Si backend responde OK, retornar tal cual
    if (response.ok && data) {
      return NextResponse.json(data, {
        status: response.status,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    // Si backend falla, caer a error controlado
    const message =
      typeof data === "object" && data
        ? data.error || data.message || "No se pudo obtener el estado del modelo"
        : "No se pudo obtener el estado del modelo";

    return NextResponse.json(
      { success: false, error: message },
      {
        status: 502,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { success: false, error: message },
      {
        status: 500,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      },
    );
  }
}
