# VioTech Pro · Arquitectura Frontend

> Última actualización: Enero 2025  
> Alcance: Frontend (Next.js 16, React 19) y puntos de integración con backend (`viotech-main.onrender.com`)

## 📋 Índice

1. [Stack Tecnológico](#stack-tecnológico)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Arquitectura de Desarrollo](#arquitectura-de-desarrollo)
4. [Autenticación y Roles](#autenticación-y-roles)
5. [Integraciones Backend](#integraciones-backend)
6. [Design System](#design-system)
7. [Seguridad y Errores](#seguridad-y-errores)

---

## 🛠️ Stack Tecnológico

### Framework y Core
- **Next.js 16** (App Router) - Framework principal
- **React 19** - Biblioteca UI base
- **TypeScript 5** (strict mode) - Type safety

### Estilos y UI
- **Tailwind CSS 4** - Utility-first styling
- **Shadcn/UI** - Design system base
- **Radix UI** - Primitives accesibles
- **Lucide React** - Iconos

### Gestión de Estado
- **TanStack Query 5** - Server state management
- **React Hook Form** - Formularios
- **Zod** - Validación de schemas

### HTTP y API
- **Axios** - Cliente HTTP centralizado (`lib/apiClient.ts`)
- Interceptores JWT automáticos
- Refresh token automático

### Internacionalización
- **next-intl** - i18n (es/en/pt)

### Otras Librerías
- **Framer Motion** - Animaciones
- **Sonner** - Notificaciones toast
- **Recharts** - Gráficos
- **React Big Calendar** - Calendarios
- **date-fns + date-fns-tz** - Manejo de fechas
- **jsPDF + jsPDF AutoTable + XLSX** - Exportación

---

## 📂 Estructura del Proyecto

### Rutas (App Router)

```
app/
├── (auth)/              # Autenticación
│   ├── login/
│   ├── forgot-password/
│   └── reset-password/
├── (client)/            # Portal cliente
│   ├── dashboard/       # Dashboard principal
│   └── client/          # Tickets, IA, etc.
├── (marketing)/         # Landing y sitio público
├── (ops-admin)/         # Panel administrativo
├── (ops-internal)/      # Panel operaciones internas
└── (payments)/          # Flujos de pago
```

### Componentes

```
components/
├── ui/                  # Componentes Shadcn/UI base
├── dashboard/           # Componentes de dashboard
├── admin/               # Componentes administrativos
├── tickets/             # Componentes de tickets
└── partners/            # Componentes de partners
```

### Lógica Compartida

```
lib/
├── apiClient.ts         # ⚠️ Cliente Axios centralizado (NUNCA usar fetch directo)
├── hooks/               # Custom hooks (TanStack Query)
│   ├── useTickets.ts
│   ├── useServices.ts
│   └── ...
├── types/               # Tipos TypeScript compartidos
└── utils/               # Utilidades y helpers
```

### i18n

```
messages/
├── es.json             # Español
├── en.json             # Inglés
└── pt.json             # Portugués
```

---

## 🏗️ Arquitectura de Desarrollo

### Los 3 Mandamientos del Código

#### 1. No usarás `fetch` nativo

Toda comunicación con el backend debe pasar por `lib/apiClient.ts`. Este cliente inyecta automáticamente el `Authorization: Bearer <token>` y maneja el refresco de sesión.

```typescript
// ❌ MAL (Inseguro, repetitivo)
const res = await fetch("/api/tickets", { 
  headers: { Authorization: token } 
});

// ✅ BIEN (Seguro, tipado)
import { apiClient } from "@/lib/apiClient";
const { data } = await apiClient.get("/tickets");
```

#### 2. No usarás `useEffect` para cargar datos

Si necesitas datos del servidor al montar un componente, usa un Custom Hook con TanStack Query.

```typescript
// ❌ MAL (Gestión manual de estado)
const [data, setData] = useState([]);
useEffect(() => {
  fetch("/api/tickets").then(res => res.json()).then(setData);
}, []);

// ✅ BIEN (Caché automático, loading states nativos)
const { data, isLoading, error } = useTickets();
if (isLoading) return <Skeleton />;
```

#### 3. Separarás la UI de la Lógica

- **Componente (.tsx)**: Solo debe saber CÓMO mostrar los datos
- **Hook (lib/hooks/)**: Solo debe saber CÓMO obtener y procesar los datos

### Ejemplos de Implementación

#### Caso A: Obtener una lista de datos (GET)

**1. Crear el Hook (`lib/hooks/useTickets.ts`)**

```typescript
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export function useTickets() {
  return useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const { data } = await apiClient.get("/tickets");
      return data;
    }
  });
}
```

**2. Usarlo en el Componente**

```typescript
export function TicketsList() {
  const { data, isLoading, error } = useTickets();
  
  if (isLoading) return <Skeleton />;
  if (error) return <div>Error al cargar tickets</div>;
  
  return (
    <ul>
      {data.map(ticket => (
        <li key={ticket.id}>{ticket.title}</li>
      ))}
    </ul>
  );
}
```

#### Caso B: Enviar datos (POST/PUT)

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

export function CreateTicketForm() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (newTicket: CreateTicketDto) => {
      return await apiClient.post("/tickets", newTicket);
    },
    onSuccess: () => {
      // Esto hace que la lista se recargue sola
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket creado con éxito");
    }
  });
  
  const handleSubmit = (data: FormData) => {
    mutation.mutate(data);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... campos del formulario ... */}
    </form>
  );
}
```

---

## 🔐 Autenticación y Roles

### Almacenamiento de Tokens

- Tokens almacenados en `localStorage`/`sessionStorage`
- Claves: `viotech_token`, `viotech_refresh_token`
- Compatibilidad legacy: `authTokenVioTech`, `userNameVioTech`

### Flujo de Autenticación

1. Login → Guarda tokens → Evento `authChanged`
2. Guards leen `useAuth` / storage
3. Refresh automático si el token expira

### Roles del Sistema

- **Cliente** (default): Ve sus tickets/servicios
- **Agente**: Acceso global a tickets
- **Admin**: Acceso completo + gestión de roles
- **Support**: Acceso a tickets y soporte

### Guards de Ruta

- `AdminGate`: Consulta `/auth/me` y permite solo roles `admin/agente/support`
- `useAuth`: Hook para verificar autenticación y roles

---

## 🔌 Integraciones Backend

### Base API

- Variable de entorno: `NEXT_PUBLIC_BACKEND_API_URL`
- Ejemplo: `https://viotech-main.onrender.com`
- Se fuerza sufijo `/api` automáticamente

### Endpoints Principales

#### Autenticación
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Usuario actual

#### Tickets
- `GET /tickets` - Lista de tickets
- `POST /tickets` - Crear ticket
- `GET /tickets/:id` - Detalle de ticket
- `POST /tickets/:id/comments` - Agregar comentario

#### Servicios
- `GET /services/me` - Servicios del usuario
- `GET /services/catalog` - Catálogo de servicios

#### Métricas
- `GET /metrics/dashboard` - Métricas del dashboard

#### Pagos
- `POST /payments/create` - Crear pago Wompi
- `GET /payments/:id/status` - Estado del pago

#### IA
- `POST /ai/ticket-assistant` - Chat con asistente
- `POST /ai/ticket-assistant/create-ticket` - Crear ticket desde IA
- `GET /predictions/model-status` - Estado del modelo ML
- `POST /predictions/project-timeline` - Predicción de timeline

#### Admin
- `GET /users` - Lista de usuarios
- `PUT /users/:id/role` - Cambiar rol de usuario

---

## 🎨 Design System

### Tokens de Diseño

#### Espaciado (rem)
- `--space-1: 0.25rem`
- `--space-2: 0.5rem`
- `--space-3: 0.75rem`
- `--space-4: 1rem`
- `--space-5: 1.5rem`
- `--space-6: 2rem`

#### Tipografía
- `--font-sans: "Inter", system-ui, sans-serif`
- `--font-mono: "JetBrains Mono", ui-monospace, monospace`

#### Radios
- `--radius-sm: 0.375rem`
- `--radius-md: 0.75rem`
- `--radius-lg: 1.5rem`

#### Sombras
- `--shadow-sm: 0 1px 2px rgba(0,0,0,0.06)`
- `--shadow-md: 0 8px 30px rgba(0,0,0,0.12)`

### Componentes Base

Componentes Shadcn/UI disponibles:
- `Badge`, `Button`, `Card`, `Dialog`, `Input`, `Select`
- `Skeleton`, `Table`, `Pagination`, `Breadcrumb`
- `State` (loading/error/empty)

---

## 🔒 Seguridad y Errores

### CORS

- Backend permite: `https://viotech.com.co`
- Configurar en backend para producción

### Manejo de Errores HTTP

- **401 Unauthorized**: Redirigir a login
- **403 Forbidden**: Mostrar mensaje de acceso denegado
- **429 Too Many Requests**: Mensajes amigables en IA/predicciones
- **500 Server Error**: Mostrar mensaje genérico al usuario

### Validación de Inputs

- Formularios con validación Zod
- Sanitización básica (pendiente: sanitización extra en frontend)

---

## 🚀 Variables de Entorno

### Requeridas

```env
NEXT_PUBLIC_BACKEND_API_URL=https://viotech-main.onrender.com
```

### Opcionales

```env
# Backend (server-side)
BACKEND_API_URL=https://viotech-main.onrender.com

# Features flags
NEXT_PUBLIC_ENABLE_PREDICTOR=true
NEXT_PUBLIC_ENABLE_AI_ASSISTANT=true
NEXT_PUBLIC_ENABLE_ADMIN=true
NEXT_PUBLIC_ADMIN_MOCK=false

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=

# Wompi
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=
```

---

## 📝 Pendientes (Según Roadmap)

- [ ] Documentar diagrama del backend en su repo
- [ ] Multi-tenant: organization/project aún no implementado
- [ ] Design system unificado y Storybook
- [ ] Testing (Jest/RTL, E2E) y CI configurado
- [ ] Sanitización avanzada de inputs

---

## 📚 Referencias

- [Stack Tecnológico Completo](./STACK_TECNOLOGICO_COMPLETO.md)
- [Roadmap Estratégico 2025](./VIOTECH_ROADMAP_STRATEGICO_2025.md)
- [Agentes de Desarrollo](./AGENTS.md)
