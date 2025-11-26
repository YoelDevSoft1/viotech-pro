import type { ReactNode } from "react";
import Header from "@/components/Header";

export default function ClientGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">{children}</main>
    </div>
  );
}
