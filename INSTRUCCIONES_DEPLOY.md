# 🚀 Instrucciones para Corregir el Deploy en Netlify

## Problema Principal

**Case Sensitivity**: Los archivos en Git tienen mayúsculas (`Badge.tsx`) pero los imports usan minúsculas (`badge.tsx`). Netlify (Linux) es case-sensitive y no puede encontrar los módulos.

## Solución Rápida

### Paso 1: Ejecutar Corrección

Ya se ejecutó automáticamente la corrección. Verifica el estado:

```bash
git status
```

### Paso 2: Verificar Cambios

Deberías ver cambios como:
```
D  components/ui/Badge.tsx
D  components/ui/Button.tsx
...
A  components/ui/badge.tsx
A  components/ui/button.tsx
```

### Paso 3: Commit y Push

```bash
git add -A
git commit -m "fix: corregir case sensitivity de componentes UI para Netlify"
git push
```

### Paso 4: Monitorear Deploy en Netlify

1. Ve a tu sitio en Netlify
2. Revisa el build en tiempo real
3. Verifica que no aparezcan más errores de "Module not found"

## Si los Cambios no se Aplicaron

Ejecuta manualmente:

```bash
# Eliminar archivos con mayúsculas
git rm --cached components/ui/Badge.tsx
git rm --cached components/ui/Breadcrumb.tsx
git rm --cached components/ui/Button.tsx
git rm --cached components/ui/Card.tsx
git rm --cached components/ui/Pagination.tsx
git rm --cached components/ui/Select.tsx
git rm --cached components/ui/Skeleton.tsx
git rm --cached components/ui/State.tsx
git rm --cached components/ui/Table.tsx
git rm --cached components/ui/ToastProvider.tsx

# Agregar archivos con minúsculas
git add -f components/ui/badge.tsx
git add -f components/ui/breadcrumb.tsx
git add -f components/ui/button.tsx
git add -f components/ui/card.tsx
git add -f components/ui/pagination.tsx
git add -f components/ui/select.tsx
git add -f components/ui/skeleton.tsx
git add -f components/ui/state.tsx
git add -f components/ui/table.tsx

# Si ToastProvider existe, crear toast-provider.tsx
if [ -f "components/ui/ToastProvider.tsx" ]; then
  cp components/ui/ToastProvider.tsx components/ui/toast-provider.tsx
  git add -f components/ui/toast-provider.tsx
  git rm --cached components/ui/ToastProvider.tsx
fi

# Commit
git commit -m "fix: corregir case sensitivity de componentes UI para Netlify"
git push
```

## Verificación Final

Después del deploy exitoso, verifica:

1. ✅ No hay errores de "Module not found"
2. ✅ El build completa sin errores
3. ✅ El sitio funciona correctamente

---

**Nota**: Si después del deploy aún hay errores, puede ser necesario limpiar el caché de Netlify en la configuración del sitio.

