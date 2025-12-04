"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analyticsService, analytics } from "@/lib/services/analyticsService";
import { useCurrentUser } from "@/lib/hooks/useResources";

/**
 * Hook para tracking automático de analytics
 * Sprint 4.3 - VioTech Pro
 * 
 * @example
 * ```tsx
 * function MyPage() {
 *   useAnalytics(); // Track page views automáticamente
 *   return <div>...</div>;
 * }
 * ```
 */
export function useAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: user } = useCurrentUser();

  useEffect(() => {
    // Track page view automáticamente
    const page = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

    analyticsService.pageView(page, {
      pathname,
      searchParams: searchParams.toString(),
      userId: user?.id,
      organizationId: user?.organizationId,
      locale: typeof window !== "undefined" ? navigator.language : "es",
      device: typeof window !== "undefined" 
        ? window.innerWidth < 768 ? "mobile" 
        : window.innerWidth < 1024 ? "tablet" 
        : "desktop"
        : "unknown",
    });
  }, [pathname, searchParams, user?.id, user?.organizationId]);

  return {
    track: analytics,
    trackEvent: (event: Parameters<typeof analyticsService.trackEvent>[0]) =>
      analyticsService.trackEvent(event),
  };
}
