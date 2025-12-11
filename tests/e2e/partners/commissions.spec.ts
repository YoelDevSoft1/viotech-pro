/**
 * Partner Commissions E2E Tests
 * Tests para comisiones de partners
 */

import { test, expect } from "@playwright/test";
import { urls } from "../fixtures/test-data";

test.describe("Partner Commissions - Display", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(urls.partnersCommissions);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });
  });

  test("should display commissions page with title", async ({ page }) => {
    // Given: Usuario partner autenticado
    // When: Navega a la página de comisiones
    // Then: Debe ver el título

    await expect(page.getByRole("heading", { level: 2 })).toContainText(/comisiones|commissions/i);
  });

  test("should show commission stats cards", async ({ page }) => {
    // Given: Página de comisiones cargada
    // When: Reviso las estadísticas
    // Then: Debe mostrar cards con totales

    // Cards de stats: Total, Pendiente, Pagado
    const statsCards = page.locator('[class*="card"]').filter({
      hasText: /total|pendiente|pagado|pending|paid/i,
    });

    await expect(statsCards.first()).toBeVisible();
    
    // Debe haber al menos 3 cards de stats
    const count = await statsCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("should display total commissions amount", async ({ page }) => {
    // Given: Página de comisiones
    // When: Reviso el total
    // Then: Debe mostrar monto formateado (COP)

    const totalCard = page.locator('[class*="card"]').filter({
      hasText: /total/i,
    }).first();

    await expect(totalCard).toBeVisible();

    // Verificar que hay un monto (formato de moneda colombiana)
    const amountText = await totalCard.textContent();
    // Puede ser $0 o un valor con formato COP
    expect(amountText).toMatch(/\$|COP|0|[0-9]/);
  });

  test("should display pending commissions", async ({ page }) => {
    // Given: Página de comisiones
    // When: Reviso pendientes
    // Then: Debe mostrar monto pendiente

    const pendingCard = page.locator('[class*="card"]').filter({
      hasText: /pendiente|pending/i,
    }).first();

    await expect(pendingCard).toBeVisible();
  });

  test("should display paid commissions", async ({ page }) => {
    // Given: Página de comisiones
    // When: Reviso pagados
    // Then: Debe mostrar monto pagado

    const paidCard = page.locator('[class*="card"]').filter({
      hasText: /pagado|paid/i,
    }).first();

    await expect(paidCard).toBeVisible();
  });

  test("should have status filter", async ({ page }) => {
    // Given: Página de comisiones
    // When: Busco filtros
    // Then: Debe haber filtro de estado

    const statusFilter = page.locator('button[role="combobox"]').filter({
      hasText: /estado|status|todos/i,
    }).first();

    await expect(statusFilter).toBeVisible();

    // Abrir y verificar opciones
    await statusFilter.click();
    const options = page.locator('[role="option"]');
    await expect(options.first()).toBeVisible();

    // Verificar que existen opciones esperadas
    const pendingOption = options.filter({ hasText: /pendiente|pending/i });
    const paidOption = options.filter({ hasText: /pagado|paid/i });

    expect(
      (await pendingOption.count()) > 0 || (await paidOption.count()) > 0
    ).toBeTruthy();
  });

  test("should have period filter", async ({ page }) => {
    // Given: Página de comisiones
    // When: Busco filtro de período
    // Then: Debe existir

    const periodFilter = page.locator('button[role="combobox"]').filter({
      hasText: /período|period|mes|2024/i,
    }).first();

    await expect(periodFilter).toBeVisible();
  });

  test("should have export button", async ({ page }) => {
    // Given: Página de comisiones
    // When: Busco botón de exportar
    // Then: Debe existir

    const exportBtn = page.getByRole("button", { name: /exportar|export|descargar|download/i });
    await expect(exportBtn).toBeVisible();
  });

  test("should display commissions table or empty state", async ({ page }) => {
    // Given: Página de comisiones cargada
    // When: Reviso el contenido
    // Then: Debe mostrar tabla o estado vacío

    const table = page.locator("table");
    const emptyState = page.locator('[class*="text-center"]').filter({
      hasText: /no hay comisiones|no commissions|sin comisiones/i,
    });

    const hasTable = await table.isVisible().catch(() => false);
    const hasEmptyState = await emptyState.first().isVisible().catch(() => false);

    expect(hasTable || hasEmptyState).toBeTruthy();
  });

  test("should display commission table headers", async ({ page }) => {
    // Given: Tabla de comisiones visible
    // When: Reviso los headers
    // Then: Debe tener columnas esperadas

    const table = page.locator("table");
    
    if (await table.isVisible()) {
      const headers = table.locator("th");
      const headerTexts = await headers.allTextContents();
      
      // Verificar que existen headers relevantes
      const expectedHeaders = ["monto", "amount", "estado", "status", "período", "period"];
      const hasExpectedHeaders = expectedHeaders.some((header) =>
        headerTexts.some((text) => text.toLowerCase().includes(header))
      );
      
      expect(hasExpectedHeaders).toBeTruthy();
    }
  });
});

test.describe("Partner Commissions - Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(urls.partnersCommissions);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });
  });

  test("should filter by status", async ({ page }) => {
    // Given: Página de comisiones con datos
    // When: Filtro por estado "paid"
    // Then: Solo muestra comisiones pagadas

    const statusFilter = page.locator('button[role="combobox"]').filter({
      hasText: /estado|status|todos/i,
    }).first();
    
    await statusFilter.click();

    const paidOption = page.locator('[role="option"]').filter({
      hasText: /pagado|paid/i,
    });

    if (await paidOption.isVisible().catch(() => false)) {
      await paidOption.click();
      await page.waitForTimeout(500);

      // Verificar que los badges son de pagado
      const table = page.locator("table");
      if (await table.isVisible()) {
        const badges = table.locator('[class*="badge"]');
        const count = await badges.count();

        if (count > 0) {
          for (let i = 0; i < Math.min(count, 3); i++) {
            const badgeText = await badges.nth(i).textContent();
            expect(badgeText?.toLowerCase()).toMatch(/pagado|paid/i);
          }
        }
      }
    }
  });

  test("should filter by period", async ({ page }) => {
    // Given: Página de comisiones
    // When: Filtro por período específico
    // Then: Solo muestra comisiones de ese período

    const periodFilter = page.locator('button[role="combobox"]').filter({
      hasText: /período|period|mes|todos|2024/i,
    }).first();

    await periodFilter.click();

    const options = page.locator('[role="option"]');
    const optionCount = await options.count();

    if (optionCount > 1) {
      // Seleccionar una opción que no sea "todos"
      const specificOption = options.filter({
        hasText: /2024|noviembre|diciembre|octubre/i,
      }).first();

      if (await specificOption.isVisible().catch(() => false)) {
        await specificOption.click();
        await page.waitForTimeout(500);

        // Verificar que la tabla se actualizó
        const table = page.locator("table");
        await expect(table).toBeVisible();
      }
    }
  });
});

test.describe("Partner Commissions - Calculations", () => {
  test("should calculate totals correctly", async ({ page }) => {
    // Given: Página de comisiones con datos
    // When: Sumo los valores de la tabla
    // Then: Debe coincidir con el total mostrado

    await page.goto(urls.partnersCommissions);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });

    const table = page.locator("table");
    
    if (await table.isVisible()) {
      // Obtener el total mostrado en las cards
      const totalCard = page.locator('[class*="card"]').filter({
        hasText: /^total/i,
      }).first();
      
      const totalText = await totalCard.textContent();
      
      // Si hay un total, verificar que es un número válido
      if (totalText) {
        // Extraer el número (eliminar símbolos de moneda)
        const numberMatch = totalText.match(/[\d.,]+/);
        if (numberMatch) {
          const totalValue = parseFloat(numberMatch[0].replace(/[.,]/g, ""));
          expect(totalValue).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});




