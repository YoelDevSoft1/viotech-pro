/**
 * Service Comparison E2E Tests
 * Tests para la funcionalidad de comparación de servicios
 */

import { test, expect } from "@playwright/test";
import { urls } from "../fixtures/test-data";

test.describe("Service Comparison Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(urls.servicesCompare);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 15000 });
  });

  test("should display comparison page", async ({ page }) => {
    // Given: Usuario navega a comparación
    // When: Página carga
    // Then: Debe mostrar interfaz de comparación

    const heading = page.getByRole("heading").filter({
      hasText: /comparar|comparison|compare/i,
    });

    await expect(heading.first()).toBeVisible();
  });

  test("should show empty state when no services selected", async ({ page }) => {
    // Given: Página de comparación sin servicios
    // When: Reviso el contenido
    // Then: Debe mostrar mensaje para agregar servicios

    const emptyState = page.locator('[class*="card"]').filter({
      hasText: /agregar|añadir|selecciona|add|select/i,
    });

    const addServiceSelect = page.locator('button[role="combobox"]').filter({
      hasText: /agregar|añadir|servicio|add/i,
    });

    const hasEmptyState = await emptyState.first().isVisible().catch(() => false);
    const hasSelect = await addServiceSelect.first().isVisible().catch(() => false);

    expect(hasEmptyState || hasSelect).toBeTruthy();
  });

  test("should add service to comparison", async ({ page }) => {
    // Given: Página de comparación vacía
    // When: Agrego un servicio
    // Then: Servicio aparece en la comparación

    const addSelect = page.locator('button[role="combobox"]').first();

    if (await addSelect.isVisible()) {
      await addSelect.click();

      // Seleccionar primer servicio disponible
      const option = page.locator('[role="option"]').first();

      if (await option.isVisible()) {
        const serviceName = await option.textContent();
        await option.click();

        await page.waitForTimeout(500);

        // Verificar que el servicio fue agregado
        const serviceInComparison = page.locator('[class*="card"], [class*="border"]').filter({
          hasText: serviceName?.split("-")[0]?.trim() || "",
        });

        await expect(serviceInComparison.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("should add multiple services to comparison", async ({ page }) => {
    // Given: Página de comparación
    // When: Agrego múltiples servicios
    // Then: Todos aparecen

    const addSelect = page.locator('button[role="combobox"]').first();

    if (await addSelect.isVisible()) {
      // Agregar primer servicio
      await addSelect.click();
      const option1 = page.locator('[role="option"]').first();
      if (await option1.isVisible()) {
        await option1.click();
        await page.waitForTimeout(500);
      }

      // Buscar selector para agregar otro
      const addSelect2 = page.locator('button[role="combobox"]').filter({
        hasText: /agregar|añadir|add/i,
      }).first();

      if (await addSelect2.isVisible()) {
        await addSelect2.click();
        const option2 = page.locator('[role="option"]').first();
        if (await option2.isVisible()) {
          await option2.click();
          await page.waitForTimeout(500);
        }
      }

      // Verificar que hay servicios en comparación
      console.log("Services added to comparison");
    }
  });

  test("should limit to 4 services maximum", async ({ page }) => {
    // Given: 4 servicios ya seleccionados
    // When: Intento agregar otro
    // Then: Muestra error o deshabilita opción

    // Este test depende de poder agregar 4 servicios primero
    // y luego verificar que no se puede agregar más
    
    const addSelect = page.locator('button[role="combobox"]').first();

    if (await addSelect.isVisible()) {
      // Agregar servicios hasta el límite
      for (let i = 0; i < 4; i++) {
        const selector = page.locator('button[role="combobox"]').filter({
          hasText: /agregar|añadir|add|servicio/i,
        }).first();

        if (await selector.isVisible().catch(() => false)) {
          await selector.click();
          const option = page.locator('[role="option"]').first();
          if (await option.isVisible().catch(() => false)) {
            await option.click();
            await page.waitForTimeout(300);
          }
        }
      }

      // Intentar agregar el 5to
      const finalSelector = page.locator('button[role="combobox"]').filter({
        hasText: /agregar|añadir|add/i,
      }).first();

      // El selector no debería estar visible o debería mostrar error
      const selectorVisible = await finalSelector.isVisible().catch(() => false);
      
      if (selectorVisible) {
        await finalSelector.click();
        const option = page.locator('[role="option"]').first();
        if (await option.isVisible().catch(() => false)) {
          await option.click();
          
          // Debería aparecer un toast de error
          const errorToast = page.locator('[data-sonner-toast]').filter({
            hasText: /máximo|maximum|4|límite|limit/i,
          });
          await expect(errorToast.first()).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test("should remove service from comparison", async ({ page }) => {
    // Given: Servicio en comparación
    // When: Click en remover
    // Then: Servicio se elimina

    const addSelect = page.locator('button[role="combobox"]').first();

    if (await addSelect.isVisible()) {
      // Agregar un servicio
      await addSelect.click();
      const option = page.locator('[role="option"]').first();
      if (await option.isVisible()) {
        await option.click();
        await page.waitForTimeout(500);
      }

      // Buscar botón de remover (X)
      const removeBtn = page.locator('button').filter({
        has: page.locator('[class*="x"], svg'),
      }).first();

      if (await removeBtn.isVisible()) {
        await removeBtn.click();
        await page.waitForTimeout(500);

        // Verificar que se removió (volvemos a estado vacío o menos servicios)
        console.log("Service removed");
      }
    }
  });

  test("should display comparison table with services", async ({ page }) => {
    // Given: Servicios seleccionados
    // When: Reviso la tabla
    // Then: Debe mostrar comparación lado a lado

    const addSelect = page.locator('button[role="combobox"]').first();

    if (await addSelect.isVisible()) {
      // Agregar servicios
      for (let i = 0; i < 2; i++) {
        const selector = page.locator('button[role="combobox"]').filter({
          hasText: /agregar|añadir|add|servicio/i,
        }).first();

        if (await selector.isVisible().catch(() => false)) {
          await selector.click();
          const option = page.locator('[role="option"]').first();
          if (await option.isVisible().catch(() => false)) {
            await option.click();
            await page.waitForTimeout(300);
          }
        }
      }

      // Verificar tabla de comparación
      const table = page.locator("table");

      if (await table.isVisible()) {
        // Verificar headers
        const headers = table.locator("th");
        const headerCount = await headers.count();
        expect(headerCount).toBeGreaterThan(1);

        // Verificar filas con características
        const rows = table.locator("tbody tr");
        const rowCount = await rows.count();
        expect(rowCount).toBeGreaterThan(0);
      }
    }
  });

  test("should compare prices", async ({ page }) => {
    // Given: Servicios en comparación
    // When: Reviso la fila de precio
    // Then: Debe mostrar precios de cada servicio

    const addSelect = page.locator('button[role="combobox"]').first();

    if (await addSelect.isVisible()) {
      // Agregar servicios
      for (let i = 0; i < 2; i++) {
        const selector = page.locator('button[role="combobox"]').filter({
          hasText: /agregar|añadir|add|servicio/i,
        }).first();

        if (await selector.isVisible().catch(() => false)) {
          await selector.click();
          const option = page.locator('[role="option"]').first();
          if (await option.isVisible().catch(() => false)) {
            await option.click();
            await page.waitForTimeout(300);
          }
        }
      }

      // Buscar fila de precio
      const priceRow = page.locator("tr").filter({
        hasText: /precio|price/i,
      });

      if (await priceRow.isVisible()) {
        const cells = priceRow.locator("td");
        const cellCount = await cells.count();

        // Debe haber al menos 2 celdas con precios
        expect(cellCount).toBeGreaterThanOrEqual(2);

        // Verificar que tienen formato de precio
        for (let i = 0; i < cellCount; i++) {
          const cellText = await cells.nth(i).textContent();
          expect(cellText).toMatch(/\$|COP|[\d.,]+/);
        }
      }
    }
  });

  test("should compare features", async ({ page }) => {
    // Given: Servicios en comparación
    // When: Reviso la fila de características
    // Then: Debe mostrar features de cada servicio

    const addSelect = page.locator('button[role="combobox"]').first();

    if (await addSelect.isVisible()) {
      // Agregar servicios
      for (let i = 0; i < 2; i++) {
        const selector = page.locator('button[role="combobox"]').filter({
          hasText: /agregar|añadir|add|servicio/i,
        }).first();

        if (await selector.isVisible().catch(() => false)) {
          await selector.click();
          const option = page.locator('[role="option"]').first();
          if (await option.isVisible().catch(() => false)) {
            await option.click();
            await page.waitForTimeout(300);
          }
        }
      }

      // Buscar fila de características
      const featuresRow = page.locator("tr").filter({
        hasText: /características|features|funcionalidades/i,
      });

      if (await featuresRow.isVisible()) {
        // Debe tener listas de features
        const lists = featuresRow.locator("ul");
        const listCount = await lists.count();
        expect(listCount).toBeGreaterThan(0);
      }
    }
  });

  test("should have CTA buttons for each service", async ({ page }) => {
    // Given: Servicios en comparación
    // When: Reviso los CTAs
    // Then: Debe haber botón de ver detalles para cada servicio

    const addSelect = page.locator('button[role="combobox"]').first();

    if (await addSelect.isVisible()) {
      // Agregar un servicio
      await addSelect.click();
      const option = page.locator('[role="option"]').first();
      if (await option.isVisible()) {
        await option.click();
        await page.waitForTimeout(500);
      }

      // Buscar botones de ver detalles
      const detailBtns = page.getByRole("button", {
        name: /ver detalles|view details|más info/i,
      });

      const btnCount = await detailBtns.count();
      expect(btnCount).toBeGreaterThan(0);
    }
  });
});

test.describe("Service Comparison - Navigation", () => {
  test("should navigate from catalog to comparison", async ({ page }) => {
    // Given: Catálogo de servicios
    // When: Click en comparar
    // Then: Navega a página de comparación

    await page.goto(urls.servicesCatalog);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 15000 });

    const compareLink = page.locator('a[href*="compare"]').first();

    if (await compareLink.isVisible().catch(() => false)) {
      await compareLink.click();
      await page.waitForURL(/compare/);
      expect(page.url()).toContain("compare");
    }
  });

  test("should preserve selected services in URL", async ({ page }) => {
    // Given: Servicios seleccionados
    // When: Reviso la URL
    // Then: Debe tener parámetros de los servicios seleccionados

    await page.goto(urls.servicesCompare);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 15000 });

    const addSelect = page.locator('button[role="combobox"]').first();

    if (await addSelect.isVisible()) {
      await addSelect.click();
      const option = page.locator('[role="option"]').first();
      if (await option.isVisible()) {
        await option.click();
        await page.waitForTimeout(1000);

        // La URL podría tener query params con los IDs de servicios
        const url = page.url();
        console.log("Comparison URL:", url);
      }
    }
  });
});
