"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  Package, 
  Plus, 
  Calendar, 
  Clock, 
  AlertCircle 
} from "lucide-react";

import { useServices, type Service } from "@/lib/hooks/useServices";
import { PageHeader, PageShell } from "@/components/ui/shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Helpers visuales
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status.toLowerCase()) {
    case "activo": return "default"; // Verde/Negro (según tema)
    case "pendiente": return "secondary"; // Amarillo/Gris
    case "expirado": return "destructive"; // Rojo
    default: return "outline";
  }
};

export default function ServicesPage() {
  const { services, loading, error, refresh } = useServices();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filtrado en cliente
  const filtered = services.filter(s => {
    const matchSearch = s.nombre.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.estado === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <PageShell>
      <div className="flex flex-col gap-6">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Mis Servicios</h1>
              <p className="text-muted-foreground">Gestiona tus licencias y suscripciones activas.</p>
            </div>
            <Link href="/services/catalog">
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Contratar Nuevo
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-muted/20 p-4 rounded-lg border">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar servicio..." 
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="activo">Activos</SelectItem>
              <SelectItem value="pendiente">Pendientes</SelectItem>
              <SelectItem value="expirado">Expirados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content Area */}
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error al cargar</AlertTitle>
            <AlertDescription>
              {error}. <Button variant="link" className="p-0 h-auto font-normal text-destructive underline" onClick={() => refresh()}>Reintentar</Button>
            </AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-muted/10 border-dashed">
            <Package className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No se encontraron servicios</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              {search || statusFilter !== 'all' ? "Prueba cambiando los filtros de búsqueda." : "Aún no tienes servicios contratados."}
            </p>
            {services.length === 0 && (
              <Link href="/services/catalog">
                <Button variant="outline">Ir al Catálogo</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((service) => (
              <Card key={service.id} className="flex flex-col overflow-hidden transition-all hover:border-primary/50 hover:shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-semibold leading-tight line-clamp-1">
                      {service.nombre}
                    </CardTitle>
                    <Badge variant={getStatusVariant(service.estado)} className="capitalize shrink-0">
                      {service.estado}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{service.tipo || "Servicio"}</p>
                </CardHeader>
                
                <CardContent className="flex-1 pb-4 space-y-4">
                  {/* Dates */}
                  <div className="space-y-2 text-sm">
                    {service.fecha_compra && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Inicio</span>
                        <span>{new Date(service.fecha_compra).toLocaleDateString()}</span>
                      </div>
                    )}
                    {service.fecha_expiracion && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Vence</span>
                        <span>{new Date(service.fecha_expiracion).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress (si aplica) */}
                  {service.progreso !== null && service.progreso !== undefined && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium">{service.progreso}%</span>
                      </div>
                      <Progress value={service.progreso} className="h-1.5" />
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-0">
                  <Button variant="secondary" className="w-full" size="sm">
                    Ver Detalles
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}