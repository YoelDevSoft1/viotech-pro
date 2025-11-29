import type { ReactNode } from "react";
import RoleGate from "@/components/common/RoleGate";

export const metadata = {
  title: "Interno | VioTech",
};

export default function InternalLayout({ children }: { children: ReactNode }) {
  return <RoleGate allowedRoles={["agente", "admin"]}>{children}</RoleGate>;
}
