# 🚀 Guía Rápida de Migración i18n

## 📝 Checklist Rápido por Componente

### **1. Identificar Textos**
```tsx
// Buscar strings hardcodeados en español/inglés
// Ejemplos: "Guardar", "Cancelar", "Bienvenido", etc.
```

### **2. Agregar Claves a Traducciones**
```json
// messages/es.json, messages/en.json, messages/pt.json
{
  "seccion": {
    "clave": "Texto traducido"
  }
}
```

### **3. Usar en Componente**
```tsx
import { useTranslations } from "next-intl";

const t = useTranslations("seccion");
<h1>{t("clave")}</h1>
```

### **4. Formateo de Fechas/Números**
```tsx
import { useI18n } from "@/lib/hooks/useI18n";

const { formatDate, formatCurrency, formatNumber } = useI18n();
<span>{formatDate(date)}</span>
```

---

## 🔍 Búsqueda de Textos Hardcodeados

### **Comandos Útiles:**

```bash
# Buscar strings comunes en español
grep -r "Guardar\|Cancelar\|Eliminar\|Editar" app/ components/

# Buscar títulos de páginas
grep -r "title.*=" app/

# Buscar placeholders
grep -r "placeholder.*=" app/ components/
```

---

## 📋 Plantilla de Migración

### **Antes:**
```tsx
export function MyComponent() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bienvenido a tu panel de control</p>
      <Button>Guardar</Button>
      <span>{new Date().toLocaleDateString()}</span>
    </div>
  );
}
```

### **Después:**
```tsx
"use client";

import { useTranslations } from "next-intl";
import { useI18n } from "@/lib/hooks/useI18n";

export function MyComponent() {
  const t = useTranslations("dashboard");
  const { formatDate } = useI18n();

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
      <Button>{t("save")}</Button>
      <span>{formatDate(new Date())}</span>
    </div>
  );
}
```

---

## 🎯 Orden Recomendado de Migración

1. **Componentes UI** (Button, Dialog, Alert)
2. **Header y Sidebar** (navegación)
3. **Dashboard** (página principal)
4. **Formularios** (Create/Edit)
5. **Listas** (Tickets, Proyectos)
6. **Detalles** (Detalle de ticket/proyecto)
7. **Vistas especiales** (Kanban, Gantt)
8. **Páginas de marketing**

---

## ⚠️ Errores Comunes

### **Error 1: Olvidar "use client"**
```tsx
// ❌ INCORRECTO (Server Component)
import { useTranslations } from "next-intl";

// ✅ CORRECTO
"use client";
import { useTranslations } from "next-intl";
```

### **Error 2: Clave de traducción no existe**
```tsx
// ❌ INCORRECTO
t("clave.inexistente") // Error en runtime

// ✅ CORRECTO
// Asegurarse de agregar la clave en todos los archivos JSON
```

### **Error 3: No traducir todos los idiomas**
```json
// ❌ INCORRECTO - Solo en español
// messages/es.json
{ "key": "valor" }

// ✅ CORRECTO - En todos los idiomas
// messages/es.json, messages/en.json, messages/pt.json
{ "key": "valor" }
```

---

## 🔗 Referencias Rápidas

- **Hook de traducciones:** `useTranslations("namespace")`
- **Hook de formateo:** `useI18n()`
- **Selector de idioma:** `<LocaleSelector />`
- **Archivos de traducción:** `messages/{locale}.json`

---

**Última actualización:** Diciembre 2024

