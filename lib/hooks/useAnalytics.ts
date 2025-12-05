"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { analyticsService, analytics } from "@/lib/services/analyticsService";
import { useCurrentUser } from "@/lib/hooks/useResources";
import type { AnalyticsDashboard, AnalyticsFilters, RealtimeMetrics } from "@/lib/types/analytics";
import { subDays, format } from "date-fns";

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

/**
 * Hook para obtener datos del dashboard de analytics
 */
export function useAnalyticsDashboard(filters?: AnalyticsFilters) {
  const period = filters?.period || "7d";
  
  const getDateRange = () => {
    const end = new Date();
    let start: Date;
    
    switch (period) {
      case "today":
        start = new Date(end);
        start.setHours(0, 0, 0, 0);
        break;
      case "7d":
        start = subDays(end, 7);
        break;
      case "30d":
        start = subDays(end, 30);
        break;
      case "90d":
        start = subDays(end, 90);
        break;
      case "custom":
        if (filters?.customRange) {
          start = new Date(filters.customRange.start);
          end.setTime(new Date(filters.customRange.end).getTime());
        } else {
          start = subDays(end, 7);
        }
        break;
      default:
        start = subDays(end, 7);
    }
    
    return {
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
    };
  };

  const { startDate, endDate } = getDateRange();

  return useQuery<AnalyticsDashboard>({
    queryKey: ["analytics-dashboard", period, startDate, endDate, filters?.organizationId],
    queryFn: async () => {
      const summary = await analyticsService.getSummary({
        startDate,
        endDate,
        organizationId: filters?.organizationId,
      });

      if (!summary) {
        // Devolver estructura vacía si no hay datos
        return {
          period: {
            start: startDate,
            end: endDate,
          },
          engagement: {
            dau: 0,
            wau: 0,
            mau: 0,
            stickiness: 0,
            totalSessions: 0,
            avgSessionDuration: 0,
            pagesPerSession: 0,
            bounceRate: 0,
          },
          onboarding: {
            startRate: 0,
            completionRate: 0,
            avgTimeToComplete: 0,
            dropOffByStep: {},
            timeToFirstValue: 0,
          },
          features: {
            adoptionRate: {},
            topFeatures: [],
            usageFrequency: {},
          },
          conversion: {
            trialConversionRate: 0,
            upgradeRate: 0,
            monthlyChurnRate: 0,
            mrr: 0,
            arpu: 0,
            ltv: 0,
          },
          errors: {
            errorRate: 0,
            errorsByType: {},
            formAbandonmentRate: 0,
            noResultsRate: 0,
          },
          trends: {
            dau: 0,
            sessions: 0,
            avgSessionDuration: 0,
            conversionRate: 0,
          },
        };
      }

      // Transformar el summary a AnalyticsDashboard
      // AnalyticsSummary tiene: totalEvents, uniqueUsers, eventsByType, topEvents, eventsByDay
      // Necesitamos mapear esto a AnalyticsDashboard
      return {
        period: {
          start: startDate,
          end: endDate,
          ...(filters?.compareWith && filters.compareWith !== "none" && {
            comparison: {
              start: format(subDays(new Date(startDate), period === "7d" ? 7 : period === "30d" ? 30 : 90), "yyyy-MM-dd"),
              end: startDate,
            },
          }),
        },
        engagement: {
          dau: summary.uniqueUsers || 0, // Aproximación: uniqueUsers como DAU
          wau: summary.uniqueUsers || 0, // Aproximación
          mau: summary.uniqueUsers || 0, // Aproximación
          stickiness: 0,
          totalSessions: Math.floor(summary.totalEvents / 5) || 0, // Estimación: ~5 eventos por sesión
          avgSessionDuration: 0,
          pagesPerSession: 0,
          bounceRate: 0,
        },
        onboarding: {
          startRate: 0,
          completionRate: 0,
          avgTimeToComplete: 0,
          dropOffByStep: {},
          timeToFirstValue: 0,
        },
        features: {
          adoptionRate: {},
          topFeatures: summary.topEvents.map(e => ({ feature: e.eventName, usage: e.count })) || [],
          usageFrequency: summary.eventsByType || {},
        },
        conversion: {
          trialConversionRate: 0,
          upgradeRate: 0,
          monthlyChurnRate: 0,
          mrr: 0,
          arpu: 0,
          ltv: 0,
        },
        errors: {
          errorRate: 0,
          errorsByType: summary.eventsByType || {},
          formAbandonmentRate: 0,
          noResultsRate: 0,
        },
        trends: {
          dau: 0,
          sessions: 0,
          avgSessionDuration: 0,
          conversionRate: 0,
        },
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener métricas en tiempo real
 */
export function useRealtimeMetrics() {
  return useQuery<RealtimeMetrics>({
    queryKey: ["analytics-realtime"],
    queryFn: async () => {
      // Por ahora, devolvemos datos mock
      // En el futuro, esto debería llamar a un endpoint de tiempo real
      // como WebSocket o polling cada 30 segundos
      return {
        activeUsers: 42,
        topPages: [
          { page: "/dashboard", views: 24 },
          { page: "/tickets", views: 18 },
          { page: "/projects", views: 12 },
        ],
        eventsPerMinute: 128,
        activeCountries: [
          { country: "Colombia", users: 25 },
          { country: "México", users: 12 },
          { country: "Argentina", users: 5 },
        ],
      };
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 30 * 1000, // Refetch cada 30 segundos
  });
}
