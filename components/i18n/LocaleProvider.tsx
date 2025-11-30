"use client";

import { useEffect } from "react";
import { useUserPreferences, useUpdateUserPreferences } from "@/lib/hooks/useCustomization";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n";

/**
 * Provider que sincroniza el locale del usuario con next-intl
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const currentLocale = useLocale() as Locale;
  const { data: preferences } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();

  useEffect(() => {
    // Sincronizar locale de next-intl con preferencias del usuario
    if (preferences && preferences.language !== currentLocale) {
      // El locale se maneja a través de la URL, no necesitamos actualizar preferencias aquí
      // pero podemos guardar la preferencia del usuario para futuras sesiones
    }
  }, [currentLocale, preferences]);

  return <>{children}</>;
}

