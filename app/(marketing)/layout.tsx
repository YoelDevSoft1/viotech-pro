import type { ReactNode } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">{children}</main>
      <Footer />
    </div>
  );
}
