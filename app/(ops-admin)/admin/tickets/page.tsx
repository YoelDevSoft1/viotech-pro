"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
import OrgSelector, { type Org } from "@/components/common/OrgSelector";
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
import { useOrg } from "@/lib/hooks/useOrg";
import { cn } from "@/lib/utils";
import { StatusBadge, PriorityBadge } from "@/components/tickets/TicketBadges";
import { toast } from "sonner";
import { TicketComments } from "@/components/tickets/TicketComments";
import { useTicket } from "@/lib/hooks/useTicket";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useLocaleContext } from "@/lib/contexts/LocaleContext";
import { useI18n } from "@/lib/hooks/useI18n";

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

// Las opciones se crearán dinámicamente usando traducciones

export default function AdminTicketsPage() {
  const router = useRouter();
  const { t: contextT, locale, messages } = useLocaleContext();
  const { formatDate } = useI18n();
  
  // Función de traducción mejorada para tickets con fallback directo a mensajes
  const tTickets = useCallback((key: string, values?: Record<string, string | number>) => {
    // Primero intentar buscar directamente en los mensajes del locale actual
    if (messages && typeof messages === "object") {
      const ticketsMessages = (messages as any)?.tickets;
      if (ticketsMessages && typeof ticketsMessages === "object") {
        // Si la clave tiene puntos, navegar por la estructura
        const keys = key.split(".");
        let value: any = ticketsMessages;
        let found = true;
        for (const k of keys) {
          if (value && typeof value === "object" && k in value) {
            value = value[k];
          } else {
            found = false;
            value = null;
            break;
          }
        }
        if (found && typeof value === "string") {
          // Aplicar interpolación si hay valores
          if (values) {
            let result = value;
            for (const [k, v] of Object.entries(values)) {
              result = result.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
            }
            return result;
          }
          return value;
        }
      }
    }
    
    // Si no se encuentra directamente, usar el contexto como fallback
    try {
      const result = contextT(key, "tickets", values);
      // Si el resultado es la clave completa o empieza con "tickets.", significa que no encontró la traducción
      if (result && (result === `tickets.${key}` || result.startsWith("tickets."))) {
        // Intentar una vez más buscar directamente con console.warn para debug
        console.warn(`Translation not found for key: ${key} in namespace tickets for locale: ${locale}`);
        return key;
      }
      return result;
    } catch (error) {
      console.error("Translation error:", error);
      return key;
    }
  }, [contextT, locale, messages]);
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

  // Crear opciones usando traducciones
  const estadoOptions = useMemo(() => [
    { value: "", label: tTickets("all") },
    { value: "abierto", label: tTickets("status.open") },
    { value: "en_progreso", label: tTickets("status.inProgress") },
    { value: "resuelto", label: tTickets("status.resolved") },
    { value: "cerrado", label: tTickets("status.closed") },
  ], [tTickets]);

  const prioridadOptions = useMemo(() => [
    { value: "", label: tTickets("all") },
    { value: "baja", label: tTickets("priority.low") },
    { value: "media", label: tTickets("priority.medium") },
    { value: "alta", label: tTickets("priority.high") },
    { value: "critica", label: tTickets("priority.critical") },
  ], [tTickets]);

  const impactoOptions = useMemo(() => [
    { value: "", label: tTickets("all") },
    { value: "bajo", label: tTickets("impact.low") },
    { value: "medio", label: tTickets("impact.medium") },
    { value: "alto", label: tTickets("impact.high") },
    { value: "critico", label: tTickets("impact.critical") },
  ], [tTickets]);

  const categoriaOptions = useMemo(() => [
    { value: "", label: tTickets("all") },
    { value: "tecnico", label: tTickets("category.technical") },
    { value: "facturacion", label: tTickets("category.billing") },
    { value: "soporte", label: tTickets("category.support") },
    { value: "feature", label: tTickets("category.feature") },
    { value: "bug", label: tTickets("category.bug") },
  ], [tTickets]);

  const { tickets, loading, error, refresh, pagination } = useTickets({
    estado: filters.estado || undefined,
    prioridad: filters.prioridad || undefined,
    impacto: filters.impacto || undefined,
    categoria: filters.categoria || undefined,
    asignadoA: filters.asignadoA === "unassigned" ? undefined : filters.asignadoA || undefined,
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
        throw new Error(data?.error || data?.message || tTickets("error.updateFailed"));
      }
      toast.success(tTickets("success.updated"));
      await refresh();
      if (selectedTicketId === ticketId) {
        await refreshSelectedTicket();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : tTickets("error.updateFailed");
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
      toast.success(tTickets("success.bulkUpdated", { count: ticketIds.length }));
      setSelectedTickets(new Set());
    } catch (err) {
      toast.error(tTickets("error.bulkUpdateFailed"));
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
      [tTickets("export.id"), tTickets("export.title"), tTickets("export.status"), tTickets("export.priority"), tTickets("export.user"), tTickets("export.organization"), tTickets("export.createdAt")].join(","),
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
    toast.success(tTickets("success.exported"));
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <MessageSquare className="h-8 w-8" />
              {tTickets("admin.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {tTickets("admin.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportTickets} disabled={filteredAndSortedTickets.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              {tTickets("export")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => refresh()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {tTickets("refresh")}
            </Button>
          </div>
        </div>
        <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} label={tTickets("organization")} />
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tTickets("stats.total")}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{tTickets("stats.inSystem")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tTickets("stats.open")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.abiertos}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.abiertos / stats.total) * 100) : 0}% {tTickets("stats.ofTotal")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tTickets("stats.critical")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticos}</div>
            <p className="text-xs text-muted-foreground">{tTickets("stats.criticalPriority")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tTickets("stats.resolutionRate")}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasaResolucion}%</div>
            <p className="text-xs text-muted-foreground">{stats.resueltos} {tTickets("stats.resolved")}</p>
          </CardContent>
        </Card>
        </div>

      {/* Filtros Avanzados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {tTickets("admin.advancedFilters")}
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                {tTickets("clearFilters")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={tTickets("admin.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div className="space-y-2 min-w-0">
                <label className="text-sm font-medium">{tTickets("statusLabel")}</label>
                <Select value={filters.estado || undefined} onValueChange={onFilterChange("estado")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tTickets("all")} className="truncate" />
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
              <div className="space-y-2 min-w-0">
                <label className="text-sm font-medium">{tTickets("priorityLabel")}</label>
                <Select value={filters.prioridad || undefined} onValueChange={onFilterChange("prioridad")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tTickets("all")} className="truncate" />
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
              <div className="space-y-2 min-w-0">
                <label className="text-sm font-medium">{tTickets("impact")}</label>
                <Select value={filters.impacto || undefined} onValueChange={onFilterChange("impacto")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tTickets("all")} className="truncate" />
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
              <div className="space-y-2 min-w-0">
                <label className="text-sm font-medium">{tTickets("category")}</label>
                <Select value={filters.categoria || undefined} onValueChange={onFilterChange("categoria")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tTickets("all")} className="truncate" />
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
              <div className="space-y-2 min-w-0">
                <label className="text-sm font-medium">{tTickets("assignee")}</label>
                <Select value={filters.asignadoA || undefined} onValueChange={onFilterChange("asignadoA")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tTickets("all")} className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">{tTickets("unassigned")}</SelectItem>
                    <SelectItem value="assigned">{tTickets("assigned")}</SelectItem>
                  </SelectContent>
          </Select>
              </div>
              <div className="space-y-2 min-w-0">
                <label className="text-sm font-medium">{tTickets("project")}</label>
                <Select value={filters.projectId || undefined} onValueChange={onFilterChange("projectId")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tTickets("all")} className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{tTickets("noProject")}</SelectItem>
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
                  {tTickets("admin.selectedTickets", { count: selectedTickets.size })}
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
                    <SelectValue placeholder={tTickets("admin.changeStatus")} />
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
                    <SelectValue placeholder={tTickets("admin.changePriority")} />
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
              title={tTickets("noTickets")}
              message={
                search || hasActiveFilters
                  ? tTickets("admin.noTicketsFiltered")
                  : tTickets("noTicketsMessage")
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{tTickets("admin.ticketsCount", { count: filteredAndSortedTickets.length })}</CardTitle>
                <CardDescription>
                  {pagination.total > 0 && (
                    <>
                      {tTickets("admin.showing", {
                        from: ((currentPage - 1) * pagination.limit) + 1,
                        to: Math.min(currentPage * pagination.limit, pagination.total),
                        total: pagination.total
                      })}
                    </>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "table" | "kanban")}>
                  <TabsList>
                    <TabsTrigger value="table">{tTickets("admin.table")}</TabsTrigger>
                    <TabsTrigger value="kanban" disabled>{tTickets("admin.kanban")}</TabsTrigger>
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
                        {tTickets("title")}
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
                        {tTickets("statusLabel")}
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
                        {tTickets("priorityLabel")}
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>{tTickets("user")}</TableHead>
                    <TableHead>{tTickets("organization")}</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-2"
                        onClick={() => handleSort("createdAt")}
                      >
                        {tTickets("createdAt")}
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">{tTickets("actions")}</TableHead>
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
                                {tTickets("priority.critical")}
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
                            {tTickets("view")}
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
                                {tTickets("editFull")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(t.id)}>
                                <Copy className="h-4 w-4 mr-2" />
                                {tTickets("copyId")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => updateTicket(t.id, { estado: "resuelto" })}
                                disabled={t.estado === "resuelto"}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                {tTickets("markAsResolved")}
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
                  {tTickets("admin.pageInfo", { current: currentPage, total: pagination.totalPages })}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    {tTickets("admin.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={currentPage === pagination.totalPages}
                  >
                    {tTickets("admin.next")}
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
            <DialogTitle>{tTickets("admin.ticketDetail")}</DialogTitle>
            <DialogDescription>
              {selectedTicket?.titulo || tTickets("loading")}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{tTickets("admin.generalInfo")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{tTickets("statusLabel")}:</span>
                      <StatusBadge status={selectedTicket.estado} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{tTickets("priorityLabel")}:</span>
                      <PriorityBadge priority={selectedTicket.prioridad} />
                    </div>
                    {selectedTicket.categoria && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{tTickets("category")}:</span>
                        <span className="capitalize">{selectedTicket.categoria}</span>
                      </div>
                    )}
                    {selectedTicket.impacto && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{tTickets("impact")}:</span>
                        <span className="capitalize">{selectedTicket.impacto}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{tTickets("admin.metadata")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{tTickets("createdAt")}:</span>
                      <span>{formatDate(selectedTicket.createdAt, "PPpp")}</span>
                    </div>
                    {selectedTicket.usuario?.email && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{tTickets("user")}:</span>
                        <span>{selectedTicket.usuario.email}</span>
                      </div>
                    )}
                    {selectedTicket.organizationId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{tTickets("organization")}:</span>
                        <span className="font-mono text-xs">{selectedTicket.organizationId}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              {selectedTicket.descripcion && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{tTickets("description")}</CardTitle>
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
