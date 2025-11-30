import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

// Idiomas soportados
export const locales = ["es", "en", "pt"] as const;
export type Locale = (typeof locales)[number];

// Idioma por defecto
export const defaultLocale: Locale = "es";

export default getRequestConfig(async ({ locale }) => {
  // Validar que el locale sea válido
  if (!locale || !locales.includes(locale as Locale)) notFound();

  const validLocale = locale as Locale;

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default,
  };
});

