# 🚀 Guía de Optimización de Caching - React Query

> **Objetivo**: Optimizar el caching en React Query para mejorar performance y reducir carga del servidor

---

## 📊 Estrategia de Caching por Tipo de Dato

### Datos Estáticos (30 minutos - 1 hora)

**Cuando usar:**
- Catálogos de servicios
- Categorías
- Tags
- Configuraciones que cambian raramente

**Ejemplo:**
```typescript
staleTime: 1000 * 60 * 30, // 30 minutos
```

**Hooks actuales:**
- ✅ `useServiceCatalog` - 30 min (correcto)
- ✅ `useServiceCategories` - 1 hora (correcto)
- ✅ `useServiceTags` - 1 hora (correcto)

---

### Datos Semi-Estáticos (5-15 minutos)

**Cuando usar:**
- Servicios individuales
- Perfiles de usuario
- Preferencias de usuario
- Configuraciones de dashboard

**Ejemplo:**
```typescript
staleTime: 1000 * 60 * 5, // 5 minutos
```

**Hooks actuales:**
- ✅ `useServiceBySlug` - 15 min (correcto)
- ✅ `useDashboard` metrics - 5 min (correcto)
- ✅ `useUserPreferences` - 5 min (correcto)

---

### Datos Dinámicos (1-2 minutos)

**Cuando usar:**
- Tickets
- Notificaciones
- Métricas del dashboard
- Actividad reciente

**Ejemplo:**
```typescript
staleTime: 1000 * 60, // 1 minuto
```

**Hooks actuales:**
- ✅ `useTickets` - 1 min (correcto)
- ✅ `useDashboard` activity - 2 min (correcto)
- ✅ `useNotifications` - 30 seg (puede mejorar)

---

### Datos en Tiempo Real (0-30 segundos)

**Cuando usar:**
- Notificaciones en tiempo real
- Sesiones activas
- Estado de tickets en kanban
- Métricas en tiempo real

**Ejemplo:**
```typescript
staleTime: 0, // Siempre fresco
// O
staleTime: 1000 * 30, // 30 segundos
```

**Hooks actuales:**
- ✅ `useNotifications` - 30 seg (correcto)
- ✅ `useSessions` - 30 seg (correcto)
- ✅ `useKanban` columns - 30 seg (correcto)

---

## ✅ Hooks Optimizados Correctamente

### Estáticos (30min+)
- `useServiceCatalog` - 30 min ✅
- `useServiceCategories` - 1 hora ✅
- `useServiceTags` - 1 hora ✅

### Semi-Estáticos (5-15min)
- `useServiceBySlug` - 15 min ✅
- `useDashboard` metrics - 5 min ✅
- `useNotificationPreferences` - 5 min ✅
- `useUserPreferences` - 5 min ✅
- `useOnboardingProgress` - 5 min ✅
- `useModelStatus` - 5 min ✅

### Dinámicos (1-2min)
- `useTickets` - 1 min ✅
- `useDashboard` activity - 2 min ✅
- `useMetrics` - 5 min ✅ (puede bajar a 2 min)
- `useResources` - 1 min ✅

### Tiempo Real (0-30seg)
- `useNotifications` - 30 seg ✅
- `useSessions` - 30 seg ✅
- `useKanban` - 30 seg ✅

---

## 🔧 Mejoras Recomendadas

### 1. Optimizar Hooks de Métricas

**Antes:**
```typescript
staleTime: 1000 * 60 * 5, // 5 minutos
```

**Después:**
```typescript
staleTime: 1000 * 60 * 2, // 2 minutos (más fresco para métricas)
```

**Aplicar a:**
- `useMetrics` - Cambiar de 5 min a 2 min

### 2. Optimizar Hooks de Blog

**Actual:**
- Public posts: 5 min ✅
- Admin posts: 2 min ✅
- Categories: 30 min ✅

**Recomendación:** Mantener actual

### 3. Optimizar Hooks de Recursos

**Actual:**
- Resources: 1 min ✅
- Availability: 30 seg ✅

**Recomendación:** Mantener actual

---

## 📝 Guía de Implementación

### Para Nuevos Hooks

Sigue esta tabla:

| Tipo de Dato | staleTime | Ejemplo |
|--------------|-----------|---------|
| **Catálogo/Servicios** | 30 min | `useServiceCatalog` |
| **Configuración** | 5-15 min | `useUserPreferences` |
| **Dashboard/Métricas** | 2-5 min | `useDashboard` |
| **Tickets/Notificaciones** | 30 seg - 2 min | `useTickets` |
| **Tiempo Real** | 0-30 seg | `useNotifications` |

### Template para Nuevos Hooks

```typescript
// Datos estáticos
export function useMyStaticData() {
  return useQuery({
    queryKey: ["my-data"],
    queryFn: fetchMyData,
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}

// Datos dinámicos
export function useMyDynamicData() {
  return useQuery({
    queryKey: ["my-data"],
    queryFn: fetchMyData,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

// Tiempo real
export function useMyRealtimeData() {
  return useQuery({
    queryKey: ["my-data"],
    queryFn: fetchMyData,
    staleTime: 0, // Siempre fresco
    refetchInterval: 30000, // Refetch cada 30 seg
  });
}
```

---

## 🎯 Mejores Prácticas

### 1. Invalidación Inteligente

**Después de mutations, invalidar solo queries relacionadas:**

```typescript
const queryClient = useQueryClient();

// Después de crear ticket
await createTicket(data);
queryClient.invalidateQueries({ queryKey: ["tickets"] });
queryClient.invalidateQueries({ queryKey: ["dashboard-activity"] });
```

### 2. Prefetching

**Prefetch datos que probablemente se necesiten:**

```typescript
// En página de servicios, prefetch detalles
queryClient.prefetchQuery({
  queryKey: ["service", slug],
  queryFn: () => fetchService(slug),
  staleTime: 1000 * 60 * 15,
});
```

### 3. Optimistic Updates

**Para mejor UX, actualizar cache optimísticamente:**

```typescript
const mutation = useMutation({
  mutationFn: updateTicket,
  onMutate: async (newData) => {
    // Cancelar queries en curso
    await queryClient.cancelQueries({ queryKey: ["ticket", id] });
    
    // Snapshot del valor anterior
    const previous = queryClient.getQueryData(["ticket", id]);
    
    // Actualizar optimísticamente
    queryClient.setQueryData(["ticket", id], newData);
    
    return { previous };
  },
  onError: (err, newData, context) => {
    // Revertir en caso de error
    queryClient.setQueryData(["ticket", id], context.previous);
  },
});
```

---

## 📊 Impacto Esperado

### Reducción de Requests

- **Datos estáticos**: Reducción del 80-90%
- **Datos semi-estáticos**: Reducción del 50-70%
- **Datos dinámicos**: Reducción del 20-30%

### Mejora de Performance

- **Carga inicial**: Más rápida (datos desde cache)
- **Navegación**: Instantánea (sin esperar requests)
- **UX**: Más fluida y responsiva

---

## 🔍 Monitoreo

### Verificar Caching

```typescript
// En DevTools de React Query
const queryData = queryClient.getQueryData(["my-key"]);
console.log("Cached data:", queryData);
```

### Verificar Invalidación

```typescript
// Verificar si query está stale
const queryState = queryClient.getQueryState(["my-key"]);
console.log("Is stale:", queryState?.isStale);
```

---

## ✅ Checklist de Optimización

- [x] Catálogos y servicios - 30 min
- [x] Configuraciones - 5-15 min
- [x] Dashboard - 2-5 min
- [x] Tickets/Notificaciones - 30 seg - 2 min
- [x] Tiempo real - 0-30 seg
- [ ] Revisar hooks sin staleTime
- [ ] Implementar prefetching donde aplique
- [ ] Optimistic updates en mutations críticas

---

**Última actualización**: Enero 2025

