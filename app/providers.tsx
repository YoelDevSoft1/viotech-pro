"use client";

import { useState, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { OrgProvider } from "@/components/common/OrgProvider";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import { LocaleProvider } from "@/lib/contexts/LocaleContext";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { WebVitalsTracker } from "@/components/common/WebVitalsTracker";
import { AnalyticsProvider } from "@/components/common/AnalyticsProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  // Inicializamos el cliente de React Query una sola vez por sesión
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minuto de caché
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <LocaleProvider>
          <OrgProvider>
            <OnboardingProvider>
              <ErrorBoundary>
                <Suspense fallback={null}>
                  <AnalyticsProvider>
                    <WebVitalsTracker />
                    {children}
                  </AnalyticsProvider>
                </Suspense>
              </ErrorBoundary>
            </OnboardingProvider>
          </OrgProvider>
        </LocaleProvider>
      </NextThemesProvider>
      
      {/* Devtools solo en desarrollo */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}