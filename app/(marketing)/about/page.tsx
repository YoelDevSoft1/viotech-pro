import type { Metadata } from "next";
import { AboutPageClient } from "./about-client";

export const metadata: Metadata = {
  title: "Sobre Nosotros | VioTech Pro - Equipo y Valores",
  description: "Conoce al equipo de VioTech Pro. Más de 5 años transformando empresas con tecnología premium y consultoría TI estratégica en Colombia.",
  keywords: [
    "sobre VioTech",
    "equipo consultoría TI",
    "valores empresa",
    "historia VioTech",
    "Colombia"
  ],
  metadataBase: new URL("https://viotech.com.co"),
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "Sobre Nosotros | VioTech Pro",
    description: "Equipo de expertos en consultoría TI y desarrollo de software enterprise.",
    url: "https://viotech.com.co/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre Nosotros | VioTech Pro",
    description: "Conoce al equipo que transforma empresas con tecnología.",
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}

