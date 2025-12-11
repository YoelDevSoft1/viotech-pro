"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  MessageSquare,
  Paperclip,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Inbox,
  X,
  Ticket,
  ArrowLeft,
} from "lucide-react";
import { useTickets } from "@/lib/hooks/useTickets";
import { useTicket } from "@/lib/hooks/useTicket";
import { CreateTicketDialog } from "@/components/tickets/CreateTicketDialog";
import { TicketComments } from "@/components/tickets/TicketComments";
import { StatusBadge, PriorityBadge } from "@/components/tickets/TicketBadges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Filters = {
  estado: string;
  prioridad: string;
};

function TicketListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 rounded-xl border bg-card">
          <div className="flex justify-between mb-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-3/4 mb-3" />
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TicketDetailSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-3">
        <Skeleton className="h-7 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
      </div>
      <Separator />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

function EmptyTicketsList() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">No se encontraron tickets</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        No hay tickets que coincidan con los filtros seleccionados
      </p>
    </div>
  );
}

function EmptyTicketDetail() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-10 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Ticket className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-medium text-muted-foreground mb-1">
        Selecciona un ticket
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Haz clic en un ticket de la lista para ver sus detalles y comentarios
      </p>
    </div>
  );
}

export function TicketsPanel() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>({ estado: "todos", prioridad: "todas" });
  const [page, setPage] = useState(1);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    tickets,
    loading,
    error,
    pagination,
    refresh,
  } = useTickets({
    page,
    limit: 10,
    estado: filters.estado === "todos" ? undefined : filters.estado,
    prioridad: filters.prioridad === "todas" ? undefined : filters.prioridad,
  });

  const filteredTickets = useMemo(() => {
    if (!search) return tickets;
    const lower = search.toLowerCase();
    return tickets.filter(t =>
      t.titulo.toLowerCase().includes(lower) ||
      t.id.toLowerCase().includes(lower)
    );
  }, [tickets, search]);

  const {
    ticket: selectedTicketFull,
    isLoading: isLoadingTicketDetail,
    addComment,
    isCommenting,
    refresh: refreshTicketDetail,
  } = useTicket(selectedTicketId || undefined);

  const selectedTicket = useMemo(() =>
    tickets.find(t => t.id === selectedTicketId) || null
    , [tickets, selectedTicketId]);

  const clearFilters = () => {
    setSearch("");
    setFilters({ estado: "todos", prioridad: "todas" });
  };

  const hasActiveFilters = search || filters.estado !== "todos" || filters.prioridad !== "todas";

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Gestión de Tickets
            </CardTitle>
            <CardDescription>
              {pagination.total || 0} tickets en total
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => refresh()}
                    disabled={loading}
                  >
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Actualizar tickets</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Ticket
            </Button>
          </div>
        </div>
      </CardHeader>

      <Separator />

      {/* Toolbar de filtros */}
      <div className="p-4 space-y-4 border-b">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título o ID..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearch("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Select
            value={filters.estado}
            onValueChange={(v) => setFilters(p => ({ ...p, estado: v }))}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="abierto">Abierto</SelectItem>
              <SelectItem value="en_progreso">En Progreso</SelectItem>
              <SelectItem value="resuelto">Resuelto</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.prioridad}
            onValueChange={(v) => setFilters(p => ({ ...p, prioridad: v }))}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las prioridades</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Limpiar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Limpiar todos los filtros</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      <CardContent className="p-0">
        {loading && !tickets.length ? (
          <div className="p-4">
            <TicketListSkeleton />
          </div>
        ) : error ? (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertDescription className="flex items-center justify-between">
                <span>Error cargando tickets: {error}</span>
                <Button variant="outline" size="sm" onClick={() => refresh()}>
                  Reintentar
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            {/* Lista de Tickets */}
            <div className={cn(
              "lg:col-span-4 border-r flex flex-col",
              selectedTicket ? "hidden lg:flex" : "flex"
            )}>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {filteredTickets.length === 0 ? (
                    <EmptyTicketsList />
                  ) : (
                    filteredTickets.map(ticket => (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicketId(ticket.id)}
                        className={cn(
                          "cursor-pointer p-4 rounded-xl border transition-all",
                          selectedTicket?.id === ticket.id
                            ? "bg-primary/5 border-primary/30 shadow-sm"
                            : "bg-card border-border hover:bg-muted/50 hover:border-border/80"
                        )}
                      >
                        <div className="flex justify-between mb-1.5">
                          <span className="text-[10px] font-mono text-muted-foreground">
                            #{ticket.id.slice(0, 8)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-medium text-sm mb-2 line-clamp-2">{ticket.titulo}</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1.5">
                            <StatusBadge status={ticket.estado} />
                            <PriorityBadge priority={ticket.prioridad} />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {(ticket.comentarios?.length || 0) > 0 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1">
                                      <MessageSquare className="h-3 w-3" />
                                      <span>{ticket.comentarios?.length || 0}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{ticket.comentarios?.length} comentarios</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {(ticket.attachments?.length || 0) > 0 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1">
                                      <Paperclip className="h-3 w-3" />
                                      <span>{ticket.attachments?.length || 0}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{ticket.attachments?.length} adjuntos</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <div className="p-3 border-t flex justify-between items-center text-xs text-muted-foreground bg-muted/30">
                  <span>
                    Página {page} de {pagination.totalPages}
                  </span>
                  <div className="flex gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Página anterior</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            disabled={page >= pagination.totalPages}
                            onClick={() => setPage(p => p + 1)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Página siguiente</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              )}
            </div>

            {/* Detalle del Ticket */}
            <div className={cn(
              "lg:col-span-8 flex flex-col bg-muted/10",
              !selectedTicket ? "hidden lg:flex" : "flex"
            )}>
              {selectedTicket ? (
                <div className="h-full flex flex-col">
                  {/* Header del Detalle */}
                  <div className="p-6 border-b bg-card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="lg:hidden mb-3 -ml-2 gap-1"
                          onClick={() => setSelectedTicketId(null)}
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Volver a la lista
                        </Button>
                        <h2 className="text-xl font-bold leading-tight">{selectedTicket.titulo}</h2>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <StatusBadge status={selectedTicket.estado} />
                          <PriorityBadge priority={selectedTicket.prioridad} />
                          <span className="text-xs text-muted-foreground">
                            Creado el {new Date(selectedTicket.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/client/tickets/${selectedTicket.id}`}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver completo
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Abrir página completa del ticket</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* Contenido Scrollable */}
                  <ScrollArea className="flex-1">
                    <div className="p-6 space-y-6">
                      {/* Descripción */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Descripción
                        </h3>
                        <div className="p-4 bg-muted/30 rounded-lg border text-sm whitespace-pre-wrap">
                          {selectedTicket.descripcion || "Sin descripción."}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Card className="border-border/50">
                          <CardContent className="p-3">
                            <div className="text-xs text-muted-foreground mb-1">Categoría</div>
                            <div className="font-medium capitalize">{selectedTicket.categoria || "General"}</div>
                          </CardContent>
                        </Card>
                        <Card className="border-border/50">
                          <CardContent className="p-3">
                            <div className="text-xs text-muted-foreground mb-1">Impacto</div>
                            <div className="font-medium capitalize">{selectedTicket.impacto || "-"}</div>
                          </CardContent>
                        </Card>
                        <Card className="border-border/50">
                          <CardContent className="p-3">
                            <div className="text-xs text-muted-foreground mb-1">Asignado a</div>
                            <div className="font-medium">{selectedTicket.asignadoA || "Sin asignar"}</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Comentarios y Adjuntos */}
                      <Separator />
                      {isLoadingTicketDetail ? (
                        <TicketDetailSkeleton />
                      ) : (
                        <TicketComments
                          ticketId={selectedTicket.id}
                          comments={selectedTicketFull?.comentarios || selectedTicket.comentarios || []}
                          attachments={selectedTicketFull?.attachments || selectedTicket.attachments || []}
                          onAddComment={async (payload) => {
                            await addComment(payload);
                            refresh();
                          }}
                          onRefresh={() => {
                            refreshTicketDetail();
                            refresh();
                          }}
                          isSubmitting={isCommenting}
                        />
                      )}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <EmptyTicketDetail />
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Modal de Creación */}
      <CreateTicketDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => refresh()}
      />
    </Card>
  );
}
