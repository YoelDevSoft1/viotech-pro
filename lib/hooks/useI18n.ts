"use client";

import { useMemo, useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { es, enUS, ptBR } from "date-fns/locale";
import type { Locale as AppLocale } from "@/i18n";
import { defaultLocale, locales } from "@/i18n";
import type { Locale as DateFnsLocale } from "date-fns/locale";

const dateFnsLocales: Record<AppLocale, DateFnsLocale> = {
  es: es,
  en: enUS,
  pt: ptBR,
};

/**
 * Hook personalizado para i18n con utilidades de formato
 * Versión segura que funciona sin middleware activo
 */
export function useI18n() {
  const [locale, setLocale] = useState<AppLocale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  // Detectar locale desde localStorage o navegador (solo en cliente)
  useEffect(() => {
    setMounted(true);
    const savedLocale = localStorage.getItem("viotech_locale") as AppLocale | null;
    if (savedLocale && locales.includes(savedLocale)) {
      setLocale(savedLocale);
    } else {
      // Detectar desde navegador
      const browserLang = navigator.language.split("-")[0];
      if (browserLang === "en" || browserLang === "pt") {
        setLocale(browserLang as AppLocale);
      }
    }
  }, []);

  const dateFnsLocale = useMemo(() => dateFnsLocales[locale], [locale]);

  const formatDate = (date: Date | string, formatStr: string = "PP") => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, formatStr, { locale: dateFnsLocale });
  };

  const formatRelativeTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: dateFnsLocale,
    });
  };

  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
    const localeMap: Record<AppLocale, string> = {
      es: "es-CO",
      en: "en-US",
      pt: "pt-BR",
    };

    return new Intl.NumberFormat(localeMap[locale], options).format(value);
  };

  const formatCurrency = (value: number, currency: string = "COP") => {
    const localeMap: Record<AppLocale, string> = {
      es: "es-CO",
      en: "en-US",
      pt: "pt-BR",
    };

    return new Intl.NumberFormat(localeMap[locale], {
      style: "currency",
      currency,
    }).format(value);
  };

  return {
    locale,
    formatDate,
    formatRelativeTime,
    formatNumber,
    formatCurrency,
  };
}

