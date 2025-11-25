import type { ReactNode } from "react";
import RoleGate from "@/components/RoleGate";

export const metadata = {
  title: "Cliente | VioTech",
};

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <RoleGate allowedRoles={["cliente", "agente", "admin"]}>{children}</RoleGate>;
}
