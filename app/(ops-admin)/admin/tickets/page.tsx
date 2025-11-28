"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Filter,
  Search,
  MessageSquare,
  User,
  Building2,
  Calendar,
  Eye,
  RefreshCw,
  Download,
  MoreVertical,
  CheckSquare,
  Square,
  ArrowUpDown,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  FileText,
  BarChart3,
  Settings,
  Save,
  X,
  Plus,
  Edit,
  Trash2,
  Copy,
  Share2,
} from "lucide-react";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, isTokenExpired, refreshAccessToken, logout } from "@/lib/auth";
import { EmptyState } from "@/components/ui/state";
import { useTickets } from "@/lib/hooks/useTickets";
import { useOrg } from "@/lib/useOrg";
import { cn } from "@/lib/utils";
import { StatusBadge, PriorityBadge } from "@/components/tickets/TicketBadges";
import { toast } from "sonner";
import { TicketComments } from "@/components/tickets/TicketComments";
import { useTicket } from "@/lib/hooks/useTicket";

type Ticket = {
  id: string;
  titulo: string;
  descripcion?: string | null;
  estado: string;
  prioridad: string;
  impacto?: string | null;
  urgencia?: string | null;
  categoria?: string | null;
  slaObjetivo?: string | null;
  slaVenceEn?: string | null;
  slaAtendidoEn?: string | null;
  etiquetas?: any[];
  createdAt: string;
  updatedAt?: string;
  comentarios?: any[];
  usuario?: { nombre?: string; email?: string; id?: string };
  organizationId?: string;
  projectId?: string;
  asignadoA?: string | null;
  attachments?: any[];
};

type SortField = "createdAt" | "titulo" | "estado" | "prioridad" | "updatedAt";
type SortOrder = "asc" | "desc";

const estadoOptions = [
  { value: "", label: "Todos" },
  { value: "abierto", label: "Abierto" },
  { value: "en_progreso", label: "En progreso" },
  { value: "resuelto", label: "Resuelto" },
  { value: "cerrado", label: "Cerrado" },
];

const prioridadOptions = [
  { value: "", label: "Todas" },
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

const impactoOptions = [
  { value: "", label: "Todos" },
  { value: "bajo", label: "Bajo" },
  { value: "medio", label: "Medio" },
  { value: "alto", label: "Alto" },
  { value: "critico", label: "Crítico" },
];

const categoriaOptions = [
  { value: "", label: "Todas" },
  { value: "tecnico", label: "Técnico" },
  { value: "facturacion", label: "Facturación" },
  { value: "soporte", label: "Soporte" },
  { value: "feature", label: "Feature Request" },
  { value: "bug", label: "Bug" },
];

export default function AdminTicketsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    estado: "",
    prioridad: "",
    impacto: "",
    categoria: "",
    asignadoA: "",
    projectId: "",
  });
  const [search, setSearch] = useState("");
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { setOrgId, orgId } = useOrg();

  const { tickets, loading, error, refresh, pagination } = useTickets({
    estado: filters.estado || undefined,
    prioridad: filters.prioridad || undefined,
    impacto: filters.impacto || undefined,
    categoria: filters.categoria || undefined,
    asignadoA: filters.asignadoA === "unassigned" ? null : filters.asignadoA || undefined,
    projectId: filters.projectId || undefined,
    organizationId: orgId || undefined,
    sort: sortField,
    order: sortOrder,
    page: currentPage,
    limit: 50,
  });

  const { ticket: selectedTicket, refresh: refreshSelectedTicket } = useTicket(selectedTicketId || undefined);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const total = tickets.length;
    const abiertos = tickets.filter((t) => t.estado === "abierto").length;
    const enProgreso = tickets.filter((t) => t.estado === "en_progreso").length;
    const resueltos = tickets.filter((t) => t.estado === "resuelto").length;
    const criticos = tickets.filter((t) => t.prioridad === "critica").length;
    const sinAsignar = tickets.filter((t) => !t.asignadoA).length;

    return {
      total,
      abiertos,
      enProgreso,
      resueltos,
      criticos,
      sinAsignar,
      tasaResolucion: total > 0 ? Math.round((resueltos / total) * 100) : 0,
    };
  }, [tickets]);

  // Filtrado y ordenamiento local
  const filteredAndSortedTickets = useMemo(() => {
    let result = [...tickets];

    // Filtro de asignado (local, ya que el backend puede no soportarlo)
    if (filters.asignadoA === "unassigned") {
      result = result.filter((t) => !t.asignadoA);
    } else if (filters.asignadoA === "assigned") {
      result = result.filter((t) => !!t.asignadoA);
    }

    // Búsqueda local
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.titulo.toLowerCase().includes(lower) ||
          t.id.toLowerCase().includes(lower) ||
          t.descripcion?.toLowerCase().includes(lower) ||
          t.usuario?.email?.toLowerCase().includes(lower) ||
          t.usuario?.nombre?.toLowerCase().includes(lower) ||
          t.categoria?.toLowerCase().includes(lower)
      );
    }

    // Ordenamiento local (si no viene del servidor)
    result.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case "titulo":
          aVal = a.titulo.toLowerCase();
          bVal = b.titulo.toLowerCase();
          break;
        case "estado":
          aVal = a.estado;
          bVal = b.estado;
          break;
        case "prioridad":
          const priorityOrder = { critica: 4, alta: 3, media: 2, baja: 1 };
          aVal = priorityOrder[a.prioridad as keyof typeof priorityOrder] || 0;
          bVal = priorityOrder[b.prioridad as keyof typeof priorityOrder] || 0;
          break;
        case "updatedAt":
          aVal = new Date(a.updatedAt || a.createdAt).getTime();
          bVal = new Date(b.updatedAt || b.createdAt).getTime();
          break;
        default:
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

      return result;
    }, [tickets, search, sortField, sortOrder, filters.asignadoA]);

  const updateTicket = async (ticketId: string, payload: Partial<Ticket>) => {
    setActionLoading(ticketId);
    setActionError(null);
    let token = getAccessToken();
    if (!token) {
      router.replace("/login?from=/admin/tickets");
      return;
    }
    if (isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        router.replace("/login?from=/admin/tickets&reason=expired");
        return;
      }
    }
    try {
      const res = await fetch(buildApiUrl(`/tickets/${ticketId}`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || data?.message || "No se pudo actualizar el ticket");
      }
      toast.success("Ticket actualizado");
      await refresh();
      if (selectedTicketId === ticketId) {
        await refreshSelectedTicket();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al actualizar ticket";
      setActionError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const bulkUpdateTickets = async (ticketIds: string[], payload: Partial<Ticket>) => {
    setActionLoading("bulk");
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const promises = ticketIds.map((id) => updateTicket(id, payload));
      await Promise.all(promises);
      toast.success(`${ticketIds.length} tickets actualizados`);
      setSelectedTickets(new Set());
    } catch (err) {
      toast.error("Error al actualizar tickets");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const toggleSelectTicket = (ticketId: string) => {
    const newSelected = new Set(selectedTickets);
    if (newSelected.has(ticketId)) {
      newSelected.delete(ticketId);
    } else {
      newSelected.add(ticketId);
    }
    setSelectedTickets(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedTickets.size === filteredAndSortedTickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(filteredAndSortedTickets.map((t) => t.id)));
    }
  };

  const exportTickets = () => {
    const csv = [
      ["ID", "Título", "Estado", "Prioridad", "Usuario", "Organización", "Fecha Creación"].join(","),
      ...filteredAndSortedTickets.map((t) =>
        [
          t.id,
          `"${t.titulo}"`,
          t.estado,
          t.prioridad,
          t.usuario?.email || "",
          t.organizationId || "",
          new Date(t.createdAt).toLocaleString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Tickets exportados");
  };

  const openTicketDetail = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setIsDetailOpen(true);
  };

  const onFilterChange = (field: keyof typeof filters) => (value: string) => {
    let finalValue = value;
    // Mapear valores especiales a valores vacíos para los filtros
    if (value === "all" || value === "none") {
      finalValue = "";
    } else if (field === "asignadoA" && value === "unassigned") {
      finalValue = "unassigned"; // Mantener para filtrar sin asignar
    }
    setFilters((f) => ({ ...f, [field]: finalValue }));
  };

  const clearFilters = () => {
    setFilters({
      estado: "",
      prioridad: "",
      impacto: "",
      categoria: "",
      asignadoA: "",
      projectId: "",
    });
    setSearch("");
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "") || search.trim() !== "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
          </Link>
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <MessageSquare className="h-8 w-8" />
              Gestión Avanzada de Tickets
            </h1>
            <p className="text-muted-foreground mt-1">
              Panel completo de administración con métricas, filtros avanzados y acciones en lote.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportTickets} disabled={filteredAndSortedTickets.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" onClick={() => refresh()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>
        <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} label="Organización" />
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">En el sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abiertos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.abiertos}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.abiertos / stats.total) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticos}</div>
            <p className="text-xs text-muted-foreground">Prioridad crítica</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Resolución</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasaResolucion}%</div>
            <p className="text-xs text-muted-foreground">{stats.resueltos} resueltos</p>
          </CardContent>
        </Card>
        </div>

      {/* Filtros Avanzados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros y Búsqueda Avanzada
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, ID, descripción, usuario, categoría..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Select value={filters.estado || undefined} onValueChange={onFilterChange("estado")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {estadoOptions
                      .filter((o) => o.value !== "")
                      .map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prioridad</label>
                <Select value={filters.prioridad || undefined} onValueChange={onFilterChange("prioridad")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    {prioridadOptions
                      .filter((o) => o.value !== "")
                      .map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Impacto</label>
                <Select value={filters.impacto || undefined} onValueChange={onFilterChange("impacto")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {impactoOptions
                      .filter((o) => o.value !== "")
                      .map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                {o.label}
                        </SelectItem>
            ))}
                  </SelectContent>
          </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoría</label>
                <Select value={filters.categoria || undefined} onValueChange={onFilterChange("categoria")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriaOptions
                      .filter((o) => o.value !== "")
                      .map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                {o.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Asignado</label>
                <Select value={filters.asignadoA || undefined} onValueChange={onFilterChange("asignadoA")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Sin asignar</SelectItem>
                    <SelectItem value="assigned">Asignados</SelectItem>
                  </SelectContent>
          </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Proyecto</label>
                <Select value={filters.projectId || undefined} onValueChange={onFilterChange("projectId")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin proyecto</SelectItem>
                  </SelectContent>
          </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {(error || actionError) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{actionError || error}</AlertDescription>
        </Alert>
      )}

      {/* Acciones en Lote */}
      {selectedTickets.size > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  {selectedTickets.size} ticket(s) seleccionado(s)
                    </span>
                  </div>
              <div className="flex items-center gap-2">
                  <Select
                  onValueChange={(value) => {
                    if (value) {
                      bulkUpdateTickets(Array.from(selectedTickets), { estado: value });
                    }
                  }}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Cambiar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estadoOptions
                      .filter((o) => o.value !== "")
                      .map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                  </Select>
                  <Select
                  onValueChange={(value) => {
                    if (value) {
                      bulkUpdateTickets(Array.from(selectedTickets), { prioridad: value });
                    }
                  }}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Cambiar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    {prioridadOptions
                      .filter((o) => o.value !== "")
                      .map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTickets(new Set())}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets Table */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : filteredAndSortedTickets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              title="No hay tickets"
              message={
                search || hasActiveFilters
                  ? "No se encontraron tickets que coincidan con los filtros."
                  : "No hay tickets disponibles."
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tickets ({filteredAndSortedTickets.length})</CardTitle>
                <CardDescription>
                  {pagination.total > 0 && (
                    <>
                      Mostrando {((currentPage - 1) * pagination.limit) + 1} -{" "}
                      {Math.min(currentPage * pagination.limit, pagination.total)} de {pagination.total} tickets
                    </>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "table" | "kanban")}>
                  <TabsList>
                    <TabsTrigger value="table">Tabla</TabsTrigger>
                    <TabsTrigger value="kanban" disabled>Kanban</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedTickets.size === filteredAndSortedTickets.length && filteredAndSortedTickets.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-[300px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-2"
                        onClick={() => handleSort("titulo")}
                      >
                        Ticket
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-2"
                        onClick={() => handleSort("estado")}
                      >
                        Estado
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-2"
                        onClick={() => handleSort("prioridad")}
                      >
                        Prioridad
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Organización</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-2"
                        onClick={() => handleSort("createdAt")}
                      >
                        Fecha
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTickets.map((t) => (
                    <TableRow
                      key={t.id}
                      className={cn(
                        "hover:bg-muted/50",
                        selectedTickets.has(t.id) && "bg-primary/5"
                      )}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedTickets.has(t.id)}
                          onCheckedChange={() => toggleSelectTicket(t.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex items-start gap-2">
                            <p className="font-medium leading-tight">{t.titulo}</p>
                            {t.prioridad === "critica" && (
                              <Badge variant="destructive" className="text-xs">
                                Crítico
                              </Badge>
                            )}
                          </div>
                          {t.descripcion && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{t.descripcion}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground font-mono">#{t.id.slice(0, 8)}</p>
                            {t.categoria && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {t.categoria}
                              </Badge>
                            )}
                            {t.impacto && (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {t.impacto}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={t.estado}
                          onValueChange={(value) => updateTicket(t.id, { estado: value })}
                          disabled={actionLoading === t.id}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {estadoOptions
                              .filter((o) => o.value !== "")
                              .map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {o.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={t.prioridad}
                          onValueChange={(value) => updateTicket(t.id, { prioridad: value })}
                          disabled={actionLoading === t.id}
                        >
                          <SelectTrigger className="w-[120px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {prioridadOptions
                              .filter((o) => o.value !== "")
                              .map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {o.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                  </Select>
                      </TableCell>
                      <TableCell>
                        {t.usuario?.email ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <p className="text-sm font-medium">{t.usuario.nombre || "Sin nombre"}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">{t.usuario.email}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {t.organizationId ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground font-mono">
                              {t.organizationId.slice(0, 8)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {new Date(t.createdAt).toLocaleDateString("es-CO", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          {t.slaObjetivo && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    SLA
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Vence: {new Date(t.slaObjetivo).toLocaleString("es-CO")}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openTicketDetail(t.id)}
                            className="gap-2"
                          >
                            <Eye className="h-3 w-3" />
                            Ver
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => router.push(`/admin/tickets/${t.id}`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar completo
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(t.id)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copiar ID
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => updateTicket(t.id, { estado: "resuelto" })}
                                disabled={t.estado === "resuelto"}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Marcar resuelto
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Página {currentPage} de {pagination.totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={currentPage === pagination.totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog de Detalle */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Ticket</DialogTitle>
            <DialogDescription>
              {selectedTicket?.titulo || "Cargando..."}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Información General</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado:</span>
                      <StatusBadge status={selectedTicket.estado} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prioridad:</span>
                      <PriorityBadge priority={selectedTicket.prioridad} />
                    </div>
                    {selectedTicket.categoria && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Categoría:</span>
                        <span className="capitalize">{selectedTicket.categoria}</span>
                      </div>
                    )}
                    {selectedTicket.impacto && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Impacto:</span>
                        <span className="capitalize">{selectedTicket.impacto}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Metadatos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Creado:</span>
                      <span>{new Date(selectedTicket.createdAt).toLocaleString("es-CO")}</span>
                    </div>
                    {selectedTicket.usuario?.email && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Usuario:</span>
                        <span>{selectedTicket.usuario.email}</span>
                      </div>
                    )}
                    {selectedTicket.organizationId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Organización:</span>
                        <span className="font-mono text-xs">{selectedTicket.organizationId}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              {selectedTicket.descripcion && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Descripción</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{selectedTicket.descripcion}</p>
                  </CardContent>
                </Card>
              )}
              <TicketComments
                ticketId={selectedTicket.id}
                comments={selectedTicket.comentarios}
                attachments={selectedTicket.attachments}
                onAddComment={async (payload) => {
                  // Implementar agregar comentario
                  await refreshSelectedTicket();
                }}
                onRefresh={refreshSelectedTicket}
                isSubmitting={false}
              />
          </div>
        )}
        </DialogContent>
      </Dialog>
      </div>
  );
}
