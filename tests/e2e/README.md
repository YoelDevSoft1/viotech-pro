# E2E Tests - VioTech Pro

Tests end-to-end para Partners & Marketplace usando Playwright.

## Estructura

```
tests/e2e/
├── .auth/              # Estado de autenticación (gitignored)
├── fixtures/           # Datos de prueba
│   └── test-data.ts    # Constantes y datos de test
├── partners/           # Tests de Partners
│   ├── dashboard.spec.ts
│   ├── leads.spec.ts
│   ├── commissions.spec.ts
│   └── referrals.spec.ts
├── marketplace/        # Tests de Marketplace
│   ├── catalog.spec.ts
│   ├── service-detail.spec.ts
│   └── comparison.spec.ts
├── notifications/      # Tests de Notificaciones
│   └── push.spec.ts
├── auth.setup.ts       # Setup de autenticación
└── README.md
```

## Requisitos

1. **Node.js 20+**
2. **Playwright instalado**: `npm install`
3. **Variables de entorno** (crear `.env.local`):
   ```env
   TEST_PARTNER_EMAIL=partner@test.viotech.com
   TEST_PARTNER_PASSWORD=your_password
   PLAYWRIGHT_BASE_URL=http://localhost:3000
   ```

## Comandos

```bash
# Ejecutar todos los tests
npm run test:e2e

# Ejecutar con UI interactiva
npm run test:e2e:ui

# Ejecutar en modo debug
npm run test:e2e:debug

# Ejecutar con browser visible
npm run test:e2e:headed

# Ver reporte de tests
npm run test:e2e:report

# Ejecutar solo tests de partners
npx playwright test tests/e2e/partners/

# Ejecutar solo tests de marketplace
npx playwright test tests/e2e/marketplace/

# Ejecutar un archivo específico
npx playwright test tests/e2e/partners/dashboard.spec.ts
```

## Configuración

El archivo `playwright.config.ts` en la raíz configura:
- **Timeout**: 30 segundos por test
- **Retries**: 2 en CI, 0 en local
- **Browsers**: Chromium, Firefox, Mobile Chrome
- **Screenshots/Videos**: Solo en fallo
- **Web Server**: Arranca `npm run dev` automáticamente

## Crear cuenta de test

Para los tests de Partners, necesitas una cuenta con rol de partner:

1. Crear usuario en el backend con rol `partner`
2. Asociar a la tabla `partners` con tier válido
3. Configurar las credenciales en las variables de entorno

## CI/CD

Los tests se ejecutan automáticamente en GitHub Actions:
- En cada PR a `main`, `develop`, `staging`
- Después del job de build
- Reportes disponibles como artifacts

### Secrets requeridos en GitHub:
- `TEST_PARTNER_EMAIL`
- `TEST_PARTNER_PASSWORD`

## Casos de Prueba

### Partners

| Test | Descripción | Prioridad |
|------|-------------|-----------|
| Partner Login Flow | Autenticación y acceso con rol partner | 🔴 Alta |
| Partner Dashboard | Estadísticas, tier, leads recientes | 🔴 Alta |
| Partner Leads CRUD | Crear, listar, filtrar leads | 🟡 Media |
| Partner Commissions | Listado, filtros, cálculos | 🟡 Media |
| Partner Referrals | Link de referido, historial | 🟢 Baja |

### Marketplace

| Test | Descripción | Prioridad |
|------|-------------|-----------|
| Catalog Browse | Listado, filtros, búsqueda | 🔴 Alta |
| Service Detail | Información, tabs, CTA | 🟡 Media |
| Service Comparison | Comparar hasta 4 servicios | 🟡 Media |

## Troubleshooting

### Error: "Target page, context or browser has been closed"
El navegador se cerró antes de completar el test. Aumenta el timeout o revisa la navegación.

### Error: "locator.click: Target closed"
El elemento no existe o fue eliminado del DOM. Usa `await expect(element).toBeVisible()` antes de interactuar.

### Tests lentos
- Usa `--project=chromium` para ejecutar solo en un browser
- Filtra por archivo: `npx playwright test dashboard.spec.ts`
- Ejecuta en paralelo: ya está configurado con `fullyParallel: true`

### Autenticación falla
1. Verifica credenciales en variables de entorno
2. Revisa que el usuario exista y tenga rol partner
3. Elimina `tests/e2e/.auth/*.json` y re-ejecuta

## Convenciones

### Formato Given/When/Then
```typescript
test("should do something", async ({ page }) => {
  // Given: Estado inicial
  await page.goto("/partners");
  
  // When: Acción del usuario
  await page.click('button:has-text("Crear")');
  
  // Then: Verificación
  await expect(page.locator('[role="dialog"]')).toBeVisible();
});
```

### Selectores preferidos
1. `data-testid` (más estable)
2. `role` y `name` (accesibilidad)
3. Texto visible (más legible)
4. CSS como último recurso

### Esperas
```typescript
// ✅ Bien: esperar elemento específico
await expect(page.locator(".animate-pulse").first()).toBeHidden();

// ❌ Mal: esperas fijas
await page.waitForTimeout(5000);
```




