import type { Metadata } from "next";
import { ContactPageClient } from "./contact-client";

export const metadata: Metadata = {
  title: "Contacto | VioTech Pro - Consultoría TI Enterprise",
  description: "Agenda una consultoría gratuita de 45 minutos con nuestro equipo. Descubre cómo podemos transformar tu negocio con tecnología premium.",
  keywords: [
    "contacto consultoría TI",
    "agendar consultoría",
    "contacto VioTech",
    "consultoría gratuita",
    "contacto desarrollo software"
  ],
  metadataBase: new URL("https://viotech.com.co"),
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contacto | VioTech Pro",
    description: "Agenda una consultoría gratuita y descubre cómo transformar tu negocio.",
    url: "https://viotech.com.co/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contacto | VioTech Pro",
    description: "Agenda una consultoría gratuita con nuestro equipo.",
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}

