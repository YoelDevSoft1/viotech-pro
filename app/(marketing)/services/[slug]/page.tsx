import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicePageClient } from "./service-client";

const services = {
  "desarrollo-software": {
    title: "Desarrollo de Software Enterprise",
    description: "Soluciones a medida con tecnologías modernas. Desde MVPs hasta plataformas empresariales robustas y escalables.",
    icon: "Code2" as const,
    features: [
      "Aplicaciones web y móviles",
      "APIs y microservicios",
      "Integraciones personalizadas",
      "Mantenimiento continuo",
    ],
    benefits: [
      "Time-to-market reducido en 40%",
      "Arquitectura escalable desde el día uno",
      "Código limpio y mantenible",
      "Soporte técnico incluido",
    ],
  },
  "consultoria-ti": {
    title: "Consultoría TI Estratégica",
    description: "Estrategia tecnológica integral. Auditorías de infraestructura, optimización de procesos y transformación digital.",
    icon: "Brain" as const,
    features: [
      "Arquitectura de sistemas",
      "Migración a la nube",
      "Ciberseguridad empresarial",
      "Automatización de procesos",
    ],
    benefits: [
      "Roadmap tecnológico claro",
      "Reducción de costos operativos",
      "Mejora en seguridad y compliance",
      "Optimización de procesos",
    ],
  },
  "soporte-tecnico": {
    title: "Soporte Técnico 24/7",
    description: "Soporte técnico premium con SLA garantizado. Resolvemos incidencias antes de que las notes.",
    icon: "Headphones" as const,
    features: [
      "Soporte 24/7/365",
      "SLA garantizado 99.9%",
      "Monitoreo proactivo",
      "Respuesta en menos de 1 hora",
    ],
    benefits: [
      "Uptime garantizado 99.9%",
      "Resolución rápida de incidencias",
      "Prevención proactiva de problemas",
      "Equipo dedicado",
    ],
  },
};

type ServiceSlug = keyof typeof services;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services[slug as ServiceSlug];
  
  if (!service) {
    return {
      title: "Servicio no encontrado | VioTech Pro",
    };
  }

  return {
    title: `${service.title} | VioTech Pro`,
    description: service.description,
    keywords: [
      service.title.toLowerCase(),
      "consultoría TI",
      "Colombia",
      "enterprise",
    ],
    metadataBase: new URL("https://viotech.com.co"),
    alternates: {
      canonical: `/services/${slug}`,
    },
    openGraph: {
      title: `${service.title} | VioTech Pro`,
      description: service.description,
      url: `https://viotech.com.co/services/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.title} | VioTech Pro`,
      description: service.description,
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services[slug as ServiceSlug];

  if (!service) {
    notFound();
  }

  return <ServicePageClient service={service} slug={slug} />;
}

