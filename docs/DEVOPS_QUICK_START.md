# 🚀 DevOps Quick Start - Implementación Rápida

> Guía rápida para implementar las mejoras DevOps identificadas en la auditoría

## 📋 Resumen de Mejoras Implementadas

He creado los siguientes archivos como base para las mejoras DevOps:

### ✅ Archivos Creados

1. **`docs/AUDITORIA_DEVOPS_MEJORAS_2025.md`** - Análisis completo del sistema
2. **`lib/logger.ts`** - Logger estructurado listo para usar
3. **`sentry.client.config.ts`** - Configuración Sentry para cliente
4. **`sentry.server.config.ts`** - Configuración Sentry para servidor
5. **`app/api/health/route.ts`** - Endpoint de health check mejorado
6. **`.env.example`** - Template de variables de entorno
7. **`.github/workflows/ci.yml`** - Pipeline CI básico

---

## 🎯 Implementación Paso a Paso

### Paso 1: Configurar Variables de Entorno (5 min)

1. Copiar el template:
   ```bash
   cp .env.example .env.local
   ```

2. Completar las variables críticas en `.env.local`:
   ```env
   NEXT_PUBLIC_BACKEND_API_URL=https://viotech-main.onrender.com
   NEXT_PUBLIC_ENVIRONMENT=development
   NEXT_PUBLIC_LOG_LEVEL=info
   ```

### Paso 2: Integrar Logger (10 min)

El logger ya está creado en `lib/logger.ts`. Solo necesitas usarlo:

```typescript
// Reemplazar console.log/error por logger
import { logger } from '@/lib/logger';

// En lugar de:
console.log('User logged in');
console.error('API error', error);

// Usar:
logger.info('User logged in', { userId: user.id });
logger.error('API error', error, { endpoint: '/api/tickets' });
```

**Ejemplo de uso en `lib/apiClient.ts`:**

```typescript
import { logger } from '@/lib/logger';

// En el interceptor de respuesta:
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    logger.apiError(
      error.config?.url || 'unknown',
      error.config?.method?.toUpperCase() || 'GET',
      error.response?.status || 0,
      error.message,
      { userId: getAccessToken() ? 'authenticated' : undefined }
    );
    // ... resto del manejo de error
  }
);
```

### Paso 3: Integrar Sentry (15 min)

1. **Instalar dependencias:**
   ```bash
   npm install @sentry/nextjs
   ```

2. **Ejecutar wizard de configuración:**
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```
   
   Esto configurará automáticamente los archivos necesarios.

3. **Actualizar configuración:**
   - Los archivos `sentry.client.config.ts` y `sentry.server.config.ts` ya están creados
   - Solo necesitas agregar tu DSN de Sentry en `.env.local`:
     ```env
     NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
     ```

4. **Verificar integración:**
   - Los errores se capturarán automáticamente
   - Puedes probar con: `logger.error('Test error', new Error('Test'))`

### Paso 4: Health Check Mejorado (Ya Implementado)

El endpoint `/api/health` ya está creado y funcionando. Puedes probarlo:

```bash
curl http://localhost:3000/api/health
```

**Próximos pasos:**
- Configurar UptimeRobot/Cronitor para monitoreo automático
- Agregar alertas por email/Slack si el health check falla

### Paso 5: Configurar CI/CD (20 min)

1. **Verificar que el workflow existe:**
   - El archivo `.github/workflows/ci.yml` ya está creado

2. **Agregar secrets en GitHub (si es necesario):**
   - Ve a Settings → Secrets and variables → Actions
   - Agrega variables si necesitas acceder a servicios externos

3. **Hacer push y verificar:**
   ```bash
   git add .github/workflows/ci.yml
   git commit -m "feat: add CI pipeline"
   git push
   ```

4. **Verificar que el workflow se ejecuta:**
   - Ve a la pestaña "Actions" en GitHub
   - Deberías ver el workflow ejecutándose

---

## 📦 Dependencias Requeridas

### Para Sentry:
```bash
npm install @sentry/nextjs
```

### Para Logger (opcional, si quieres algo más robusto):
```bash
# El logger actual no requiere dependencias externas
# Si prefieres Pino (más robusto):
npm install pino pino-pretty
```

---

## 🔍 Verificación Post-Implementación

### Checklist Rápido

- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Logger importado y usado en al menos un lugar crítico (apiClient)
- [ ] Sentry instalado y configurado con DSN
- [ ] Health check responde en `/api/health`
- [ ] CI/CD se ejecuta correctamente en GitHub Actions
- [ ] No hay errores de TypeScript (`npm run build`)

### Pruebas Manuales

1. **Logger:**
   ```typescript
   // En cualquier componente o hook
   import { logger } from '@/lib/logger';
   logger.info('Test log');
   logger.error('Test error', new Error('Test'));
   // Verificar en consola del navegador
   ```

2. **Sentry:**
   ```typescript
   // En cualquier lugar
   import * as Sentry from '@sentry/nextjs';
   Sentry.captureException(new Error('Test Sentry'));
   // Verificar en dashboard de Sentry
   ```

3. **Health Check:**
   ```bash
   # En desarrollo
   curl http://localhost:3000/api/health
   
   # En producción
   curl https://tu-dominio.com/api/health
   ```

---

## 📊 Métricas de Éxito

Después de implementar, deberías ver:

1. **Logger funcionando:**
   - Logs estructurados en consola (desarrollo)
   - Errores críticos enviados automáticamente

2. **Sentry capturando errores:**
   - Errores apareciendo en dashboard de Sentry
   - Contexto de usuario y ruta disponible

3. **Health Check operativo:**
   - Endpoint respondiendo correctamente
   - Estado de backend visible

4. **CI/CD funcionando:**
   - Builds automáticos en cada push
   - Linting y type checking automáticos

---

## 🔗 Siguientes Pasos

Una vez implementadas las mejoras básicas, puedes avanzar con:

1. **Staging Environment:**
   - Crear proyecto Vercel para staging
   - Configurar deploy automático en branch `staging`

2. **Alertas Automáticas:**
   - Configurar UptimeRobot para health checks
   - Configurar alertas en Sentry

3. **Dashboards:**
   - Crear dashboard en Sentry/Vercel Analytics
   - Configurar métricas de negocio

4. **Optimizaciones:**
   - Revisar bundle size
   - Optimizar imágenes y assets
   - Implementar caching avanzado

---

## 🆘 Troubleshooting

### Error: "Sentry DSN not configured"
- Verifica que `NEXT_PUBLIC_SENTRY_DSN` esté en `.env.local`
- Reinicia el servidor de desarrollo después de agregar variables

### Error: "Module not found: logger"
- Verifica que el archivo `lib/logger.ts` existe
- Verifica la ruta de importación (`@/lib/logger`)

### Health check no responde
- Verifica que el endpoint esté en `app/api/health/route.ts`
- Verifica que el servidor Next.js esté corriendo
- Revisa logs del servidor para errores

### CI/CD no se ejecuta
- Verifica que el archivo `.github/workflows/ci.yml` esté en el repo
- Verifica permisos de GitHub Actions en el repositorio
- Revisa la pestaña "Actions" en GitHub para ver errores

---

## 📚 Documentación Completa

Para más detalles, consulta:
- **Auditoría completa:** `docs/AUDITORIA_DEVOPS_MEJORAS_2025.md`
- **Arquitectura:** `docs/ARCHITECTURE.md`
- **Stack tecnológico:** `docs/STACK_TECNOLOGICO_COMPLETO.md`

---

**Última actualización:** Enero 2025

