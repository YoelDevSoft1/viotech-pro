# ⚠️ Sentry y Turbopack - Nota Importante

> **Fecha**: Enero 2025

---

## 📋 Situación Actual

Sentry está instalado y configurado, pero hay una limitación importante:

**Sentry aún no soporta completamente Turbopack en modo desarrollo.**

### El Problema

Next.js 16 usa Turbopack por defecto en desarrollo (`next dev`), pero Sentry agrega configuración de webpack automáticamente, lo que causa conflictos.

### La Solución

Se han implementado dos opciones:

---

## ✅ Opción 1: Desarrollo con Webpack (Recomendado para Sentry)

Para usar Sentry completamente en desarrollo, usar webpack:

```bash
npm run dev:webpack
```

Esto ejecuta `next dev --webpack` que:
- ✅ Funciona completamente con Sentry
- ✅ Soporta todas las características de Sentry
- ✅ Instrumentación completa del lado del servidor

---

## ⚠️ Opción 2: Desarrollo con Turbopack (Limitado)

Si prefieres usar Turbopack (más rápido), Sentry funcionará parcialmente:

```bash
npm run dev
```

**Limitaciones:**
- ⚠️ SDK no se carga completamente en el navegador
- ⚠️ Instrumentación del servidor puede ser incompleta
- ✅ Build de producción funciona perfectamente

**Advertencia:** Verás un warning pero la app funcionará. Solo que Sentry no capturará errores en desarrollo.

---

## 🎯 Recomendación

### Para Desarrollo Local

**Usar Webpack cuando trabajes con Sentry:**

```bash
npm run dev:webpack
```

**Razón:**
- Sentry funciona completamente
- Puedes probar captura de errores
- Instrumentación completa

### Para Producción

**No hay problema:**
- Build de producción (`npm run build`) funciona perfectamente
- Sentry funciona completamente en producción
- No hay limitaciones

---

## 🔧 Configuración Aplicada

1. ✅ Agregado `turbopack: {}` en `next.config.ts` para evitar error
2. ✅ Creado script `dev:webpack` para desarrollo completo con Sentry
3. ✅ Script `dev` normal sigue usando Turbopack (con advertencia)

---

## 📊 Resumen

| Modo | Comando | Sentry Funciona | Velocidad |
|------|---------|-----------------|-----------|
| **Desarrollo (Turbopack)** | `npm run dev` | ⚠️ Parcial | ⚡⚡⚡ Muy rápido |
| **Desarrollo (Webpack)** | `npm run dev:webpack` | ✅ Completo | ⚡ Rápido |
| **Producción** | `npm run build` | ✅ Completo | N/A |

---

## 🚀 Próximos Pasos

1. **Para desarrollo con Sentry completo:**
   ```bash
   npm run dev:webpack
   ```

2. **Para desarrollo rápido (sin probar Sentry):**
   ```bash
   npm run dev
   ```

3. **Producción (Sentry funciona perfecto):**
   ```bash
   npm run build
   ```

---

## 🔗 Referencia

- Issue de Sentry sobre Turbopack: https://github.com/getsentry/sentry-javascript/issues/8105
- Documentación Next.js Turbopack: https://nextjs.org/docs/app/api-reference/next-config-js/turbopack

---

**Nota**: Cuando Sentry agregue soporte completo para Turbopack, se actualizará esta configuración.

---

**Última actualización**: Enero 2025

