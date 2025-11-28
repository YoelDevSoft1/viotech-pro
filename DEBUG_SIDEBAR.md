# Debug del Sidebar Colapsado

## Problema Actual
El sidebar colapsado se ve muy ancho y los elementos no están alineados correctamente.

## Valores Actuales

### Constantes (sidebar.tsx)
- `SIDEBAR_WIDTH_ICON = "3rem"` → **48px**

### Elementos cuando está colapsado

#### 1. SidebarHeader (app-sidebar.tsx línea 66)
```
className="border-b p-4 group-data-[collapsible=icon]:p-0"
```
- Expandido: padding de 16px (p-4)
- Colapsado: **padding de 0px**

#### 2. Logo Icon (app-sidebar.tsx línea 68)
```
className="... size-8 ... group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:mx-auto"
```
- Expandido: 32px
- Colapsado: **32px** (sin cambio)

#### 3. SidebarContent (app-sidebar.tsx línea 77)
```
className="p-2 group-data-[collapsible=icon]:p-0"
```
- Expandido: padding de 8px
- Colapsado: **padding de 0px**

#### 4. SidebarGroup (sidebar.tsx línea 390)
```
className="... p-2 group-data-[collapsible=icon]:p-0"
```
- Expandido: padding de 8px
- Colapsado: **padding de 0px**

#### 5. SidebarMenuButton (sidebar.tsx línea 478)
```
group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-1
```
- Colapsado: tamaño **32px** (size-8) con padding **4px** (p-1)

#### 6. SidebarUser Avatar (sidebar-user.tsx línea 34)
```
className="h-9 w-9 ... group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8"
```
- Expandido: 36px
- Colapsado: **32px**

## Análisis del Problema

### Espacio disponible cuando está colapsado:
- Ancho total: **48px** (3rem)
- Iconos/avatares: **32px** (size-8)
- Espacio sobrante: **16px** (8px a cada lado)

### Problemas identificados:

1. **Header sin padding**: Con `p-0`, el icono de 32px toca los bordes del sidebar de 48px
   - Solo hay 8px de margen a cada lado
   - Se ve apretado

2. **Todos los elementos tienen p-0**: No hay padding interno en ningún contenedor
   - Los elementos tocan los bordes
   - No hay espacio visual

3. **Los iconos son muy grandes**: 32px en un contenedor de 48px deja muy poco espacio

## Soluciones Propuestas

### Opción 1: Reducir tamaño de iconos (RECOMENDADA)
- Cambiar iconos de `size-8` (32px) a `size-6` (24px) cuando está colapsado
- Mantener el ancho del sidebar en 48px
- Esto da: 48px - 24px = 24px de espacio (12px a cada lado) ✓

### Opción 2: Reducir ancho del sidebar
- Cambiar `SIDEBAR_WIDTH_ICON` de `3rem` (48px) a `2.5rem` (40px)
- Mantener iconos en 32px
- Esto da: 40px - 32px = 8px de espacio (4px a cada lado) ✗ (muy ajustado)

### Opción 3: Agregar padding mínimo
- Mantener todo como está pero agregar `p-1` (4px) cuando está colapsado
- Esto reduce el espacio de los iconos pero centra mejor

## Solución Implementada
Voy a implementar la **Opción 1**:
- Reducir tamaño de iconos a 24px (size-6)
- Reducir tamaño de avatar a 24px
- Reducir SidebarMenuButton a size-6 (24px)
- Mantener el ancho del sidebar en 48px pero reducirlo un poco a 44px (2.75rem) para que sea más compacto

