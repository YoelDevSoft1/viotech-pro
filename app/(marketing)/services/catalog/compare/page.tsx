/**
 * Página de Comparación de Servicios
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { ComparePageClient } from "./compare-client";

export const metadata: Metadata = {
  title: "Comparar Servicios | VioTech Pro",
  description: "Compara servicios y encuentra el plan perfecto para tu negocio",
};

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <ComparePageClient />
    </Suspense>
  );
}

