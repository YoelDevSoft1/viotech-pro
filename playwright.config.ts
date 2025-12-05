/**
 * Playwright E2E Test Configuration
 * VioTech Pro - Partners & Marketplace Tests
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // Directorio de tests
  testDir: "./tests/e2e",

  // Timeout por test (30 segundos)
  timeout: 30 * 1000,

  // Timeout de expect (5 segundos)
  expect: {
    timeout: 5000,
  },

  // Ejecutar tests en paralelo
  fullyParallel: true,

  // Reintentos en CI
  retries: process.env.CI ? 2 : 0,

  // Workers en CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
  ],

  // Configuración compartida
  use: {
    // Base URL de la aplicación
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",

    // Trace on first retry
    trace: "on-first-retry",

    // Screenshot on failure
    screenshot: "only-on-failure",

    // Video on failure
    video: "on-first-retry",

    // Locale
    locale: "es-CO",

    // Timezone
    timezoneId: "America/Bogota",
  },

  // Proyectos (navegadores)
  projects: [
    // Setup project para autenticación
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    // Chromium (Desktop)
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/partner.json",
      },
      dependencies: ["setup"],
    },

    // Firefox (Desktop)
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        storageState: "tests/e2e/.auth/partner.json",
      },
      dependencies: ["setup"],
    },

    // Mobile Chrome
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
        storageState: "tests/e2e/.auth/partner.json",
      },
      dependencies: ["setup"],
    },
  ],

  // Web server para desarrollo local
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Output directory
  outputDir: "test-results",
});

