import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://viotech.com.co"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName: "VioTech Pro",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@viotech",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}