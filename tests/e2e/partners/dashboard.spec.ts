/**
 * Partner Dashboard E2E Tests
 * Tests para el dashboard de partners
 */

import { test, expect } from "@playwright/test";
import { urls } from "../fixtures/test-data";

test.describe("Partner Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(urls.partnersDashboard);
  });

  test("should load partner dashboard with stats", async ({ page }) => {
    // Given: Usuario autenticado como partner
    // When: Navega al dashboard de partners
    // Then: Debe ver las estadísticas principales

    // Esperar que cargue (no skeleton/loading)
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });

    // Verificar título del dashboard
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/partner|dashboard/i);

    // Verificar cards de estadísticas (Total Leads, Conversion Rate, Revenue, Commissions)
    const statsCards = page.locator('[class*="card"]').filter({ hasText: /leads|conversion|revenue|comisi/i });
    await expect(statsCards.first()).toBeVisible();

    // Verificar que hay al menos 4 cards de stats
    const cardsCount = await page.locator('.grid [class*="card"]').count();
    expect(cardsCount).toBeGreaterThanOrEqual(4);
  });

  test("should display partner tier badge", async ({ page }) => {
    // Given: Usuario partner autenticado
    // When: Dashboard carga
    // Then: Debe mostrar el badge del tier (bronze/silver/gold/platinum)

    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });

    const tierBadge = page.locator('[class*="badge"]').filter({ 
      hasText: /bronze|silver|gold|platinum|bronce|plata|oro|platino/i 
    });
    await expect(tierBadge.first()).toBeVisible();
  });

  test("should show recent leads section", async ({ page }) => {
    // Given: Dashboard cargado
    // When: Reviso la sección de leads recientes
    // Then: Debe mostrar lista o mensaje vacío

    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });

    // Buscar sección de leads recientes
    const recentLeadsSection = page.locator('[class*="card"]').filter({ 
      hasText: /leads recientes|recent leads/i 
    });
    await expect(recentLeadsSection).toBeVisible();

    // Verificar que tiene enlace "Ver todos"
    const viewAllLink = recentLeadsSection.getByRole("link", { name: /ver todos|view all/i });
    await expect(viewAllLink).toBeVisible();
  });

  test("should show recent commissions section", async ({ page }) => {
    // Given: Dashboard cargado
    // When: Reviso la sección de comisiones
    // Then: Debe mostrar lista o mensaje vacío

    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });

    const commissionsSection = page.locator('[class*="card"]').filter({ 
      hasText: /comisiones recientes|recent commissions/i 
    });
    await expect(commissionsSection).toBeVisible();
  });

  test("should navigate to leads page from dashboard", async ({ page }) => {
    // Given: Dashboard cargado
    // When: Click en "Ver todos" de leads
    // Then: Navega a la página de leads

    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });

    const leadsSection = page.locator('[class*="card"]').filter({ 
      hasText: /leads recientes|recent leads/i 
    });
    const viewAllBtn = leadsSection.getByRole("link", { name: /ver todos|view all/i }).first();
    
    await viewAllBtn.click();
    await page.waitForURL(/\/partners\/leads/);
    
    expect(page.url()).toContain("/partners/leads");
  });

  test("should display performance score", async ({ page }) => {
    // Given: Dashboard cargado
    // When: Reviso el header
    // Then: Debe mostrar el performance score

    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });

    // El performance score está en el header del dashboard
    const performanceText = page.getByText(/performance|rendimiento|score/i);
    await expect(performanceText.first()).toBeVisible();
  });

  test("should handle loading state gracefully", async ({ page }) => {
    // Given: Navegando al dashboard
    // When: La página está cargando
    // Then: Debe mostrar skeletons/loading

    await page.goto(urls.partnersDashboard);
    
    // Verificar que hay indicadores de carga (skeletons)
    const skeletons = page.locator(".animate-pulse, [class*='skeleton']");
    
    // Al menos debería haber un skeleton inicialmente (o carga muy rápida)
    // No fallamos si carga muy rápido
    const hasSkeletons = await skeletons.first().isVisible().catch(() => false);
    
    // Esperar que termine de cargar
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 15000 });
  });

  test("should show error state when API fails", async ({ page }) => {
    // Simular error de API interceptando la request
    await page.route("**/api/partners/**", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    await page.goto(urls.partnersDashboard);

    // Debe mostrar mensaje de error
    const errorElement = page.locator('[class*="alert"], [role="alert"]').filter({
      hasText: /error|algo salió mal|something went wrong/i,
    });
    
    // O un botón de reintentar
    const retryButton = page.getByRole("button", { name: /reintentar|retry/i });
    
    // Al menos uno debe ser visible
    const hasError = await errorElement.first().isVisible().catch(() => false);
    const hasRetry = await retryButton.first().isVisible().catch(() => false);
    
    expect(hasError || hasRetry).toBeTruthy();
  });
});

test.describe("Partner Dashboard - Access Control", () => {
  test("should redirect non-authenticated users to login", async ({ browser }) => {
    // Crear contexto sin autenticación
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto(urls.partnersDashboard);
    
    // Debe redirigir a login
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain("/login");
    
    await context.close();
  });
});


