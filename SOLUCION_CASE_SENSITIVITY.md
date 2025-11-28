# 🔧 Solución: Case Sensitivity en Netlify

## Problema Identificado

Los archivos de componentes UI en Git tienen **mayúsculas iniciales** (`Badge.tsx`, `Button.tsx`) pero todos los **imports en el código usan minúsculas** (`badge.tsx`, `button.tsx`).

En Windows esto funciona porque el sistema de archivos no es case-sensitive, pero en **Linux (Netlify) sí lo es**, causando que los módulos no se encuentren.

## Archivos Afectados

Los siguientes archivos están en Git con mayúsculas pero se importan con minúsculas:

1. `components/ui/Badge.tsx` → debería ser `components/ui/badge.tsx`
2. `components/ui/Breadcrumb.tsx` → debería ser `components/ui/breadcrumb.tsx`
3. `components/ui/Button.tsx` → debería ser `components/ui/button.tsx`
4. `components/ui/Card.tsx` → debería ser `components/ui/card.tsx`
5. `components/ui/Pagination.tsx` → debería ser `components/ui/pagination.tsx`
6. `components/ui/Select.tsx` → debería ser `components/ui/select.tsx`
7. `components/ui/Skeleton.tsx` → debería ser `components/ui/skeleton.tsx`
8. `components/ui/State.tsx` → debería ser `components/ui/state.tsx`
9. `components/ui/Table.tsx` → debería ser `components/ui/table.tsx`
10. `components/ui/ToastProvider.tsx` → debería ser `components/ui/toast-provider.tsx`

## Solución: Renombrar Archivos en Git

En Windows, necesitamos usar un enfoque de 2 pasos porque el sistema de archivos no distingue entre mayúsculas y minúsculas.

### Opción 1: Usar Git MV con Nombres Temporales (Recomendado)

```bash
# Paso 1: Renombrar a nombres temporales
git mv components/ui/Badge.tsx components/ui/_badge.tsx
git mv components/ui/Breadcrumb.tsx components/ui/_breadcrumb.tsx
git mv components/ui/Button.tsx components/ui/_button.tsx
git mv components/ui/Card.tsx components/ui/_card.tsx
git mv components/ui/Pagination.tsx components/ui/_pagination.tsx
git mv components/ui/Select.tsx components/ui/_select.tsx
git mv components/ui/Skeleton.tsx components/ui/_skeleton.tsx
git mv components/ui/State.tsx components/ui/_state.tsx
git mv components/ui/Table.tsx components/ui/_table.tsx
git mv components/ui/ToastProvider.tsx components/ui/_toast-provider.tsx

# Paso 2: Renombrar a nombres finales en minúsculas
git mv components/ui/_badge.tsx components/ui/badge.tsx
git mv components/ui/_breadcrumb.tsx components/ui/breadcrumb.tsx
git mv components/ui/_button.tsx components/ui/button.tsx
git mv components/ui/_card.tsx components/ui/card.tsx
git mv components/ui/_pagination.tsx components/ui/pagination.tsx
git mv components/ui/_select.tsx components/ui/select.tsx
git mv components/ui/_skeleton.tsx components/ui/skeleton.tsx
git mv components/ui/_state.tsx components/ui/state.tsx
git mv components/ui/_table.tsx components/ui/table.tsx
git mv components/ui/_toast-provider.tsx components/ui/toast-provider.tsx

# Verificar cambios
git status

# Commit
git add -A
git commit -m "fix: renombrar componentes UI a minúsculas para compatibilidad case-sensitive en Netlify"
git push
```

### Opción 2: Eliminar y Re-agregar (Más Simple pero Pierde Historial)

```bash
# Eliminar archivos con mayúsculas de git (pero mantenerlos localmente)
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

# Agregar archivos con minúsculas (si existen localmente)
git add components/ui/badge.tsx
git add components/ui/breadcrumb.tsx
git add components/ui/button.tsx
git add components/ui/card.tsx
git add components/ui/pagination.tsx
git add components/ui/select.tsx
git add components/ui/skeleton.tsx
git add components/ui/state.tsx
git add components/ui/table.tsx

# Commit
git commit -m "fix: renombrar componentes UI a minúsculas para compatibilidad case-sensitive"
git push
```

## Verificación

Después de hacer los cambios:

1. Verifica que los archivos estén en minúsculas:
   ```bash
   git ls-files components/ui/*.tsx
   ```

2. Verifica que no haya duplicados:
   ```bash
   git ls-files components/ui/ | Select-String -Pattern 'Badge|Button|Card'
   ```

3. Haz un build local para verificar:
   ```bash
   npm run build
   ```

## Importante

⚠️ **Asegúrate de hacer esto en una rama separada o tener un backup antes de hacer push**, ya que esto cambiará el historial de Git para estos archivos.

---

**Última actualización**: Diciembre 2024

