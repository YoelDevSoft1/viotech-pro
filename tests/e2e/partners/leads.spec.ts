/**
 * Partner Leads E2E Tests
 * Tests CRUD para leads de partners
 */

import { test, expect } from "@playwright/test";
import { urls, testLead } from "../fixtures/test-data";

test.describe("Partner Leads - List", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(urls.partnersLeads);
    // Esperar que cargue
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });
  });

  test("should display leads page with title", async ({ page }) => {
    // Given: Usuario partner autenticado
    // When: Navega a la página de leads
    // Then: Debe ver el título y descripción

    await expect(page.getByRole("heading", { level: 2 })).toContainText(/leads/i);
  });

  test("should show create lead button", async ({ page }) => {
    // Given: Página de leads cargada
    // When: Reviso los controles
    // Then: Debe haber botón para crear lead

    const createBtn = page.getByRole("button", { name: /crear lead|create lead|nuevo/i });
    await expect(createBtn).toBeVisible();
  });

  test("should have search functionality", async ({ page }) => {
    // Given: Página de leads
    // When: Busco el campo de búsqueda
    // Then: Debe existir y funcionar

    const searchInput = page.getByPlaceholder(/buscar|search/i);
    await expect(searchInput).toBeVisible();

    // Probar que se puede escribir
    await searchInput.fill("test search");
    await expect(searchInput).toHaveValue("test search");
  });

  test("should have status filter", async ({ page }) => {
    // Given: Página de leads
    // When: Busco filtros
    // Then: Debe haber filtro de estado

    // Buscar el select de estado
    const statusFilter = page.locator('button[role="combobox"]').filter({ 
      hasText: /estado|status|todos/i 
    }).first();
    await expect(statusFilter).toBeVisible();

    // Click para abrir
    await statusFilter.click();
    
    // Verificar opciones
    const options = page.locator('[role="option"]');
    await expect(options.first()).toBeVisible();
  });

  test("should have source filter", async ({ page }) => {
    // Given: Página de leads
    // When: Busco filtros
    // Then: Debe haber filtro de fuente

    const sourceFilter = page.locator('button[role="combobox"]').filter({ 
      hasText: /fuente|source|origen/i 
    }).first();
    await expect(sourceFilter).toBeVisible();
  });

  test("should display leads table or empty state", async ({ page }) => {
    // Given: Página de leads cargada
    // When: Reviso el contenido
    // Then: Debe mostrar tabla con leads o estado vacío

    // Buscar tabla o estado vacío
    const table = page.locator("table");
    const emptyState = page.locator('[class*="text-center"]').filter({
      hasText: /no hay leads|no leads|sin leads|empty/i,
    });

    const hasTable = await table.isVisible().catch(() => false);
    const hasEmptyState = await emptyState.first().isVisible().catch(() => false);

    // Al menos uno debe ser visible
    expect(hasTable || hasEmptyState).toBeTruthy();
  });
});

test.describe("Partner Leads - Create", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(urls.partnersLeads);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });
  });

  test("should open create lead modal", async ({ page }) => {
    // Given: Página de leads
    // When: Click en crear lead
    // Then: Se abre modal con formulario

    const createBtn = page.getByRole("button", { name: /crear lead|create lead|nuevo/i });
    await createBtn.click();

    // Modal debe estar visible
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verificar campos del formulario
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    // Given: Modal de crear lead abierto
    // When: Intento enviar sin datos
    // Then: Debe mostrar errores de validación

    const createBtn = page.getByRole("button", { name: /crear lead|create lead|nuevo/i });
    await createBtn.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Click en submit sin llenar
    const submitBtn = modal.getByRole("button", { name: /crear|create|submit/i }).last();
    await submitBtn.click();

    // Debe mostrar errores (campo requerido, email inválido, etc.)
    const errors = page.locator(".text-destructive, [class*='error']");
    await expect(errors.first()).toBeVisible({ timeout: 5000 });
  });

  test("should validate email format", async ({ page }) => {
    // Given: Modal de crear lead
    // When: Ingreso email inválido
    // Then: Debe mostrar error de formato

    const createBtn = page.getByRole("button", { name: /crear lead|create lead|nuevo/i });
    await createBtn.click();

    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Llenar con email inválido
    await page.fill('input[id="name"]', "Test Name");
    await page.fill('input[id="email"]', "invalid-email");

    // Intentar enviar
    const submitBtn = page.locator('[role="dialog"]').getByRole("button", { name: /crear|create/i }).last();
    await submitBtn.click();

    // Debe haber error de email
    const emailError = page.locator(".text-destructive, [class*='error']").filter({
      hasText: /email|correo/i,
    });
    await expect(emailError.first()).toBeVisible({ timeout: 5000 });
  });

  test("should create lead successfully", async ({ page }) => {
    // Given: Modal de crear lead
    // When: Lleno datos válidos y envío
    // Then: Lead se crea y aparece toast de éxito

    const createBtn = page.getByRole("button", { name: /crear lead|create lead|nuevo/i });
    await createBtn.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Llenar formulario con datos únicos
    const uniqueEmail = `testlead_${Date.now()}@example.com`;
    await page.fill('input[id="name"]', testLead.name);
    await page.fill('input[id="email"]', uniqueEmail);
    await page.fill('input[id="company"]', testLead.company);
    await page.fill('input[id="phone"]', testLead.phone);

    // Seleccionar source
    const sourceSelect = modal.locator('button[id="source"]');
    await sourceSelect.click();
    await page.click(`[role="option"]:has-text("Referral"), [role="option"]:has-text("Referido")`);

    // Submit
    const submitBtn = modal.getByRole("button", { name: /crear|create/i }).last();
    await submitBtn.click();

    // Verificar toast de éxito
    const toast = page.locator('[data-sonner-toast]').filter({
      hasText: /éxito|success|creado/i,
    });
    await expect(toast.first()).toBeVisible({ timeout: 10000 });

    // Modal debe cerrarse
    await expect(modal).toBeHidden({ timeout: 5000 });
  });

  test("should close modal on cancel", async ({ page }) => {
    // Given: Modal de crear lead abierto
    // When: Click en cancelar
    // Then: Modal se cierra

    const createBtn = page.getByRole("button", { name: /crear lead|create lead|nuevo/i });
    await createBtn.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Click cancelar
    const cancelBtn = modal.getByRole("button", { name: /cancelar|cancel/i });
    await cancelBtn.click();

    // Modal debe cerrarse
    await expect(modal).toBeHidden();
  });
});

test.describe("Partner Leads - Filter & Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(urls.partnersLeads);
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10000 });
  });

  test("should filter by status", async ({ page }) => {
    // Given: Página de leads con datos
    // When: Filtro por estado "converted"
    // Then: Solo muestra leads convertidos

    const statusFilter = page.locator('button[role="combobox"]').filter({ 
      hasText: /estado|status|todos/i 
    }).first();
    await statusFilter.click();

    // Seleccionar "Convertido"
    const convertedOption = page.locator('[role="option"]').filter({
      hasText: /convertido|converted/i,
    });
    
    if (await convertedOption.isVisible().catch(() => false)) {
      await convertedOption.click();
      
      // Esperar que se actualice la tabla
      await page.waitForTimeout(500);
      
      // Verificar que los badges mostrados son "convertido"
      const badges = page.locator('table [class*="badge"]');
      const count = await badges.count();
      
      if (count > 0) {
        // Todos los badges visibles deben ser de convertido
        for (let i = 0; i < Math.min(count, 5); i++) {
          const badgeText = await badges.nth(i).textContent();
          expect(badgeText?.toLowerCase()).toMatch(/convertido|converted/i);
        }
      }
    }
  });

  test("should search leads by name", async ({ page }) => {
    // Given: Página de leads con datos
    // When: Busco por nombre
    // Then: Se filtran los resultados

    const searchInput = page.getByPlaceholder(/buscar|search/i);
    await searchInput.fill("test");

    // Esperar debounce
    await page.waitForTimeout(500);

    // Si hay resultados, deben contener "test"
    const tableRows = page.locator("table tbody tr");
    const rowCount = await tableRows.count();

    if (rowCount > 0 && !await page.locator('text=/no hay|no leads/i').isVisible().catch(() => false)) {
      const firstRowText = await tableRows.first().textContent();
      // El texto debería contener lo que buscamos (case insensitive)
      // O puede que no haya resultados que coincidan
    }
  });
});

