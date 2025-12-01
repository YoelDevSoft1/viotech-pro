"use client";

import { useLocaleContext } from "@/lib/contexts/LocaleContext";

/**
 * Hook seguro de traducciones que funciona incluso durante prerender
 * Usa el contexto de locale para obtener traducciones
 * Se re-renderiza automáticamente cuando cambia el locale
 */
export function useTranslationsSafe(namespace?: string) {
  const { t: contextT } = useLocaleContext();
  
  // Devolver función que siempre accede al contexto actual
  // Esto asegura que cuando cambie el locale, la función use el nuevo valor
  return (key: string) => {
    return contextT(key, namespace);
  };
}

