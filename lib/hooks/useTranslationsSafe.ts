"use client";

import { useLocaleContext } from "@/lib/contexts/LocaleContext";

/**
 * Hook seguro de traducciones que funciona incluso durante prerender
 * Usa el contexto de locale para obtener traducciones
 * Se re-renderiza automáticamente cuando cambia el locale
 * Soporta interpolación de valores dinámicos
 */
export function useTranslationsSafe(namespace?: string) {
  const { t: contextT } = useLocaleContext();
  
  // Devolver función que siempre accede al contexto actual
  // Esto asegura que cuando cambie el locale, la función use el nuevo valor
  return (key: string, values?: Record<string, string | number>) => {
    return contextT(key, namespace, values);
  };
}

