import type { Metadata } from "next";
import { BlogPageClient } from "./blog-client";

export const metadata: Metadata = {
  title: "Blog | VioTech Pro - Artículos sobre Consultoría TI y Tecnología",
  description: "Descubre artículos sobre consultoría TI, transformación digital, desarrollo de software y mejores prácticas tecnológicas para empresas.",
  keywords: [
    "blog consultoría TI",
    "artículos tecnología",
    "transformación digital",
    "desarrollo software",
    "Colombia"
  ],
  metadataBase: new URL("https://viotech.com.co"),
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog | VioTech Pro",
    description: "Artículos sobre consultoría TI, transformación digital y tecnología enterprise.",
    url: "https://viotech.com.co/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | VioTech Pro",
    description: "Artículos sobre consultoría TI y transformación digital.",
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}

