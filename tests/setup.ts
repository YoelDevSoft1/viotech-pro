/**
 * Test Setup
 * Configuración global para tests unitarios
 */

import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";

// Limpiar después de cada test (solo si se usa @testing-library/react)
// Importación dinámica para evitar errores en tests que no usan React Testing Library
afterEach(async () => {
  try {
    const { cleanup } = await import("@testing-library/react");
    cleanup();
  } catch {
    // @testing-library/react no está disponible o no se necesita, no hay problema
  }
});

// Mock de next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock de next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "es",
}));

// Mock de @tanstack/react-query
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
  };
});

// Mock de window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
