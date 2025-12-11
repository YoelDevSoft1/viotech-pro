/**
 * Authentication Setup para Cliente
 * Configura el estado de autenticación para los tests del portal cliente
 */

import { test as setup, expect } from "@playwright/test";
import path from "path";

// Ruta relativa a la raíz del proyecto (tests/e2e/.auth/client.json)
// __dirname es tests/e2e/client, necesitamos subir un nivel
const authFile = path.join(__dirname, "..", ".auth", "client.json");

// Datos de test cliente
// IMPORTANTE: Las credenciales deben estar en variables de entorno
// No hardcodear credenciales en el código por seguridad
const testClient = {
  email: process.env.TEST_CLIENT_EMAIL,
  password: process.env.TEST_CLIENT_PASSWORD,
};

// Validar que las credenciales estén configuradas
if (!testClient.email || !testClient.password) {
  throw new Error(
    "TEST_CLIENT_EMAIL y TEST_CLIENT_PASSWORD deben estar configuradas en variables de entorno.\n" +
    "Crea un archivo .env.test o configura las variables en tu sistema."
  );
}

setup("authenticate as client", async ({ page }) => {
  // Navegar a login
  await page.goto("/login");
  
  // Esperar a que el botón "Iniciar Sesión" esté visible
  const loginButton = page.getByRole('button', { name: 'Iniciar Sesión', exact: true });
  await expect(loginButton).toBeVisible();
  
  // Encontrar el formulario que contiene el botón de login
  // Usar xpath para encontrar el ancestro form del botón
  let loginForm = loginButton.locator('xpath=ancestor::form').first();
  
  // Llenar credenciales - usar el input dentro del formulario de login
  const emailInput = loginForm.locator('input[type="email"], input[name="email"]').first();
  const passwordInput = loginForm.locator('input[type="password"], input[name="password"]').first();

  await expect(emailInput).toBeVisible();
  await emailInput.fill(testClient.email ?? "");
  await passwordInput.fill(testClient.password ?? "");

  // Asegurar que el checkbox "Recordar mi sesión" esté marcado
  // Esto hace que el token se guarde en localStorage en lugar de sessionStorage
  // Playwright storageState captura mejor localStorage que sessionStorage
  // El checkbox puede estar interceptado por otros elementos, usar JavaScript para hacer clic directamente
  const isChecked = await page.evaluate(() => {
    const checkbox = document.querySelector('input[type="checkbox"][name="remember"]') as HTMLInputElement;
    return checkbox ? checkbox.checked : false;
  });
  
  if (!isChecked) {
    // Usar JavaScript para hacer clic directamente en el checkbox, evitando elementos interceptados
    await page.evaluate(() => {
      const checkbox = document.querySelector('input[type="checkbox"][name="remember"]') as HTMLInputElement;
      if (checkbox && !checkbox.checked) {
        // Disparar el evento click directamente en el checkbox
        checkbox.click();
        // También disparar el evento change para asegurar que React detecte el cambio
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(300); // Dar tiempo a que se actualice el estado
  }
  
  // Intentar login con retry para manejar rate limiting (429)
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Si no es el primer intento, esperar antes de reintentar
      if (attempt > 1) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 2), 10000); // Backoff exponencial, max 10s
        console.log(`Reintentando login después de ${waitTime}ms (intento ${attempt}/${maxRetries})...`);
        await page.waitForTimeout(waitTime);
        
        // Recargar la página para limpiar el estado
        await page.goto("/login");
        await expect(loginButton).toBeVisible();
        
        // Re-llenar credenciales
        const retryForm = loginButton.locator('xpath=ancestor::form').first();
        const retryEmailInput = retryForm.locator('input[type="email"], input[name="email"]').first();
        const retryPasswordInput = retryForm.locator('input[type="password"], input[name="password"]').first();
        await retryEmailInput.fill(testClient.email ?? "");
        await retryPasswordInput.fill(testClient.password ?? "");
        
        // Asegurar que el checkbox "Recordar mi sesión" esté marcado también en el retry
        const retryIsChecked = await page.evaluate(() => {
          const checkbox = document.querySelector('input[type="checkbox"][name="remember"]') as HTMLInputElement;
          return checkbox ? checkbox.checked : false;
        });
        
        if (!retryIsChecked) {
          // Usar JavaScript para hacer clic directamente en el checkbox
          await page.evaluate(() => {
            const checkbox = document.querySelector('input[type="checkbox"][name="remember"]') as HTMLInputElement;
            if (checkbox && !checkbox.checked) {
              checkbox.click();
              checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            }
          });
          await page.waitForTimeout(300);
        }
        
        // Actualizar loginForm para el retry
        loginForm = retryForm;
      }
      
      // Submit - usar el botón dentro del formulario de login
      const submitButton = loginForm.locator('button[type="submit"]');
      
      // Esperar a que se complete la respuesta del login antes de verificar la redirección
      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) => resp.url().includes('/api/auth/login') || resp.url().includes('/api/login'),
          { timeout: 10000 }
        ).catch(() => null), // Si no hay respuesta de API, continuar
        submitButton.click(),
      ]);
      
      // Verificar si hay errores en la respuesta
      if (response && !response.ok()) {
        const errorBody = await response.text().catch(() => '');
        let errorData: { error?: string } = {};
        try {
          errorData = errorBody ? JSON.parse(errorBody) : {};
        } catch {
          errorData = { error: errorBody.substring(0, 200) };
        }
        
        // Si es rate limiting (429), reintentar
        if (response.status() === 429 && attempt < maxRetries) {
          lastError = new Error(
            `Rate limiting detectado (intento ${attempt}/${maxRetries}): ${errorData.error || 'Demasiadas solicitudes'}`
          );
          continue; // Reintentar
        }
        
        // Para otros errores o último intento, lanzar error
        throw new Error(
          `Login falló con status ${response.status()}. ` +
          `Respuesta: ${errorData.error || errorBody.substring(0, 200)}`
        );
      }
      
      // Si llegamos aquí, el login fue exitoso
      break;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // Si no es rate limiting, lanzar el error inmediatamente
      if (!lastError.message.includes('429') && !lastError.message.includes('Rate limiting')) {
        throw lastError;
      }
      // Si es el último intento y sigue siendo rate limiting, lanzar error
      if (attempt === maxRetries) {
        throw new Error(
          `Login falló después de ${maxRetries} intentos debido a rate limiting. ` +
          `Espera unos minutos y vuelve a intentar, o contacta al administrador para aumentar el límite de rate limiting en el backend.`
        );
      }
      // Continuar al siguiente intento solo si es rate limiting
    }
  }
  
  // Esperar redirección exitosa (dashboard o client)
  // Usar waitForLoadState para asegurar que la navegación se complete
  try {
    await page.waitForURL(/\/(dashboard|client)/, { timeout: 15000 });
  } catch (error) {
    // Si falla, verificar si hay mensajes de error en la página
    const errorMessage = await page.locator('text=/error|incorrecto|inválido/i').first().textContent().catch(() => null);
    if (errorMessage) {
      throw new Error(`Login falló: ${errorMessage}. URL actual: ${page.url()}`);
    }
    throw new Error(
      `No se redirigió después del login. URL actual: ${page.url()}. ` +
      `Verifica las credenciales: ${testClient.email}`
    );
  }
  
  // Verificar que tenemos una sesión válida
  // El token se guarda como "viotech_token" según lib/auth.ts
  // Esperar a que el token se guarde en localStorage (puede tomar un momento después de la redirección)
  let token: string | null = null;
  let refreshToken: string | null = null;
  let tokenLocation: 'localStorage' | 'sessionStorage' | null = null;
  let attempts = 0;
  const maxAttempts = 20; // Aumentar intentos porque puede tardar más
  
  while ((!token || !refreshToken) && attempts < maxAttempts) {
    await page.waitForTimeout(500); // Esperar 500ms entre intentos
    const storageInfo = await page.evaluate(() => {
      const localToken = localStorage.getItem("viotech_token");
      const sessionToken = sessionStorage.getItem("viotech_token");
      const localRefresh = localStorage.getItem("viotech_refresh_token");
      const sessionRefresh = sessionStorage.getItem("viotech_refresh_token");
      
      return {
        token: localToken || sessionToken,
        refreshToken: localRefresh || sessionRefresh,
        location: localToken ? 'localStorage' : (sessionToken ? 'sessionStorage' : null),
      };
    });
    
    token = storageInfo.token;
    refreshToken = storageInfo.refreshToken;
    tokenLocation = storageInfo.location as 'localStorage' | 'sessionStorage' | null;
    attempts++;
  }
  
  if (!token || !refreshToken) {
    // Debug: ver qué hay en ambos storages
    const storageContent = await page.evaluate(() => {
      const local: Record<string, string> = {};
      const session: Record<string, string> = {};
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) local[key] = localStorage.getItem(key) || '';
      }
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) session[key] = sessionStorage.getItem(key) || '';
      }
      
      return { localStorage: local, sessionStorage: session };
    });
    
    throw new Error(
      `No se encontró token después del login después de ${maxAttempts} intentos.\n` +
      `URL actual: ${page.url()}\n` +
      `Token encontrado: ${token ? 'Sí' : 'No'}\n` +
      `RefreshToken encontrado: ${refreshToken ? 'Sí' : 'No'}\n` +
      `Contenido de storages: ${JSON.stringify(storageContent, null, 2)}\n` +
      `Verifica que el login fue exitoso y que saveTokens() se ejecutó correctamente.`
    );
  }
  
  // Si el token está en sessionStorage, moverlo a localStorage para que storageState lo capture
  // Playwright storageState captura ambos, pero es mejor asegurarnos
  if (tokenLocation === 'sessionStorage') {
    await page.evaluate(({ token, refreshToken }) => {
      // Mover de sessionStorage a localStorage
      localStorage.setItem("viotech_token", token!);
      localStorage.setItem("viotech_refresh_token", refreshToken!);
      // Mantener también en sessionStorage por si acaso
    }, { token, refreshToken });
    await page.waitForTimeout(500);
  }
  
  // Verificar una vez más que el token está en localStorage antes de guardar
  const finalCheck = await page.evaluate(() => {
    return {
      token: localStorage.getItem("viotech_token"),
      refreshToken: localStorage.getItem("viotech_refresh_token"),
      allLocalStorage: Object.fromEntries(
        Array.from({ length: localStorage.length }, (_, i) => {
          const key = localStorage.key(i);
          return [key, localStorage.getItem(key || '')];
        }).filter(([key]) => key) as [string, string][]
      ),
    };
  });
  
  if (!finalCheck.token || !finalCheck.refreshToken) {
    throw new Error(
      `Token no está en localStorage antes de guardar storageState.\n` +
      `Contenido de localStorage: ${JSON.stringify(finalCheck.allLocalStorage, null, 2)}\n` +
      `Token: ${finalCheck.token ? 'Sí' : 'No'}\n` +
      `RefreshToken: ${finalCheck.refreshToken ? 'Sí' : 'No'}`
    );
  }
  
  // Esperar un momento adicional para asegurar que todo se haya guardado
  await page.waitForTimeout(1000);
  
  // Guardar estado de autenticación
  // Esto guardará cookies, localStorage y sessionStorage
  await page.context().storageState({ path: authFile });
  
  // Verificar que el archivo se guardó correctamente con el token
  const fs = require('fs');
  const savedState = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
  
  // Buscar el token en localStorage o sessionStorage de cualquier origin
  const hasToken = savedState.origins?.some((origin: any) => {
    const localToken = origin.localStorage?.some((item: any) => item.name === 'viotech_token');
    const sessionToken = origin.sessionStorage?.some((item: any) => item.name === 'viotech_token');
    return localToken || sessionToken;
  });
  
  if (!hasToken) {
    // Debug adicional: verificar qué hay realmente en el archivo
    const tokenItems = savedState.origins?.flatMap((origin: any) => [
      ...(origin.localStorage || []).map((item: any) => `localStorage.${item.name}`),
      ...(origin.sessionStorage || []).map((item: any) => `sessionStorage.${item.name}`),
    ]) || [];
    
    throw new Error(
      `El storageState se guardó pero no contiene el token viotech_token.\n` +
      `Token encontrado antes de guardar: ${token ? 'Sí' : 'No'}\n` +
      `Ubicación del token: ${tokenLocation}\n` +
      `Items en storageState: ${tokenItems.join(', ')}\n` +
      `Contenido guardado: ${JSON.stringify(savedState, null, 2)}\n` +
      `Verifica que el token se guardó correctamente en localStorage antes de guardar el estado.`
    );
  }
  
  console.log(`✓ Token guardado correctamente en storageState. Ubicación: ${tokenLocation}`);
});
