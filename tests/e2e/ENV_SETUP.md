# Configuración de Variables de Entorno para Tests E2E

## Variables Requeridas

Para ejecutar los tests E2E del portal cliente, necesitas configurar las siguientes variables de entorno:

### Opción 1: Archivo `.env.test` (Recomendado para desarrollo local)

Crea un archivo `.env.test` en la raíz del proyecto con el siguiente contenido:

```env
# Credenciales de cliente para tests
TEST_CLIENT_EMAIL=camilo@viotech.com.co
TEST_CLIENT_PASSWORD=@bC154356

# URL base para tests (opcional, por defecto http://localhost:3000)
PLAYWRIGHT_BASE_URL=http://localhost:3000

# Credenciales de partner para tests (opcional)
TEST_PARTNER_EMAIL=partner@test.viotech.com
TEST_PARTNER_PASSWORD=TestPassword123!

# ID de organización de test (opcional)
TEST_CLIENT_ORG_ID=org-test-001
```

**Importante:** El archivo `.env.test` está en `.gitignore` y no se subirá al repositorio por seguridad.

### Opción 2: Variables de Entorno del Sistema

#### Windows PowerShell
```powershell
$env:TEST_CLIENT_EMAIL="camilo@viotech.com.co"
$env:TEST_CLIENT_PASSWORD="@bC154356"
```

#### Linux/Mac
```bash
export TEST_CLIENT_EMAIL="camilo@viotech.com.co"
export TEST_CLIENT_PASSWORD="@bC154356"
```

### Opción 3: CI/CD (GitHub Actions)

Configura los secrets en GitHub:
- `TEST_CLIENT_EMAIL`
- `TEST_CLIENT_PASSWORD`

Estos se cargarán automáticamente como variables de entorno en el workflow.

## Cómo Funciona

El archivo `playwright.config.ts` carga automáticamente las variables desde:
1. Variables de entorno del sistema (prioridad)
2. Archivo `.env.test` (si existe)

Las variables están disponibles en `process.env` dentro de los tests.
