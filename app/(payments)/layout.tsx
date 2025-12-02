"use client";

import type { ReactNode } from "react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function PaymentsLayout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary variant="payment">
      <div className="min-h-screen bg-background">{children}</div>
    </ErrorBoundary>
  );
}
