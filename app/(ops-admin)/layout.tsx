import type { ReactNode } from "react";
export default function OpsAdminLayout({ children }: { children: ReactNode }) {
  // El layout específico de admin (components/admin/AdminLayout) ya incluye sidebar y topbar.
  // Aquí usamos un contenedor neutro para evitar duplicados.
  return <div className="min-h-screen bg-background">{children}</div>;
}
