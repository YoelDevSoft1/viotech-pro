/**
 * Cliente Tickets E2E Tests
 * Tests para el módulo de tickets según validaciones C2.2
 */

import { test, expect } from "@playwright/test";
import { navigateToProtectedRoute } from "./helpers";

test.describe("Cliente Tickets - E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Usar estado de autenticación guardado
    // No navegar aquí, dejar que cada test navegue cuando lo necesite
    // para poder verificar la URL correctamente
  });

  test("TC-C2.2.4: Crear ticket completo exitosamente", async ({ page }) => {
    // Given: Usuario autenticado
    // When: Navega a tickets y crea uno nuevo
    await navigateToProtectedRoute(page, "/client/tickets", /\/client\/tickets/);
    
    // Verificar que la página cargó correctamente
    // Buscar elementos específicos de la página de tickets que solo aparecen cuando está cargada
    // El componente TicketsPanel tiene "Gestión de Tickets" como texto visible
    await expect(
      page.locator('text=/Gestión de Tickets/i').first()
    ).toBeVisible({ timeout: 10000 });
    
    // Abrir modal de crear ticket
    // El botón está en TicketsPanel con texto "Nuevo Ticket" e icono Plus
    const createButton = page.getByRole('button', { name: /nuevo ticket/i }).first();
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();
    
    // Esperar a que el modal se abra
    await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 5000 });

    // Completar formulario válido
    // Esperar a que el modal esté completamente cargado
    await page.waitForTimeout(500);
    
    const tituloInput = page.locator('input[name="titulo"], input[placeholder*="asunto" i]').first();
    await expect(tituloInput).toBeVisible({ timeout: 5000 });
    await tituloInput.fill("Problema con login - Test E2E");
    
    const descripcionInput = page.locator('textarea[name="descripcion"]').first();
    await descripcionInput.fill("Descripción detallada del problema para testing");
    
    // Seleccionar prioridad (puede ser un Select de Radix UI)
    const prioridadSelect = page.locator('button:has-text("Prioridad"), select[name="prioridad"]').first();
    if (await prioridadSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await prioridadSelect.click();
      await page.locator('text=/media|medium/i').first().click({ timeout: 3000 });
    }

    // Enviar formulario
    const submitButton = page.getByRole('button', { name: /crear|enviar/i }).first();
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await submitButton.click();

    // Then: Debe mostrar toast de éxito
    await expect(page.locator('text=/ticket.*creado|success|éxito/i')).toBeVisible({ timeout: 10000 });

    // And: Ticket debe aparecer en lista
    // Usar .first() para evitar strict mode violation (puede aparecer en múltiples lugares)
    await expect(page.locator('text=/Problema con login/i').first()).toBeVisible({ timeout: 10000 });
  });

  test("TC-C2.2.1: Validación de asunto mínimo 5 caracteres", async ({ page }) => {
    // Given: Modal de crear ticket abierto
    await navigateToProtectedRoute(page, "/client/tickets", /\/client\/tickets/);
    // Verificar que la página cargó correctamente
    await expect(page.locator('text=/Gestión de Tickets/i').first()).toBeVisible({ timeout: 10000 });
    
    const createButton = page.getByRole('button', { name: /nuevo ticket/i }).first();
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();
    
    // Esperar a que el modal se abra
    await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 5000 });

    // When: Usuario ingresa asunto de 3 caracteres
    const tituloInput = page.locator('input[name="titulo"]').first();
    await expect(tituloInput).toBeVisible({ timeout: 5000 });
    await tituloInput.fill("abc");
    await tituloInput.blur();
    await page.waitForTimeout(300);

    // Intentar hacer submit para activar la validación
    // React Hook Form valida en onSubmit por defecto
    const submitButton = page.getByRole('button', { name: /crear/i }).first();
    
    // Hacer click en el botón para activar validación (puede estar deshabilitado, pero el click activa la validación)
    await page.evaluate(() => {
      const button = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (button) {
        // Disparar el evento submit del formulario para activar validación
        const form = button.closest('form');
        if (form) {
          form.requestSubmit();
        }
      }
    });
    
    await page.waitForTimeout(1000); // Dar tiempo a que se ejecute la validación

    // Then: Debe mostrar error
    // Buscar el mensaje usando el selector específico de FormMessage
    // FormMessage se renderiza como <p data-slot="form-message" class="text-destructive text-sm">
    const errorMessage = page.locator('[data-slot="form-message"]').filter({ 
      hasText: /asunto|5|caracteres/i 
    }).first();
    
    // También buscar por el texto completo del mensaje
    await expect(
      errorMessage.or(page.locator('text=/asunto.*al menos 5|debe tener.*5 caracteres|El asunto debe tener al menos 5 caracteres/i').first())
    ).toBeVisible({ timeout: 5000 });

    // And: Botón crear debe estar deshabilitado
    await expect(submitButton).toBeDisabled();
  });

  test("TC-C2.2.1: Validación de asunto máximo 200 caracteres", async ({ page }) => {
    // Given: Modal de crear ticket abierto
    await navigateToProtectedRoute(page, "/client/tickets", /\/client\/tickets/);
    // Verificar que la página cargó correctamente
    await expect(page.locator('text=/Gestión de Tickets/i').first()).toBeVisible({ timeout: 10000 });
    
    const createButton = page.getByRole('button', { name: /nuevo ticket/i }).first();
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();

    // When: Usuario ingresa asunto de 201 caracteres
    const tituloInput = page.locator('input[name="titulo"]').first();
    await expect(tituloInput).toBeVisible({ timeout: 5000 });
    const longText = "a".repeat(201);
    await tituloInput.fill(longText);
    await tituloInput.blur();
    await page.waitForTimeout(300);
    
    // Intentar hacer submit para activar la validación
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    });
    await page.waitForTimeout(1000);

    // Then: Debe mostrar error
    // Buscar usando el selector específico de FormMessage
    const errorMessage = page.locator('[data-slot="form-message"]').filter({ 
      hasText: /asunto|200|exceder|caracteres/i 
    }).first();
    
    await expect(
      errorMessage.or(page.locator('text=/asunto.*no puede exceder 200|no puede exceder.*200 caracteres|El asunto no puede exceder 200 caracteres/i').first())
    ).toBeVisible({ timeout: 5000 });
  });

  test("TC-C2.2.3: Manejo de error 400 con mensaje específico", async ({ page }) => {
    // Given: Backend responde 400
    await page.route("**/api/tickets", (route) => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({
          error: "El asunto debe tener entre 5 y 200 caracteres",
        }),
      });
    });

    await navigateToProtectedRoute(page, "/client/tickets", /\/client\/tickets/);
    // Verificar que la página cargó correctamente
    await expect(page.locator('text=/Gestión de Tickets/i').first()).toBeVisible({ timeout: 10000 });
    
    const createButton = page.getByRole('button', { name: /nuevo ticket/i }).first();
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();
    
    const tituloInput = page.locator('input[name="titulo"]').first();
    await expect(tituloInput).toBeVisible({ timeout: 5000 });
    await tituloInput.fill("Test");
    
    const submitButton = page.getByRole('button', { name: /crear/i }).first();
    await submitButton.click();

    // Then: Debe mostrar mensaje específico
    // El mensaje puede aparecer en un toast (sonner) o en el FormMessage
    // Buscar en toast primero, luego en FormMessage
    await expect(
      page.locator('[data-slot="form-message"]').filter({ 
        hasText: /asunto|5|200|caracteres/i 
      }).or(
        page.locator('text=/asunto.*5.*200|entre 5 y 200|formato no válido|Faltan campos|El asunto debe tener entre 5 y 200 caracteres/i')
      ).first()
    ).toBeVisible({ timeout: 5000 });
    
    // And: No debe mostrar stacktrace
    await expect(page.locator('text=/PrismaError|Error code|stack/i')).not.toBeVisible();
  });

  test("TC-C2.2.3: Manejo de error 500 con mensaje genérico", async ({ page }) => {
    // Given: Backend responde 500
    await page.route("**/api/tickets", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({
          error: "Internal server error",
        }),
      });
    });

    await navigateToProtectedRoute(page, "/client/tickets", /\/client\/tickets/);
    // Verificar que la página cargó correctamente
    await expect(page.locator('text=/Gestión de Tickets/i').first()).toBeVisible({ timeout: 10000 });
    
    const createButton = page.getByRole('button', { name: /nuevo ticket/i }).first();
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();
    
    const tituloInput = page.locator('input[name="titulo"]').first();
    await expect(tituloInput).toBeVisible({ timeout: 5000 });
    await tituloInput.fill("Test válido de ticket");
    
    const submitButton = page.getByRole('button', { name: /crear/i }).first();
    await submitButton.click();

    // Then: Debe mostrar mensaje genérico
    await expect(page.locator('text=/error del servidor|intenta de nuevo|servidor/i')).toBeVisible({ timeout: 5000 });
    
    // And: No debe mostrar stacktrace
    await expect(page.locator('text=/PrismaError|Error code|at |stack/i')).not.toBeVisible();
  });
});
