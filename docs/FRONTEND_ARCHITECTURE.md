Crea este archivo en la raíz de tu proyecto (viotech-pro/FRONTEND_ARCHITECTURE.md) y haz commit.

Markdown

# 🏗️ Arquitectura Frontend 2.0 - Guía de Desarrollo

Este documento define los nuevos estándares de desarrollo para el frontend de VioTech. El objetivo es eliminar la gestión manual de estados, centralizar la comunicación con el API y estandarizar la UI.

---

## 🛠️ Tech Stack & Decisiones Técnicas

| Capa | Tecnología | Justificación |
| :--- | :--- | :--- |
| **HTTP Client** | **Axios** | Manejo centralizado de Interceptores (Auth Tokens, Refresh automático, Errores 401). |
| **Server State** | **TanStack Query** | Caching, re-fetching automático, eliminación de `useEffect` para carga de datos. |
| **Formularios** | **React Hook Form + Zod** | Validación estricta, performance (uncontrolled components) y tipado seguro. |
| **UI Components** | **Shadcn/UI** | Componentes accesibles, personalizables y basados en Tailwind. |
| **Notificaciones** | **Sonner** | Sistema de toasts ligero y apilable. |

---

## 📂 Estructura de Carpetas

```text
/app                 # Rutas y Páginas (Next.js App Router)
  /providers.tsx     # Configuración global (QueryClient, Toaster, Auth)

/lib
  apiClient.ts       # ⚠️ EL NÚCLEO: Instancia de Axios configurada. NO usar fetch manual.
  /hooks             # Custom Hooks de React Query (Lógica de Negocio)
    useTickets.ts    # Ej: useQuery para leer, useMutation para escribir
    useResources.ts  # Ej: Dropdowns de usuarios, organizaciones
  /types             # Interfaces TypeScript compartidas (DTOs)

/components
  /ui                # Componentes base de Shadcn (Button, Input, Dialog)
  /dashboard         # Componentes de negocio grandes (TicketsPanel)
  /tickets           # Componentes específicos (CreateTicketDialog)
📜 Los 3 Mandamientos del Código Nuevo
1. No usarás fetch nativo
Toda comunicación con el backend debe pasar por lib/apiClient.ts. Este cliente inyecta automáticamente el Authorization: Bearer <token> y maneja el refresco de sesión.

TypeScript

// ❌ MAL (Inseguro, repetitivo)
const res = await fetch("/api/tickets", { headers: { Authorization: token } });

// ✅ BIEN (Seguro, tipado)
import { apiClient } from "@/lib/apiClient";
const { data } = await apiClient.get("/tickets");
2. No usarás useEffect para cargar datos
Si necesitas datos del servidor al montar un componente, usa un Custom Hook con React Query.

TypeScript

// ❌ MAL (Gestión manual de estado)
const [data, setData] = useState([]);
useEffect(() => { ... }, []);

// ✅ BIEN (Caché automático, loading states nativos)
const { data, isLoading, error } = useTickets();
if (isLoading) return <Skeleton />;
3. Separarás la UI de la Lógica
Componente (.tsx): Solo debe saber CÓMO mostrar los datos.

Hook (lib/hooks/): Solo debe saber CÓMO obtener y procesar los datos.

⚡ Cheatsheet (Copia y Pega)
Caso A: Obtener una lista de datos (GET)
1. Crear el Hook (lib/hooks/useEjemplo.ts)

TypeScript

export function useEjemplo() {
  return useQuery({
    queryKey: ["ejemplo-list"], // Clave única para el caché
    queryFn: async () => {
      const { data } = await apiClient.get("/ejemplo");
      return data;
    }
  });
}
2. Usarlo en el Componente

TypeScript

export function EjemploLista() {
  const { data, isLoading } = useEjemplo();
  if (isLoading) return <div>Cargando...</div>;
  return <ul>{data.map(item => <li key={item.id}>{item.nombre}</li>)}</ul>;
}
Caso B: Enviar datos (POST/PUT)
TypeScript

// En el componente
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: async (nuevoItem) => {
    return await apiClient.post("/ejemplo", nuevoItem);
  },
  onSuccess: () => {
    // Esto hace que la lista (Caso A) se recargue sola
    queryClient.invalidateQueries({ queryKey: ["ejemplo-list"] });
    toast.success("Creado con éxito");
  }
});

// Al hacer submit
mutation.mutate({ nombre: "Nuevo Item" });
🚀 Plan de Migración
No vamos a reescribir toda la app de golpe.

Código Nuevo: Todo feature nuevo DEBE seguir esta arquitectura.

Legacy: El código viejo con fetch se mantendrá hasta que sea necesario tocar ese archivo por mantenimiento. En ese momento, se refactoriza.