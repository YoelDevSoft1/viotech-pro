"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
import { analyticsService } from "@/lib/services/analyticsService";

/**
 * Props del AnalyticsProvider
 */
interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * ID de medición de Google Analytics 4
 */
const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

/**
 * Provider de Analytics que:
 * - Carga el script de GA4 si está configurado
 * - Trackea automáticamente vistas de página en navegación
 * - Proporciona contexto para trackear eventos
 * 
 * @example
 * ```tsx
 * // En layout.tsx
 * <AnalyticsProvider>
 *   {children}
 * </AnalyticsProvider>
 * ```
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // Usar el hook useAnalytics que trackea automáticamente page views
  useAnalytics();

  // Si no hay GA4 configurado, solo renderizar children
  if (!GA4_MEASUREMENT_ID) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Google Analytics 4 Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA4_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: false,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
      {children}
    </>
  );
}

/**
 * Componente para trackear conversiones específicas
 * Usar en páginas de éxito de pago, registro, etc.
 */
export function TrackConversion({
  conversionId,
  conversionLabel,
  value,
  currency = "USD",
}: {
  conversionId: string;
  conversionLabel: string;
  value?: number;
  currency?: string;
}) {
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "conversion", {
        send_to: `${conversionId}/${conversionLabel}`,
        value: value,
        currency: currency,
      });
    }
  }, [conversionId, conversionLabel, value, currency]);

  return null;
}

/**
 * Hook para trackear eventos de e-commerce
 */
export function useEcommerceAnalytics() {
  const { trackEvent } = useAnalytics();

  const trackViewItem = (item: {
    item_id: string;
    item_name: string;
    price: number;
    currency?: string;
    item_category?: string;
  }) => {
    trackEvent({
      eventType: "ecommerce",
      eventName: "view_item",
      properties: {
        currency: item.currency || "USD",
        value: item.price,
        items: JSON.stringify([item]),
      },
    });
  };

  const trackAddToCart = (item: {
    item_id: string;
    item_name: string;
    price: number;
    quantity?: number;
    currency?: string;
  }) => {
    trackEvent({
      eventType: "ecommerce",
      eventName: "add_to_cart",
      properties: {
        currency: item.currency || "USD",
        value: item.price * (item.quantity || 1),
        items: JSON.stringify([{ ...item, quantity: item.quantity || 1 }]),
      },
    });
  };

  const trackBeginCheckout = (items: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity?: number;
  }>, value: number, currency?: string) => {
    trackEvent({
      eventType: "ecommerce",
      eventName: "begin_checkout",
      properties: {
        currency: currency || "USD",
        value,
        items: JSON.stringify(items),
      },
    });
  };

  const trackPurchase = (
    transactionId: string,
    items: Array<{
      item_id: string;
      item_name: string;
      price: number;
      quantity?: number;
    }>,
    value: number,
    currency?: string
  ) => {
    trackEvent({
      eventType: "ecommerce",
      eventName: "purchase",
      properties: {
        transaction_id: transactionId,
        currency: currency || "USD",
        value,
        items: JSON.stringify(items),
      },
    });
  };

  return {
    trackViewItem,
    trackAddToCart,
    trackBeginCheckout,
    trackPurchase,
  };
}

