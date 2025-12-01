import type { Metadata } from "next";
import { StructuredData } from "@/components/marketing/StructuredData";
import { HomePageClient } from "./home-client";

export const metadata: Metadata = {
  title: "VioTech Pro | Consultoría TI y Desarrollo de Software Enterprise",
  description: "Transformamos PyMEs colombianas con consultoría TI estratégica, desarrollo de software premium, infraestructura cloud segura y soporte 24/7. Acelera tu crecimiento digital.",
  keywords: [
    "consultoría TI",
    "desarrollo de software",
    "transformación digital",
    "infraestructura cloud",
    "soporte técnico 24/7",
    "Colombia",
    "PyME",
    "enterprise",
    "VioTech"
  ],
  metadataBase: new URL("https://viotech.com.co"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "VioTech Pro | Consultoría TI y Desarrollo Enterprise",
    description: "Transformamos PyMEs con tecnología premium. Consultoría estratégica, desarrollo de software, cloud y soporte 24/7.",
    url: "https://viotech.com.co",
    siteName: "VioTech Pro",
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VioTech Pro - Consultoría TI Enterprise",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VioTech Pro | Consultoría TI Enterprise",
    description: "Transformamos PyMEs con tecnología premium. Desarrollo, cloud y soporte 24/7.",
    creator: "@viotech",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function MarketingPage() {
  return (
    <>
      <StructuredData type="organization" />
      <StructuredData type="website" />
      <StructuredData type="service" />
      <HomePageClient />
    </>
  );
}
