# 🚀 Instrucciones Rápidas de Instalación - Sentry

## ⚡ Instalación Rápida (5 minutos)

### 1. Instalar Paquete
```bash
npm install @sentry/nextjs
```

### 2. Crear Proyecto en Sentry
- Ir a [sentry.io](https://sentry.io) y crear cuenta
- Crear proyecto **Next.js** llamado `viotech-pro-frontend`
- Copiar el **DSN** que aparece

### 3. Agregar DSN a Variables de Entorno

Crear o editar `.env.local`:
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@o4507467686985728.ingest.us.sentry.io/xxxxx
NEXT_PUBLIC_ENVIRONMENT=development
```

### 4. Habilitar en next.config.ts

Descomentar estas líneas al final del archivo `next.config.ts`:

```typescript
const { withSentryConfig } = require("@sentry/nextjs");

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "viotech-solutions",  // Cambiar por tu organización
  project: "viotech-pro-frontend",
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: false,
  automaticVercelMonitors: true,
});
```

### 5. Verificar

```bash
npm run build
```

Si el build es exitoso, **¡Sentry está funcionando!** 🎉

---

## ✅ ¿Qué está Listo?

- ✅ Configuración de cliente y servidor
- ✅ Integración con Error Boundary
- ✅ Integración con Logger
- ✅ Tracking de usuario automático
- ✅ Filtros de errores configurados

**Todo funciona automáticamente una vez instalado el paquete.**

---

## 📖 Documentación Completa

Ver `docs/SENTRY_SETUP_GUIDE.md` para guía detallada.

---

**Tiempo total**: ~5 minutos  
**Complejidad**: ⭐ Baja (solo instalar y configurar DSN)

