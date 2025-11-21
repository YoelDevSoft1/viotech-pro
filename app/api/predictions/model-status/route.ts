import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: "ready",
      modelVersion: "mock-0.1",
      lastTrainedAt: "placeholder",
      notes: "Modelo heurístico temporal hasta conectar con TensorFlow.js/pgvector",
    },
  });
}
