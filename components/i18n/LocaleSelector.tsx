"use client";

import { useState, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, usePathname } from "next/navigation";
import { locales, defaultLocale, type Locale } from "@/i18n";

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
  const router = useRouter();
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  // Detectar locale actual desde localStorage o preferencias del navegador
  // Solo en el cliente para evitar errores de hidratación
  useEffect(() => {
    setMounted(true);
    const savedLocale = localStorage.getItem("viotech_locale") as Locale | null;
    if (savedLocale && locales.includes(savedLocale)) {
      setCurrentLocale(savedLocale);
    } else {
      // Detectar desde navegador
      const browserLang = navigator.language.split("-")[0];
      if (browserLang === "en" || browserLang === "pt") {
        setCurrentLocale(browserLang as Locale);
      }
    }
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    setCurrentLocale(newLocale);
    if (mounted) {
      localStorage.setItem("viotech_locale", newLocale);
    }
    // Por ahora solo guardamos la preferencia
    // Cuando next-intl esté activo, aquí se cambiará la ruta
    router.refresh();
  };

  // No renderizar hasta que esté montado para evitar diferencias de hidratación
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
        <Globe className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Cambiar idioma</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Cambiar idioma</span>
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
            {currentLocale === loc && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

