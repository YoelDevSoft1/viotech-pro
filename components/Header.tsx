"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, LogIn } from "lucide-react";
import clsx from "clsx";

const navigation = [
  { label: "Servicios", href: "#services" },
  { label: "Casos", href: "#cases" },
  { label: "Proceso", href: "#process" },
  { label: "Stack", href: "#tech" },
  { label: "Contacto", href: "#contact" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 bg-background/30 backdrop-blur border-b border-transparent",
        isScrolled && "bg-background/60 backdrop-blur-sm border-border/60"
      )}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-medium tracking-tight text-foreground"
        >
          VioTech Solutions
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
            aria-label="Login"
          >
            <LogIn className="w-4 h-4" />
          </Link>
          <a
            href="https://wa.link/1r4ul7"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-muted transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          <a
            href="https://calendly.com/viotech/demo"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background shadow-lg shadow-foreground/10 transition-transform hover:scale-105"
            target="_blank"
            rel="noreferrer"
          >
            Agendar demo
          </a>
        </div>

        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded-full border border-border text-foreground"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Abrir menú"
        >
          {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-border/70 bg-background">
          <div className="px-6 py-4 space-y-4 text-sm">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              <a
                href="https://wa.link/1r4ul7"
                className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-medium"
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsMenuOpen(false)}
              >
                WhatsApp
              </a>
              <a
                href="https://calendly.com/viotech/demo"
                className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background"
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsMenuOpen(false)}
              >
                Agendar demo
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
