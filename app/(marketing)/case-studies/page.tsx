import type { Metadata } from "next";
import { CaseStudiesPageClient } from "./case-studies-client";

export const metadata: Metadata = {
  title: "Casos de Éxito | VioTech Pro - Proyectos Realizados",
  description: "Descubre cómo hemos transformado empresas en Fintech, Retail y Salud. Casos de éxito con resultados medibles y testimonios reales.",
  keywords: [
    "casos de éxito",
    "proyectos realizados",
    "testimonios clientes",
    "transformación digital",
    "Colombia"
  ],
  metadataBase: new URL("https://viotech.com.co"),
  alternates: {
    canonical: "/case-studies",
  },
  openGraph: {
    title: "Casos de Éxito | VioTech Pro",
    description: "Transformaciones digitales medibles que impulsan el crecimiento empresarial.",
    url: "https://viotech.com.co/case-studies",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Casos de Éxito | VioTech Pro",
    description: "Resultados reales para empresas reales.",
  },
};

export default function CaseStudiesPage() {
  return <CaseStudiesPageClient />;
}

