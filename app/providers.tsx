"use client";

import { ToastProvider } from "@/components/ui/ToastProvider";
import { OrgProvider } from "@/components/OrgProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <OrgProvider>{children}</OrgProvider>
    </ToastProvider>
  );
}
