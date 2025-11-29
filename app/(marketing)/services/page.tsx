import type { Metadata } from "next";
import { ServicesPageClient } from "./services-client";

export const metadata: Metadata = {
  title: "Servicios | VioTech Pro - Consultoría TI y Desarrollo",
  description: "Descubre nuestros servicios de consultoría TI, desarrollo de software enterprise, infraestructura cloud y soporte técnico 24/7 para PyMEs en Colombia.",
  keywords: [
    "servicios consultoría TI",
    "desarrollo software",
    "infraestructura cloud",
    "soporte técnico",
    "servicios TI Colombia"
  ],
  metadataBase: new URL("https://viotech.com.co"),
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Servicios | VioTech Pro",
    description: "Consultoría TI, desarrollo de software enterprise, cloud y soporte 24/7 para PyMEs.",
    url: "https://viotech.com.co/services",
    type: "website",
    images: [
      {
        url: "/og-services.jpg",
        width: 1200,
        height: 630,
        alt: "VioTech Pro - Servicios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Servicios | VioTech Pro",
    description: "Consultoría TI, desarrollo enterprise, cloud y soporte 24/7.",
  },
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
