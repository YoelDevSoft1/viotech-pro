/**
 * Playwright E2E Test Configuration
 * VioTech Pro - Partners & Marketplace Tests
 */

import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";
import path from "path";

// Cargar variables de entorno desde .env.test si existe
config({ path: path.resolve(__dirname, ".env.test") });

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

  // Variables de entorno para tests
  // Las credenciales se cargan automáticamente desde:
  // 1. Variables de entorno del sistema (prioridad)
  // 2. Archivo .env.test en la raíz del proyecto (si existe)
  // 
  // Para configurar localmente:
  // 1. Copia .env.test.example a .env.test
  // 2. Completa con tus credenciales de test
  // 
  // Para CI/CD, configurar como secrets en GitHub Actions:
  // - TEST_CLIENT_EMAIL
  // - TEST_CLIENT_PASSWORD

  // Proyectos (navegadores)
  projects: [
    // Setup project para autenticación de partners
    {
      name: "setup-partner",
      testMatch: /.*partner.*\.setup\.ts/,
    },

    // Setup project para autenticación de cliente
    {
      name: "setup-client",
      testMatch: /.*client.*\.setup\.ts/,
    },

    // Chromium (Desktop) - Partners
    {
      name: "chromium-partner",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/partner.json",
      },
      dependencies: ["setup-partner"],
      testMatch: /.*partners.*\.spec\.ts/,
    },

    // Chromium (Desktop) - Cliente
    {
      name: "chromium-client",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/client.json",
      },
      dependencies: ["setup-client"],
      testMatch: /.*client.*\.spec\.ts/,
    },

    // Chromium (Desktop) - Cliente sin autenticación (para tests de protección de rutas)
    {
      name: "chromium-client-unauth",
      use: {
        ...devices["Desktop Chrome"],
        // No usar storageState para este proyecto
      },
      testMatch: /.*smoke.*\.spec\.ts/,
      // Solo ejecutar el test de protección de rutas
      grep: /TC-C1\.1\.1/,
    },

    // Firefox (Desktop) - Partners
    {
      name: "firefox-partner",
      use: {
        ...devices["Desktop Firefox"],
        storageState: "tests/e2e/.auth/partner.json",
      },
      dependencies: ["setup-partner"],
      testMatch: /.*partners.*\.spec\.ts/,
    },

    // Firefox (Desktop) - Cliente
    {
      name: "firefox-client",
      use: {
        ...devices["Desktop Firefox"],
        storageState: "tests/e2e/.auth/client.json",
      },
      dependencies: ["setup-client"],
      testMatch: /.*client.*\.spec\.ts/,
    },

    // Firefox (Desktop) - Cliente sin autenticación
    {
      name: "firefox-client-unauth",
      use: {
        ...devices["Desktop Firefox"],
      },
      testMatch: /.*smoke.*\.spec\.ts/,
      grep: /TC-C1\.1\.1/,
    },

    // Mobile Chrome - Partners
    {
      name: "mobile-chrome-partner",
      use: {
        ...devices["Pixel 5"],
        storageState: "tests/e2e/.auth/partner.json",
      },
      dependencies: ["setup-partner"],
      testMatch: /.*partners.*\.spec\.ts/,
    },

    // Mobile Chrome - Cliente
    {
      name: "mobile-chrome-client",
      use: {
        ...devices["Pixel 5"],
        storageState: "tests/e2e/.auth/client.json",
      },
      dependencies: ["setup-client"],
      testMatch: /.*client.*\.spec\.ts/,
    },

    // Mobile Chrome - Cliente sin autenticación
    {
      name: "mobile-chrome-client-unauth",
      use: {
        ...devices["Pixel 5"],
      },
      testMatch: /.*smoke.*\.spec\.ts/,
      grep: /TC-C1\.1\.1/,
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


