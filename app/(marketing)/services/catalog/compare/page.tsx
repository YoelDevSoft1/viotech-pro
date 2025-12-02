/**
 * Página de Comparación de Servicios
 */

import type { Metadata } from "next";
import { ComparePageClient } from "./compare-client";

export const metadata: Metadata = {
  title: "Comparar Servicios | VioTech Pro",
  description: "Compara servicios y encuentra el plan perfecto para tu negocio",
};

export default function ComparePage() {
  return <ComparePageClient />;
}

