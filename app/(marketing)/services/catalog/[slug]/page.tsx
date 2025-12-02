/**
 * Página de Detalle de Servicio
 */

import type { Metadata } from "next";
import { ServiceDetailClient } from "./service-detail-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  return {
    title: `Servicio ${slug} | VioTech Pro`,
    description: `Detalles del servicio ${slug} en VioTech Pro`,
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  return <ServiceDetailClient slug={slug} />;
}

