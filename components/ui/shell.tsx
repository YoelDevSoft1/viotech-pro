import { cn } from "@/lib/utils";

interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

// 1. PageShell: El contenedor principal de una vista (sustituye al main con padding manual)
// Si está dentro de un layout con sidebar, usa div en lugar de main
export function PageShell({ children, className, as: Component, ...props }: ShellProps) {
  // Si no se especifica 'as', usa 'div' para evitar conflictos con layouts que ya tienen main
  const ComponentToUse = Component || "div";
  return (
    <ComponentToUse className={cn("flex-1 space-y-8 max-w-7xl mx-auto w-full", className)} {...props}>
      {children}
    </ComponentToUse>
  );
}

// 2. PageHeader: Título y descripción con acciones opcionales a la derecha
interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between", className)} {...props}>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// 3. PageGrid: Grid responsive estándar para dashboards o listas de cards
export function PageGrid({ children, className, ...props }: ShellProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)} {...props}>
      {children}
    </div>
  );
}

// 4. PageSection: Sección con borde superior opcional para separar contenido
export function PageSection({ children, className, title, ...props }: ShellProps & { title?: string }) {
  return (
    <section className={cn("space-y-4", className)} {...props}>
      {title && <h3 className="text-lg font-medium text-foreground">{title}</h3>}
      {children}
    </section>
  );
}