"use client";

import { useState, useMemo } from "react";
import { Search, Plus, MessageSquare } from "lucide-react";
import { useTickets } from "@/lib/hooks/useTickets"; // Tu hook existente
import { CreateTicketDialog } from "@/components/tickets/CreateTicketDialog";
import { StatusBadge, PriorityBadge } from "@/components/tickets/TicketBadges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// Tipos auxiliares para los filtros (puedes moverlos a types)
type Filters = {
  estado: string;
  prioridad: string;
};

export function TicketsPanel() {
  // Estados locales
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>({ estado: "todos", prioridad: "todas" });
  const [page, setPage] = useState(1);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Hook de datos (React Query)
  const { 
    tickets, 
    loading, 
    error, 
    pagination, 
    refresh 
  } = useTickets({
    page,
    limit: 10,
    // Convertimos 'todos' a undefined para que la API no filtre
    estado: filters.estado === "todos" ? undefined : filters.estado,
    prioridad: filters.prioridad === "todas" ? undefined : filters.prioridad,
  });

  // Filtrado en cliente para la búsqueda de texto (si la API no lo soporta nativamente en 'q')
  // O idealmente pasar 'search' al hook useTickets si tu API soporta ?search=...
  const filteredTickets = useMemo(() => {
    if (!search) return tickets;
    const lower = search.toLowerCase();
    return tickets.filter(t => 
        t.titulo.toLowerCase().includes(lower) || 
        t.id.toLowerCase().includes(lower)
    );
  }, [tickets, search]);

  const selectedTicket = useMemo(() => 
    tickets.find(t => t.id === selectedTicketId) || tickets[0] || null
  , [tickets, selectedTicketId]);

  if (loading && !tickets.length) {
    return (
        <div className="space-y-4 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error cargando tickets: {error}</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-background">
      
      {/* --- Toolbar Superior --- */}
      <div className="flex flex-col gap-4 pb-4 border-b border-border">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Gestión de Tickets
            </h2>
            <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" /> Nuevo Ticket
            </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Buscar ticket..." 
                    className="pl-9" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <Select 
                value={filters.estado} 
                onValueChange={(v) => setFilters(p => ({...p, estado: v}))}
            >
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="abierto">Abierto</SelectItem>
                    <SelectItem value="en_progreso">En Progreso</SelectItem>
                    <SelectItem value="resuelto">Resuelto</SelectItem>
                </SelectContent>
            </Select>
            <Select 
                value={filters.prioridad} 
                onValueChange={(v) => setFilters(p => ({...p, prioridad: v}))}
            >
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Prioridad" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* --- Master-Detail Layout --- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden pt-4">
        
        {/* Lista de Tickets (Izquierda) */}
        <div className={`lg:col-span-4 flex flex-col min-h-0 ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                {filteredTickets.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-sm">No se encontraron tickets.</div>
                ) : (
                    filteredTickets.map(ticket => (
                        <div 
                            key={ticket.id}
                            onClick={() => setSelectedTicketId(ticket.id)}
                            className={`
                                cursor-pointer p-4 rounded-xl border transition-all
                                ${selectedTicket?.id === ticket.id 
                                    ? "bg-muted border-primary/30 shadow-sm" 
                                    : "bg-card border-border hover:bg-muted/50"}
                            `}
                        >
                            <div className="flex justify-between mb-1">
                                <span className="text-[10px] font-mono text-muted-foreground">#{ticket.id.slice(0,6)}</span>
                                <span className="text-[10px] text-muted-foreground">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h4 className="font-medium text-sm mb-2 line-clamp-2">{ticket.titulo}</h4>
                            <div className="flex gap-2">
                                <StatusBadge status={ticket.estado} />
                                <PriorityBadge priority={ticket.prioridad} />
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {/* Paginación simple */}
            <div className="pt-2 flex justify-between items-center text-xs text-muted-foreground">
                <span>Página {page} de {pagination.totalPages || 1}</span>
                <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-7 px-2" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Ant</Button>
                    <Button variant="outline" size="sm" className="h-7 px-2" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Sig</Button>
                </div>
            </div>
        </div>

        {/* Detalle del Ticket (Derecha) */}
        <div className={`lg:col-span-8 flex flex-col bg-card border rounded-xl overflow-hidden ${!selectedTicket ? 'hidden lg:flex items-center justify-center bg-muted/10' : 'flex'}`}>
            {selectedTicket ? (
                <div className="h-full flex flex-col">
                    {/* Header del Detalle */}
                    <div className="p-6 border-b bg-muted/10 flex justify-between items-start">
                        <div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="lg:hidden mb-2 -ml-2 h-6 text-xs"
                                onClick={() => setSelectedTicketId(null)}
                            >
                                ← Volver
                            </Button>
                            <h2 className="text-xl font-bold">{selectedTicket.titulo}</h2>
                            <div className="flex gap-2 mt-2">
                                <StatusBadge status={selectedTicket.estado} />
                                <span className="text-xs text-muted-foreground self-center">
                                    Creado el {new Date(selectedTicket.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        {/* Aquí podrías poner botones de acción (Editar, Cerrar Ticket) */}
                    </div>

                    {/* Contenido Scrollable */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Descripción</h3>
                            <div className="p-4 bg-muted/30 rounded-lg text-sm whitespace-pre-wrap">
                                {selectedTicket.descripcion || "Sin descripción."}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div className="p-3 border rounded-lg">
                                <div className="text-xs text-muted-foreground">Categoría</div>
                                <div className="font-medium capitalize">{selectedTicket.categoria || "General"}</div>
                            </div>
                            <div className="p-3 border rounded-lg">
                                <div className="text-xs text-muted-foreground">Impacto</div>
                                <div className="font-medium capitalize">{selectedTicket.impacto || "-"}</div>
                            </div>
                            <div className="p-3 border rounded-lg">
                                <div className="text-xs text-muted-foreground">Asignado a</div>
                                <div className="font-medium">{selectedTicket.asignadoA || "Sin asignar"}</div>
                            </div>
                        </div>

                        {/* Aquí podrías importar un componente <TicketComments ticketId={selectedTicket.id} /> */}
                        {/* Por brevedad, dejo el placeholder de comentarios */}
                        <div className="pt-6 border-t">
                            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Actividad y Comentarios</h3>
                            {selectedTicket.comentarios?.length ? (
                                <div className="space-y-4">
                                    {selectedTicket.comentarios.map((c: any) => (
                                        <div key={c.id} className="bg-muted/50 p-3 rounded-lg text-sm">
                                            <div className="flex justify-between mb-1 text-xs text-muted-foreground">
                                                <span className="font-bold text-foreground">{c.autor?.nombre || "Usuario"}</span>
                                                <span>{new Date(c.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p>{c.contenido}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No hay comentarios aún.</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center p-10">
                    <MessageSquare className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">Selecciona un ticket para ver los detalles</h3>
                </div>
            )}
        </div>

      </div>

      {/* Modal de Creación */}
      <CreateTicketDialog 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => refresh()} // Refresca la lista al crear
      />
    </div>
  );
}