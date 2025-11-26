"use client";

import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/State";
import { useServices } from "@/lib/hooks/useServices";
import { useOrg } from "@/lib/useOrg";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

export default function AdminServicesPage() {
  const { services, loading, error, refresh } = useServices();
  const { setOrgId } = useOrg();

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="w-full space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al panel admin
        </Link>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Servicios</p>
          <h1 className="text-3xl font-medium text-foreground">Licencias y servicios por org</h1>
          <p className="text-sm text-muted-foreground">
            Filtra por organización para ver servicios activos y expirados.
          </p>
        </div>

        <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} />

        {error && <ErrorState message={error} />}

        {loading ? (
          <LoadingState title="Cargando servicios..." />
        ) : services.length === 0 ? (
          <EmptyState title="Sin servicios" message="No hay servicios para la organización seleccionada." />
        ) : (
          <Table>
            <THead>
              <TH className="col-span-4">Servicio</TH>
              <TH className="col-span-2">Tipo</TH>
              <TH className="col-span-2">Estado</TH>
              <TH className="col-span-2">Expiración</TH>
              <TH className="col-span-2">Org</TH>
            </THead>
            <TBody>
              {services.map((s) => (
                <TR key={s.id} className="items-center">
                  <TD className="col-span-4 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <span className="font-medium">{s.nombre}</span>
                  </TD>
                  <TD className="col-span-2 text-muted-foreground">{s.tipo || "Servicio"}</TD>
                  <TD className="col-span-2">
                    <Badge tone={s.estado === "expirado" ? "danger" : s.estado === "pendiente" ? "warning" : "success"}>
                      {s.estado}
                    </Badge>
                  </TD>
                  <TD className="col-span-2 text-muted-foreground">
                    {s.fecha_expiracion
                      ? new Date(s.fecha_expiracion).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "N/D"}
                  </TD>
                  <TD className="col-span-2 text-muted-foreground">{(s as any).organizationId || "—"}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </main>
  );
}
