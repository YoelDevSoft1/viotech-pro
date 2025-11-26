/**
 * @file TicketsPanel.tsx
 * @description Componente para el panel de tickets
 * @author VioTech Solutions
 * @version 1.0.0
 * @since 2025-11-26
 */

"use client";

import { FormEvent, useMemo, useState, useEffect, useRef } from "react";
import { Plus, MessageSquare, Paperclip, Search, X, FileText, Clock, AlertCircle, CheckCircle2, Download, Link } from "lucide-react";
import { useTickets } from "@/lib/hooks/useTickets";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/State";
import { buildApiUrl } from "@/lib/api";
import { uploadTicketAttachment } from "@/lib/storage/uploadTicketAttachment";

// --- Types (Mantenidos igual) ---
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
  tipo?: string | null;
  fuenteSolicitante?: string | null;
  linkedTickets?: string[];
  usuarioId?: string | null;
  usuario?: { id?: string; nombre?: string; email?: string } | null;
  etiquetas?: any[];
  createdAt: string;
  comentarios?: any[];
  attachments?: Attachment[];
  asignadoA?: string | null;
  organizationId?: string;
  projectId?: string;
};

type TicketForm = {
  titulo: string;
  descripcion: string;
  prioridad: string;
  slaObjetivo: string;
  impacto: string;
  urgencia: string;
  categoria: string;
  tipo: string;
  fuenteSolicitante: string;
  organizationId: string;
  projectId: string;
  linkedTickets: string[];
  asignadoA: string;
};

type Props = {
  token: string | null;
  onRequireAuth?: () => void;
};

type Attachment = {
  id?: string;
  nombre?: string;
  url: string;
  path?: string;
  tamaño?: number;
  tipoMime?: string;
  createdAt?: string;
};

// --- Componentes Auxiliares para UI ---

const Badge = ({ children, color = "gray" }: { children: React.ReactNode; color?: string }) => {
  const colors: Record<string, string> = {
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    red: "bg-red-100 text-red-700 border-red-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    gray: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${colors[color] || colors.gray} inline-flex items-center gap-1`}>
      {children}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, any> = {
    resuelto: { color: "green", icon: CheckCircle2, label: "Resuelto" },
    cerrado: { color: "gray", icon: CheckCircle2, label: "Cerrado" },
    en_progreso: { color: "amber", icon: Clock, label: "En Progreso" },
    abierto: { color: "blue", icon: AlertCircle, label: "Abierto" },
  };
  const config = map[status.toLowerCase()] || { color: "gray", icon: AlertCircle, label: status };
  const Icon = config.icon;

  return (
    <Badge color={config.color}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

// --- Main Component ---

export function TicketsPanel({ token, onRequireAuth }: Props) {
  const getSlaInfo = (ticket: Ticket) => {
    if (!ticket.slaObjetivo) return null;
    const due = new Date(ticket.slaObjetivo).getTime();
    const created = new Date(ticket.createdAt).getTime();
    if (Number.isNaN(due) || Number.isNaN(created) || due <= created) return null;
    const now = Date.now();
    const total = due - created;
    const elapsed = Math.min(Math.max(now - created, 0), total);
    const pct = Math.round((elapsed / total) * 100);
    const status = pct >= 90 ? "critical" : pct >= 70 ? "warning" : "ok";
    return { pct, status };
  };

  // State
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ estado: "", prioridad: "", impacto: "", urgencia: "" });
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // Data Fetching
  const { tickets, loading, error, pagination, refresh } = useTickets({
    page,
    limit: 10,
    estado: filters.estado || undefined,
    prioridad: filters.prioridad || undefined,
    impacto: filters.impacto || undefined,
    urgencia: filters.urgencia || undefined,
  });

  // UI & Form States
  const [attachmentsList, setAttachmentsList] = useState<Attachment[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState<TicketForm>({
    titulo: "",
    descripcion: "",
    prioridad: "mediana",
    slaObjetivo: "",
    impacto: "mediano",
    urgencia: "mediana",
    categoria: "general",
    tipo: "requerimiento",
    fuenteSolicitante: "Mesa de Servicio",
    organizationId: "",
    projectId: "",
    linkedTickets: [],
    asignadoA: "",
  });
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketComment, setTicketComment] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentsUploading, setAttachmentsUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const [organizations, setOrganizations] = useState<{ id: string; nombre?: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; nombre?: string }[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentRole, setCurrentRole] = useState<string>("");
  const [linkedSelectorOpen, setLinkedSelectorOpen] = useState(false);
  const [linkedSearch, setLinkedSearch] = useState("");
  const [userSelectorOpen, setUserSelectorOpen] = useState<"creator" | "assignee" | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState<{ id: string; nombre?: string; email?: string }[]>([]);
  const peopleOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    users.forEach((u) => {
      const name = u.nombre || u.email || u.id;
      map.set(u.id, { id: u.id, name });
    });
    tickets.forEach((t) => {
      const uid = (t as any).usuarioId || (t as any).usuario?.id;
      const uname = (t as any).usuario?.nombre || (t as any).usuario?.email;
      if (uid) map.set(uid, { id: uid, name: uname || uid });
      const aid = t.asignadoA;
      if (aid) map.set(aid, { id: aid, name: `Asignado ${aid}` });
    });
    if (currentUserId && !map.has(currentUserId)) map.set(currentUserId, { id: currentUserId, name: "Usuario actual" });
    return Array.from(map.values());
  }, [tickets, currentUserId, users]);

  const loadOrganizations = async () => {
    if (!token) return;
    try {
      const res = await fetch(buildApiUrl("/organizations"), {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (res.ok) setOrganizations(data?.data?.organizations || data?.organizations || []);
    } catch {
      /* silent */
    }
  };

  const loadProjects = async (orgId: string) => {
    if (!token || !orgId) {
      setProjects([]);
      return;
    }
    try {
      const res = await fetch(buildApiUrl(`/projects?organizationId=${orgId}`), {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (res.ok) setProjects(data?.data?.projects || data?.projects || []);
    } catch {
      /* silent */
    }
  };

  const loadAuthUser = async () => {
    if (!token) return;
    try {
      const res = await fetch(buildApiUrl("/auth/me"), {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        const user = data?.data?.user || data?.user;
        const id = user?.id;
        const rol = user?.rol || "";
        if (id) setCurrentUserId(id);
        if (rol) setCurrentRole(rol);
      }
    } catch {
      /* silent */
    }
  };

  const loadUsers = async () => {
    if (!token) return;
    try {
      const collected: any[] = [];
      let page = 1;
      const limit = 100;

      while (page < 6) {
        const res = await fetch(buildApiUrl(`/api/users?page=${page}&limit=${limit}`), {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          if (res.status === 403 || res.status === 401) {
            setLocalError("Necesitas rol admin para listar usuarios.");
          }
          break;
        }
        const list = data?.data?.users || [];
        if (Array.isArray(list)) {
          collected.push(...list);
          if (list.length < limit) break;
        } else {
          break;
        }
        page += 1;
      }

      if (collected.length) {
        const map = new Map<string, any>();
        collected.forEach((u) => {
          if (u?.id) map.set(u.id, u);
        });
        setUsers(Array.from(map.values()));
      }
    } catch (err) {
      setLocalError("No se pudieron cargar los usuarios.");
    }
  };

  const filteredTickets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tickets.filter((t) => {
      if (filters.estado && t.estado !== filters.estado) return false;
      if (filters.prioridad && t.prioridad !== filters.prioridad) return false;
      if (filters.impacto && t.impacto !== filters.impacto) return false;
      if (filters.urgencia && t.urgencia !== filters.urgencia) return false;
      if (!term) return true;
      return (
        t.titulo.toLowerCase().includes(term) ||
        (t.descripcion || "").toLowerCase().includes(term) ||
        (t.estado || "").toLowerCase().includes(term) ||
        (t.prioridad || "").toLowerCase().includes(term)
      );
    });
  }, [tickets, filters, search]);

  const selected = useMemo(() => {
    if (selectedTicket && filteredTickets.some((t) => t.id === selectedTicket.id)) {
      return selectedTicket;
    }
    return filteredTickets[0] || null;
  }, [selectedTicket, filteredTickets]);

  // Effects
  useEffect(() => {
    if (selected?.attachments && selected.attachments.length > 0) {
      setAttachmentsList(
        selected.attachments.map((a: any) => ({
          id: a.id || a.attachmentId,
          nombre: a.nombre || a.name,
          url: a.url,
          path: a.path,
          tamaño: a.tamaño || a.size,
          tipoMime: a.tipoMime || a.mimeType,
          createdAt: a.createdAt || a.created_at,
        })),
      );
    } else if (selected?.id) {
      loadAttachments(selected.id);
    } else {
      setAttachmentsList([]);
    }
    setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [selected?.id, selected?.attachments]); // Solo re-ejecutar si cambia el ID o la lista

  useEffect(() => {
    if (createTicketOpen) {
      loadOrganizations();
      loadAuthUser();
    }
  }, [createTicketOpen]);

  useEffect(() => {
    if (ticketForm.organizationId) {
      loadProjects(ticketForm.organizationId);
    } else {
      setProjects([]);
    }
  }, [ticketForm.organizationId]);

  useEffect(() => {
    if (userSelectorOpen) {
      loadUsers();
    }
  }, [userSelectorOpen]);

  useEffect(() => {
    if (createTicketOpen) {
      loadOrganizations();
    }
  }, [createTicketOpen]);

  useEffect(() => {
    if (ticketForm.organizationId) {
      loadProjects(ticketForm.organizationId);
    } else {
      setProjects([]);
    }
  }, [ticketForm.organizationId]);

  const loadAttachments = async (ticketId: string) => {
    setAttachmentsLoading(true);
    try {
      const res = await fetch(buildApiUrl(`/tickets/${ticketId}/attachments`), {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
      });
      const payload = await res.json();
      if (!res.ok) throw new Error("Error loading attachments");
      const data = payload?.data?.attachments || payload?.attachments || [];
      setAttachmentsList(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } 
    finally { setAttachmentsLoading(false); }
  };

  // Handlers
  const updateFilter = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) { onRequireAuth?.(); return; }
    if (!ticketForm.titulo.trim()) { setLocalError("Título requerido"); return; }
    
    setTicketSubmitting(true);
    setLocalError(null);
    try {
      const response = await fetch(buildApiUrl("/tickets"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
             titulo: ticketForm.titulo.trim(),
             descripcion: ticketForm.descripcion?.trim(),
             prioridad: ticketForm.prioridad,
             impacto: ticketForm.impacto,
             urgencia: ticketForm.urgencia,
             categoria: ticketForm.categoria,
             slaObjetivo: ticketForm.slaObjetivo ? new Date(ticketForm.slaObjetivo).toISOString() : undefined,
             tipo: ticketForm.tipo,
             fuenteSolicitante: ticketForm.fuenteSolicitante,
             organizationId: ticketForm.organizationId || undefined,
             projectId: ticketForm.projectId || undefined,
             asignadoA: currentRole === "cliente" ? undefined : ticketForm.asignadoA || undefined,
             linkedTickets: ticketForm.linkedTickets.length ? ticketForm.linkedTickets : undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || "Error al crear");
      
      const createdId = payload?.data?.ticket?.id || payload?.data?.id || payload?.id;

      if (createdId && attachments.length) {
        setAttachmentsUploading(true);
        for (const file of attachments) {
          await uploadTicketAttachment(createdId, file, token);
        }
      }
      
      // Reset
      setTicketForm({
        titulo: "",
        descripcion: "",
        prioridad: "mediana",
        slaObjetivo: "",
        impacto: "mediano",
        urgencia: "mediana",
        categoria: "general",
        tipo: "requerimiento",
        fuenteSolicitante: "Mesa de Servicio",
        organizationId: "",
        projectId: "",
        linkedTickets: [],
        asignadoA: "",
      });
      setAttachments([]);
      setCreateTicketOpen(false);
      refresh();
    } catch (err: any) {
      setLocalError(err.message);
    } finally {
      setTicketSubmitting(false);
      setAttachmentsUploading(false);
    }
  };

  const handleComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected || !token || !ticketComment.trim()) return;
    setCommentSubmitting(true);
    try {
        const res = await fetch(buildApiUrl(`/tickets/${selected.id}/comment`), {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ contenido: ticketComment.trim() }),
        });
        if (!res.ok) throw new Error("Error al comentar");
        setTicketComment("");
        refresh(); // Idealmente refrescar solo los comentarios, pero refresh completo es seguro
    } catch(e: any) { setLocalError(e.message); }
    finally { setCommentSubmitting(false); }
  };

  // --- Render ---

  if (loading && !tickets.length) return <LoadingState title="Cargando centro de soporte..." />;
  if (error && !tickets.length) return <ErrorState message={error} />;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-background">
      {/* Toolbar compacta para evitar texto duplicado */}
      <div className="mb-5 pb-4 border-b border-border">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="w-4 h-4" />
            <span>Gestiona tus tickets</span>
          </div>
          <button
            onClick={() => setCreateTicketOpen(true)}
            className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nuevo Ticket
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Buscar por título, estado o prioridad..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full">
            <select
              className="text-xs border border-input rounded-md px-3 py-2 bg-background focus:ring-2 focus:ring-ring focus:outline-none"
              value={filters.estado}
              onChange={(e) => updateFilter("estado", e.target.value)}
            >
              <option value="">Estado: Todos</option>
              <option value="abierto">Abierto</option>
              <option value="en_progreso">En Progreso</option>
              <option value="resuelto">Resuelto</option>
            </select>
            <select
              className="text-xs border border-input rounded-md px-3 py-2 bg-background focus:ring-2 focus:ring-ring focus:outline-none"
              value={filters.prioridad}
              onChange={(e) => updateFilter("prioridad", e.target.value)}
            >
              <option value="">Prioridad: Todas</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
            <select
              className="text-xs border border-input rounded-md px-3 py-2 bg-background focus:ring-2 focus:ring-ring focus:outline-none"
              value={filters.impacto}
              onChange={(e) => updateFilter("impacto", e.target.value)}
            >
              <option value="">Impacto: Todos</option>
              <option value="critico">Crítico</option>
              <option value="alto">Alto</option>
              <option value="medio">Medio</option>
              <option value="bajo">Bajo</option>
            </select>
            <select
              className="text-xs border border-input rounded-md px-3 py-2 bg-background focus:ring-2 focus:ring-ring focus:outline-none"
              value={filters.urgencia}
              onChange={(e) => updateFilter("urgencia", e.target.value)}
            >
              <option value="">Urgencia: Todas</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="normal">Normal</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
        
        {/* List Panel */}
        <div className={`lg:col-span-4 lg:flex flex-col gap-3 min-h-0 overflow-hidden ${selected ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 glass-scroll">
                {filteredTickets.map((ticket) => (
                    <button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group
                            ${selected?.id === ticket.id 
                                ? "bg-muted border-foreground/20 shadow-sm" 
                                : "bg-card border-border hover:border-foreground/30 hover:shadow-sm"}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">#{ticket.id.slice(0,6)}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className={`font-medium text-sm mb-2 line-clamp-2 ${selected?.id === ticket.id ? 'text-foreground' : 'text-foreground/90'}`}>
                            {ticket.titulo}
                        </h3>
                        <div className="flex items-center gap-2">
                            <StatusBadge status={ticket.estado} />
                            {ticket.prioridad === 'alta' || ticket.prioridad === 'critica' ? (
                                <Badge color="red">{ticket.prioridad}</Badge>
                            ) : null}
                        </div>
                        {(() => {
                            const sla = getSlaInfo(ticket);
                            return sla ? (
                              <div className="mt-3 space-y-1">
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                  <span>SLA</span>
                                  <span className="font-medium text-foreground/80">{sla.pct}%</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-border/60 overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-300 ${
                                      sla.status === "critical"
                                        ? "bg-gradient-to-r from-amber-400 via-amber-500 to-red-500"
                                        : sla.status === "warning"
                                          ? "bg-gradient-to-r from-emerald-400 via-amber-400 to-amber-500"
                                          : "bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500"
                                    }`}
                                    style={{ width: `${sla.pct}%` }}
                                  />
                                </div>
                              </div>
                            ) : null;
                        })()}
                    </button>
                ))}
                {!loading && filteredTickets.length === 0 && <EmptyState title="No hay tickets" message="No se encontraron resultados con estos filtros." />}
            </div>
            
            {/* Simple Pagination */}
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Pág {pagination?.page} de {pagination?.totalPages}</span>
                <div className="flex gap-1">
                    <button disabled={page===1} onClick={() => setPage(p => p-1)} className="px-2 py-1 border rounded hover:bg-muted disabled:opacity-50">Ant</button>
                    <button disabled={page>= (pagination?.totalPages || 1)} onClick={() => setPage(p => p+1)} className="px-2 py-1 border rounded hover:bg-muted disabled:opacity-50">Sig</button>
                </div>
            </div>
        </div>

        {/* Detail Panel */}
        <div className={`lg:col-span-8 flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden ${!selected ? 'hidden lg:flex lg:items-center lg:justify-center bg-muted/20 border-dashed' : 'flex'}`}>
            {!selected ? (
                <div className="text-center p-8">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-foreground/70">Selecciona un ticket</h3>
                    <p className="text-sm text-muted-foreground">Elige un ticket de la lista para ver detalles, adjuntos y comentarios.</p>
                </div>
            ) : (
                <>
                    {/* Detail Header */}
                    <div className="p-6 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-start">
                        <div className="space-y-1.5">
                            <button onClick={() => setSelectedTicket(null)} className="lg:hidden text-xs flex items-center gap-1 text-muted-foreground mb-2">
                                ← Volver
                            </button>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-semibold text-foreground">{selected.titulo}</h2>
                                <StatusBadge status={selected.estado} />
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span>ID: <span className="font-mono text-foreground">{selected.id}</span></span>
                                <span>Creado: {new Date(selected.createdAt).toLocaleDateString()}</span>
                                <span>Asignado: {selected.asignadoA || "Sin asignar"}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             {/* Acciones adicionales podrían ir aquí */}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Description */}
                        <section>
                            <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5" /> Descripción
                            </h4>
                            <div className="p-4 bg-muted/30 rounded-lg text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 border border-border/50">
                                {selected.descripcion || "Sin descripción proporcionada."}
                            </div>
                        </section>

                        {/* Metadata Grid */}
                        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 border rounded-lg bg-background">
                                <span className="text-[10px] uppercase text-muted-foreground block mb-1">Prioridad</span>
                                <span className="text-sm font-medium capitalize">{selected.prioridad}</span>
                            </div>
                            <div className="p-3 border rounded-lg bg-background">
                                <span className="text-[10px] uppercase text-muted-foreground block mb-1">Impacto</span>
                                <span className="text-sm font-medium capitalize">{selected.impacto || "-"}</span>
                            </div>
                            <div className="p-3 border rounded-lg bg-background">
                                <span className="text-[10px] uppercase text-muted-foreground block mb-1">Categoría</span>
                                <span className="text-sm font-medium capitalize">{selected.categoria || "General"}</span>
                            </div>
                            <div className="p-3 border rounded-lg bg-background">
                                <span className="text-[10px] uppercase text-muted-foreground block mb-1">SLA Objetivo</span>
                                <span className="text-sm font-medium">{selected.slaObjetivo ? new Date(selected.slaObjetivo).toLocaleDateString() : "-"}</span>
                            </div>
                        </section>

                        {/* Attachments Section - Consolidated */}
                        <section>
                            <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                <Paperclip className="w-3.5 h-3.5" /> Adjuntos ({attachmentsList.length})
                            </h4>
                            {attachmentsLoading ? <div className="h-10 w-full animate-pulse bg-muted rounded"></div> : (
                                attachmentsList.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {attachmentsList.map((file) => (
                                            <a 
                                                key={file.id || file.url} 
                                                href={file.url} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors group"
                                            >
                                                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                                                    {(file.tipoMime || "").startsWith("image") ? <img src={file.url} className="w-full h-full object-cover rounded" /> : <FileText className="w-5 h-5" />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium truncate text-foreground group-hover:underline decoration-foreground/50 underline-offset-4">{file.nombre || "Archivo adjunto"}</p>
                                                    <p className="text-[10px] text-muted-foreground">{file.tamaño ? `${Math.round(file.tamaño/1024)} KB` : "Desconocido"}</p>
                                                </div>
                                                <Download className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic pl-1">No hay archivos adjuntos.</p>
                                )
                            )}
                        </section>

                        {/* Comments / Activity Feed */}
                        <section className="border-t border-border pt-6">
                            <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5" /> Actividad
                            </h4>
                            <div className="space-y-4 mb-6">
                                {selected.comentarios?.length ? selected.comentarios.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                            {comment.autor?.nombre?.[0] || "U"}
                                        </div>
                                        <div className="bg-muted/40 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-semibold text-xs text-foreground">{comment.autor?.nombre || "Usuario"}</span>
                                                <span className="text-[10px] text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-foreground/90">{comment.contenido}</p>
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-muted-foreground text-center py-4">Inicia la conversación...</p>}
                                <div ref={commentsEndRef} />
                            </div>

                            {/* Comment Input */}
                            <form onSubmit={handleComment} className="relative">
                                <textarea
                                    className="w-full min-h-[100px] p-3 pr-24 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none text-sm resize-none"
                                    placeholder="Escribe un comentario o actualización..."
                                    value={ticketComment}
                                    onChange={(e) => setTicketComment(e.target.value)}
                                />
                                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                    <button 
                                        type="submit" 
                                        disabled={commentSubmitting || !ticketComment.trim()}
                                        className="bg-foreground text-background text-xs font-medium px-4 py-1.5 rounded-full hover:opacity-90 disabled:opacity-50 transition-all"
                                    >
                                        {commentSubmitting ? "Enviando..." : "Enviar"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                </>
            )}
        </div>
      </div>

      {/* MODAL: Create Ticket */}
      {createTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-lg font-semibold">Nuevo Ticket</h2>
                    <button onClick={() => setCreateTicketOpen(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleCreate} className="p-6 space-y-5">
                    {localError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4"/> {localError}</div>}
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase text-muted-foreground">Título del Incidente</label>
                        <input 
                            required
                            className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                            placeholder="Ej: Error al procesar pago en pasarela"
                            value={ticketForm.titulo} onChange={e => setTicketForm(p => ({...p, titulo: e.target.value}))}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Categoría</label>
                            <input 
                                className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-ring focus:outline-none text-sm"
                                placeholder="Ej: Facturación"
                                value={ticketForm.categoria} onChange={e => setTicketForm(p => ({...p, categoria: e.target.value}))}
                            />
                        </div>
                         <div className="space-y-1.5">
                            <label className="text-xs font-medium uppercase text-muted-foreground">SLA Objetivo</label>
                            <input 
                                type="date"
                                className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-ring focus:outline-none text-sm"
                                value={ticketForm.slaObjetivo} onChange={e => setTicketForm(p => ({...p, slaObjetivo: e.target.value}))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Prioridad</label>
                            <select 
                                className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                                value={ticketForm.prioridad} onChange={e => setTicketForm(p => ({...p, prioridad: e.target.value}))}
                            >
                                <option value="baja">Baja</option>
                                <option value="mediana">Mediana</option>
                                <option value="alta">Alta</option>
                                <option value="critica">Crítica</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Impacto</label>
                            <select 
                                className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                                value={ticketForm.impacto} onChange={e => setTicketForm(p => ({...p, impacto: e.target.value}))}
                            >
                                <option value="bajo">Bajo</option>
                                <option value="mediano">Mediano</option>
                                <option value="alto">Alto</option>
                                <option value="critico">Crítico</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Urgencia</label>
                            <select 
                                className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                                value={ticketForm.urgencia} onChange={e => setTicketForm(p => ({...p, urgencia: e.target.value}))}
                            >
                                <option value="baja">Baja</option>
                                <option value="mediana">Mediana</option>
                                <option value="alta">Alta</option>
                                <option value="critica">Crítica</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Tipo</label>
                            <select
                              className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                              value={ticketForm.tipo}
                              onChange={(e) => setTicketForm((p) => ({ ...p, tipo: e.target.value }))}
                            >
                              <option value="requerimiento">Requerimiento</option>
                              <option value="incidente">Incidente</option>
                              <option value="consulta">Consulta</option>
                              <option value="otro">Otro</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Fuente solicitante</label>
                            <input
                              className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-ring focus:outline-none text-sm"
                              placeholder="Ej: Mesa de Servicio"
                              value={ticketForm.fuenteSolicitante}
                              onChange={(e) => setTicketForm((p) => ({ ...p, fuenteSolicitante: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Organización</label>
                            <select
                              className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                              value={ticketForm.organizationId}
                              onChange={(e) => {
                                const orgId = e.target.value;
                                setTicketForm((p) => ({ ...p, organizationId: orgId, projectId: "" }));
                                loadProjects(orgId);
                              }}
                            >
                              <option value="">Selecciona organización</option>
                              {organizations.map((org) => (
                                <option key={org.id} value={org.id}>
                                  {org.nombre || org.id}
                                </option>
                              ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Proyecto</label>
                            <select
                              className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                              value={ticketForm.projectId}
                              onChange={(e) => setTicketForm((p) => ({ ...p, projectId: e.target.value }))}
                              disabled={!ticketForm.organizationId}
                            >
                              <option value="">Selecciona proyecto</option>
                              {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                  {project.nombre || project.id}
                                </option>
                              ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-3 p-3 border rounded-lg bg-muted/10 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Enlazar ticket</p>
                          <button
                            type="button"
                            onClick={() => setLinkedSelectorOpen(true)}
                            className="text-xs px-3 py-1 rounded-full border border-border hover:bg-muted/50"
                          >
                            Seleccionar
                          </button>
                        </div>
                        <div className="border rounded-lg bg-background/80 text-sm px-3 py-2 shadow-inner min-h-[44px] flex items-center">
                          {ticketForm.linkedTickets[0]
                            ? (() => {
                                const t = tickets.find((tk) => tk.id === ticketForm.linkedTickets[0]);
                                return t ? `${t.titulo || "Ticket"} — ${t.id}` : ticketForm.linkedTickets[0];
                              })()
                            : "Sin ticket enlazado"}
                        </div>
                        <p className="text-[11px] text-muted-foreground">Elige un ticket existente para vincular.</p>
                      </div>

                      <div className="space-y-3 p-3 border rounded-lg bg-muted/10 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Creado por</p>
                          <button
                            type="button"
                            onClick={() => {
                              setUserSelectorOpen("creator");
                              setUserSearch("");
                            }}
                            className="text-xs px-3 py-1 rounded-full border border-border hover:bg-muted/50"
                          >
                            Seleccionar
                          </button>
                        </div>
                        <select
                          className="w-full px-3 py-2 border rounded-lg bg-background/80 focus:ring-2 focus:ring-ring focus:outline-none text-sm shadow-inner"
                          value={ticketForm.usuarioId}
                          onChange={(e) => setTicketForm((p) => ({ ...p, usuarioId: e.target.value }))}
                        >
                          <option value="">Selecciona usuario</option>
                          {peopleOptions.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.id})
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-muted-foreground">Por defecto, tu usuario actual.</p>
                      </div>

                      <div className="space-y-3 p-3 border rounded-lg bg-muted/10 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Asignado a</p>
                          <button
                            type="button"
                            onClick={() => {
                              setUserSelectorOpen("assignee");
                              setUserSearch("");
                            }}
                            className="text-xs px-3 py-1 rounded-full border border-border hover:bg-muted/50"
                          >
                            Seleccionar
                          </button>
                        </div>
                        <select
                          className="w-full px-3 py-2 border rounded-lg bg-background/80 focus:ring-2 focus:ring-ring focus:outline-none text-sm shadow-inner"
                          value={ticketForm.asignadoA}
                          onChange={(e) => setTicketForm((p) => ({ ...p, asignadoA: e.target.value }))}
                        >
                          <option value="">Selecciona responsable</option>
                          {peopleOptions.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.id})
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-muted-foreground">Define el responsable (opcional).</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase text-muted-foreground">Descripción detallada</label>
                        <textarea 
                            rows={4}
                            className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-ring focus:outline-none text-sm resize-none"
                            placeholder="Describe los pasos para reproducir el error..."
                            value={ticketForm.descripcion} onChange={e => setTicketForm(p => ({...p, descripcion: e.target.value}))}
                        />
                    </div>

                    <div className="p-4 border border-dashed rounded-lg bg-muted/30">
                        <label className="cursor-pointer flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <Paperclip className="w-4 h-4" />
                            <span>{attachments.length > 0 ? `${attachments.length} archivos seleccionados` : "Adjuntar archivos (evidencias, logs...)"}</span>
                            <input type="file" multiple className="hidden" onChange={(e) => setAttachments(e.target.files ? Array.from(e.target.files) : [])} />
                        </label>
                    </div>
                    
                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                        <button type="button" onClick={() => setCreateTicketOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">Cancelar</button>
                        <button 
                            type="submit" 
                            disabled={ticketSubmitting || attachmentsUploading}
                            className="px-6 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 shadow-sm"
                        >
                            {ticketSubmitting ? "Creando..." : "Crear Ticket"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* SELECTOR: Usuarios (creador / asignado) */}
      {userSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-3xl rounded-xl border border-border shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Seleccionar usuario</p>
                <h3 className="text-lg font-semibold">
                  {userSelectorOpen === "creator" ? "Creado por" : "Asignado a"}
                </h3>
              </div>
              <button onClick={() => setUserSelectorOpen(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none text-sm"
                  placeholder="Buscar por nombre o id"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <div className="border border-border rounded-lg bg-muted/10 backdrop-blur-sm overflow-hidden">
                <div className="max-h-[55vh] overflow-y-auto glass-scroll divide-y divide-border/60">
                  {peopleOptions
                    .filter((u) => {
                      const term = userSearch.trim().toLowerCase();
                      if (!term) return true;
                      return u.name.toLowerCase().includes(term) || u.id.toLowerCase().includes(term);
                    })
                    .map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          if (userSelectorOpen === "creator") {
                            setTicketForm((p) => ({ ...p, usuarioId: u.id }));
                          } else {
                            setTicketForm((p) => ({ ...p, asignadoA: u.id }));
                          }
                          setUserSelectorOpen(null);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors"
                      >
                        <div className="text-sm font-medium text-foreground">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.id}</div>
                      </button>
                    ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                  onClick={() => setUserSelectorOpen(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SELECTOR: Linked tickets */}
      {linkedSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-3xl rounded-xl border border-border shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Seleccionar ticket</p>
                <h3 className="text-lg font-semibold">Vincular ticket existente</h3>
              </div>
              <button onClick={() => setLinkedSelectorOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none text-sm"
                  placeholder="Buscar por id, título o descripción"
                  value={linkedSearch}
                  onChange={(e) => setLinkedSearch(e.target.value)}
                />
              </div>

              <div className="border border-border rounded-lg bg-muted/10 backdrop-blur-sm overflow-hidden">
                <div className="max-h-[55vh] overflow-y-auto glass-scroll divide-y divide-border/60">
                  {tickets
                    .filter((t) => {
                      const term = linkedSearch.trim().toLowerCase();
                      if (!term) return true;
                      return (
                        t.id.toLowerCase().includes(term) ||
                        (t.titulo || "").toLowerCase().includes(term) ||
                        (t.descripcion || "").toLowerCase().includes(term)
                      );
                    })
                    .map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTicketForm((p) => ({ ...p, linkedTickets: [t.id] }));
                          setLinkedSelectorOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors"
                      >
                        <div className="text-xs text-muted-foreground mb-1">{t.id}</div>
                        <div className="text-sm font-medium text-foreground">{t.titulo || "Sin título"}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {t.descripcion || "Sin descripción"}
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                  onClick={() => {
                    setTicketForm((p) => ({ ...p, linkedTickets: [] }));
                    setLinkedSelectorOpen(false);
                  }}
                >
                  Quitar enlace
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                  onClick={() => setLinkedSelectorOpen(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
