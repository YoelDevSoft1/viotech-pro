/**
 * Smoke Tests - Portal Cliente
 * Tests críticos que deben pasar siempre (ejecutar en cada PR)
 */

import { test, expect } from "@playwright/test";
import { navigateToProtectedRoute } from "./helpers";

test.describe("Smoke Tests - Portal Cliente", () => {
  test("TC-C1.1.1: Protección de rutas cliente", async ({ page, context }) => {
    // Given: Usuario no autenticado
    // Este test debe ejecutarse sin storageState (proyecto *-unauth)
    // Limpiar cualquier estado de autenticación previo
    await context.clearCookies();
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // When: Intenta acceder a /client/dashboard
    await page.goto("/client/dashboard");

    // Then: Debe redirigir a /login
    await page.waitForURL(/\/(login|auth)/, { timeout: 10000 });
    expect(page.url()).toContain("/login");
  });

  test("TC-C2.1.2: Dashboard maneja null sin crashear", async ({ page }) => {
    // Configurar listener de errores ANTES de navegar
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    // Given: Backend devuelve null
    await page.route("**/api/metrics/dashboard", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: { slaCumplido: null, avancePromedio: null } }),
      });
    });

    // Mockear todas las demás peticiones del dashboard para evitar que networkidle tarde mucho
    await page.route("**/api/activity/recent", (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ data: [] }) });
    });
    await page.route("**/api/projects**", (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ data: [] }) });
    });
    await page.route("**/api/tickets**", (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ data: [] }) });
    });
    await page.route("**/api/services/**", (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ data: [] }) });
    });
    await page.route("**/api/auth/me**", (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ data: { id: "test-user", organizationId: "test-org" } }) });
    });
    await page.route("**/api/user/preferences**", (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ data: {} }) });
    });

    // When: Accede a dashboard
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");
    try {
      await page.waitForLoadState("networkidle", { timeout: 10000 });
    } catch {
      // Si networkidle tarda mucho, continuar de todas formas
    }

    // Then: No debe crashear
    await expect(page.locator("body")).toBeVisible();
    
    // Esperar un momento para que se complete el renderizado
    await page.waitForTimeout(1000);
    
    // Verificar que no hay errores críticos en consola
    const criticalErrors = errors.filter(e => 
      e.includes("Cannot read") || 
      e.includes("undefined") || 
      e.includes("null is not")
    );
    expect(criticalErrors.length).toBe(0);
  });

  test("TC-C2.2.1: Validación de asunto mínimo", async ({ page }) => {
    // Mockear todas las peticiones de tickets ANTES de navegar para evitar esperas innecesarias
    await page.route("**/api/tickets**", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: [] }),
      });
    });

    // Mockear otras peticiones que pueda hacer la página de tickets
    await page.route("**/api/auth/me**", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: { id: "test-user", organizationId: "test-org" } }),
      });
    });

    // Usar estado de autenticación guardado
    // Given: Modal de ticket abierto
    await navigateToProtectedRoute(page, "/client/tickets", /\/client\/tickets/);
    
    // Verificar que la página cargó correctamente (timeout más corto ya que está mockeado)
    await expect(page.locator('text=/Gestión de Tickets/i').first()).toBeVisible({ timeout: 5000 });
    
    const createButton = page.getByRole('button', { name: /nuevo ticket/i }).first();
    await expect(createButton).toBeVisible({ timeout: 5000 });
    await createButton.click();
    
    // Esperar a que el modal se abra
    await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 3000 });

    // When: Ingresa asunto inválido
    const tituloInput = page.locator('input[name="titulo"]').first();
    await expect(tituloInput).toBeVisible({ timeout: 3000 });
    await tituloInput.fill("abc");
    await tituloInput.blur();
    // Reducir waitForTimeout
    await page.waitForTimeout(200);
    
    // Intentar hacer submit para activar la validación
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    });
    // Reducir waitForTimeout - la validación debería ser instantánea
    await page.waitForTimeout(500);

    // Then: Debe mostrar error
    // Buscar usando el selector específico de FormMessage
    const errorMessage = page.locator('[data-slot="form-message"]').filter({ 
      hasText: /asunto|5|caracteres/i 
    }).first();
    
    await expect(
      errorMessage.or(page.locator('text=/asunto.*al menos 5|debe tener.*5 caracteres|El asunto debe tener al menos 5 caracteres/i').first())
    ).toBeVisible({ timeout: 3000 });
  });

  test("TC-C3.2: Manejo de backend caído", async ({ page }) => {
    // Mockear todas las peticiones del dashboard EXCEPTO metrics (que vamos a abortar)
    await page.route("**/api/activity/recent", (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ data: [] }) });
    });
    await page.route("**/api/projects**", (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ data: [] }) });
    });
    await page.route("**/api/tickets**", (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ data: [] }) });
    });
    await page.route("**/api/services/**", (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ data: [] }) });
    });
    await page.route("**/api/auth/me**", (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ data: { id: "test-user", organizationId: "test-org" } }) });
    });
    await page.route("**/api/user/preferences**", (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ data: {} }) });
    });
    
    // Given: Backend no responde (solo para métricas, no para auth)
    await page.route("**/api/metrics/**", (route) => {
      route.abort("failed");
    });

    // When: Accede a dashboard
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");
    // No esperar networkidle porque metrics va a fallar
    await page.waitForTimeout(2000); // Dar tiempo a que se muestre el error

    // Then: Debe mostrar estado de error
    await expect(
      page.locator('text=/error|fallo|reintentar/i').first()
    ).toBeVisible({ timeout: 5000 });
    
    // And: Debe mostrar botón "Reintentar"
    await expect(page.locator('button:has-text("Reintentar")')).toBeVisible();
  });
});
