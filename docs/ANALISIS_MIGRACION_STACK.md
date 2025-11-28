# 📊 Análisis de Migración al Stack Tecnológico

## 🎯 Stack Objetivo

- ✅ **TanStack Query** (Gestión de estado del servidor y caché)
- ✅ **Axios** (Cliente HTTP centralizado)
- ✅ **Shadcn UI** (Biblioteca de componentes reutilizables)
- ✅ **Tailwind CSS v4** (Motor de estilos)
- ✅ **React Hook Form** (Gestión de formularios)
- ✅ **Zod** (Validación de esquemas y datos)
- ✅ **Sonner** (Sistema de notificaciones/toasts)
- ✅ **Next-Themes** (Gestión de modo oscuro/claro)

---

## ✅ Estado Actual: Tecnologías Instaladas

Todas las tecnologías del stack objetivo **YA ESTÁN INSTALADAS** en `package.json`:

```json
{
  "@tanstack/react-query": "^5.90.11",
  "axios": "^1.13.2",
  "react-hook-form": "^7.66.1",
  "zod": "^4.1.13",
  "sonner": "^2.0.7",
  "next-themes": "^0.4.6",
  "tailwindcss": "^4",
  "shadcn": "^3.5.1"
}
```

---

## 📈 Análisis por Tecnología

### 1. ✅ TanStack Query - **PARCIALMENTE MIGRADO**

#### ✅ **Bien Implementado:**
- ✅ Configuración en `app/providers.tsx` con QueryClient
- ✅ Hooks personalizados usando `useQuery` y `useMutation`:
  - `lib/hooks/useAuth.ts` - Login, registro, recuperación de contraseña
  - `lib/hooks/useTickets.ts` - Lista de tickets con filtros
  - `lib/hooks/useServices.ts` - Servicios del usuario
  - `lib/hooks/useDashboard.ts` - Métricas del dashboard
  - `lib/hooks/useResources.ts` - Organizaciones y proyectos

#### ⚠️ **Necesita Migración:**
- ❌ `lib/useAuth.ts` - Hook legacy con `fetchWithAuth` (debe eliminarse o refactorizarse)
- ❌ `lib/projects.ts` - Funciones `fetchProjects()` y `fetchProjectById()` usan `fetch` nativo
- ❌ `lib/services.ts` - Funciones `fetchUserServices()` y `fetchServiceCatalog()` usan `fetch` nativo
- ❌ `lib/payments.ts` - Funciones `prepareWompiWidget()` y `createWompiTransaction()` usan `fetch` nativo
- ❌ `lib/metrics.ts` - Función `fetchDashboardMetrics()` usa `fetch` nativo
- ❌ `app/(ops-internal)/internal/page.tsx` - Usa `useEffect` + `fetch` para cargar alertas
- ❌ `app/(ops-admin)/admin/*/page.tsx` - Varios archivos usan `fetch` directamente
- ❌ `components/admin/RoleManager.tsx` - Usa `fetch` directamente
- ❌ `components/Header.tsx` - Posible uso de `fetch`
- ❌ `components/TimelinePredictor.tsx` - Usa `fetch`
- ❌ `components/AITicketAssistant.tsx` - Usa `fetch`
- ❌ `components/MFASetupModal.tsx` - Usa `fetch`
- ❌ `components/MFASettings.tsx` - Usa `fetch`
- ❌ `components/ChangePasswordModal.tsx` - Usa `fetch`
- ❌ `app/(ops-internal)/internal/tickets/[id]/page.tsx` - Usa `fetch`

**Total de archivos con `fetch` nativo: ~32 archivos**

---

### 2. ✅ Axios - **PARCIALMENTE MIGRADO**

#### ✅ **Bien Implementado:**
- ✅ Cliente centralizado en `lib/apiClient.ts` con:
  - Interceptores de request/response
  - Manejo automático de tokens
  - Refresh automático de tokens
  - Manejo de errores centralizado
- ✅ Usado en hooks modernos:
  - `lib/hooks/useAuth.ts`
  - `lib/hooks/useTickets.ts`
  - `lib/hooks/useServices.ts`
  - `lib/hooks/useDashboard.ts`

#### ⚠️ **Necesita Migración:**
Todos los archivos que usan `fetch` nativo deben migrarse a `apiClient` de Axios.

**Archivos prioritarios:**
1. `lib/projects.ts` → Convertir a hooks con `useQuery`
2. `lib/services.ts` → Ya existe `useServices`, eliminar funciones legacy
3. `lib/payments.ts` → Convertir a hooks con `useMutation`
4. `lib/metrics.ts` → Ya existe `useDashboard`, eliminar función legacy

---

### 3. ✅ Shadcn UI - **BIEN IMPLEMENTADO** (con mejoras recomendadas)

#### ✅ **Estado:**
- ✅ Configuración en `components.json`
- ✅ Componentes instalados en `components/ui/`:
  - `button.tsx`, `card.tsx`, `dialog.tsx`, `form.tsx`, `input.tsx`
  - `select.tsx`, `textarea.tsx`, `badge.tsx`, `table.tsx`
  - `tabs.tsx`, `dropdown-menu.tsx`, `avatar.tsx`
  - `sonner.tsx` (toast), `skeleton.tsx`, `progress.tsx`
- ✅ Usado consistentemente en formularios y componentes

#### 💡 **Componentes Recomendados para Agregar:**

**Alta Prioridad:**
- ⭐ **`alert-dialog`** - Para confirmaciones (eliminar, deshabilitar MFA, etc.)
  - Útil en: `components/MFASettings.tsx`, `components/admin/RoleManager.tsx`
  - Comando: `npx shadcn@latest add @shadcn/alert-dialog`

**Media Prioridad:**
- 📅 **`calendar`** - Para selección de fechas (SLA, fechas de tickets)
  - Útil en: `components/tickets/CreateTicketDialog.tsx`
  - Comando: `npx shadcn@latest add @shadcn/calendar`
  
- 🔍 **`command`** - Para búsqueda y selección mejorada
  - Útil en: Búsqueda de tickets, proyectos, usuarios
  - Comando: `npx shadcn@latest add @shadcn/command`

- 📱 **`drawer`** - Para paneles móviles (alternativa a dialog en móvil)
  - Útil en: Menús móviles, paneles laterales
  - Comando: `npx shadcn@latest add @shadcn/drawer`

**Baja Prioridad:**
- `popover` - Para tooltips y menús contextuales
- `hover-card` - Para información adicional al hover
- `slider` - Para rangos de valores
- `toggle` - Para switches alternativos

---

### 4. ✅ Tailwind CSS v4 - **BIEN IMPLEMENTADO**

#### ✅ **Estado:**
- ✅ Instalado y configurado
- ✅ `app/globals.css` usa sintaxis v4 (`@import "tailwindcss"`)
- ✅ Variables CSS personalizadas para tema claro/oscuro
- ✅ Configuración de PostCSS correcta

**No requiere migración adicional.**

---

### 5. ✅ React Hook Form + Zod - **PARCIALMENTE MIGRADO**

#### ✅ **Bien Implementado:**
- ✅ `app/(auth)/login/page.tsx` - Login y registro con RHF + Zod
- ✅ `components/tickets/CreateTicketDialog.tsx` - Creación de tickets
- ✅ `app/(auth)/forgot-password/page.tsx` - Recuperación de contraseña
- ✅ `app/(auth)/reset-password/page.tsx` - Reset de contraseña
- ✅ Componente `components/ui/form.tsx` configurado correctamente

#### ⚠️ **Necesita Migración:**
- ❌ `components/Contact.tsx` - Posible uso de formulario sin RHF
- ❌ `components/MFASetupModal.tsx` - Verificar si usa RHF
- ❌ `components/ChangePasswordModal.tsx` - Verificar si usa RHF
- ❌ Cualquier formulario que use `useState` para campos de formulario

---

### 6. ✅ Sonner - **BIEN IMPLEMENTADO**

#### ✅ **Estado:**
- ✅ Instalado y configurado
- ✅ Usado en hooks de autenticación (`useAuth.ts`)
- ✅ Usado en `CreateTicketDialog.tsx`
- ✅ Provider configurado en `components/ui/sonner.tsx`

**No requiere migración adicional.**

---

### 7. ✅ Next-Themes - **BIEN IMPLEMENTADO**

#### ✅ **Estado:**
- ✅ Instalado y configurado en `app/providers.tsx`
- ✅ Provider `ThemeProvider` activo
- ✅ Variables CSS para tema oscuro en `globals.css`

**No requiere migración adicional.**

---

## 🎯 Plan de Migración Priorizado

### **Fase 1: Migración de Funciones Legacy a Hooks (Alta Prioridad)**

#### 1.1 Migrar `lib/projects.ts` → Crear `lib/hooks/useProjects.ts`
```typescript
// Eliminar: fetchProjects(), fetchProjectById()
// Crear: useProjects(orgId), useProject(id)
```

#### 1.2 Migrar `lib/payments.ts` → Crear `lib/hooks/usePayments.ts`
```typescript
// Eliminar: prepareWompiWidget(), createWompiTransaction()
// Crear: usePrepareWompiWidget(), useCreateWompiTransaction()
```

#### 1.3 Limpiar funciones duplicadas
- Eliminar `lib/services.ts` (ya existe `useServices`)
- Eliminar `lib/metrics.ts` (ya existe `useDashboard`)

---

### **Fase 2: Migrar Componentes que usan `fetch` (Alta Prioridad)**

#### 2.1 Componentes de Admin
- `app/(ops-admin)/admin/*/page.tsx` - Convertir a hooks
- `components/admin/RoleManager.tsx` - Convertir a hooks

#### 2.2 Componentes de Internal
- `app/(ops-internal)/internal/page.tsx` - Convertir alertas a hook
- `app/(ops-internal)/internal/tickets/[id]/page.tsx` - Convertir a hook

#### 2.3 Componentes de UI
- `components/TimelinePredictor.tsx`
- `components/AITicketAssistant.tsx`
- `components/MFASetupModal.tsx`
- `components/MFASettings.tsx`
- `components/ChangePasswordModal.tsx`

---

### **Fase 3: Migrar Formularios Legacy (Media Prioridad)**

- Verificar y migrar formularios que usan `useState` en lugar de RHF
- Asegurar que todos los formularios usen Zod para validación

---

### **Fase 4: Limpieza Final (Baja Prioridad)**

- Eliminar `lib/useAuth.ts` (hook legacy con `fetchWithAuth`)
- Eliminar funciones `fetchWithAuth` de cualquier componente
- Eliminar imports de `buildApiUrl` donde no sean necesarios
- Consolidar manejo de errores

---

## 📋 Checklist de Migración por Archivo

### **Archivos a Migrar (Prioridad Alta)**

- [ ] `lib/projects.ts` → `lib/hooks/useProjects.ts`
- [ ] `lib/payments.ts` → `lib/hooks/usePayments.ts`
- [ ] `lib/services.ts` → Eliminar (usar `useServices`)
- [ ] `lib/metrics.ts` → Eliminar (usar `useDashboard`)
- [ ] `app/(ops-internal)/internal/page.tsx`
- [ ] `app/(ops-internal)/internal/tickets/[id]/page.tsx`
- [ ] `app/(ops-admin)/admin/health/page.tsx`
- [ ] `app/(ops-admin)/admin/page.tsx`
- [ ] `app/(ops-admin)/admin/settings/page.tsx`
- [ ] `app/(ops-admin)/admin/tickets/page.tsx`
- [ ] `components/admin/RoleManager.tsx`
- [ ] `components/TimelinePredictor.tsx`
- [ ] `components/AITicketAssistant.tsx`
- [ ] `components/MFASetupModal.tsx`
- [ ] `components/MFASettings.tsx`
- [ ] `components/ChangePasswordModal.tsx`

### **Archivos a Eliminar (Después de Migración)**

- [ ] `lib/useAuth.ts` (reemplazado por hooks en `lib/hooks/useAuth.ts`)
- [ ] `lib/projects.ts` (reemplazado por `lib/hooks/useProjects.ts`)
- [ ] `lib/services.ts` (reemplazado por `lib/hooks/useServices.ts`)
- [ ] `lib/payments.ts` (reemplazado por `lib/hooks/usePayments.ts`)
- [ ] `lib/metrics.ts` (reemplazado por `lib/hooks/useDashboard.ts`)

---

## 🔍 Patrones de Migración

### **Patrón 1: Función `fetch` → Hook `useQuery`**

**Antes:**
```typescript
// lib/projects.ts
export async function fetchProjects(organizationId?: string): Promise<Project[]> {
  let token = getAccessToken();
  // ... manejo de token
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // ... procesamiento
}
```

**Después:**
```typescript
// lib/hooks/useProjects.ts
export function useProjects(organizationId?: string) {
  const { orgId } = useOrg();
  
  return useQuery({
    queryKey: ["projects", organizationId || orgId],
    queryFn: async () => {
      const { data } = await apiClient.get("/projects", {
        params: { organizationId: organizationId || orgId },
      });
      return data?.data || [];
    },
    enabled: !!(organizationId || orgId),
  });
}
```

### **Patrón 2: Función `fetch` POST → Hook `useMutation`**

**Antes:**
```typescript
// lib/payments.ts
export async function prepareWompiWidget(planId: string) {
  let token = getAccessToken();
  // ... manejo de token
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ planId }),
  });
  // ... procesamiento
}
```

**Después:**
```typescript
// lib/hooks/usePayments.ts
export function usePrepareWompiWidget() {
  return useMutation({
    mutationFn: async (planId: string) => {
      const { data } = await apiClient.post("/payments/prepare-widget", { planId });
      return data?.data;
    },
    onSuccess: () => {
      toast.success("Widget preparado correctamente");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al preparar pago");
    },
  });
}
```

### **Patrón 3: `useEffect` + `fetch` → `useQuery`**

**Antes:**
```typescript
useEffect(() => {
  const loadData = async () => {
    const token = getAccessToken();
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setData(data);
  };
  loadData();
}, []);
```

**Después:**
```typescript
const { data, isLoading } = useQuery({
  queryKey: ["data"],
  queryFn: async () => {
    const { data } = await apiClient.get("/endpoint");
    return data;
  },
});
```

---

## 📊 Resumen de Estado

| Tecnología | Estado | Progreso | Acción Requerida |
|------------|--------|----------|------------------|
| **TanStack Query** | ⚠️ Parcial | ~40% | Migrar 32 archivos con `fetch` |
| **Axios** | ⚠️ Parcial | ~40% | Reemplazar `fetch` por `apiClient` |
| **Shadcn UI** | ✅ Completo | 100% | Agregar: alert-dialog, calendar, command, drawer (opcional) |
| **Tailwind CSS v4** | ✅ Completo | 100% | Ninguna |
| **React Hook Form** | ⚠️ Parcial | ~70% | Migrar formularios legacy |
| **Zod** | ⚠️ Parcial | ~70% | Asegurar validación en todos los forms |
| **Sonner** | ✅ Completo | 100% | Ninguna |
| **Next-Themes** | ✅ Completo | 100% | Ninguna |

---

## 🚀 Próximos Pasos Recomendados

### **Fase 0: Mejoras de Shadcn UI (Opcional pero Recomendado)**

1. **Agregar componentes útiles:**
   ```bash
   # Componentes de alta prioridad
   npx shadcn@latest add @shadcn/alert-dialog
   
   # Componentes de media prioridad
   npx shadcn@latest add @shadcn/calendar
   npx shadcn@latest add @shadcn/command
   npx shadcn@latest add @shadcn/drawer
   ```

2. **Refactorizar componentes existentes:**
   - Reemplazar confirmaciones manuales con `alert-dialog`
   - Usar `calendar` para selección de fechas en formularios

### **Fase 1: Crear Hooks Faltantes**

1. **Crear hooks faltantes:**
   - `lib/hooks/useProjects.ts`
   - `lib/hooks/usePayments.ts`

### **Fase 2: Migrar Componentes Prioritarios**

2. **Migrar componentes prioritarios:**
   - Empezar por componentes de admin/internal
   - Luego componentes de UI generales

### **Fase 3: Limpieza y Testing**

3. **Eliminar código legacy:**
   - Después de migrar, eliminar funciones `fetch` legacy
   - Limpiar imports no utilizados

4. **Testing:**
   - Verificar que todos los componentes migrados funcionen correctamente
   - Asegurar que el caché de React Query funcione bien

---

## 📝 Notas Importantes

- El proyecto **YA TIENE** todas las dependencias instaladas
- La arquitectura base está bien establecida
- La migración es principalmente **refactorización de código existente**
- No se requieren cambios en la configuración del proyecto
- El `apiClient` de Axios ya está bien configurado y listo para usar

---

---

## 🎨 Ejemplos de Uso de Componentes Shadcn Recomendados

### **1. Alert Dialog - Para Confirmaciones**

**Ejemplo: Reemplazar confirmación manual en MFASettings**

**Antes:**
```typescript
// components/MFASettings.tsx
const [disableModalOpen, setDisableModalOpen] = useState(false);

// Confirmación manual con estado
```

**Después (con alert-dialog):**
```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Deshabilitar MFA</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta acción deshabilitará la autenticación de dos factores.
        Tu cuenta será menos segura.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={handleDisableMFA}>
        Deshabilitar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### **2. Calendar - Para Selección de Fechas**

**Ejemplo: Agregar selector de fecha en CreateTicketDialog**

```typescript
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

<FormField
  control={form.control}
  name="slaObjetivo"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Fecha Objetivo SLA</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            {field.value ? format(field.value, "PPP") : "Seleccionar fecha"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={field.onChange}
            disabled={(date) => date < new Date()}
          />
        </PopoverContent>
      </Popover>
    </FormItem>
  )}
/>
```

### **3. Command - Para Búsqueda Mejorada**

**Ejemplo: Búsqueda de tickets/proyectos**

```typescript
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

<Command>
  <CommandInput placeholder="Buscar ticket..." />
  <CommandList>
    <CommandEmpty>No se encontraron resultados.</CommandEmpty>
    <CommandGroup heading="Tickets">
      {tickets.map((ticket) => (
        <CommandItem
          key={ticket.id}
          onSelect={() => handleSelectTicket(ticket.id)}
        >
          {ticket.titulo}
        </CommandItem>
      ))}
    </CommandGroup>
  </CommandList>
</Command>
```

---

**Última actualización:** $(date)
**Total de archivos a migrar:** ~32 archivos
**Tiempo estimado de migración:** 2-3 días de desarrollo

