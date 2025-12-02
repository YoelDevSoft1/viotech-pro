/**
 * Tabla de Especificaciones Técnicas del Servicio
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ServicePlanExtended } from "@/lib/types/services";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceSpecsTableProps {
  service: ServicePlanExtended;
  className?: string;
}

export function ServiceSpecsTable({ service, className }: ServiceSpecsTableProps) {
  if (!service.specs || Object.keys(service.specs).length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Especificaciones Técnicas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Característica</TableHead>
              <TableHead>Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(service.specs).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell className="font-medium">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim()}
                </TableCell>
                <TableCell>
                  {typeof value === "boolean" ? (
                    value ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )
                  ) : (
                    <span className="text-muted-foreground">{String(value)}</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

