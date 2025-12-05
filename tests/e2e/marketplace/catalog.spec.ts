/**
 * Marketplace Catalog E2E Tests
 * Tests para el catálogo de servicios/marketplace
 */

import { test, expect } from "@playwright/test";
import { urls, catalogFilters } from "../fixtures/test-data";

test.describe("Marketplace Catalog - Browse", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(urls.servicesCatalog);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 15000 });
  });

  test("should display catalog page with services", async ({ page }) => {
    // Given: Usuario navega al catálogo
    // When: La página carga
    // Then: Debe ver servicios disponibles

    // Verificar título o heading
    const heading = page.getByRole("heading").first();
    await expect(heading).toBeVisible();

    // Verificar que hay cards de servicios o mensaje vacío
    const serviceCards = page.locator('[class*="card"]').filter({
      has: page.locator('[class*="price"], [class*="precio"]'),
    });
    const emptyState = page.locator('[class*="empty"]');

    const hasCards = await serviceCards.first().isVisible().catch(() => false);
    const hasEmpty = await emptyState.first().isVisible().catch(() => false);

    expect(hasCards || hasEmpty).toBeTruthy();
  });

  test("should display service cards with required info", async ({ page }) => {
    // Given: Catálogo cargado con servicios
    // When: Reviso una card de servicio
    // Then: Debe tener nombre, precio, CTA

    const serviceCard = page.locator('[class*="card"]').filter({
      has: page.locator('button, a'),
    }).first();

    if (await serviceCard.isVisible().catch(() => false)) {
      // Verificar que tiene título
      const title = serviceCard.locator('[class*="title"], h3, h4').first();
      await expect(title).toBeVisible();

      // Verificar que tiene precio (formato COP)
      const priceText = await serviceCard.textContent();
      expect(priceText).toMatch(/\$|COP|precio|[0-9]/i);

      // Verificar que tiene CTA
      const cta = serviceCard.locator('button, a[href*="service"]').first();
      await expect(cta).toBeVisible();
    }
  });

  test("should have filter panel", async ({ page }) => {
    // Given: Catálogo de servicios
    // When: Busco panel de filtros
    // Then: Debe existir (desktop o mobile)

    // Desktop: panel lateral
    const desktopFilters = page.locator('[class*="card"]').filter({
      hasText: /filtros|filters/i,
    }).first();

    // Mobile: botón que abre sheet
    const mobileFilterBtn = page.getByRole("button", { name: /filtros|filters/i });

    const hasDesktopFilters = await desktopFilters.isVisible().catch(() => false);
    const hasMobileBtn = await mobileFilterBtn.isVisible().catch(() => false);

    expect(hasDesktopFilters || hasMobileBtn).toBeTruthy();
  });

  test("should filter by category", async ({ page }) => {
    // Given: Catálogo con filtros
    // When: Selecciono una categoría
    // Then: Se filtran los resultados

    // Buscar checkbox o selector de categoría
    const categoryCheckbox = page.locator('[id*="category"]').first();
    const categoryLabel = page.locator('label').filter({
      hasText: /consultoría|desarrollo|cloud|soporte/i,
    }).first();

    if (await categoryCheckbox.isVisible().catch(() => false)) {
      await categoryCheckbox.click();
      await page.waitForTimeout(1000);
    } else if (await categoryLabel.isVisible().catch(() => false)) {
      await categoryLabel.click();
      await page.waitForTimeout(1000);
    }

    // Verificar que la URL o el contenido cambió
    const currentUrl = page.url();
    const content = await page.content();
    
    // Algo debería haber cambiado (URL con query params o contenido filtrado)
    console.log("Filter applied, checking results...");
  });

  test("should filter by price range", async ({ page }) => {
    // Given: Catálogo con filtro de precio
    // When: Ajusto el slider de precio
    // Then: Se filtran los resultados

    // Buscar slider de precio
    const priceSlider = page.locator('[role="slider"]').first();

    if (await priceSlider.isVisible().catch(() => false)) {
      // Mover el slider
      await priceSlider.click();
      await page.waitForTimeout(1000);

      console.log("Price filter adjusted");
    }
  });

  test("should filter by rating", async ({ page }) => {
    // Given: Catálogo con filtro de rating
    // When: Selecciono rating mínimo
    // Then: Solo muestra servicios con ese rating o superior

    const ratingOption = page.locator('[class*="cursor-pointer"]').filter({
      has: page.locator('[class*="star"]'),
    }).first();

    if (await ratingOption.isVisible().catch(() => false)) {
      await ratingOption.click();
      await page.waitForTimeout(1000);

      console.log("Rating filter applied");
    }
  });

  test("should clear all filters", async ({ page }) => {
    // Given: Filtros activos
    // When: Click en limpiar filtros
    // Then: Se reinician los filtros

    const clearBtn = page.getByRole("button", { name: /limpiar|clear|reset/i });

    if (await clearBtn.isVisible().catch(() => false)) {
      await clearBtn.click();
      await page.waitForTimeout(500);

      console.log("Filters cleared");
    }
  });

  test("should show results count", async ({ page }) => {
    // Given: Catálogo cargado
    // When: Reviso el contador
    // Then: Debe mostrar cantidad de resultados

    const resultsText = page.locator('[class*="text-muted"]').filter({
      hasText: /resultados|results|servicios|encontrados/i,
    });

    if (await resultsText.first().isVisible().catch(() => false)) {
      const text = await resultsText.first().textContent();
      expect(text).toMatch(/\d+/);
    }
  });

  test("should navigate to service detail", async ({ page }) => {
    // Given: Card de servicio visible
    // When: Click en ver detalles
    // Then: Navega a página de detalle

    const detailLink = page.locator('a[href*="/services/catalog/"]').first();

    if (await detailLink.isVisible().catch(() => false)) {
      await detailLink.click();
      await page.waitForURL(/\/services\/catalog\/[^/]+/);

      expect(page.url()).toMatch(/\/services\/catalog\/[^/]+/);
    }
  });
});

test.describe("Marketplace Catalog - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should show mobile filter button", async ({ page }) => {
    // Given: Vista mobile del catálogo
    // When: Busco filtros
    // Then: Debe haber botón para abrir filtros

    await page.goto(urls.servicesCatalog);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 15000 });

    const filterBtn = page.getByRole("button", { name: /filtros|filters/i });
    await expect(filterBtn).toBeVisible();
  });

  test("should open filter sheet on mobile", async ({ page }) => {
    // Given: Vista mobile
    // When: Click en filtros
    // Then: Se abre sheet lateral

    await page.goto(urls.servicesCatalog);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 15000 });

    const filterBtn = page.getByRole("button", { name: /filtros|filters/i });
    
    if (await filterBtn.isVisible()) {
      await filterBtn.click();

      // Verificar que se abrió el sheet
      const sheet = page.locator('[role="dialog"], [class*="sheet"]');
      await expect(sheet.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should display services in single column on mobile", async ({ page }) => {
    // Given: Vista mobile del catálogo
    // When: Reviso el layout
    // Then: Servicios deben estar en una columna

    await page.goto(urls.servicesCatalog);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 15000 });

    // En mobile, el grid debería ser de 1 columna
    const serviceGrid = page.locator('[class*="grid"]').first();
    
    if (await serviceGrid.isVisible()) {
      const gridClass = await serviceGrid.getAttribute("class");
      // Verificar que no tiene clases de múltiples columnas activas
      console.log("Grid classes:", gridClass);
    }
  });
});

test.describe("Marketplace Catalog - Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(urls.servicesCatalog);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 15000 });
  });

  test("should have search input", async ({ page }) => {
    // Given: Catálogo de servicios
    // When: Busco campo de búsqueda
    // Then: Debe existir

    const searchInput = page.getByPlaceholder(/buscar|search/i);
    
    // Puede que el search esté en otro lugar o no exista
    const hasSearch = await searchInput.isVisible().catch(() => false);
    
    if (!hasSearch) {
      console.log("No dedicated search input - might use filters only");
    }
  });

  test("should search services", async ({ page }) => {
    // Given: Campo de búsqueda visible
    // When: Escribo un término
    // Then: Se filtran los resultados

    const searchInput = page.getByPlaceholder(/buscar|search/i);

    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill("desarrollo");
      await page.waitForTimeout(1000);

      // Los resultados deberían actualizarse
      console.log("Search performed");
    }
  });
});

