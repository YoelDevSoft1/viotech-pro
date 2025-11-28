import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"; // Componente Shadcn
import "./globals.css";
import { Providers } from "./providers";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VioTech | Landing Pages Profesionales para PyMEs",
  description: "Desarrollo web minimalista y profesional para PyMEs colombianas. Landing pages ultra rápidas que convierten visitantes en clientes.",
  keywords: ["landing pages", "desarrollo web", "PyME", "Colombia", "VioTech", "diseño web minimalista"],
  metadataBase: new URL("https://viotech.com.co"),
  // ... resto de tu metadata (openGraph, twitter) mantenida igual
  openGraph: {
    title: "VioTech Solutions | Consultoría TI y productos digitales premium",
    description: "Aceleramos crecimiento con consultoría estratégica, diseño y desarrollo de software de alto impacto para PyMEs y empresas en expansión.",
    url: "https://viotech.com.co",
    siteName: "VioTech Solutions",
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: "https://viotech.com.co/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VioTech Solutions Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VioTech Solutions | Consultoría TI y desarrollo a medida",
    description: "Especialistas en productos digitales premium, infraestructura cloud y experiencias web de alto rendimiento.",
    creator: "@viotech",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen font-sans`}
      >
        <Providers>
          <ServiceWorkerRegister />
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}