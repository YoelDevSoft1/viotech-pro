# 🔧 Guía de Configuración de Sentry - VioTech Pro

> **Objetivo**: Configurar Sentry para monitoreo de errores y performance en producción  
> **Tiempo estimado**: 15-20 minutos

---

## 📋 Prerequisitos

- ✅ Cuenta en Sentry (gratis hasta 5,000 eventos/mes)
- ✅ Acceso a variables de entorno del proyecto
- ✅ Permisos para instalar paquetes npm

---

## 🚀 Instalación Paso a Paso

### Paso 1: Crear Proyecto en Sentry

1. **Ir a [Sentry.io](https://sentry.io)** y crear cuenta (si no tienes)

2. **Crear nuevo proyecto:**
   - Dashboard → Projects → Create Project
   - Seleccionar: **Next.js**
   - Nombre: `viotech-pro-frontend`
   - Organización: `viotech-solutions` (o la tuya)

3. **Copiar el DSN:**
   - Después de crear el proyecto, verás un DSN
   - Ejemplo: `https://xxxxx@o4507467686985728.ingest.us.sentry.io/xxxxx`
   - **Guardar este DSN** para el siguiente paso

### Paso 2: Instalar Dependencias

```bash
npm install @sentry/nextjs
```

Este paquete incluye:
- SDK de Sentry para Next.js
- Integraciones automáticas
- Webpack plugin para source maps
- Configuración optimizada

### Paso 3: Ejecutar Wizard de Configuración

```bash
npx @sentry/wizard@latest -i nextjs
```

El wizard:
- ✅ Detectará la configuración existente
- ✅ Creará archivos adicionales necesarios
- ✅ Actualizará `next.config.ts` automáticamente
- ✅ Configurará source maps

**Nota**: Los archivos `sentry.client.config.ts` y `sentry.server.config.ts` ya existen, el wizard los puede actualizar. Revisa antes de sobrescribir.

### Paso 4: Configurar Variables de Entorno

Agregar a `.env.local` (y a las variables de entorno de tu plataforma de deploy):

```env
# Sentry DSN (obtener de tu proyecto en Sentry)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@o4507467686985728.ingest.us.sentry.io/xxxxx

# Entorno (development, staging, production)
NEXT_PUBLIC_ENVIRONMENT=development

# Versión de la app (opcional, para tracking de releases)
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Paso 5: Actualizar next.config.ts

Descomentar las líneas de Sentry en `next.config.ts`:

```typescript
// Descomentar estas líneas:
const { withSentryConfig } = require("@sentry/nextjs");

// Al final del archivo:
export default withSentryConfig(nextConfig, {
  silent: true,
  org: "viotech-solutions",  // Cambiar por tu org
  project: "viotech-pro-frontend",
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: false,
  automaticVercelMonitors: true,
});
```

### Paso 6: Verificar Configuración

1. **Verificar que los archivos existen:**
   - ✅ `sentry.client.config.ts`
   - ✅ `sentry.server.config.ts`
   - ✅ `sentry.edge.config.ts` (creado por wizard)

2. **Hacer build para verificar:**
   ```bash
   npm run build
   ```

3. **Probar captura de errores:**
   - Iniciar app: `npm run dev`
   - Simular un error usando el componente de prueba:
     ```typescript
     import { ErrorTrigger } from '@/components/common/ErrorBoundary.test';
     <ErrorTrigger />
     ```

---

## 🎯 Características Configuradas

### ✅ Error Tracking

- **Errores de JavaScript**: Capturados automáticamente
- **Errores de React**: Capturados por Error Boundary
- **Errores de API**: Capturados por logger integrado
- **Errores del servidor**: Capturados en server-side

### ✅ Performance Monitoring

- **Transaction Tracing**: Configurado automáticamente
- **Web Vitals**: Core Web Vitals tracking
- **Slow Queries**: Queries lentas identificadas

### ✅ Session Replay

- **Replay automático**: Para sesiones con errores (100%)
- **Privacidad**: Todo el texto y medios enmascarados
- **Sample Rate**: 10% en producción, 100% con errores

### ✅ Filtros Configurados

**Errores que NO se envían a Sentry:**
- ❌ Endpoints no implementados (`ENDPOINT_NOT_IMPLEMENTED`)
- ❌ Errores de cold starts (timeouts esperados)
- ❌ Errores de chunks no encontrados (legítimos)
- ❌ Errores de extensiones del navegador
- ❌ ResizeObserver loop errors (no críticos)

---

## 🔍 Verificación Post-Instalación

### Checklist

- [ ] Paquete `@sentry/nextjs` instalado
- [ ] DSN configurado en variables de entorno
- [ ] `next.config.ts` actualizado con `withSentryConfig`
- [ ] Build exitoso sin errores
- [ ] Error de prueba capturado en Sentry dashboard

### Pruebas

1. **Capturar error manualmente:**
   ```typescript
   // En cualquier componente
   import * as Sentry from '@sentry/nextjs';
   
   Sentry.captureException(new Error('Test error from Sentry'));
   ```

2. **Verificar en Sentry:**
   - Ir a tu proyecto en Sentry
   - Verificar que el error aparece en "Issues"
   - Revisar que tiene contexto completo (usuario, ruta, stack trace)

3. **Verificar Performance:**
   - Ir a "Performance" en Sentry
   - Verificar que aparecen transactions de Next.js
   - Revisar que las métricas están siendo recopiladas

---

## 📊 Configuración Avanzada

### Agregar Contexto de Usuario

```typescript
// En app/layout.tsx o donde tengas acceso al usuario
import * as Sentry from '@sentry/nextjs';

useEffect(() => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.nombre,
    });
  }
}, [user]);
```

### Configurar Release Tracking

```env
# En variables de entorno
NEXT_PUBLIC_APP_VERSION=1.2.3
```

Esto permite:
- Rastrear qué versión tiene cada error
- Filtrar errores por versión
- Ver progreso entre releases

### Configurar Alertas

En Sentry Dashboard:
1. Ir a **Alerts**
2. Crear nueva alerta:
   - Trigger: "Issue frequency"
   - Condición: "More than 10 issues in 5 minutes"
   - Acción: Email o Slack

---

## 🔗 Integraciones Existentes

### Logger

El logger ya está integrado con Sentry:
- ✅ Errores críticos se envían automáticamente
- ✅ Contexto completo incluido
- ✅ Tags y metadata agregados

### Error Boundary

El Error Boundary ya está integrado:
- ✅ Errores capturados se envían a Sentry
- ✅ Stack trace completo
- ✅ Ruta y contexto incluidos

---

## 🚨 Troubleshooting

### Error: "Cannot find module '@sentry/nextjs'"

**Solución:**
```bash
npm install @sentry/nextjs
```

### Error: "Sentry DSN not configured"

**Solución:**
- Verificar que `NEXT_PUBLIC_SENTRY_DSN` esté en `.env.local`
- Reiniciar el servidor de desarrollo
- Verificar que no haya espacios en el DSN

### No aparecen errores en Sentry

**Verificar:**
1. DSN correcto en variables de entorno
2. Entorno configurado correctamente
3. Filtros no están bloqueando errores legítimos
4. Build completado exitosamente

### Errores de build con Sentry

**Solución:**
```bash
# Limpiar y rebuild
rm -rf .next
npm run build
```

---

## 📚 Recursos

- [Documentación Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Dashboard](https://sentry.io)
- [Configuración Avanzada](./AUDITORIA_DEVOPS_MEJORAS_2025.md#32-integración-sentry)

---

**Última actualización**: Enero 2025

