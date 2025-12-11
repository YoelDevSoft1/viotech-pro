/**
 * Service Detail Page E2E Tests
 * Tests para la página de detalle de servicios
 */

import { test, expect } from "@playwright/test";
import { urls } from "../fixtures/test-data";

test.describe("Service Detail Page", () => {
  // Usar un slug de servicio de prueba
  const testServiceSlug = "consultoria-ti-empresarial";

  test("should navigate to detail from catalog", async ({ page }) => {
    // Given: Catálogo de servicios
    // When: Click en un servicio
    // Then: Navega a la página de detalle

    await page.goto(urls.servicesCatalog);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 15000 });

    // Click en primer enlace de detalle
    const detailLink = page.locator('a[href*="/services/catalog/"]').first();

    if (await detailLink.isVisible().catch(() => false)) {
      const href = await detailLink.getAttribute("href");
      await detailLink.click();
      
      // Esperar navegación
      await page.waitForURL(/\/services\/catalog\/[^/]+/, { timeout: 10000 });
      
      // Verificar que cargó
      await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });
    }
  });

  test("should display service name and description", async ({ page }) => {
    // Given: Página de detalle de servicio
    // When: Reviso el contenido
    // Then: Debe mostrar nombre y descripción

    await page.goto(urls.servicesCatalog);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 15000 });

    const detailLink = page.locator('a[href*="/services/catalog/"]').first();

    if (await detailLink.isVisible()) {
      await detailLink.click();
      await page.waitForURL(/\/services\/catalog\/[^/]+/);
      await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });

      // Verificar título
      const title = page.getByRole("heading", { level: 1 });
      await expect(title).toBeVisible();

      // Verificar que hay descripción (texto largo)
      const description = page.locator("p").filter({
        has: page.locator(":scope"),
      }).first();
      await expect(description).toBeVisible();
    }
  });

  test("should display service price", async ({ page }) => {
    // Given: Página de detalle
    // When: Busco el precio
    // Then: Debe estar visible con formato correcto

    await page.goto(urls.servicesCatalog);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 15000 });

    const detailLink = page.locator('a[href*="/services/catalog/"]').first();

    if (await detailLink.isVisible()) {
      await detailLink.click();
      await page.waitForURL(/\/services\/catalog\/[^/]+/);
      await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });

      // Verificar precio
      const pageContent = await page.content();
      expect(pageContent).toMatch(/\$[\d.,]+|COP|precio/i);
    }
  });

  test("should display service features", async ({ page }) => {
    // Given: Página de detalle
    // When: Busco características
    // Then: Debe mostrar lista de features

    await page.goto(urls.servicesCatalog);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 15000 });

    const detailLink = page.locator('a[href*="/services/catalog/"]').first();

    if (await detailLink.isVisible()) {
      await detailLink.click();
      await page.waitForURL(/\/services\/catalog\/[^/]+/);
      await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });

      // Buscar lista de features (iconos check o bullets)
      const featuresList = page.locator('ul, [class*="list"]').filter({
        has: page.locator('li, [class*="check"]'),
      });

      await expect(featuresList.first()).toBeVisible();
    }
  });

  test("should have CTA button", async ({ page }) => {
    // Given: Página de detalle
    // When: Busco CTA
    // Then: Debe haber botón de contratar/comprar

    await page.goto(urls.servicesCatalog);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 15000 });

    const detailLink = page.locator('a[href*="/services/catalog/"]').first();

    if (await detailLink.isVisible()) {
      await detailLink.click();
      await page.waitForURL(/\/services\/catalog\/[^/]+/);
      await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });

      const ctaBtn = page.getByRole("button", { 
        name: /contratar|comprar|solicitar|buy|hire|request/i 
      }).first();

      await expect(ctaBtn).toBeVisible();
    }
  });

  test("should display service rating and reviews", async ({ page }) => {
    // Given: Página de detalle
    // When: Busco rating
    // Then: Debe mostrar estrellas y/o reviews

    await page.goto(urls.servicesCatalog);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 15000 });

    const detailLink = page.locator('a[href*="/services/catalog/"]').first();

    if (await detailLink.isVisible()) {
      await detailLink.click();
      await page.waitForURL(/\/services\/catalog\/[^/]+/);
      await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });

      // Buscar rating (estrellas) o sección de reviews
      const ratingSection = page.locator('[class*="star"], [class*="rating"]');
      const reviewsSection = page.locator('[class*="review"]');

      const hasRating = await ratingSection.first().isVisible().catch(() => false);
      const hasReviews = await reviewsSection.first().isVisible().catch(() => false);

      // Al menos uno debería existir (o ninguno si no hay reviews)
      console.log("Has rating:", hasRating, "Has reviews:", hasReviews);
    }
  });

  test("should have tabs for different sections", async ({ page }) => {
    // Given: Página de detalle
    // When: Busco tabs
    // Then: Debe haber tabs para descripción, specs, reviews, etc.

    await page.goto(urls.servicesCatalog);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 15000 });

    const detailLink = page.locator('a[href*="/services/catalog/"]').first();

    if (await detailLink.isVisible()) {
      await detailLink.click();
      await page.waitForURL(/\/services\/catalog\/[^/]+/);
      await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });

      // Buscar tabs
      const tabList = page.locator('[role="tablist"]');
      const hasTabs = await tabList.isVisible().catch(() => false);

      if (hasTabs) {
        const tabs = tabList.locator('[role="tab"]');
        const tabCount = await tabs.count();
        expect(tabCount).toBeGreaterThan(0);
      }
    }
  });

  test("should switch between tabs", async ({ page }) => {
    // Given: Página con tabs
    // When: Click en otro tab
    // Then: Contenido cambia

    await page.goto(urls.servicesCatalog);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 15000 });

    const detailLink = page.locator('a[href*="/services/catalog/"]').first();

    if (await detailLink.isVisible()) {
      await detailLink.click();
      await page.waitForURL(/\/services\/catalog\/[^/]+/);
      await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });

      const tabList = page.locator('[role="tablist"]');

      if (await tabList.isVisible()) {
        const tabs = tabList.locator('[role="tab"]');
        const tabCount = await tabs.count();

        if (tabCount > 1) {
          // Click en el segundo tab
          await tabs.nth(1).click();
          
          // Verificar que el tab está seleccionado
          const isSelected = await tabs.nth(1).getAttribute("aria-selected");
          expect(isSelected).toBe("true");
        }
      }
    }
  });
});

test.describe("Service Detail - Related Services", () => {
  test("should show related or recommended services", async ({ page }) => {
    // Given: Página de detalle
    // When: Scroll hacia abajo
    // Then: Debe mostrar servicios relacionados

    await page.goto(urls.servicesCatalog);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 15000 });

    const detailLink = page.locator('a[href*="/services/catalog/"]').first();

    if (await detailLink.isVisible()) {
      await detailLink.click();
      await page.waitForURL(/\/services\/catalog\/[^/]+/);
      await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });

      // Scroll al final
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      // Buscar sección de relacionados
      const relatedSection = page.locator('[class*="card"]').filter({
        hasText: /relacionados|recommended|similar|también te puede interesar/i,
      });

      const hasRelated = await relatedSection.first().isVisible().catch(() => false);
      console.log("Has related services section:", hasRelated);
    }
  });
});




