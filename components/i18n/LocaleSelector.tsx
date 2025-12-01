"use client";

import { useEffect, useState } from "react";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocaleContext } from "@/lib/contexts/LocaleContext";
import { locales, type Locale } from "@/i18n";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

const localeNames: Record<Locale, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
};

const localeFlags: Record<Locale, string> = {
  es: "🇪🇸",
  en: "🇺🇸",
  pt: "🇧🇷",
};

export function LocaleSelector() {
  const { locale, setLocale } = useLocaleContext();
  const [mounted, setMounted] = useState(false);
  const t = useTranslationsSafe("ui");

  // Detectar cuando el componente está montado
  useEffect(() => {
    setMounted(true);
  }, []);

  // Escuchar cambios de locale desde otros componentes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleLocaleChange = (event: CustomEvent) => {
      // El locale ya se actualizó en el contexto, solo necesitamos re-renderizar
      setMounted(true);
    };

    window.addEventListener("localeChanged", handleLocaleChange as EventListener);
    return () => {
      window.removeEventListener("localeChanged", handleLocaleChange as EventListener);
    };
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  // No renderizar hasta que esté montado para evitar diferencias de hidratación
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
        <Globe className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">{t("changeLanguage")}</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("changeLanguage")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className="flex items-center gap-2"
          >
            <span className="text-lg">{localeFlags[loc]}</span>
            <span className="flex-1">{localeNames[loc]}</span>
            {locale === loc && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

