/**
 * Authentication Setup
 * Configura el estado de autenticación para los tests
 */

import { test as setup, expect } from "@playwright/test";
import { testPartner, urls } from "./fixtures/test-data";
import path from "path";

const authFile = path.join(__dirname, ".auth/partner.json");

setup("authenticate as partner", async ({ page }) => {
  // Navegar a login
  await page.goto(urls.login);
  
  // Esperar a que la página cargue
  await expect(page.locator("form")).toBeVisible();
  
  // Llenar credenciales
  await page.fill('input[name="email"], input[type="email"]', testPartner.email);
  await page.fill('input[name="password"], input[type="password"]', testPartner.password);
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Esperar redirección exitosa (dashboard o partners)
  await page.waitForURL(/\/(dashboard|partners)/, { timeout: 15000 });
  
  // Verificar que tenemos una sesión válida
  // El token debería estar en localStorage o cookies
  const token = await page.evaluate(() => {
    return localStorage.getItem("accessToken") || 
           localStorage.getItem("access_token") ||
           document.cookie.includes("token");
  });
  
  // Guardar estado de autenticación
  await page.context().storageState({ path: authFile });
});

setup.describe("authentication edge cases", () => {
  setup("should show error for invalid credentials", async ({ page }) => {
    await page.goto(urls.login);
    
    await page.fill('input[name="email"], input[type="email"]', "invalid@test.com");
    await page.fill('input[name="password"], input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    
    // Esperar mensaje de error
    await expect(page.locator('[role="alert"], .text-destructive, [data-sonner-toast]')).toBeVisible({
      timeout: 10000,
    });
  });
});




