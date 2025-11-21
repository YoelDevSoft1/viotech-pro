"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Loader2,
  RefreshCcw,
  Send,
  Shield,
  ShieldOff,
  AlertTriangle,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

type AssistantResponse = {
  reply: string;
  suggestions?: any;
  usedProvider?: string;
  modelVersion?: string;
  notes?: string;
};

type AssistantProps = {
  authToken?: string | null;
};

const getApiBase = () => {
  const env =
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://viotech-main.onrender.com";
  const trimmed = env.replace(/\/+$/, "");
  return trimmed.toLowerCase().endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const MAX_MESSAGES = 12;
const isAffirmative = (text: string) =>
  /\b(si|sí|dale|crea(lo|la| el)?|hazlo|ok|listo|perfecto)\b/i.test(text.trim());

export default function AITicketAssistant({ authToken }: AssistantProps) {
  const apiBase = useMemo(() => getApiBase(), []);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Soy tu asistente para redactar tickets claros. Describe el problema y sugeriré título, prioridad y detalles.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any | null>(null);

  useEffect(() => {
    setError(null);
  }, [input]);

  useEffect(() => {
    if (createdTicketId) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 6000);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [createdTicketId]);

  const addMessage = (message: Message) =>
    setMessages((prev) => [...prev.slice(-(MAX_MESSAGES - 1)), message]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setCreateError(null);
    const userMessage: Message = { role: "user", content: input.trim() };
    const baseMessages = [...messages, userMessage];
    setMessages((prev) => [...prev.slice(-(MAX_MESSAGES - 1)), userMessage]);
    setInput("");
    const willAutoCreate = isAffirmative(userMessage.content);

    try {
      const response = await fetch(`${apiBase}/ai/ticket-assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (response.status === 429) {
        throw new Error("Límite de uso alcanzado. Intenta en un minuto.");
      }

      if (!response.ok || !payload) {
        throw new Error(
          payload?.error ||
            payload?.message ||
            `Error del asistente (${response.status}).`
        );
      }

      const data: AssistantResponse = payload.data || payload;
      setProvider(data.usedProvider || null);
      setModel(data.modelVersion || null);
      setSuggestions(data.suggestions || null);

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply || "Listo.",
      };
      const nextMessages = [...baseMessages, assistantMessage];
      setMessages((prev) => [
        ...prev.slice(-(MAX_MESSAGES - 2)),
        assistantMessage,
      ]);

      if (data.suggestions) {
        const pretty = JSON.stringify(data.suggestions, null, 2);
        const sugMessage: Message = {
          role: "assistant",
          content: `Sugerencia estructurada:\n${pretty}`,
        };
        setMessages((prev) => [
          ...prev.slice(-(MAX_MESSAGES - 2)),
          assistantMessage,
          sugMessage,
        ]);
        nextMessages.push(sugMessage);
      }

      if (willAutoCreate) {
        if (authToken) {
          await handleCreateTicket(nextMessages, data.suggestions);
        } else {
          setCreateError("Inicia sesión para crear el ticket automáticamente.");
        }
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo obtener respuesta del asistente.";
      setError(msg);
      addMessage({
        role: "assistant",
        content: "No pude responder ahora. Intenta de nuevo en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (
    messagesOverride?: Message[],
    suggestionsOverride?: any,
  ) => {
    setCreateError(null);
    setCreatedTicketId(null);
    if (!authToken) {
      setCreateError("Inicia sesión para crear el ticket.");
      return;
    }
    setCreating(true);
    try {
      const response = await fetch(`${apiBase}/ai/ticket-assistant/create-ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          messages: messagesOverride || messages,
          context: suggestionsOverride
            ? {
                suggestions: suggestionsOverride,
                draft: suggestionsOverride
                  ? {
                      titulo: suggestionsOverride.title || suggestionsOverride.titulo,
                      descripcion:
                        suggestionsOverride.description || suggestionsOverride.descripcion,
                      prioridad:
                        suggestionsOverride.priority ||
                        suggestionsOverride.prioridad ||
                        "media",
                      etiquetas:
                        suggestionsOverride.tags ||
                        suggestionsOverride.etiquetas ||
                        [],
                    }
                  : undefined,
              }
            : undefined,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (response.status === 429) {
        throw new Error("Demasiadas solicitudes. Intenta en un minuto.");
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error("Sesión expirada. Inicia sesión nuevamente.");
      }
      if (!response.ok || !payload) {
        throw new Error(
          payload?.error ||
            payload?.message ||
            `No se pudo crear el ticket (${response.status}).`
        );
      }

      const ticketId =
        payload.data?.ticket?.id ||
        payload.data?.ticketId ||
        payload.data?.id ||
        null;
      setCreatedTicketId(ticketId);
      if (payload.data?.usedProvider) setProvider(payload.data.usedProvider);
      if (payload.data?.modelVersion) setModel(payload.data.modelVersion);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error desconocido al crear el ticket.";
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border/70 bg-background/80 p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-muted/60 p-2">
            <Bot className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Asistente IA de Tickets</p>
            <p className="text-xs text-muted-foreground">
              Redacta, prioriza y sugiere estructura.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {provider && (
            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
              <Shield className="w-3 h-3" />
              {provider} {model ? `· ${model}` : ""}
            </span>
          )}
          {!provider && !loading && (
            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
              <ShieldOff className="w-3 h-3" />
              Sin proveedor aún
            </span>
          )}
        </div>
      </div>

      {showSuccess && createdTicketId && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-green-500/40 bg-green-500/10 px-3 py-2 text-xs text-green-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Ticket creado: #{createdTicketId}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccess(false)}
            className="text-green-700 hover:text-green-900"
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      )}

      <div className="h-48 overflow-y-auto space-y-3 pr-1">
        {messages.map((m, idx) => (
          <div
            key={`${m.role}-${idx}-${m.content.slice(0, 12)}`}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                m.role === "user"
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground"
              } whitespace-pre-wrap`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {suggestions && (
        <div className="rounded-2xl border border-border/70 bg-muted/20 p-3 text-xs space-y-2">
          <p className="font-medium text-foreground">Sugerencias del asistente</p>
          <pre className="whitespace-pre-wrap text-muted-foreground">
            {JSON.stringify(suggestions, null, 2)}
          </pre>
        </div>
      )}

      <div className="space-y-2">
        <textarea
          className="w-full rounded-2xl border border-border bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
          rows={3}
          placeholder="Describe el issue, impacto y urgencia..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        {error && (
          <div className="flex items-center gap-2 text-xs text-amber-700">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:scale-[1.02] transition-transform disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Pensando...
              </>
            ) : (
              <>
                Enviar
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMessages((prev) => prev.slice(0, 1))}
            className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCcw className="w-4 h-4" />
            Limpiar
          </button>
          <button
            type="button"
            onClick={() => handleCreateTicket(undefined, suggestions)}
            disabled={creating || loading}
            className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-foreground hover:bg-muted/40 disabled:opacity-60"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Crear ticket
              </>
            )}
          </button>
        </div>

        {createError && (
          <div className="flex items-center gap-2 text-xs text-amber-700">
            <AlertTriangle className="w-4 h-4" />
            {createError}
          </div>
        )}
        {createdTicketId && (
          <div className="flex items-center gap-2 text-xs text-green-700">
            <CheckCircle2 className="w-4 h-4" />
            Ticket creado: #{createdTicketId}
          </div>
        )}
      </div>
    </div>
  );
}
