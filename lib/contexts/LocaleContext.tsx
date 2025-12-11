"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { locales, defaultLocale, type Locale } from "@/i18n";
import esMessages from "@/messages/es.json";
import enMessages from "@/messages/en.json";
import ptMessages from "@/messages/pt.json";

// Usar any para evitar problemas de tipos entre archivos JSON
type Messages = any;

const messagesMap: Record<Locale, Messages> = {
  es: esMessages,
  en: enMessages,
  pt: ptMessages,
};

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, namespace?: string, values?: Record<string, string | number>) => string;
  messages: Messages;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  // Cargar locale desde localStorage al montar
  useEffect(() => {
    setMounted(true);
    const savedLocale = localStorage.getItem("viotech_locale") as Locale | null;
    if (savedLocale && locales.includes(savedLocale)) {
      setLocaleState(savedLocale);
    } else {
      // Detectar desde navegador
      const browserLang = navigator.language.split("-")[0];
      if (browserLang === "en" || browserLang === "pt") {
        setLocaleState(browserLang as Locale);
      }
    }
  }, []);

  // Guardar locale en localStorage cuando cambie y forzar re-render
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      localStorage.setItem("viotech_locale", locale);
      // Disparar evento personalizado para notificar cambios
      window.dispatchEvent(new CustomEvent("localeChanged", { detail: { locale } }));
      // Forzar re-render de la página para actualizar todas las traducciones
      window.dispatchEvent(new Event("storage"));
    }
  }, [locale, mounted]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  // Función de traducción con soporte para interpolación
  const t = useCallback(
    (key: string, namespace?: string, values?: Record<string, string | number>): string => {
      const messages = messagesMap[locale];
      const fullKey = namespace ? `${namespace}.${key}` : key;
      
      // Navegar por las claves anidadas (ej: "marketing.home.title")
      const keys = fullKey.split(".");
      let value: any = messages;
      
      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k];
        } else {
          // Si no se encuentra, intentar en español como fallback
          const fallbackValue = getNestedValue(esMessages, keys);
          const result = typeof fallbackValue === "string" ? fallbackValue : fullKey;
          // Aplicar interpolación si hay valores
          if (values && typeof result === "string") {
            return interpolateString(result, values);
          }
          return result;
        }
      }
      
      const result = typeof value === "string" ? value : fullKey;
      // Aplicar interpolación si hay valores
      if (values && typeof result === "string") {
        return interpolateString(result, values);
      }
      return result;
    },
    [locale]
  );

  const value: LocaleContextValue = {
    locale,
    setLocale,
    t,
    messages: messagesMap[locale],
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

// Helper para obtener valores anidados
function getNestedValue(obj: any, keys: string[]): any {
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  return value;
}

// Helper para interpolar valores en strings
// Soporta tanto {key} como #{key} para compatibilidad
// También soporta pluralización ICU MessageFormat: {count, plural, one {...} other {...}}
function interpolateString(str: string, values: Record<string, string | number>): string {
  let result = str;
  
  // Procesar pluralización ICU MessageFormat primero
  // Formato: {count} {count, plural, one {texto singular} other {texto plural}}
  // O también: {count, plural, one {texto singular} other {texto plural}}
  const pluralPattern = /\{(\w+),\s*plural,\s*one\s*\{([^}]+)\}\s*other\s*\{([^}]+)\}\}/g;
  result = result.replace(pluralPattern, (match, varName, singular, plural) => {
    const count = values[varName];
    if (count !== undefined) {
      const numCount = typeof count === 'number' ? count : Number(count);
      // En español, 1 es singular, todo lo demás es plural
      // En inglés y portugués también
      return numCount === 1 ? singular : plural;
    }
    return match;
  });
  
  // Procesar interpolación simple {key} después de procesar pluralización
  // Esto asegura que {count} se reemplace después de procesar la expresión plural
  for (const [key, val] of Object.entries(values)) {
    // Reemplazar {key} con el valor
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), String(val));
    // Reemplazar #{key} con el valor (para compatibilidad con formatos como "#{id}")
    result = result.replace(new RegExp(`#\\{${key}\\}`, "g"), String(val));
  }
  
  return result;
}

export function useLocaleContext() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocaleContext must be used within LocaleProvider");
  }
  return context;
}

