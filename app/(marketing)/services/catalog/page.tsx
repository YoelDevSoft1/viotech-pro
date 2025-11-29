import type { Metadata } from "next";
import { CatalogPageClient } from "./catalog-client";

export const metadata: Metadata = {
  title: "Catálogo de Servicios | VioTech Pro - Planes y Precios",
  description: "Explora nuestro catálogo completo de servicios TI. Planes de consultoría, desarrollo de software, infraestructura cloud y soporte técnico para PyMEs en Colombia.",
  keywords: [
    "catálogo servicios TI",
    "planes consultoría",
    "precios desarrollo software",
    "servicios cloud",
    "soporte técnico Colombia"
  ],
  metadataBase: new URL("https://viotech.com.co"),
  alternates: {
    canonical: "/services/catalog",
  },
  openGraph: {
    title: "Catálogo de Servicios | VioTech Pro",
    description: "Planes de consultoría TI, desarrollo enterprise, cloud y soporte 24/7.",
    url: "https://viotech.com.co/services/catalog",
    type: "website",
    images: [
      {
        url: "/og-catalog.jpg",
        width: 1200,
        height: 630,
        alt: "VioTech Pro - Catálogo de Servicios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catálogo de Servicios | VioTech Pro",
    description: "Planes de consultoría TI, desarrollo enterprise y cloud.",
  },
};

export default function CatalogPage() {
  return <CatalogPageClient />;
}