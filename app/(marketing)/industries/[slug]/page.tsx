import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IndustryPageClient } from "./industry-client";

const industries = {
  fintech: {
    title: "Consultoría TI para Fintech",
    description: "Soluciones tecnológicas especializadas para el sector financiero. Compliance, seguridad y escalabilidad para tu fintech.",
    icon: "TrendingUp" as const,
    challenges: [
      "Cumplimiento regulatorio complejo",
      "Seguridad de datos financieros",
      "Escalabilidad bajo demanda",
      "Integración con sistemas legacy",
    ],
    solutions: [
      "Arquitectura cloud compliant",
      "Seguridad bancaria nivel enterprise",
      "APIs para integraciones financieras",
      "Monitoreo y alertas en tiempo real",
    ],
    caseStudy: {
      client: "FinanciaYa",
      result: "180% aumento en transacciones procesadas",
    },
  },
  retail: {
    title: "Transformación Digital para Retail",
    description: "E-commerce, sistemas de inventario y experiencia omnicanal para retailers que buscan competir en el mercado digital.",
    icon: "ShoppingCart" as const,
    challenges: [
      "E-commerce lento y poco optimizado",
      "Gestión de inventario desorganizada",
      "Falta de integración omnicanal",
      "Experiencia de usuario deficiente",
    ],
    solutions: [
      "E-commerce de alto rendimiento",
      "Sistemas de inventario inteligentes",
      "Integración omnicanal completa",
      "Optimización de conversión",
    ],
    caseStudy: {
      client: "Tech Shop Bogotá",
      result: "180% aumento en conversiones",
    },
  },
  healthcare: {
    title: "Tecnología para el Sector Salud",
    description: "Sistemas de gestión hospitalaria, telemedicina y plataformas de salud digital con cumplimiento HIPAA.",
    icon: "Heart" as const,
    challenges: [
      "Sistemas de gestión obsoletos",
      "Procesos manuales ineficientes",
      "Cumplimiento HIPAA y regulaciones",
      "Falta de integración entre sistemas",
    ],
    solutions: [
      "Plataformas de gestión hospitalaria",
      "Sistemas de telemedicina",
      "Historia clínica digital",
      "Dashboards analíticos en tiempo real",
    ],
    caseStudy: {
      client: "SMD Vital Bogotá",
      result: "40% reducción en tiempos de atención",
    },
  },
};

type IndustrySlug = keyof typeof industries;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = industries[slug as IndustrySlug];
  
  if (!industry) {
    return {
      title: "Industria no encontrada | VioTech Pro",
    };
  }

  return {
    title: `${industry.title} | VioTech Pro`,
    description: industry.description,
    keywords: [
      industry.title.toLowerCase(),
      "consultoría TI",
      "Colombia",
      slug,
    ],
    metadataBase: new URL("https://viotech.com.co"),
    alternates: {
      canonical: `/industries/${slug}`,
    },
    openGraph: {
      title: `${industry.title} | VioTech Pro`,
      description: industry.description,
      url: `https://viotech.com.co/industries/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${industry.title} | VioTech Pro`,
      description: industry.description,
    },
  };
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = industries[slug as IndustrySlug];

  if (!industry) {
    notFound();
  }

  return <IndustryPageClient industry={industry} slug={slug} />;
}

