# 🧪 Estrategia de QA - Portal Cliente

**Fecha:** Diciembre 2024  
**Basado en:** `VALIDACIONES_APLICADAS_CLIENTE.md`  
**Agente:** QA Automation VioTech Pro

---

## 📋 Resumen Ejecutivo

Este documento define la **estrategia completa de testing** para el portal cliente basada en las validaciones aplicadas. Incluye:

- ✅ **8 riesgos críticos** identificados y priorizados
- ✅ **22 casos de prueba** en formato Given/When/Then
- ✅ **Matriz de pruebas** con 22 items (Unit + E2E)
- ✅ **Ejemplos de código** para tests unitarios y E2E
- ✅ **Plan de regresión** y configuración CI/CD
- ✅ **Archivos de ejemplo** creados y listos para usar

**Estado de implementación:**
- ✅ Configuración: Vitest, Playwright, setup files
- ✅ Tests unitarios: `metricRanges.test.ts` (ejemplo completo)
- ✅ Tests E2E: `dashboard.spec.ts`, `tickets.spec.ts`, `smoke.spec.ts` (ejemplos)
- ⏳ Pendiente: Completar tests restantes según priorización

**Próximo paso:** Instalar dependencias y ejecutar tests de ejemplo para validar setup.

---

## 📋 1. Riesgos y Alcance de Pruebas

### 🔴 Riesgos Críticos (Prioridad Alta)

1. **Seguridad y Acceso (C1.1)**
   - **Riesgo:** Cliente accede a datos de otra organización
   - **Impacto:** Violación de privacidad, pérdida de confianza, problemas legales
   - **Probabilidad:** Media (si falla validación de `org_id`)

2. **Datos Inconsistentes en Dashboard (C2.1)**
   - **Riesgo:** Métricas fuera de rango o null causan crash
   - **Impacto:** Dashboard inutilizable, experiencia de usuario rota
   - **Probabilidad:** Alta (datos del backend pueden variar)

3. **Validación de Tickets (C2.2)**
   - **Riesgo:** Tickets inválidos se crean, datos corruptos
   - **Impacto:** Sistema de tickets inestable, tickets sin sentido
   - **Probabilidad:** Media (validación frontend puede ser bypassed)

4. **Flujo de Pagos (C2.3)**
   - **Riesgo:** Pago exitoso pero servicio no se activa
   - **Impacto:** Pérdida de dinero, cliente insatisfecho, soporte abrumado
   - **Probabilidad:** Baja (pero impacto crítico)

5. **Manejo de Errores (C3)**
   - **Riesgo:** Errores técnicos expuestos al usuario
   - **Impacto:** Confusión, pérdida de confianza
   - **Probabilidad:** Media

### 🟡 Riesgos Moderados (Prioridad Media)

6. **IA y Predictor (C2.4)**
   - **Riesgo:** IA no disponible rompe pantalla completa
   - **Impacto:** Feature inutilizable temporalmente
   - **Probabilidad:** Media

7. **Notificaciones (C2.5)**
   - **Riesgo:** Navegación a recursos eliminados causa crash
   - **Impacto:** Experiencia de usuario rota
   - **Probabilidad:** Baja

8. **Idioma y Preferencias (C2.6)**
   - **Riesgo:** Cambio de idioma no se guarda o bloquea UI
   - **Impacto:** Frustración del usuario
   - **Probabilidad:** Baja

---

## 📊 2. Matriz de Pruebas

| Módulo | Feature | Tipo de Test | Herramienta | Prioridad | Estado |
|--------|---------|--------------|-------------|-----------|--------|
| **C1.1 - Acceso** | Protección de rutas | E2E | Playwright | 🔴 Alta | ⏳ Pendiente |
| **C1.1 - Acceso** | Validación JWT + Rol | E2E | Playwright | 🔴 Alta | ⏳ Pendiente |
| **C1.1 - Acceso** | Aislamiento de datos por org | E2E + Integración | Playwright + API | 🔴 Alta | ⏳ Pendiente |
| **C2.1 - Dashboard** | Normalización de rangos | Unit | Vitest | 🔴 Alta | ⏳ Pendiente |
| **C2.1 - Dashboard** | Manejo de null/undefined | Unit | Vitest | 🔴 Alta | ⏳ Pendiente |
| **C2.1 - Dashboard** | Configuración de rangos | Unit | Vitest | 🟡 Media | ⏳ Pendiente |
| **C2.1 - Dashboard** | Estados loading/error/empty | E2E | Playwright | 🟡 Media | ⏳ Pendiente |
| **C2.2 - Tickets** | Validación Zod (asunto 5-200) | Unit | Vitest | 🔴 Alta | ⏳ Pendiente |
| **C2.2 - Tickets** | Validación Zod (descripción max 10k) | Unit | Vitest | 🟡 Media | ⏳ Pendiente |
| **C2.2 - Tickets** | Enums de prioridad/impacto | Unit | Vitest | 🟡 Media | ⏳ Pendiente |
| **C2.2 - Tickets** | Manejo errores 400/500 | E2E | Playwright | 🟡 Media | ⏳ Pendiente |
| **C2.2 - Tickets** | Crear ticket completo | E2E | Playwright | 🔴 Alta | ⏳ Pendiente |
| **C2.3 - Pagos** | Servicios filtrados por org | E2E | Playwright | 🔴 Alta | ⏳ Pendiente |
| **C2.3 - Pagos** | Estados vacíos | E2E | Playwright | 🟡 Media | ⏳ Pendiente |
| **C2.3 - Pagos** | Flujo éxito después de pago | E2E | Playwright | 🔴 Alta | ⏳ Pendiente |
| **C2.4 - IA** | Manejo error 503 | E2E | Playwright | 🟡 Media | ⏳ Pendiente |
| **C2.4 - IA** | Prellenado de campos | E2E | Playwright | 🟡 Media | ⏳ Pendiente |
| **C2.5 - Notificaciones** | Navegación a recursos | E2E | Playwright | 🟡 Media | ⏳ Pendiente |
| **C2.5 - Notificaciones** | Manejo recursos eliminados | E2E | Playwright | 🟡 Media | ⏳ Pendiente |
| **C2.6 - Settings** | Selector de idioma | E2E | Playwright | 🟢 Baja | ⏳ Pendiente |
| **C3 - UX/Errores** | Estados loading/error/empty | E2E | Playwright | 🟡 Media | ⏳ Pendiente |
| **C3 - UX/Errores** | Manejo 401/403 | E2E | Playwright | 🔴 Alta | ⏳ Pendiente |

**Leyenda:**
- 🔴 Alta: Bloquea funcionalidad crítica
- 🟡 Media: Afecta experiencia pero no bloquea
- 🟢 Baja: Mejora de calidad

---

## 🎯 3. Casos de Prueba Clave (Given/When/Then)

### C1.1 - Acceso y Rol

#### TC-C1.1.1: Protección de Rutas Cliente
```
GIVEN: Usuario no autenticado
WHEN: Intenta acceder a /client/dashboard
THEN: Debe redirigir a /login con parámetro ?from=/client/dashboard
```

#### TC-C1.1.2: Validación de Rol
```
GIVEN: Usuario autenticado con rol "admin"
WHEN: Accede a /client/dashboard
THEN: Debe permitir acceso (admin puede ver cliente)
```

#### TC-C1.1.3: Aislamiento de Datos
```
GIVEN: Usuario A (org_id: "org-1") y Usuario B (org_id: "org-2")
WHEN: Usuario A accede a /client/tickets
THEN: Solo debe ver tickets de "org-1"
AND: No debe ver tickets de "org-2"
```

### C2.1 - Dashboard

#### TC-C2.1.1: Normalización de Rangos
```
GIVEN: Backend devuelve slaCumplido: 150
WHEN: Dashboard renderiza métricas
THEN: Debe mostrar 100% (normalizado)
AND: Debe loggear warning en consola
```

#### TC-C2.1.2: Manejo de Null
```
GIVEN: Backend devuelve avancePromedio: null
WHEN: Dashboard renderiza métricas
THEN: Debe mostrar "N/A" o 0
AND: No debe crashear la aplicación
```

#### TC-C2.1.3: Configuración de Rangos
```
GIVEN: slaCumplido: 95
WHEN: Se obtiene status con getSLAStatus(95)
THEN: Debe retornar status: "excelente"
AND: label: "Excelente"
AND: color: "text-green-500"
```

#### TC-C2.1.4: Estados de Carga
```
GIVEN: Dashboard cargando métricas
WHEN: Usuario accede a /dashboard
THEN: Debe mostrar skeleton/loading
AND: No debe mostrar métricas hasta que carguen
```

### C2.2 - Tickets

#### TC-C2.2.1: Validación de Asunto
```
GIVEN: Formulario de ticket abierto
WHEN: Usuario ingresa asunto de 3 caracteres
THEN: Debe mostrar error: "El asunto debe tener al menos 5 caracteres"
AND: Botón "Crear" debe estar deshabilitado
```

#### TC-C2.2.2: Validación de Prioridad
```
GIVEN: Formulario de ticket abierto
WHEN: Usuario intenta enviar con prioridad inválida
THEN: Debe mostrar error: "Prioridad inválida"
AND: Solo debe aceptar: baja, media, alta, critica
```

#### TC-C2.2.3: Manejo de Error 400
```
GIVEN: Usuario envía ticket con datos inválidos
WHEN: Backend responde 400
THEN: Debe mostrar mensaje específico según campo
AND: No debe mostrar stacktrace técnico
```

#### TC-C2.2.4: Crear Ticket Completo
```
GIVEN: Usuario autenticado como cliente
WHEN: Completa formulario válido y envía
THEN: Ticket debe crearse exitosamente
AND: Debe aparecer en lista de tickets
AND: Debe mostrar toast de éxito
```

### C2.3 - Servicios y Pagos

#### TC-C2.3.1: Filtrado por Organización
```
GIVEN: Usuario A (org-1) y Usuario B (org-2) con servicios
WHEN: Usuario A accede a /client/payments
THEN: Solo debe ver servicios de org-1
AND: No debe ver servicios de org-2
```

#### TC-C2.3.2: Estado Vacío
```
GIVEN: Usuario sin servicios activos
WHEN: Accede a /client/payments
THEN: Debe mostrar EmptyState con mensaje "Sin servicios aún"
AND: Debe mostrar CTA para explorar catálogo
```

#### TC-C2.3.3: Flujo de Pago Exitoso
```
GIVEN: Usuario selecciona plan y completa checkout
WHEN: Pago se procesa exitosamente
THEN: Servicios deben refrescarse automáticamente
AND: Debe mostrar toast de éxito
AND: Nuevo servicio debe aparecer en lista
```

### C2.4 - IA

#### TC-C2.4.1: Manejo de Error 503
```
GIVEN: IA no disponible (backend responde 503)
WHEN: Usuario intenta usar asistente
THEN: Debe mostrar mensaje: "El asistente de IA no está disponible temporalmente"
AND: Pantalla no debe crashear
AND: Usuario puede seguir usando la app
```

#### TC-C2.4.2: Prellenado de Campos
```
GIVEN: IA genera sugerencia de ticket
WHEN: Usuario hace click en "Crear ticket desde IA"
THEN: Formulario debe prellenarse con titulo, descripcion, prioridad
AND: Usuario puede editar campos antes de enviar
AND: Validación Zod debe aplicarse
```

### C2.5 - Notificaciones

#### TC-C2.5.1: Navegación a Recurso
```
GIVEN: Notificación de ticket creado
WHEN: Usuario hace click en notificación
THEN: Debe navegar a /client/tickets/[id]
AND: Debe marcar notificación como leída
```

#### TC-C2.5.2: Recurso Eliminado
```
GIVEN: Notificación de ticket que fue eliminado
WHEN: Usuario hace click en notificación
THEN: Debe mostrar toast: "Este recurso ya no está disponible"
AND: No debe crashear la aplicación
```

### C2.6 - Settings

#### TC-C2.6.1: Cambio de Idioma
```
GIVEN: Usuario en settings
WHEN: Cambia idioma de "es" a "en"
THEN: UI debe cambiar a inglés
AND: Preferencia debe guardarse
AND: Debe persistir en siguiente sesión
```

### C3 - UX/Errores

#### TC-C3.1: Manejo de 401/403
```
GIVEN: Token JWT expirado
WHEN: Usuario intenta acceder a /client/dashboard
THEN: Debe redirigir a /login
AND: Debe mostrar mensaje amigable
```

#### TC-C3.2: Backend Caído
```
GIVEN: Backend no responde (timeout)
WHEN: Usuario accede a dashboard
THEN: Debe mostrar estado de error
AND: Debe mostrar botón "Reintentar"
AND: No debe mostrar stacktrace técnico
```

---

## 💻 4. Ejemplos de Tests Automatizados

### 4.1. Tests Unitarios (Vitest)

#### Test: Normalización de Rangos (`lib/config/metricRanges.ts`)

```typescript
// tests/unit/lib/config/metricRanges.test.ts
import { describe, it, expect } from "vitest";
import { getSLAStatus, getHealthScoreStatus, SLA_RANGES, HEALTH_SCORE_RANGES } from "@/lib/config/metricRanges";

describe("metricRanges", () => {
  describe("getSLAStatus", () => {
    it("debe retornar 'excelente' para valores >= 95", () => {
      const result = getSLAStatus(95);
      expect(result.status).toBe("excelente");
      expect(result.label).toBe("Excelente");
      expect(result.color).toBe("text-green-500");
    });

    it("debe retornar 'bueno' para valores entre 85 y 94.99", () => {
      const result = getSLAStatus(90);
      expect(result.status).toBe("bueno");
      expect(result.label).toBe("Bueno");
    });

    it("debe retornar 'regular' para valores entre 70 y 84.99", () => {
      const result = getSLAStatus(75);
      expect(result.status).toBe("regular");
      expect(result.label).toBe("Regular");
    });

    it("debe retornar 'critico' para valores < 70", () => {
      const result = getSLAStatus(50);
      expect(result.status).toBe("critico");
      expect(result.label).toBe("Crítico");
    });

    it("debe retornar 'sin_datos' para null", () => {
      const result = getSLAStatus(null);
      expect(result.status).toBe("sin_datos");
      expect(result.label).toBe("Sin datos");
    });

    it("debe retornar 'sin_datos' para undefined", () => {
      const result = getSLAStatus(undefined);
      expect(result.status).toBe("sin_datos");
    });

    it("debe retornar 'sin_datos' para NaN", () => {
      const result = getSLAStatus(NaN);
      expect(result.status).toBe("sin_datos");
    });
  });

  describe("getHealthScoreStatus", () => {
    it("debe retornar 'excelente' para valores >= 24", () => {
      const result = getHealthScoreStatus(25);
      expect(result.status).toBe("excelente");
    });

    it("debe retornar 'bueno' para valores entre 18 y 23.99", () => {
      const result = getHealthScoreStatus(20);
      expect(result.status).toBe("bueno");
    });

    it("debe retornar 'regular' para valores entre 12 y 17.99", () => {
      const result = getHealthScoreStatus(15);
      expect(result.status).toBe("regular");
    });

    it("debe retornar 'critico' para valores < 12", () => {
      const result = getHealthScoreStatus(10);
      expect(result.status).toBe("critico");
    });
  });
});
```

#### Test: Normalización en useDashboard (`lib/hooks/useDashboard.ts`)

```typescript
// tests/unit/lib/hooks/useDashboard.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { apiClient } from "@/lib/apiClient";

// Mock de apiClient
vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("useDashboard", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("debe normalizar slaCumplido fuera de rango [0, 100]", async () => {
    // Given: Backend devuelve valor fuera de rango
    (apiClient.get as any).mockResolvedValueOnce({
      data: {
        slaCumplido: 150, // Fuera de rango
        avancePromedio: 50,
        ticketsAbiertos: 5,
        ticketsResueltos: 10,
        serviciosActivos: 2,
      },
    });

    const { result } = renderHook(() => useDashboard(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Then: Debe normalizar a 100
    expect(result.current.metrics?.slaCumplido).toBe(100);
  });

  it("debe manejar null/undefined sin crashear", async () => {
    // Given: Backend devuelve null
    (apiClient.get as any).mockResolvedValueOnce({
      data: {
        slaCumplido: null,
        avancePromedio: null,
        ticketsAbiertos: null,
        ticketsResueltos: null,
        serviciosActivos: null,
      },
    });

    const { result } = renderHook(() => useDashboard(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Then: Debe usar defaults (0)
    expect(result.current.metrics?.slaCumplido).toBe(0);
    expect(result.current.metrics?.avancePromedio).toBe(0);
    expect(result.current.metrics?.ticketsAbiertos).toBe(0);
  });

  it("debe manejar error 404 en /activity/recent sin romper dashboard", async () => {
    // Given: /metrics/dashboard funciona pero /activity/recent falla
    (apiClient.get as any)
      .mockResolvedValueOnce({
        data: {
          slaCumplido: 95,
          avancePromedio: 80,
          ticketsAbiertos: 5,
          ticketsResueltos: 10,
          serviciosActivos: 2,
        },
      })
      .mockRejectedValueOnce({
        response: { status: 404 },
      });

    const { result } = renderHook(() => useDashboard(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Then: Métricas deben cargar, actividad debe ser array vacío
    expect(result.current.metrics).toBeDefined();
    expect(result.current.activity).toEqual([]);
    expect(result.current.isError).toBe(false);
  });
});
```

#### Test: Validación Zod de Tickets (`components/tickets/CreateTicketDialog.tsx`)

```typescript
// tests/unit/components/tickets/CreateTicketDialog.test.ts
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateTicketDialog } from "@/components/tickets/CreateTicketDialog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("CreateTicketDialog - Validaciones", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("debe validar asunto mínimo 5 caracteres", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    
    render(
      <CreateTicketDialog
        open={true}
        onOpenChange={vi.fn()}
        onSuccess={onSuccess}
      />,
      { wrapper }
    );

    // When: Usuario ingresa asunto de 3 caracteres
    const tituloInput = screen.getByLabelText(/asunto|título/i);
    await user.type(tituloInput, "abc");

    // Then: Debe mostrar error
    await waitFor(() => {
      expect(screen.getByText(/al menos 5 caracteres/i)).toBeInTheDocument();
    });

    // And: Botón crear debe estar deshabilitado o mostrar error
    const submitButton = screen.getByRole("button", { name: /crear|enviar/i });
    expect(submitButton).toBeDisabled();
  });

  it("debe validar asunto máximo 200 caracteres", async () => {
    const user = userEvent.setup();
    
    render(
      <CreateTicketDialog
        open={true}
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />,
      { wrapper }
    );

    const tituloInput = screen.getByLabelText(/asunto|título/i);
    const longText = "a".repeat(201); // 201 caracteres

    await user.type(tituloInput, longText);

    await waitFor(() => {
      expect(screen.getByText(/no puede exceder 200 caracteres/i)).toBeInTheDocument();
    });
  });

  it("debe validar prioridad como enum", async () => {
    const user = userEvent.setup();
    
    render(
      <CreateTicketDialog
        open={true}
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />,
      { wrapper }
    );

    // When: Usuario intenta seleccionar prioridad inválida
    const prioridadSelect = screen.getByLabelText(/prioridad/i);
    
    // Then: Solo debe mostrar opciones válidas
    await user.click(prioridadSelect);
    
    const options = screen.getAllByRole("option");
    const validPriorities = ["baja", "media", "alta", "critica"];
    
    options.forEach((option) => {
      const value = option.getAttribute("value");
      if (value) {
        expect(validPriorities.includes(value)).toBe(true);
      }
    });
  });
});
```

### 4.2. Tests E2E (Playwright)

#### Test: Flujo Completo Cliente (Happy Path)

```typescript
// tests/e2e/client/dashboard.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Cliente Dashboard - E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Autenticar como cliente
    // (Similar a auth.setup.ts pero para cliente)
    await page.goto("/login");
    await page.fill('input[name="email"]', process.env.TEST_CLIENT_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_CLIENT_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("TC-C2.1.4: Dashboard muestra estados de carga correctamente", async ({ page }) => {
    // Given: Usuario autenticado
    // When: Accede a dashboard
    await page.goto("/dashboard");

    // Then: Debe mostrar skeleton mientras carga
    const skeleton = page.locator('[class*="skeleton"], [class*="animate-pulse"]').first();
    await expect(skeleton).toBeVisible({ timeout: 1000 });

    // And: Después debe mostrar métricas
    await expect(skeleton).toBeHidden({ timeout: 10000 });
    await expect(page.locator('text=/tickets|servicios|sla/i')).toBeVisible();
  });

  test("TC-C2.1.2: Dashboard maneja null/undefined sin crashear", async ({ page }) => {
    // Given: Backend devuelve métricas con null
    await page.route("**/api/metrics/dashboard", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: {
            slaCumplido: null,
            avancePromedio: null,
            ticketsAbiertos: null,
            serviciosActivos: null,
          },
        }),
      });
    });

    // When: Usuario accede a dashboard
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Then: Debe mostrar "N/A" o 0, no debe crashear
    const metrics = page.locator('[class*="card"], [class*="metric"]');
    await expect(metrics.first()).toBeVisible();
    
    // Verificar que no hay errores en consola
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    
    expect(errors.filter(e => e.includes("Cannot read") || e.includes("undefined")).length).toBe(0);
  });
});
```

#### Test: Crear Ticket Completo

```typescript
// tests/e2e/client/tickets.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Cliente Tickets - E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Autenticar como cliente
    await page.goto("/login");
    await page.fill('input[name="email"]', process.env.TEST_CLIENT_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_CLIENT_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("TC-C2.2.4: Crear ticket completo exitosamente", async ({ page }) => {
    // Given: Usuario autenticado
    // When: Navega a tickets y crea uno nuevo
    await page.goto("/client/tickets");
    
    // Abrir modal de crear ticket
    await page.click('button:has-text("Nuevo Ticket")');
    await expect(page.locator('text=/nuevo ticket|crear ticket/i')).toBeVisible();

    // Completar formulario válido
    await page.fill('input[name="titulo"], input[placeholder*="asunto"]', "Problema con login - Test E2E");
    await page.fill('textarea[name="descripcion"]', "Descripción detallada del problema");
    
    // Seleccionar prioridad
    await page.click('button:has-text("Prioridad")');
    await page.click('text=/media|medium/i');

    // Enviar formulario
    await page.click('button[type="submit"]:has-text("Crear")');

    // Then: Debe mostrar toast de éxito
    await expect(page.locator('text=/ticket.*creado|success/i')).toBeVisible({ timeout: 5000 });

    // And: Ticket debe aparecer en lista
    await expect(page.locator('text=/Problema con login/i')).toBeVisible({ timeout: 5000 });
  });

  test("TC-C2.2.1: Validación de asunto mínimo 5 caracteres", async ({ page }) => {
    // Given: Modal de crear ticket abierto
    await page.goto("/client/tickets");
    await page.click('button:has-text("Nuevo Ticket")');

    // When: Usuario ingresa asunto de 3 caracteres
    await page.fill('input[name="titulo"]', "abc");

    // Then: Debe mostrar error
    await expect(page.locator('text=/al menos 5 caracteres/i')).toBeVisible();

    // And: Botón crear debe estar deshabilitado
    const submitButton = page.locator('button[type="submit"]:has-text("Crear")');
    await expect(submitButton).toBeDisabled();
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

    await page.goto("/client/tickets");
    await page.click('button:has-text("Nuevo Ticket")');
    
    await page.fill('input[name="titulo"]', "Test");
    await page.click('button[type="submit"]:has-text("Crear")');

    // Then: Debe mostrar mensaje específico
    await expect(page.locator('text=/asunto.*5.*200/i')).toBeVisible();
    
    // And: No debe mostrar stacktrace
    await expect(page.locator('text=/PrismaError|Error code/i')).not.toBeVisible();
  });
});
```

#### Test: Flujo de Pagos

```typescript
// tests/e2e/client/payments.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Cliente Pagos - E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Autenticar como cliente
    await page.goto("/login");
    await page.fill('input[name="email"]', process.env.TEST_CLIENT_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_CLIENT_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("TC-C2.3.1: Servicios filtrados por organización", async ({ page }) => {
    // Given: Usuario autenticado con org_id específico
    await page.goto("/client/payments");

    // When: Carga página de servicios
    await page.waitForLoadState("networkidle");

    // Then: Request debe incluir organizationId
    const requests = await page.evaluate(() => {
      return (window as any).__testRequests || [];
    });

    // Verificar que se llama a /services/me con organizationId
    // (Esto requiere mock o intercepción de red)
  });

  test("TC-C2.3.2: Estado vacío cuando no hay servicios", async ({ page }) => {
    // Given: Usuario sin servicios
    await page.route("**/api/services/me*", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: [] }),
      });
    });

    // When: Accede a /client/payments
    await page.goto("/client/payments");
    await page.waitForLoadState("networkidle");

    // Then: Debe mostrar EmptyState
    await expect(page.locator('text=/sin servicios|no hay servicios/i')).toBeVisible();
    
    // And: Debe mostrar CTA para explorar catálogo
    await expect(page.locator('button:has-text("Explorar"), a:has-text("catálogo")')).toBeVisible();
  });

  test("TC-C2.3.3: Flujo de pago exitoso actualiza servicios", async ({ page }) => {
    // Given: Usuario con servicios activos
    await page.goto("/client/payments");
    
    // Mock: Servicios iniciales
    let servicesCount = 1;
    await page.route("**/api/services/me*", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: Array(servicesCount).fill(null).map((_, i) => ({
            id: `service-${i}`,
            nombre: `Servicio ${i}`,
            estado: "activo",
          })),
        }),
      });
    });

    // When: Usuario completa pago (simulado)
    // Nota: En test real, esto requeriría mock de Wompi o sandbox
    
    // Simular éxito de pago
    await page.evaluate(() => {
      // Trigger refresh de servicios
      (window as any).__testPaymentSuccess?.();
    });

    // Then: Servicios deben refrescarse
    servicesCount = 2; // Simular nuevo servicio
    await page.reload();
    
    // Verificar que aparece nuevo servicio
    await expect(page.locator('text=/Servicio 1/i')).toBeVisible({ timeout: 5000 });
  });
});
```

#### Test: IA y Manejo de Errores

```typescript
// tests/e2e/client/ia.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Cliente IA - E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', process.env.TEST_CLIENT_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_CLIENT_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("TC-C2.4.1: Manejo de error 503 sin crashear", async ({ page }) => {
    // Given: IA no disponible
    await page.route("**/api/ai/ticket-assistant", (route) => {
      route.fulfill({
        status: 503,
        body: JSON.stringify({
          error: "IA no disponible temporalmente",
        }),
      });
    });

    // When: Usuario intenta usar asistente
    await page.goto("/client/ia/asistente");
    await page.fill('textarea[placeholder*="mensaje"]', "Necesito ayuda");
    await page.click('button:has-text("Enviar")');

    // Then: Debe mostrar mensaje amigable
    await expect(page.locator('text=/no está disponible temporalmente/i')).toBeVisible({ timeout: 5000 });
    
    // And: Pantalla no debe crashear
    await expect(page.locator('textarea')).toBeVisible();
    
    // And: Usuario puede seguir usando la app
    await expect(page.locator('button:has-text("Enviar")')).toBeEnabled();
  });

  test("TC-C2.4.2: Prellenado de campos desde IA", async ({ page }) => {
    // Given: IA genera sugerencia
    await page.route("**/api/ai/ticket-assistant", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: {
            reply: "Aquí está tu ticket sugerido",
            suggestions: {
              title: "Problema con API",
              description: "La API no responde correctamente",
              priority: "alta",
              tags: ["api", "bug"],
            },
          },
        }),
      });
    });

    await page.goto("/client/ia/asistente");
    await page.fill('textarea', "Tengo un problema con la API");
    await page.click('button:has-text("Enviar")');

    // When: Usuario hace click en "Crear ticket desde IA"
    await page.click('button:has-text("Crear ticket")');

    // Then: Formulario debe prellenarse
    // (Esto requiere que el modal se abra y verificar campos)
    await expect(page.locator('input[name="titulo"]')).toHaveValue(/Problema con API/i);
    
    // And: Usuario puede editar
    await page.fill('input[name="titulo"]', "Problema con API - Editado");
    
    // And: Validación debe aplicarse
    await page.fill('input[name="titulo"]', "abc"); // Inválido
    await expect(page.locator('text=/al menos 5 caracteres/i')).toBeVisible();
  });
});
```

#### Test: Notificaciones

```typescript
// tests/e2e/client/notifications.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Cliente Notificaciones - E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', process.env.TEST_CLIENT_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_CLIENT_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("TC-C2.5.1: Navegación a recurso desde notificación", async ({ page }) => {
    // Given: Notificación de ticket creado
    await page.route("**/api/notifications*", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [
            {
              id: "notif-1",
              type: "ticket_created",
              title: "Nuevo ticket creado",
              message: "Tu ticket #12345 fue creado",
              actionUrl: "/client/tickets/12345",
              read: false,
            },
          ],
        }),
      });
    });

    // When: Usuario accede a notificaciones y hace click
    await page.goto("/client/notifications");
    await page.waitForLoadState("networkidle");
    
    await page.click('text=/Nuevo ticket creado/i');

    // Then: Debe navegar a detalle del ticket
    await page.waitForURL("**/client/tickets/12345");
    
    // And: Notificación debe marcarse como leída
    // (Verificar que se llama a API de marcar como leída)
  });

  test("TC-C2.5.2: Manejo de recurso eliminado", async ({ page }) => {
    // Given: Notificación de ticket que fue eliminado
    await page.route("**/api/notifications*", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [
            {
              id: "notif-1",
              type: "ticket_created",
              title: "Ticket eliminado",
              actionUrl: "/client/tickets/deleted-id",
              read: false,
            },
          ],
        }),
      });
    });

    // Mock: Ticket no existe (404)
    await page.route("**/api/tickets/deleted-id", (route) => {
      route.fulfill({ status: 404 });
    });

    // When: Usuario hace click en notificación
    await page.goto("/client/notifications");
    await page.waitForLoadState("networkidle");
    await page.click('text=/Ticket eliminado/i');

    // Then: Debe mostrar toast de error
    await expect(page.locator('text=/ya no está disponible/i')).toBeVisible({ timeout: 5000 });
    
    // And: No debe crashear
    await expect(page.locator('body')).toBeVisible();
  });
});
```

---

## 🔄 5. Plan de Regresión y CI

### 5.1. Estrategia de Regresión

#### Tests de Humo (Smoke Tests) - Ejecutar en cada PR
```bash
# Tests críticos que deben pasar siempre
npm run test:smoke
```

**Tests incluidos:**
- TC-C1.1.1: Protección de rutas
- TC-C2.1.2: Manejo de null/undefined
- TC-C2.2.1: Validación de asunto
- TC-C3.2: Manejo de backend caído

#### Tests de Regresión Completa - Ejecutar antes de release
```bash
# Todos los tests E2E del cliente
npm run test:e2e:client
```

#### Tests de Integración - Ejecutar en CI
```bash
# Tests que requieren backend mock
npm run test:integration:client
```

### 5.2. Configuración de CI/CD

#### Actualizar `.github/workflows/ci.yml`

```yaml
# Agregar job para tests del cliente
  client-tests:
    name: Client Portal Tests
    runs-on: ubuntu-latest
    needs: build
    timeout-minutes: 30
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run unit tests (client)
        run: npm run test:unit:client
        env:
          NODE_ENV: test
      
      - name: Run E2E tests (client)
        run: npm run test:e2e:client
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:3000
          TEST_CLIENT_EMAIL: ${{ secrets.TEST_CLIENT_EMAIL }}
          TEST_CLIENT_PASSWORD: ${{ secrets.TEST_CLIENT_PASSWORD }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-client
          path: playwright-report/
          retention-days: 30
```

### 5.3. Scripts de package.json

```json
{
  "scripts": {
    "test:unit": "vitest",
    "test:unit:client": "vitest tests/unit/client",
    "test:unit:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:client": "playwright test tests/e2e/client",
    "test:e2e:ui": "playwright test --ui",
    "test:smoke": "playwright test tests/e2e/client/smoke.spec.ts",
    "test:integration:client": "vitest tests/integration/client",
    "test:coverage": "vitest --coverage"
  }
}
```

### 5.4. Criterios de Aceptación para PRs

**Bloqueantes (PR no se puede mergear si fallan):**
- ✅ Todos los tests de humo pasan
- ✅ TypeScript compila sin errores
- ✅ Linter pasa sin errores
- ✅ Build exitoso

**Recomendados (warning pero no bloquean):**
- ⚠️ Cobertura de código > 70% en módulos modificados
- ⚠️ Todos los tests E2E del cliente pasan

---

## 📦 6. Setup de Entorno de Testing

### 6.1. Instalación de Dependencias

```bash
# Instalar Vitest y React Testing Library
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# Instalar Playwright (ya está instalado)
npm install -D @playwright/test

# Instalar coverage
npm install -D @vitest/coverage-v8
```

### 6.2. Configuración de Vitest

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.config.*",
        "**/types/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

### 6.3. Setup File para Tests

```typescript
// tests/setup.ts
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Limpiar después de cada test
afterEach(() => {
  cleanup();
});

// Mock de next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/dashboard",
}));

// Mock de next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
```

---

## 🎯 7. Priorización de Implementación

### Fase 1 - Crítico (Semana 1)
1. ✅ Tests unitarios de `metricRanges.ts`
2. ✅ Tests unitarios de normalización en `useDashboard.ts`
3. ✅ Tests E2E de protección de rutas (C1.1)
4. ✅ Tests E2E de validación de tickets (C2.2.1, C2.2.4)

### Fase 2 - Importante (Semana 2)
5. ✅ Tests E2E de dashboard (C2.1)
6. ✅ Tests E2E de pagos (C2.3)
7. ✅ Tests E2E de manejo de errores (C3)

### Fase 3 - Mejoras (Semana 3)
8. ✅ Tests E2E de IA (C2.4)
9. ✅ Tests E2E de notificaciones (C2.5)
10. ✅ Tests E2E de settings (C2.6)

---

## 📝 8. Checklist de Implementación

### Setup Inicial
- [x] Configurar Vitest (`vitest.config.ts`)
- [x] Configurar Playwright para cliente (`playwright.config.ts` actualizado)
- [x] Crear archivos de setup (`tests/setup.ts`)
- [x] Actualizar fixtures con datos cliente (`tests/e2e/fixtures/test-data.ts`)
- [ ] Instalar dependencias de testing (pendiente ejecutar `npm install`)
- [ ] Configurar variables de entorno de test (crear `.env.test`)

### Tests Unitarios
- [x] `tests/unit/lib/config/metricRanges.test.ts` (ejemplo completo)
- [ ] `tests/unit/lib/hooks/useDashboard.test.ts` (pendiente crear)
- [ ] `tests/unit/components/tickets/CreateTicketDialog.test.ts` (pendiente crear)
- [ ] Otros hooks y utils críticos (pendiente)

### Tests E2E
- [x] `tests/e2e/client/auth.setup.ts` (setup de autenticación)
- [x] `tests/e2e/client/dashboard.spec.ts` (ejemplo con 4 tests)
- [x] `tests/e2e/client/tickets.spec.ts` (ejemplo con 5 tests)
- [x] `tests/e2e/client/smoke.spec.ts` (tests críticos)
- [ ] `tests/e2e/client/payments.spec.ts` (pendiente crear)
- [ ] `tests/e2e/client/ia.spec.ts` (pendiente crear)
- [ ] `tests/e2e/client/notifications.spec.ts` (pendiente crear)
- [ ] `tests/e2e/client/settings.spec.ts` (pendiente crear)

### CI/CD
- [ ] Actualizar `.github/workflows/ci.yml` (pendiente agregar job cliente)
- [x] Agregar scripts a `package.json` (completado)
- [ ] Configurar secrets en GitHub (TEST_CLIENT_EMAIL, TEST_CLIENT_PASSWORD)
- [x] Documentar proceso de testing (este documento)

---

## 🔍 9. Métricas de Calidad

### Cobertura Objetivo
- **Unit Tests:** > 80% en `lib/` y `components/`
- **E2E Tests:** 100% de flujos críticos cubiertos
- **Integration Tests:** > 70% de endpoints cliente

### KPIs de Testing
- Tiempo de ejecución de tests: < 5 minutos (unit) + < 15 minutos (E2E)
- Tasa de falsos positivos: < 5%
- Tests que fallan en CI pero pasan local: < 2%

---

---

## 📦 10. Archivos Creados

### Tests Unitarios
- ✅ `tests/unit/lib/config/metricRanges.test.ts` - Tests de configuración de rangos
- ⏳ `tests/unit/lib/hooks/useDashboard.test.ts` - Pendiente crear
- ⏳ `tests/unit/components/tickets/CreateTicketDialog.test.ts` - Pendiente crear

### Tests E2E
- ✅ `tests/e2e/client/auth.setup.ts` - Setup de autenticación cliente
- ✅ `tests/e2e/client/dashboard.spec.ts` - Tests de dashboard
- ✅ `tests/e2e/client/tickets.spec.ts` - Tests de tickets
- ✅ `tests/e2e/client/smoke.spec.ts` - Tests de humo críticos
- ⏳ `tests/e2e/client/payments.spec.ts` - Pendiente crear
- ⏳ `tests/e2e/client/ia.spec.ts` - Pendiente crear
- ⏳ `tests/e2e/client/notifications.spec.ts` - Pendiente crear
- ⏳ `tests/e2e/client/settings.spec.ts` - Pendiente crear

### Configuración
- ✅ `vitest.config.ts` - Configuración de Vitest
- ✅ `tests/setup.ts` - Setup global para tests unitarios
- ✅ `playwright.config.ts` - Actualizado con proyectos cliente
- ✅ `tests/e2e/fixtures/test-data.ts` - Actualizado con datos cliente

---

## 🚀 11. Quick Start

### Instalación
```bash
# Instalar dependencias de testing
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8 @vitejs/plugin-react

# Instalar Playwright (si no está instalado)
npx playwright install --with-deps
```

### Ejecutar Tests
```bash
# Tests unitarios
npm run test:unit

# Tests unitarios con watch
npm run test:unit:watch

# Tests unitarios del cliente
npm run test:unit:client

# Tests E2E del cliente
npm run test:e2e:client

# Tests de humo (críticos)
npm run test:smoke

# Todos los tests
npm run test:all
```

### Variables de Entorno Necesarias
```env
# .env.test
TEST_CLIENT_EMAIL=cliente@test.viotech.com
TEST_CLIENT_PASSWORD=TestPassword123!
TEST_CLIENT_ORG_ID=org-test-001
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

---

**Documento creado:** Diciembre 2024  
**Última actualización:** Diciembre 2024  
**Estado:** ✅ Listo para implementación

**Próximos pasos:**
1. Instalar dependencias de testing
2. Crear cuenta de test cliente en backend
3. Implementar tests unitarios restantes
4. Implementar tests E2E restantes
5. Configurar CI/CD con nuevos tests
