/**
 * Helpers para tests E2E del portal cliente
 */

import { Page, expect } from "@playwright/test";

/**
 * Navega a una ruta protegida y verifica que el usuario está autenticado
 * @param page - Instancia de Playwright Page
 * @param url - URL a la que navegar
 * @param expectedPath - Path esperado (regex o string)
 * @throws Error si el usuario no está autenticado
 */
export async function navigateToProtectedRoute(
  page: Page,
  url: string,
  expectedPath: RegExp | string = url
): Promise<void> {
  await page.goto(url);
  
  // Esperar a que la navegación se complete
  await page.waitForLoadState("domcontentloaded");
  
  // Esperar a que la URL sea la esperada (esto detectará redirecciones)
  try {
    if (expectedPath instanceof RegExp) {
      await page.waitForURL(expectedPath, { timeout: 10000 });
    } else {
      await page.waitForURL(expectedPath, { timeout: 10000 });
    }
  } catch (error) {
    // Si falla, verificar si fuimos redirigidos a login
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw new Error(
        `Test falló: Usuario no autenticado. Redirigido a ${currentUrl}.\n` +
        `El storageState no se aplicó correctamente.\n` +
        `Verifica que el archivo tests/e2e/.auth/client.json existe y es válido.\n` +
        `Ejecuta: npm run test:e2e:client -- --project=setup-client`
      );
    }
    throw error;
  }
  
  // Verificar que NO estamos en login (doble verificación)
  const finalUrl = page.url();
  if (finalUrl.includes('/login')) {
    throw new Error(
      `Test falló: Usuario no autenticado. Redirigido a ${finalUrl}.\n` +
      `El storageState no se aplicó correctamente.\n` +
      `Verifica que el archivo tests/e2e/.auth/client.json existe y es válido.\n` +
      `Ejecuta: npm run test:e2e:client -- --project=setup-client`
    );
  }
  
  // Esperar a que la página cargue completamente (con timeout para evitar esperas largas)
  try {
    await page.waitForLoadState("networkidle", { timeout: 5000 });
  } catch {
    // Si networkidle tarda mucho, continuar de todas formas
    // La página ya debería estar cargada con domcontentloaded
  }
}
