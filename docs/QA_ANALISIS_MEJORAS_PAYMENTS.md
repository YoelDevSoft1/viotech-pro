# Análisis QA: Mejoras en Página de Pagos

**Fecha:** 2025-01-XX  
**Módulo:** `app/(client)/client/payments/page.tsx`  
**Tipo de Cambio:** Refactorización de traducciones + Mejoras de robustez

---

## 1. RIESGOS Y ALCANCE DE PRUEBAS

### 🔴 Riesgos Críticos

1. **Traducciones faltantes o mal configuradas**
   - **Riesgo:** Si `client.services.backToDashboard` no existe en `messages/*.json`, se mostrará la clave en lugar del texto
   - **Impacto:** UX degradada, texto sin traducir visible al usuario
   - **Probabilidad:** Media (verificado: la clave no existe en `messages/es.json`)

2. **Formato inesperado de respuesta API**
   - **Riesgo:** Si `/services/catalog` devuelve `null`, objeto vacío `{}`, o estructura anidada inesperada
   - **Impacto:** Error de renderizado, página en blanco, o crash de React
   - **Probabilidad:** Baja (pero el código ya tiene defensas)

### 🟡 Riesgos Altos

3. **Validación de tipos en runtime**
   - **Riesgo:** Uso de `any` en `rawData` puede ocultar errores de tipo
   - **Impacto:** Errores silenciosos, comportamiento impredecible
   - **Probabilidad:** Baja (TypeScript debería prevenir, pero runtime puede variar)

4. **Regresión en otros componentes**
   - **Riesgo:** Cambio de patrón de traducciones (`useTranslationsSafe()` sin namespace → con namespace) puede romper otros 103 archivos que usan el hook
   - **Impacto:** Múltiples páginas con traducciones rotas
   - **Probabilidad:** Media (requiere verificación exhaustiva)

### 🟢 Riesgos Medios

5. **Performance en validaciones repetidas**
   - **Riesgo:** `Array.isArray(catalog)` se ejecuta múltiples veces en el render
   - **Impacto:** Overhead mínimo, pero acumulativo en renders frecuentes
   - **Probabilidad:** Muy baja

6. **Manejo de errores de red**
   - **Riesgo:** Si la API falla, el componente muestra array vacío sin feedback claro
   - **Impacto:** Usuario no sabe si hay error o simplemente no hay servicios
   - **Probabilidad:** Media

---

## 2. MATRIZ DE PRUEBAS

| Módulo/Feature | Tipo de Prueba | Herramienta | Prioridad | Estado |
|----------------|----------------|-------------|-----------|--------|
| **Traducciones** | Unit | Vitest + React Testing Library | 🔴 Crítica | Pendiente |
| Validación de namespace `client.services` | Unit | Vitest | 🔴 Crítica | Pendiente |
| Validación de namespace `sidebar` | Unit | Vitest | 🔴 Crítica | Pendiente |
| **Carga de catálogo** | Integration | Vitest + MSW | 🟡 Alta | Pendiente |
| Respuesta API con `data.data` (anidado) | Integration | Vitest + MSW | 🟡 Alta | Pendiente |
| Respuesta API con `data` directo (array) | Integration | Vitest + MSW | 🟡 Alta | Pendiente |
| Respuesta API con `null` o `{}` | Integration | Vitest + MSW | 🟡 Alta | Pendiente |
| Error de red (timeout, 500, 503) | Integration | Vitest + MSW | 🟡 Alta | Pendiente |
| **Validaciones de array** | Unit | Vitest | 🟡 Alta | Pendiente |
| `Array.isArray()` antes de `.find()` | Unit | Vitest | 🟡 Alta | Pendiente |
| `Array.isArray()` antes de `.map()` | Unit | Vitest | 🟡 Alta | Pendiente |
| **Flujo de renovación** | E2E | Playwright | 🟡 Alta | Pendiente |
| Botón "Renovar" con catálogo vacío | E2E | Playwright | 🟡 Alta | Pendiente |
| Botón "Renovar Ahora" con servicio expirado | E2E | Playwright | 🟡 Alta | Pendiente |
| **Regresión de traducciones** | Integration | Vitest + Script de verificación | 🟡 Alta | Pendiente |
| Verificar que otros 103 archivos no se rompan | Integration | Script custom | 🟡 Alta | Pendiente |
| **UX y feedback** | E2E | Playwright | 🟢 Media | Pendiente |
| Mensaje cuando catálogo está vacío | E2E | Playwright | 🟢 Media | Pendiente |
| Loading state durante carga | E2E | Playwright | 🟢 Media | Pendiente |

---

## 3. CASOS DE PRUEBA CLAVE (Given/When/Then)

### CP-001: Traducción de "backToDashboard" con namespace correcto

**Given:** El usuario está en la página de pagos (`/client/payments`)  
**And:** El locale está configurado en `es`  
**And:** Existe la clave `client.services.backToDashboard` en `messages/es.json`  
**When:** El componente se renderiza  
**Then:** El botón "Volver al Dashboard" muestra el texto traducido  
**And:** No se muestra la clave sin traducir (ej: `client.services.backToDashboard`)

---

### CP-002: Carga de catálogo con respuesta anidada (`data.data`)

**Given:** El usuario está autenticado  
**And:** La API `/services/catalog` devuelve `{ data: { data: [...] } }`  
**When:** El componente carga el catálogo  
**Then:** El estado `catalog` contiene un array válido  
**And:** Los servicios se renderizan correctamente en el grid

---

### CP-003: Carga de catálogo con respuesta directa (array)

**Given:** El usuario está autenticado  
**And:** La API `/services/catalog` devuelve directamente un array `[...]`  
**When:** El componente carga el catálogo  
**Then:** El estado `catalog` contiene el array recibido  
**And:** Los servicios se renderizan correctamente

---

### CP-004: Manejo de respuesta API inválida (null/objeto)

**Given:** El usuario está autenticado  
**And:** La API `/services/catalog` devuelve `null` o `{}`  
**When:** El componente intenta cargar el catálogo  
**Then:** Se muestra un `console.warn` con el mensaje de advertencia  
**And:** El estado `catalog` se establece como array vacío `[]`  
**And:** Se muestra el mensaje "No hay servicios disponibles en el catálogo"

---

### CP-005: Error de red durante carga de catálogo

**Given:** El usuario está autenticado  
**And:** La API `/services/catalog` retorna error 500 o timeout  
**When:** El componente intenta cargar el catálogo  
**Then:** El error se captura en el `catch`  
**And:** El estado `catalog` se establece como array vacío `[]`  
**And:** Se muestra el mensaje "No hay servicios disponibles en el catálogo"  
**And:** No se produce un crash de React

---

### CP-006: Renovación de servicio con catálogo válido

**Given:** El usuario tiene un servicio expirado  
**And:** El catálogo contiene un plan con `nombre` coincidente  
**When:** El usuario hace clic en "Renovar"  
**Then:** Se abre el modal `CheckoutModal`  
**And:** El plan seleccionado coincide con el servicio expirado

---

### CP-007: Renovación de servicio con catálogo vacío

**Given:** El usuario tiene un servicio expirado  
**And:** El catálogo está vacío o no contiene el plan  
**When:** El usuario hace clic en "Renovar"  
**Then:** No se abre el modal de checkout  
**And:** No se produce un error en consola

---

### CP-008: Validación de array antes de métodos de array

**Given:** El estado `catalog` es `null` o `undefined` (caso edge)  
**When:** El componente intenta ejecutar `catalog.find()` o `catalog.map()`  
**Then:** Se valida con `Array.isArray(catalog)` primero  
**And:** No se produce un `TypeError: catalog.find is not a function`

---

### CP-009: Regresión en otros componentes que usan traducciones

**Given:** Existen 103 archivos que usan `useTranslationsSafe()`  
**And:** Algunos usan el patrón antiguo (sin namespace)  
**When:** Se despliega el cambio a producción  
**Then:** Todos los componentes renderizan correctamente  
**And:** No se muestran claves sin traducir en ninguna página

---

## 4. EJEMPLOS DE TESTS AUTOMATIZADOS

### Test Unitario: Validación de traducciones

```typescript
// __tests__/client/payments/page.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ClientPaymentsPage from '@/app/(client)/client/payments/page';
import { LocaleProvider } from '@/lib/contexts/LocaleContext';

// Mock de hooks y dependencias
vi.mock('@/lib/hooks/useServices', () => ({
  useServices: () => ({
    services: [],
    loading: false,
    error: null,
  }),
}));

vi.mock('@/lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('ClientPaymentsPage - Traducciones', () => {
  it('debe mostrar texto traducido para "backToDashboard"', async () => {
    const { apiClient } = await import('@/lib/apiClient');
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { data: [] },
    });

    render(
      <LocaleProvider locale="es">
        <ClientPaymentsPage />
      </LocaleProvider>
    );

    // Verificar que existe la traducción
    const backButton = screen.getByRole('link', { name: /volver al/i });
    expect(backButton).toBeInTheDocument();
    
    // Verificar que NO se muestra la clave sin traducir
    expect(screen.queryByText('client.services.backToDashboard')).not.toBeInTheDocument();
  });

  it('debe mostrar texto traducido para "payments" en sidebar', async () => {
    const { apiClient } = await import('@/lib/apiClient');
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { data: [] },
    });

    render(
      <LocaleProvider locale="es">
        <ClientPaymentsPage />
      </LocaleProvider>
    );

    const title = screen.getByRole('heading', { name: /pagos/i });
    expect(title).toBeInTheDocument();
  });
});
```

---

### Test de Integración: Carga de catálogo con diferentes formatos

```typescript
// __tests__/client/payments/catalog-loading.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import ClientPaymentsPage from '@/app/(client)/client/payments/page';
import { apiClient } from '@/lib/apiClient';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ClientPaymentsPage - Carga de Catálogo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe manejar respuesta anidada (data.data)', async () => {
    server.use(
      http.get('*/api/services/catalog', () => {
        return HttpResponse.json({
          data: {
            data: [
              { id: '1', nombre: 'Plan Básico', precio: 100 },
            ],
          },
        });
      })
    );

    render(<ClientPaymentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Plan Básico')).toBeInTheDocument();
    });

    // Verificar que catalog es un array
    const cards = screen.getAllByText(/plan básico/i);
    expect(cards.length).toBeGreaterThan(0);
  });

  it('debe manejar respuesta directa (array)', async () => {
    server.use(
      http.get('*/api/services/catalog', () => {
        return HttpResponse.json([
          { id: '1', nombre: 'Plan Premium', precio: 200 },
        ]);
      })
    );

    render(<ClientPaymentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Plan Premium')).toBeInTheDocument();
    });
  });

  it('debe manejar respuesta null y establecer array vacío', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    server.use(
      http.get('*/api/services/catalog', () => {
        return HttpResponse.json(null);
      })
    );

    render(<ClientPaymentsPage />);

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Catálogo de servicios no es un array')
      );
    });

    expect(screen.getByText(/no hay servicios disponibles/i)).toBeInTheDocument();
    consoleWarnSpy.mockRestore();
  });

  it('debe manejar respuesta objeto vacío {}', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    server.use(
      http.get('*/api/services/catalog', () => {
        return HttpResponse.json({});
      })
    );

    render(<ClientPaymentsPage />);

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    expect(screen.getByText(/no hay servicios disponibles/i)).toBeInTheDocument();
    consoleWarnSpy.mockRestore();
  });

  it('debe manejar error de red y establecer array vacío', async () => {
    server.use(
      http.get('*/api/services/catalog', () => {
        return HttpResponse.error();
      })
    );

    render(<ClientPaymentsPage />);

    await waitFor(() => {
      expect(screen.getByText(/no hay servicios disponibles/i)).toBeInTheDocument();
    });
  });
});
```

---

### Test Unitario: Validaciones de array

```typescript
// __tests__/client/payments/array-validation.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ClientPaymentsPage from '@/app/(client)/client/payments/page';

describe('ClientPaymentsPage - Validaciones de Array', () => {
  it('no debe fallar si catalog es null al usar .find()', async () => {
    const { apiClient } = await import('@/lib/apiClient');
    vi.mocked(apiClient.get).mockResolvedValue({
      data: null,
    });

    // Mock de servicios con uno expirado
    vi.mock('@/lib/hooks/useServices', () => ({
      useServices: () => ({
        services: [
          {
            id: '1',
            nombre: 'Plan Test',
            estado: 'expirado',
            fecha_expiracion: '2020-01-01',
          },
        ],
        loading: false,
        error: null,
      }),
    }));

    render(<ClientPaymentsPage />);

    // Verificar que el botón de renovar existe pero no causa error
    const renovarButton = screen.queryByRole('button', { name: /renovar/i });
    // El botón puede no aparecer si no hay plan en catálogo, pero no debe haber error
    expect(() => render(<ClientPaymentsPage />)).not.toThrow();
  });

  it('debe validar Array.isArray antes de .map()', async () => {
    const { apiClient } = await import('@/lib/apiClient');
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { data: 'not-an-array' }, // Simular respuesta inválida
    });

    render(<ClientPaymentsPage />);

    // No debe haber error de renderizado
    expect(screen.getByText(/no hay servicios disponibles/i)).toBeInTheDocument();
  });
});
```

---

### Test E2E: Flujo de renovación

```typescript
// e2e/client/payments.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Página de Pagos - Renovación de Servicios', () => {
  test.beforeEach(async ({ page }) => {
    // Login y navegación a página de pagos
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await page.goto('/client/payments');
  });

  test('debe abrir modal de checkout al hacer clic en Renovar', async ({ page }) => {
    // Mock de API responses
    await page.route('**/api/services/catalog', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [
            {
              id: '1',
              nombre: 'Plan Básico',
              precio: 100,
              currency: 'COP',
            },
          ],
        }),
      });
    });

    await page.route('**/api/services', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '1',
            nombre: 'Plan Básico',
            estado: 'expirado',
            fecha_expiracion: '2020-01-01',
          },
        ]),
      });
    });

    await page.waitForSelector('text=Renovar');

    // Hacer clic en botón Renovar
    await page.click('button:has-text("Renovar")');

    // Verificar que se abre el modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Plan Básico')).toBeVisible();
  });

  test('no debe abrir modal si catálogo está vacío', async ({ page }) => {
    await page.route('**/api/services/catalog', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.route('**/api/services', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '1',
            nombre: 'Plan Básico',
            estado: 'expirado',
            fecha_expiracion: '2020-01-01',
          },
        ]),
      });
    });

    await page.waitForSelector('text=Renovar');

    // Hacer clic en botón Renovar
    await page.click('button:has-text("Renovar")');

    // Verificar que NO se abre el modal
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });
});
```

---

### Script de Verificación de Regresión

```typescript
// scripts/verify-translations-regression.ts
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

/**
 * Script para verificar que los cambios en useTranslationsSafe
 * no rompan otros componentes
 */
async function verifyTranslationsRegression() {
  const projectRoot = process.cwd();
  const sourceFiles = await glob('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', '.next/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
  });

  const issues: Array<{ file: string; line: number; issue: string }> = [];

  for (const file of sourceFiles) {
    const content = readFileSync(join(projectRoot, file), 'utf-8');
    
    // Buscar uso de useTranslationsSafe sin namespace (patrón antiguo)
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      // Patrón: const t = useTranslationsSafe();
      if (line.includes('useTranslationsSafe()') && !line.includes('useTranslationsSafe("')) {
        issues.push({
          file,
          line: index + 1,
          issue: 'Uso de useTranslationsSafe sin namespace - puede requerir actualización',
        });
      }
    });
  }

  if (issues.length > 0) {
    console.error('❌ Se encontraron posibles problemas de regresión:\n');
    issues.forEach(({ file, line, issue }) => {
      console.error(`  ${file}:${line} - ${issue}`);
    });
    process.exit(1);
  } else {
    console.log('✅ No se encontraron problemas de regresión en traducciones');
  }
}

verifyTranslationsRegression();
```

---

## 5. ESTRATEGIA DE REGRESIÓN/CI

### Pre-commit Hooks

1. **Linter de traducciones**
   - Verificar que todas las claves usadas en código existan en `messages/*.json`
   - Ejecutar: `npm run lint:translations`

2. **Type-check estricto**
   - Asegurar que TypeScript detecte errores de tipo
   - Ejecutar: `npm run type-check`

### CI Pipeline

```yaml
# .github/workflows/qa-payments.yml
name: QA Payments Page

on:
  pull_request:
    paths:
      - 'app/(client)/client/payments/**'
      - 'lib/hooks/useTranslationsSafe.ts'
      - 'messages/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Unit tests
        run: npm run test:unit -- app/(client)/client/payments
      
      - name: Integration tests
        run: npm run test:integration -- catalog-loading
      
      - name: Verify translations
        run: npm run verify:translations
      
      - name: E2E tests (smoke)
        run: npm run test:e2e -- payments.spec.ts
```

### Checklist de Regresión

Antes de mergear a `main`:

- [ ] Todos los tests unitarios pasan
- [ ] Tests de integración pasan con diferentes formatos de API
- [ ] E2E tests de flujo crítico pasan
- [ ] Script de verificación de traducciones no reporta problemas
- [ ] Verificación manual en navegador (Chrome, Firefox, Safari)
- [ ] Verificación en diferentes locales (es, en, pt)
- [ ] Verificación con catálogo vacío, con datos, y con error de API
- [ ] Verificación de que otros componentes que usan `useTranslationsSafe` no se rompen

### Monitoreo Post-Deploy

1. **Sentry/Error Tracking**
   - Alertar si hay errores de tipo `TypeError: catalog.find is not a function`
   - Alertar si hay errores relacionados con traducciones

2. **Analytics**
   - Monitorear tasa de error en página `/client/payments`
   - Monitorear tiempo de carga del catálogo

3. **Feature Flags**
   - Considerar feature flag para rollback rápido si hay problemas

---

## 6. RECOMENDACIONES ADICIONALES

### Mejoras Sugeridas

1. **Agregar clave de traducción faltante**
   ```json
   // messages/es.json
   {
     "client": {
       "services": {
         "backToDashboard": "Volver al Dashboard"
       }
     }
   }
   ```

2. **Tipado más estricto**
   - Reemplazar `any` en `rawData` con tipo específico o `unknown`
   - Crear tipo `CatalogResponse` para la respuesta de la API

3. **Manejo de errores más explícito**
   - Mostrar toast/alert cuando la API falla (no solo array vacío)
   - Distinguir entre "no hay servicios" y "error al cargar"

4. **Memoización de validaciones**
   - Usar `useMemo` para `Array.isArray(catalog)` si se usa múltiples veces

5. **Tests de snapshot**
   - Agregar snapshot tests para detectar cambios visuales inesperados

---

## CONCLUSIÓN

Las mejoras introducidas son **positivas** y aumentan la robustez del componente. Sin embargo, se requiere:

1. ✅ **Agregar la clave de traducción faltante** (`client.services.backToDashboard`)
2. ✅ **Implementar tests automatizados** para prevenir regresiones
3. ✅ **Verificar regresión en otros 103 archivos** que usan `useTranslationsSafe`
4. ✅ **Mejorar feedback al usuario** cuando hay errores de API

**Prioridad de implementación:** 🔴 Crítica (traducciones) → 🟡 Alta (tests) → 🟢 Media (mejoras UX)

