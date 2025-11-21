import type { ReactNode } from "react";
import AdminGate from "@/components/admin/AdminGate";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
  title: "Admin | VioTech",
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGate>
      <AdminLayout>{children}</AdminLayout>
    </AdminGate>
  );
}
