"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Headphones,
  Lock,
  LogOut,
  MessageSquare,
  Paperclip,
  Plus,
  Shield,
  Sparkles,
  TrendingUp,
  Users2,
} from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { fetchDashboardMetrics, type DashboardMetrics } from "@/lib/metrics";
import { logout, getAccessToken, refreshAccessToken, isTokenExpired } from "@/lib/auth";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import MFASettings from "@/components/MFASettings";
import TimelinePredictor from "@/components/TimelinePredictor";
import AITicketAssistant from "@/components/AITicketAssistant";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/ToastProvider";

type Service = {
  id: string;
  nombre: string;
  tipo: "licencia" | "landing-page" | string;
  estado: "activo" | "expirado" | "pendiente" | string;
  fecha_compra?: string | null;
  fecha_expiracion?: string | null;
  progreso?: number | null;
  precio?: number | null;
};

type TimelineEvent = {
  id: string;
  title: string;
  date: string;
  type: "renovacion" | "kickoff";
  serviceName: string;
};

type TicketComment = {
  id: string;
  contenido: string;
  tipo: string;
  createdAt: string;
  autor?: {
    id: string;
    nombre: string;
    email: string;
  } | null;
};

type Ticket = {
  id: string;
  titulo: string;
  descripcion?: string | null;
  estado: string;
  prioridad: string;
  slaObjetivo?: string | null;
  etiquetas?: string | Record<string, unknown> | Array<unknown> | null;
  createdAt: string;
  comentarios?: TicketComment[];
};

const TOKEN_KEYS = ["viotech_token", "authTokenVioTech"];
const USERNAME_KEYS = ["viotech_user_name", "userNameVioTech"];
const ENABLE_PREDICTOR = process.env.NEXT_PUBLIC_ENABLE_PREDICTOR === "true";
const ENABLE_AI_ASSISTANT = process.env.NEXT_PUBLIC_ENABLE_AI_ASSISTANT === "true";
const SHOW_DASHBOARD_ASSISTANT = false; // IA avanzada movida a vista dedicada

type ModelStatus = {
  enabled: boolean;
  modelVersion?: string;
  notes?: string;
  healthy?: boolean;
};

const getPredictorApiBase = () => {
  const env =
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://viotech-main.onrender.com";
  const trimmed = env.replace(/\/+$/, "");
  return trimmed.toLowerCase().endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const formatDate = (value?: string | null) => {
  if (!value) return "Por definir";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Por definir";
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const computeProgressFromDates = (service: Service) => {
  if (!service.fecha_compra || !service.fecha_expiracion) return undefined;
  const start = new Date(service.fecha_compra).getTime();
  const end = new Date(service.fecha_expiracion).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return service.estado === "expirado" ? 100 : undefined;
  }
  const total = end - start;
  const elapsed = Math.min(Math.max(Date.now() - start, 0), total);
  return Math.round((elapsed / total) * 100);
};

const parseMaybeJson = <T,>(value: unknown, fallback: T): T => {
  if (!value) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  if (typeof value === "object") {
    return value as T;
  }
  return fallback;
};

const getFromStorage = (keys: string[]) => {
  if (typeof window === "undefined") return null;
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of keys) {
      const value = storage.getItem(key);
      if (value) return value;
    }
  }
  return null;
};

const clearStorages = (keys: string[]) => {
  if (typeof window === "undefined") return;
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of keys) {
      storage.removeItem(key);
    }
  }
};

const ServiceCard = ({ service }: { service: Service }) => {
  const progress =
    typeof service.progreso === "number"
      ? service.progreso
      : computeProgressFromDates(service);

  const statusBadge = {
    activo: "bg-green-100 text-green-800 border border-green-200",
    expirado: "bg-red-100 text-red-800 border border-red-200",
    pendiente: "bg-amber-100 text-amber-800 border border-amber-200",
  }[service.estado] || "bg-slate-100 text-slate-700 border border-slate-200";

  return (
    <div className="rounded-3xl border border-border/70 bg-background/70 p-6 space-y-4 hover:border-border transition-colors">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-[0.3em]">
            {service.tipo === "licencia" ? "Licencia" : "Proyecto"}
          </p>
          <h4 className="text-xl font-medium text-foreground">{service.nombre}</h4>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge}`}>
          {service.estado}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Inicio</p>
          <p className="text-foreground">{formatDate(service.fecha_compra)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Renovación</p>
          <p className="text-foreground">{formatDate(service.fecha_expiracion)}</p>
        </div>
      </div>
      {typeof progress === "number" && (
        <div>
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
            <span>Estatus</span>
            <span className="text-foreground">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-border">
            <div
              className="h-full rounded-full bg-foreground transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {service.precio ? `$${service.precio?.toLocaleString("es-CO")}` : "Proyecto a medida"}
        </span>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-xs font-medium text-foreground hover:gap-3 transition-all"
        >
          Ver detalles
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) => (
  <div className="rounded-3xl border border-border/70 bg-background/70 p-6 space-y-3">
    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
    <p className="text-3xl font-medium text-foreground">{value}</p>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

const TimelineCard = ({ event }: { event: TimelineEvent }) => (
  <div className="rounded-2xl border border-border/70 p-4 space-y-1">
    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
      {event.type === "renovacion" ? "Renovación" : "Kickoff"}
    </p>
    <p className="text-sm font-medium text-foreground">{event.title}</p>
    <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
  </div>
);

const QuickAction = ({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) => (
  <Link
    href={href}
    target="_blank"
    rel="noreferrer"
    className="rounded-2xl border border-border/60 p-4 hover:bg-muted/30 transition-colors"
  >
    <p className="text-sm font-medium text-foreground">{title}</p>
    <p className="text-xs text-muted-foreground">{description}</p>
  </Link>
);

export default function DashboardPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("cliente");
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "tickets">("overview");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [ticketsSuccess, setTicketsSuccess] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketFilters, setTicketFilters] = useState({ estado: "", prioridad: "" });
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "media",
    slaObjetivo: "",
  });
  const [ticketTargetUserId, setTicketTargetUserId] = useState("");
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketComment, setTicketComment] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentsUploading, setAttachmentsUploading] = useState(false);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [organizationId, setOrganizationId] = useState<string>("");
  const isPrivileged = userRole !== "cliente";
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [modelStatusError, setModelStatusError] = useState<string | null>(null);
  const [modelStatusLoading, setModelStatusLoading] = useState(false);
  const predictorApiBase = useMemo(() => getPredictorApiBase(), []);
  const { notify } = useToast();

  const uploadTicketAttachments = useCallback(async (files: File[]) => {
    if (!files.length) return [];
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const bucket =
      process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "tickets";

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
    }

    const uploads: { name: string; url: string; path: string }[] = [];

    for (const file of files) {
      const sanitizedName = file.name.replace(/\s+/g, "-");
      const uniqueId =
        typeof window !== "undefined" && typeof window.crypto?.randomUUID === "function"
          ? window.crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const filePath = `tickets/${uniqueId}-${sanitizedName}`;

      const response = await fetch(
        `${supabaseUrl}/storage/v1/object/${bucket}/${encodeURIComponent(filePath)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: file,
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "No se pudo subir el adjunto.");
      }

      uploads.push({
        name: file.name,
        url: `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`,
        path: filePath,
      });
    }

    return uploads;
  }, []);

  const fetchServices = useCallback(
    async (token: string) => {
      setLoading(true);
      setError(null);

      try {
        // Verificar y refrescar token si es necesario
        let tokenToUse = token;
        if (isTokenExpired(token)) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            tokenToUse = newToken;
            setToken(newToken);
          } else {
            await logout();
            router.replace("/login?from=/dashboard&reason=token_expired");
            return;
          }
        }

        const servicesUrl = organizationId
          ? `${buildApiUrl("/services/me")}?organizationId=${organizationId}`
          : buildApiUrl("/services/me");

        const response = await fetch(servicesUrl, {
          headers: { 
            Authorization: `Bearer ${tokenToUse}`,
            'Cache-Control': 'no-cache',
          },
          cache: 'no-store',
        });
        const payload = await response.json().catch(() => null);

        // Si el token expiró durante la request, intentar refrescar
        if (response.status === 401) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            // Reintentar con nuevo token
            const retryUrl = organizationId
              ? `${buildApiUrl("/services/me")}?organizationId=${organizationId}`
              : buildApiUrl("/services/me");
            const retryResponse = await fetch(retryUrl, {
              headers: { 
                Authorization: `Bearer ${newToken}`,
                'Cache-Control': 'no-cache',
              },
              cache: 'no-store',
            });
            const retryPayload = await retryResponse.json().catch(() => null);
            if (!retryResponse.ok) {
              throw new Error(retryPayload?.error || retryPayload?.message || "No se pudo cargar el panel.");
            }
            setToken(newToken);
            const normalizedServices: Service[] = (retryPayload.data || []).map((service: Service) => ({
              ...service,
              progreso:
                typeof service.progreso === "number"
                  ? service.progreso
                  : computeProgressFromDates(service),
            }));
            setServices(normalizedServices);
            setLoading(false);
            return;
          } else {
            await logout();
            router.replace("/login?from=/dashboard&reason=unauthorized");
            return;
          }
        }

      if (!response.ok || !Array.isArray(payload?.data)) {
        throw new Error(payload?.error || payload?.message || "No se pudo cargar el panel.");
      }

      const normalizedServices: Service[] = payload.data.map((service: Service) => ({
        ...service,
        progreso:
          typeof service.progreso === "number"
            ? service.progreso
            : computeProgressFromDates(service),
      }));

      setServices(normalizedServices);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Error desconocido al cargar el panel.";
      setError(message);
      } finally {
        setLoading(false);
      }
    },
    [router, organizationId],
  );

  // Función auxiliar para procesar tickets
  const processTickets = useCallback((payload: any) => {
    if (!payload?.data?.tickets) {
      setTickets([]);
      setSelectedTicket(null);
      return;
    }

    const validTickets = (payload.data.tickets || [])
      .filter((ticket: any) => ticket && ticket.id && ticket.titulo)
      .map((ticket: Ticket) => {
        // Mapear comentarios preservando toda la estructura
        const comentarios = Array.isArray(ticket.comentarios) 
          ? ticket.comentarios.map((comment: any) => ({
              id: String(comment.id || ''),
              contenido: String(comment.contenido || ''),
              tipo: String(comment.tipo || 'cliente'),
              ticketId: String(comment.ticketId || comment.ticket_id || ''),
              autorId: String(comment.autorId || comment.autor_id || ''),
              createdAt: comment.createdAt || comment.created_at || new Date().toISOString(),
              updatedAt: comment.updatedAt || comment.updated_at || new Date().toISOString(),
              autor: comment.autor || null,
            }))
          : [];
        
        return {
          id: String(ticket.id),
          titulo: String(ticket.titulo || 'Sin título'),
          descripcion: ticket.descripcion || null,
          estado: String(ticket.estado || 'abierto'),
          prioridad: String(ticket.prioridad || 'media'),
          slaObjetivo: ticket.slaObjetivo || null,
          etiquetas: parseMaybeJson(
            ticket.etiquetas,
            [] as Array<{ name: string; url: string }>
          ),
          createdAt: ticket.createdAt || new Date().toISOString(),
          comentarios: comentarios,
        };
      });

    console.log('Tickets recibidos:', {
      total: payload.data.tickets?.length || 0,
      validos: validTickets.length,
      sample: validTickets[0],
      sampleComentarios: validTickets[0]?.comentarios,
      sampleComentariosCount: validTickets[0]?.comentarios?.length || 0,
    });
    
    // Log detallado del primer ticket para debugging
    if (validTickets.length > 0) {
      console.log('Primer ticket detallado:', {
        id: validTickets[0].id,
        titulo: validTickets[0].titulo,
        comentariosRaw: payload.data.tickets?.[0]?.comentarios,
        comentariosMapeados: validTickets[0].comentarios,
        comentariosLength: validTickets[0].comentarios?.length,
      });
    }

    setTickets(validTickets);

    if (validTickets.length > 0) {
      setSelectedTicket((prev) => {
        if (!prev) return validTickets[0];
        const found = validTickets.find((item: Ticket) => item.id === prev.id);
        return found || validTickets[0];
      });
    } else {
      setSelectedTicket(null);
    }
  }, []);

  const fetchTickets = useCallback(
    async (authToken: string) => {
      setTicketsLoading(true);
      setTicketsError(null);
      setTicketsSuccess(null);
      try {
        // Verificar y refrescar token si es necesario
        let tokenToUse = authToken;
        if (isTokenExpired(authToken)) {
          console.log('Token expirado, intentando refrescar...');
          const newToken = await refreshAccessToken();
          if (newToken) {
            tokenToUse = newToken;
            setToken(newToken);
          } else {
            await logout();
            router.replace("/login?from=/dashboard&reason=token_expired");
            return;
          }
        }

        // Agregar timestamp para evitar caché del navegador
        const timestamp = Date.now();
        const ticketsUrl = new URL(buildApiUrl("/tickets"));
        ticketsUrl.searchParams.set("_t", String(timestamp));
        if (organizationId) ticketsUrl.searchParams.set("organizationId", organizationId);
        if (ticketFilters.estado) ticketsUrl.searchParams.set("estado", ticketFilters.estado);
        if (ticketFilters.prioridad) ticketsUrl.searchParams.set("prioridad", ticketFilters.prioridad);
        const url = ticketsUrl.toString();
        
        const response = await fetch(url, {
          method: 'GET',
          headers: { 
            Authorization: `Bearer ${tokenToUse}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
          cache: 'no-store',
        });
        const payload = await response.json().catch(() => null);
        
        // Si el token expiró durante la request, intentar refrescar y reintentar
        if (response.status === 401) {
          console.log('Token inválido en request, intentando refrescar...');
          const newToken = await refreshAccessToken();
          if (newToken) {
            // Reintentar con nuevo token
            const retryTimestamp = Date.now();
            const retryUrlObj = new URL(buildApiUrl("/tickets"));
            retryUrlObj.searchParams.set("_t", String(retryTimestamp));
            if (organizationId) retryUrlObj.searchParams.set("organizationId", organizationId);
            if (ticketFilters.estado) retryUrlObj.searchParams.set("estado", ticketFilters.estado);
            if (ticketFilters.prioridad) retryUrlObj.searchParams.set("prioridad", ticketFilters.prioridad);
            const retryUrl = retryUrlObj.toString();
            const retryResponse = await fetch(retryUrl, {
              method: 'GET',
              headers: { 
                Authorization: `Bearer ${newToken}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
              },
              cache: 'no-store',
            });
            const retryPayload = await retryResponse.json().catch(() => null);
            if (!retryResponse.ok) {
              throw new Error(retryPayload?.error || retryPayload?.message || "No se pudieron cargar los tickets.");
            }
            setToken(newToken);
            processTickets(retryPayload);
            return;
          } else {
            await logout();
            router.replace("/login?from=/dashboard&reason=token_expired");
            return;
          }
        }
        
        if (!response.ok) {
          throw new Error(payload?.error || payload?.message || "No se pudieron cargar los tickets.");
        }
        
        processTickets(payload);
      } catch (ticketsError) {
        const message =
          ticketsError instanceof Error ? ticketsError.message : "Error desconocido al cargar tickets.";
        console.error('Error al cargar tickets:', ticketsError);

        // Fallback: si el backend aún no soporta organizationId, reintentar sin el filtro
        const needsOrgFallback =
          organizationId &&
          typeof message === "string" &&
          message.toLowerCase().includes("organizationid");

        if (needsOrgFallback) {
          try {
            const retryUrlObj = new URL(buildApiUrl("/tickets"));
            retryUrlObj.searchParams.set("_t", String(Date.now()));
            if (ticketFilters.estado) retryUrlObj.searchParams.set("estado", ticketFilters.estado);
            if (ticketFilters.prioridad) retryUrlObj.searchParams.set("prioridad", ticketFilters.prioridad);
            const retryUrl = retryUrlObj.toString();

            const retryResponse = await fetch(retryUrl, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
              },
              cache: "no-store",
            });
            const retryPayload = await retryResponse.json().catch(() => null);
            if (retryResponse.ok) {
              processTickets(retryPayload);
              setTicketsError(null);
              notify({
                title: "Cargado sin filtro de organización",
                message: "El backend aún no soporta organizationId; se muestran todos tus tickets.",
                variant: "info",
              });
              return;
            }
          } catch (fallbackError) {
            console.error("Fallback sin organizationId falló:", fallbackError);
          }
        }

        setTicketsError(message);
        setTickets([]);
        notify({
          title: "Error al cargar tickets",
          message,
          variant: "error",
        });
      } finally {
        setTicketsLoading(false);
      }
    },
    [router, organizationId, ticketFilters, notify, processTickets],
  );


  const fetchMetrics = useCallback(
    async (authToken: string) => {
      if (!authToken) return;
      setMetricsLoading(true);
      try {
        const metrics = await fetchDashboardMetrics(authToken, organizationId || undefined);
        setDashboardMetrics(metrics);
      } catch (metricsError) {
        console.error("Error al cargar métricas:", metricsError);
        setDashboardMetrics(null);
      } finally {
        setMetricsLoading(false);
      }
    },
    [organizationId]
  );

  const fetchModelStatus = useCallback(async () => {
    if (!ENABLE_PREDICTOR) return;
    setModelStatusLoading(true);
    setModelStatusError(null);
    try {
      const response = await fetch(`${predictorApiBase}/predictions/model-status`, {
        headers: { "Cache-Control": "no-store" },
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload) {
        throw new Error(
          payload?.error ||
            payload?.message ||
            `Backend respondió ${response.status}`
        );
      }

      // Normalizar diferentes formas
      const data = payload.data || payload;
      const enabled = data.enabled ?? data.status === "ready";
      const modelVersion = data.modelVersion || data.version || "desconocido";
      const healthy = data.lastStatus?.healthy ?? data.modelLoaded ?? enabled;

      setModelStatus({
        enabled: Boolean(enabled),
        modelVersion,
        notes: data.notes,
        healthy: Boolean(healthy),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo obtener el estado del modelo";
      setModelStatusError(message);
      setModelStatus(null);
    } finally {
      setModelStatusLoading(false);
    }
  }, [predictorApiBase]);

  const handleCreateTicket = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      router.replace("/login?from=/dashboard&reason=expired");
      return;
    }
    if (!ticketForm.titulo.trim()) {
      setTicketsError("El título del ticket es obligatorio.");
      return;
    }
    setTicketSubmitting(true);
    setTicketsError(null);
    try {
      setAttachmentsUploading(true);
      const uploads = await uploadTicketAttachments(attachments);
      setAttachmentsUploading(false);

      const response = await fetch(buildApiUrl("/tickets"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: ticketForm.titulo.trim(),
          descripcion: ticketForm.descripcion?.trim(),
          prioridad: ticketForm.prioridad,
          slaObjetivo: ticketForm.slaObjetivo || undefined,
          etiquetas: uploads.length ? uploads : undefined,
          usuarioId:
            isPrivileged && ticketTargetUserId.trim()
              ? ticketTargetUserId.trim()
              : undefined,
          organizationId: organizationId || undefined,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || "No se pudo crear el ticket.");
      }
      setTicketForm({
        titulo: "",
        descripcion: "",
        prioridad: "media",
        slaObjetivo: "",
      });
      setAttachments([]);
      setCreateTicketOpen(false);
      setTicketsSuccess("Ticket creado exitosamente.");
      notify({
        title: "Ticket creado",
        message: "Se registró el ticket en tu organización.",
        variant: "success",
      });
      setTimeout(() => setTicketsSuccess(null), 3500);
      await fetchTickets(token);
    } catch (creationError) {
      const message =
        creationError instanceof Error ? creationError.message : "Error desconocido al crear ticket.";
      setTicketsError(message);
      notify({
        title: "Error",
        message,
        variant: "error",
      });
    } finally {
      setTicketSubmitting(false);
      setAttachmentsUploading(false);
    }
  };

  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTicket || !token) return;
    if (!ticketComment.trim()) return;
    setCommentSubmitting(true);
    try {
      const response = await fetch(buildApiUrl(`/tickets/${selectedTicket.id}/comment`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contenido: ticketComment.trim() }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || "No se pudo agregar el comentario.");
      }
      setTicketComment("");
      // Refrescar tickets - processTickets y el useEffect actualizarán selectedTicket automáticamente
      await fetchTickets(token);
      notify({
        title: "Comentario agregado",
        message: "Tu comentario se publicó correctamente.",
        variant: "success",
      });
    } catch (commentError) {
      const message =
        commentError instanceof Error
          ? commentError.message
          : "Error desconocido al agregar comentario.";
      setTicketsError(message);
      notify({
        title: "Error",
        message,
        variant: "error",
      });
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleAttachmentsChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      setAttachments([]);
      return;
    }
    setAttachments(Array.from(event.target.files));
  };

  useEffect(() => {
  const initializeAuth = async () => {
      let storedToken = getAccessToken();
      const storedName = getFromStorage(USERNAME_KEYS);

      if (!storedToken) {
        router.replace("/login?from=/dashboard&reason=no_token");
        return;
      }

      // Verificar si el token está expirado y refrescar si es necesario
      if (isTokenExpired(storedToken)) {
        console.log('Token inicial expirado, refrescando...');
        const newToken = await refreshAccessToken();
        if (newToken) {
          storedToken = newToken;
        } else {
          // No se pudo refrescar, redirigir a login
          await logout();
          router.replace("/login?from=/dashboard&reason=token_expired");
          return;
        }
      }

      setUserName(storedName);
      setToken(storedToken);
      fetchServices(storedToken);
      // Obtener rol
      try {
      const res = await fetch(buildApiUrl("/auth/me"), {
        headers: { Authorization: `Bearer ${storedToken}` },
        cache: "no-store",
      });
        const payload = await res.json().catch(() => null);
        if (res.ok && payload) {
          const data = payload.data || payload;
          const role = data.rol || data.role || "cliente";
          setUserRole(String(role).toLowerCase());
          const orgFromProfile = data.organizationId || data.organization_id;
          if (orgFromProfile && typeof orgFromProfile === "string") {
            setOrganizationId(orgFromProfile);
          }
        }
      } catch {
        // Ignorar error de rol, se queda cliente
      }
    };

    initializeAuth();

    // Listener para detectar cambios en el storage (útil cuando se refresca el token)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'viotech_token' || e.key === 'authTokenVioTech') {
        const newToken = getAccessToken();
        if (newToken && newToken !== token) {
          console.log('Token actualizado en storage, recargando...');
          setToken(newToken);
          // Si estamos en la pestaña de tickets, recargar
          if (activeTab === "tickets") {
            fetchTickets(newToken);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router, fetchServices, activeTab, fetchTickets, token]);

  useEffect(() => {
    fetchModelStatus();
  }, [fetchModelStatus]);

  useEffect(() => {
    // Recargar tickets y métricas cuando cambie la org o filtros
    const storedToken = getAccessToken();
    if (storedToken) {
      fetchServices(storedToken);
      if (activeTab === "tickets") {
        fetchTickets(storedToken);
      }
      fetchMetrics(storedToken);
    }
  }, [organizationId, ticketFilters, activeTab, fetchServices, fetchTickets, fetchMetrics]);

  useEffect(() => {
    if (activeTab !== "tickets") return;
    
    const loadTickets = async () => {
      // Obtener token actualizado siempre del storage (puede haber cambiado por refresh)
      let currentToken = getAccessToken();
      if (!currentToken) {
        router.replace("/login?from=/dashboard&reason=no_token");
        return;
      }
      
      // Verificar si el token está expirado y refrescar si es necesario
      if (isTokenExpired(currentToken)) {
        console.log('Token expirado al cargar tickets, refrescando...');
        const newToken = await refreshAccessToken();
        if (newToken) {
          currentToken = newToken;
          setToken(newToken);
        } else {
          await logout();
          router.replace("/login?from=/dashboard&reason=token_expired");
          return;
        }
      }
      
      // Si el token cambió, actualizar el estado
      if (currentToken !== token) {
        setToken(currentToken);
      }
      
      // Forzar recarga de tickets (evitar caché)
      await fetchTickets(currentToken);
    };
    
    loadTickets();
  }, [activeTab, fetchTickets, router]); // Remover token de dependencias para evitar loops

  useEffect(() => {
    setTicketComment("");
  }, [selectedTicket?.id]);

  // Actualizar selectedTicket cuando tickets cambie (ej: después de agregar comentario)
  useEffect(() => {
    if (!selectedTicket || tickets.length === 0) return;
    
    // Buscar el ticket actualizado en la lista
    const updatedTicket = tickets.find((t) => t.id === selectedTicket.id);
    if (updatedTicket) {
      // Comparar comentarios para detectar cambios
      const currentCommentsCount = selectedTicket.comentarios?.length || 0;
      const updatedCommentsCount = updatedTicket.comentarios?.length || 0;
      
      // Actualizar solo si hay diferencia en los comentarios
      if (updatedCommentsCount !== currentCommentsCount) {
        setSelectedTicket(updatedTicket);
      } else if (updatedCommentsCount > 0) {
        // Comparar IDs de comentarios para detectar nuevos comentarios
        const currentCommentIds = (selectedTicket.comentarios || []).map(c => c.id).sort().join(',');
        const updatedCommentIds = (updatedTicket.comentarios || []).map(c => c.id).sort().join(',');
        if (currentCommentIds !== updatedCommentIds) {
          setSelectedTicket(updatedTicket);
        }
      }
    }
  }, [tickets]); // Solo observar tickets, no selectedTicket para evitar loops

  const metrics = useMemo(() => {
    // Si tenemos métricas del backend, usarlas
    if (dashboardMetrics) {
      return [
        {
          title: "Servicios activos",
          value: `${dashboardMetrics.serviciosActivos}`,
          description: "Proyectos enterprise en ejecución",
        },
        {
          title: "Próxima renovación",
          value: dashboardMetrics.proximaRenovacion 
            ? formatDate(dashboardMetrics.proximaRenovacion)
            : "Por definir",
          description: "Próximo servicio a renovar",
        },
        {
          title: "Avance promedio",
          value: `${dashboardMetrics.avancePromedio}%`,
          description: "KPIs globales del trimestre",
        },
        {
          title: "Tickets abiertos",
          value: `${dashboardMetrics.ticketsAbiertos}`,
          description: "Solicitudes de soporte activas",
        },
        {
          title: "Tickets resueltos",
          value: `${dashboardMetrics.ticketsResueltos}`,
          description: "Casos cerrados exitosamente",
        },
        {
          title: "SLA cumplido",
          value: `${dashboardMetrics.slaCumplido}%`,
          description: "Acuerdo activo para top tier",
        },
      ];
    }

    // Fallback: calcular métricas localmente si no hay datos del backend
    if (!services.length) {
      return [
        { title: "Servicios activos", value: "0", description: "Esperando tu próximo proyecto" },
        { title: "Próxima renovación", value: "Por definir", description: "Sin fechas programadas" },
        { title: "Avance promedio", value: "0%", description: "KPIs globales del trimestre" },
      ];
    }

    const activeServices = services.filter((service) => service.estado === "activo");
    const sortedRenewals = [...services]
      .filter((service) => service.fecha_expiracion)
      .sort(
        (a, b) =>
          new Date(a.fecha_expiracion || "").getTime() -
          new Date(b.fecha_expiracion || "").getTime(),
      );

    const avgProgress =
      Math.round(
        (activeServices.reduce(
          (acc, service) => acc + (service.progreso ?? computeProgressFromDates(service) ?? 0),
          0,
        ) /
          (activeServices.length || 1)) *
          10,
      ) / 10;

    return [
      {
        title: "Servicios activos",
        value: `${activeServices.length}`,
        description: "Proyectos enterprise en ejecución",
      },
      {
        title: "Próxima renovación",
        value: sortedRenewals.length ? formatDate(sortedRenewals[0].fecha_expiracion) : "Por definir",
        description: sortedRenewals.length ? sortedRenewals[0].nombre : "Sin proyectos pendientes",
      },
      {
        title: "Avance promedio",
        value: `${Number.isFinite(avgProgress) ? avgProgress : 0}%`,
        description: "KPIs globales del trimestre",
      },
    ];
  }, [services, dashboardMetrics]);

  const timeline = useMemo<TimelineEvent[]>(() => {
    if (!services.length) return [];

    const events = services.flatMap((service) => {
      const kickoffEvent = service.fecha_compra
        ? [
            {
              id: `${service.id}-kickoff`,
              title: `Kickoff ${service.nombre}`,
              date: service.fecha_compra,
              type: "kickoff",
              serviceName: service.nombre,
            } satisfies TimelineEvent,
          ]
        : [];

      const renewalEvent = service.fecha_expiracion
        ? [
            {
              id: `${service.id}-renewal`,
              title: `Renovación ${service.nombre}`,
              date: service.fecha_expiracion,
              type: "renovacion",
              serviceName: service.nombre,
            } satisfies TimelineEvent,
          ]
        : [];

      return [...kickoffEvent, ...renewalEvent];
    });

    return events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    ).slice(0, 4);
  }, [services]);

  const isTopTier = services.length > 0;

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <main className="min-h-screen bg-background px-6 py-24">
      <div className="max-w-6xl mx-auto space-y-12">
        <section className="rounded-3xl border border-border/70 bg-muted/20 p-8 md:p-12 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                Programa Top Tier
              </p>
              <h1 className="text-3xl sm:text-4xl font-medium text-foreground">
                {userName ? `Hola ${userName},` : "Hola,"} aquí tienes el pulso ejecutivo de tus
                proyectos.
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Consultoría, entregables y soporte VIP centralizados en un solo lugar. Seguimos el
                roadmap compartido y priorizamos tus hitos estratégicos.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                  onClick={() => setChangePasswordOpen(true)}
                >
                  <Lock className="w-4 h-4" />
                  Cambiar contraseña
                </button>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
              <a
                href="https://calendly.com/viotech/demo"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:scale-105 transition-transform"
              >
                Agendar reunión ejecutiva
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
          {isTopTier ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-1 text-xs font-medium text-muted-foreground">
              <Shield className="w-4 h-4" />
              Top tier habilitado · SLA prioritario · Equipo dedicado
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-1 text-xs font-medium text-muted-foreground">
              <Users2 className="w-4 h-4" />
              Estamos listos para asignarte un PM dedicado. Contrata un plan enterprise.
            </div>
          )}
        </section>

        <div className="flex flex-wrap items-center gap-3">
          {(
            [
              { key: "overview", label: "Resumen ejecutivo" },
              { key: "tickets", label: "Tickets & soporte" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            {loading && (
              <section className="rounded-3xl border border-border/70 bg-background/80 p-10 text-center space-y-4">
                <p className="text-lg text-muted-foreground">
                  Sincronizando con tu Command Center...
                </p>
                <p className="text-sm text-muted-foreground">
                  Tus datos se cargan con cifrado end-to-end.
                </p>
              </section>
            )}

            {error && (
              <section className="rounded-3xl border border-red-500/40 bg-red-500/5 p-8 space-y-3">
                <p className="text-sm font-medium text-red-500">No pudimos cargar tu panel.</p>
                <p className="text-sm text-red-500/80">{error}</p>
                <button
                  className="inline-flex items-center gap-2 text-xs font-medium text-red-500 underline"
                  onClick={() => {
                    const storedToken = getFromStorage(TOKEN_KEYS);
                    if (storedToken) fetchServices(storedToken);
                  }}
                >
                  Reintentar
                </button>
              </section>
            )}

            {!loading && !error && (
              <>
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {metrics.map((stat) => (
                    <StatCard
                      key={stat.title}
                      title={stat.title}
                      value={stat.value}
                      description={stat.description}
                    />
                  ))}
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-medium text-foreground">Servicios activos</h2>
                      <Link
                        href="/services"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Ver todos
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    {services.length === 0 ? (
                      <div className="rounded-3xl border border-border/70 bg-background/80 p-8 text-center space-y-3">
                        <p className="text-lg text-foreground">Aún no has activado tu primer proyecto.</p>
                        <p className="text-sm text-muted-foreground">
                          Agenda un discovery call para priorizar el backlog y recibir un plan de acción.
                        </p>
                        <Link
                          href="/services/catalog"
                          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:scale-105 transition-transform mt-4"
                        >
                          Ver Catálogo de Servicios
                        </Link>
                        <a
                          href="https://wa.link/1r4ul7"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:scale-105 transition-transform"
                        >
                          Hablar con un consultor
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((service) => (
                          <ServiceCard key={service.id} service={service} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-medium text-foreground mb-4">Seguridad</h2>
                      <MFASettings />
                    </div>
                    <h2 className="text-2xl font-medium text-foreground">Roadmap inmediato</h2>
                    {timeline.length ? (
                      <div className="space-y-4">
                        {timeline.map((event) => (
                          <TimelineCard key={event.id} event={event} />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-border/70 bg-background/70 p-6 text-sm text-muted-foreground">
                        No hay hitos calendarizados todavía. Nuestro equipo puede ayudarte a definir el
                        siguiente release.
                      </div>
                    )}
                    <div className="rounded-3xl border border-border/70 bg-background/80 p-6 space-y-3">
                      <p className="text-sm font-medium text-foreground">Mesa de soporte VIP</p>
                      <p className="text-sm text-muted-foreground">
                        Respuesta prioritaria <strong>en menos de 2 minutos</strong> vía WhatsApp o canal
                        privado de Slack. Tu squad está disponible 24/7.
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <QuickAction
                          title="Canal WhatsApp"
                          description="Contacta al ingeniero on-call"
                          href="https://wa.link/1r4ul7"
                        />
                        <QuickAction
                          title="Agendar sesión"
                          description="Reunión con tu Product Manager"
                          href="https://calendly.com/viotech/demo"
                        />
                      </div>
                    </div>
                  </div>
                </section>

        <section className="rounded-3xl border border-border/70 bg-muted/20 p-8 space-y-6">
          <OrgSelector onChange={(org: Org | null) => setOrganizationId(org?.id || "")} />
        </section>

        <section className="rounded-3xl border border-border/70 bg-muted/20 p-8 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Reportes ejecutivos
                      </p>
                      <h3 className="text-2xl font-medium text-foreground">
                        Insights del trimestre y próximos pasos.
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-2xl">
                        Consolidamos métricas de performance, satisfacción de usuarios y backlog priorizado
                        para que puedas tomar decisiones con claridad.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <QuickAction
                        title="Último reporte PDF"
                        description="Descarga y compártelo con tu junta directiva"
                        href="mailto:contacto@viotech.com.co?subject=Solicitar%20reporte%20ejecutivo"
                      />
                      <QuickAction
                        title="Cargar briefing"
                        description="Comparte nuevos requerimientos del Q"
                        href="https://viotech.com.co/#contact"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-border/70 bg-background/80 p-5 space-y-2">
                      <TrendingUp className="w-5 h-5 text-foreground" />
                      <p className="text-lg font-medium text-foreground">+18% velocidad</p>
                      <p className="text-sm text-muted-foreground">Incremento promedio tras 2 sprints.</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/80 p-5 space-y-2">
                      <CalendarDays className="w-5 h-5 text-foreground" />
                      <p className="text-lg font-medium text-foreground">Roadmap listo</p>
                      <p className="text-sm text-muted-foreground">
                        Los siguientes releases están definidos.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/80 p-5 space-y-2">
                      <Headphones className="w-5 h-5 text-foreground" />
                      <p className="text-lg font-medium text-foreground">SLA cumplido</p>
                      <p className="text-sm text-muted-foreground">Monitoreo 24/7 y soporte ejecutado.</p>
                    </div>
                  </div>
                </section>

                {ENABLE_PREDICTOR && (
                  <section className="rounded-3xl border border-border/70 bg-background/80 p-8 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                          IA · Predicción de tiempos y costos
                        </p>
                        <h3 className="text-2xl font-medium text-foreground">Vista dedicada</h3>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                          Usa la página de predicciones para trabajar con el modelo ML.
                        </p>
                      </div>
                      <Link
                        href="/client/ia/predictor"
                        className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:scale-[1.02] transition-transform"
                      >
                        Abrir predicciones
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/client/ia/asistente"
                        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors"
                      >
                        Ir al asistente IA
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </section>
                )}

                <section className="rounded-3xl border border-border/70 bg-background/80 p-8 space-y-5">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Checklist ejecutivo</p>
                      <p className="text-xs text-muted-foreground">
                        Seguimiento quincenal de acciones clave con tu squad.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Validar entregables del sprint actual",
                      "Confirmar alcance de la próxima iteración",
                      "Actualizar stakeholders internos",
                      "Definir aprobaciones de seguridad/compliance",
                    ].map((task) => (
                      <label
                        key={task}
                        className="flex items-start gap-3 rounded-2xl border border-border/60 p-4 text-sm"
                      >
                        <input type="checkbox" className="mt-1 accent-foreground" />
                        <span>{task}</span>
                      </label>
                    ))}
                  </div>
                </section>
              </>
            )}
          </>
        )}
{activeTab === "tickets" && (

          <section className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Tickets & soporte
                </p>
                <h2 className="text-3xl font-medium text-foreground">Gestión de casos prioritarios</h2>
                <p className="text-sm text-muted-foreground">
                  Registra nuevos tickets, adjunta evidencias y conversa con tu squad dedicado.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateTicketOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4" />
                {createTicketOpen ? "Cerrar formulario" : "Nuevo ticket"}
              </button>
            </div>

            {ticketsError && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-500">
                {ticketsError}
              </div>
            )}
            {ticketsSuccess && !ticketsError && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-600">
                {ticketsSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Organización
                </label>
                <OrgSelector onChange={(org: Org | null) => setOrganizationId(org?.id || "")} />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Estado
                </label>
                <select
                  className="w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
                  value={ticketFilters.estado}
                  onChange={(event) =>
                    setTicketFilters((prev) => ({ ...prev, estado: event.target.value }))
                  }
                >
                  <option value="">Todos</option>
                  <option value="abierto">Abierto</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="resuelto">Resuelto</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Prioridad
                </label>
                <select
                  className="w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
                  value={ticketFilters.prioridad}
                  onChange={(event) =>
                    setTicketFilters((prev) => ({ ...prev, prioridad: event.target.value }))
                  }
                >
                  <option value="">Todas</option>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
            </div>

            {ticketsLoading ? (
              <div className="rounded-3xl border border-border/60 bg-background/70 p-8 text-center text-muted-foreground">
                Sincronizando tickets...
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[0.45fr,0.55fr] xl:grid-cols-[0.45fr,0.35fr,0.2fr] gap-6">
                <div className="rounded-3xl border border-border/70 bg-background/80 p-4 space-y-3">
                  {tickets.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Aún no tienes tickets registrados.
                    </p>
                  ) : (
                    tickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        type="button"
                        onClick={() => setSelectedTicket(ticket)}
                        className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${
                          selectedTicket?.id === ticket.id
                            ? "border-foreground bg-muted/40"
                            : "border-border hover:border-border/80"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-foreground">{ticket.titulo}</p>
                          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {ticket.prioridad}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(ticket.createdAt)}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                          <span
                            className={`px-2 py-0.5 rounded-full ${
                              ticket.estado === "resuelto"
                                ? "bg-green-100 text-green-700"
                                : ticket.estado === "en_progreso"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {ticket.estado}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="rounded-3xl border border-border/70 bg-background/80 p-6 space-y-4">
                  {selectedTicket ? (
                    <>
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                          Ticket #{selectedTicket.id.slice(0, 6).toUpperCase()}
                        </p>
                        <h3 className="text-2xl font-medium text-foreground">
                          {selectedTicket.titulo}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedTicket.descripcion || "Sin descripción."}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs">
                          <span className="rounded-full border border-border px-3 py-1">
                            Prioridad: {selectedTicket.prioridad}
                          </span>
                          {selectedTicket.slaObjetivo && (
                            <span className="rounded-full border border-border px-3 py-1">
                              SLA: {formatDate(selectedTicket.slaObjetivo)}
                            </span>
                          )}
                        </div>

                        {Array.isArray(selectedTicket.etiquetas) &&
                          selectedTicket.etiquetas.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                                Adjuntos
                              </p>
                              <div className="flex flex-wrap gap-3">
                                {(
                                  selectedTicket.etiquetas as Array<{ name: string; url: string }>
                                ).map((file, idx) => (
                                  <a
                                    key={`${selectedTicket.id}-${file.url || file.name || idx}`}
                                    href={file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs hover:bg-muted"
                                  >
                                    <Paperclip className="w-3 h-3" />
                                    {file.name}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                          Actividad
                        </p>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                          {(() => {
                            // Debug: Log del estado actual
                            console.log('Renderizando comentarios:', {
                              selectedTicketId: selectedTicket.id,
                              comentarios: selectedTicket.comentarios,
                              comentariosLength: selectedTicket.comentarios?.length,
                              isArray: Array.isArray(selectedTicket.comentarios),
                            });
                            
                            const comentarios = Array.isArray(selectedTicket.comentarios) 
                              ? selectedTicket.comentarios 
                              : [];
                            
                            if (comentarios.length > 0) {
                              return comentarios.map((comment: any) => (
                                <div
                                  key={comment.id || Math.random()}
                                  className="rounded-2xl border border-border/70 p-3 text-sm"
                                >
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{comment.autor?.nombre || comment.autor?.email || "Equipo VioTech"}</span>
                                    <span>{formatDate(comment.createdAt || comment.created_at)}</span>
                                  </div>
                                  <p className="text-foreground mt-1">{comment.contenido}</p>
                                </div>
                              ));
                            } else {
                              return <p className="text-sm text-muted-foreground">Sin comentarios aún.</p>;
                            }
                          })()}
                        </div>
                      </div>

                      <form className="space-y-3" onSubmit={handleCommentSubmit}>
                        <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Nuevo comentario
                        </label>
                        <textarea
                          className="w-full rounded-2xl border border-border bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40"
                          rows={3}
                          value={ticketComment}
                          onChange={(event) => setTicketComment(event.target.value)}
                          placeholder="Actualiza a tu squad con los últimos detalles..."
                        />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:scale-105 transition-transform disabled:opacity-60"
                          disabled={commentSubmitting || !ticketComment.trim()}
                        >
                          {commentSubmitting ? "Enviando..." : "Agregar comentario"}
                        </button>
                      </form>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Selecciona un ticket para ver los detalles.
                    </p>
                  )}
                </div>

                {ENABLE_AI_ASSISTANT && SHOW_DASHBOARD_ASSISTANT && (
                  <div className="rounded-3xl border border-border/70 bg-background/80 p-4">
                    <AITicketAssistant
                      authToken={token}
                      targetUserId={isPrivileged ? ticketTargetUserId || null : null}
                      isPrivileged={isPrivileged}
                    />
                  </div>
                )}
              </div>
            )}

            {createTicketOpen && (
              <form
                className="rounded-3xl border border-border/70 bg-background/80 p-6 space-y-4"
                onSubmit={handleCreateTicket}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Título
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
                      value={ticketForm.titulo}
                      onChange={(event) =>
                        setTicketForm((prev) => ({ ...prev, titulo: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Prioridad
                    </label>
                    <select
                      className="w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
                      value={ticketForm.prioridad}
                      onChange={(event) =>
                        setTicketForm((prev) => ({ ...prev, prioridad: event.target.value }))
                      }
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Descripción
                  </label>
                  <textarea
                    className="w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
                    rows={4}
                    value={ticketForm.descripcion}
                    onChange={(event) =>
                      setTicketForm((prev) => ({ ...prev, descripcion: event.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      SLA objetivo
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
                      value={ticketForm.slaObjetivo}
                      onChange={(event) =>
                        setTicketForm((prev) => ({ ...prev, slaObjetivo: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      <Paperclip className="w-3 h-3" />
                      Adjuntos (opcional)
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={handleAttachmentsChange}
                      className="block w-full text-xs text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-foreground file:px-4 file:py-2 file:text-xs file:font-medium file:text-background hover:file:opacity-80"
                    />
                    {attachments.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {attachments.length} archivo(s) listos para subir.
                      </p>
                    )}
                  </div>
                  {isPrivileged && (
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Asignar a usuario (ID)
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
                        placeholder="ID de usuario destino"
                        value={ticketTargetUserId}
                        onChange={(event) => setTicketTargetUserId(event.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Solo agentes/admin pueden crear para otros usuarios.
                      </p>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:scale-105 transition-transform disabled:opacity-60"
                  disabled={ticketSubmitting || attachmentsUploading}
                >
                  {ticketSubmitting ? "Creando ticket..." : "Crear ticket"}
                </button>
              </form>
            )}
          </section>
        )}
      </div>

      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </main>
  );
}
