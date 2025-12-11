"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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
  User,
  X,
  Zap,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

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
  targetUserId?: string | null;
  isPrivileged?: boolean;
  organizationId?: string | null;
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

const extractJsonFromText = (text: string) => {
  if (!text) return null;
  const match = text.match(/```json\n([\s\S]*?)\n```/i);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
};

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}

function SuggestionsPanel({
  suggestions,
  tAI,
}: {
  suggestions: any;
  tAI: (key: string) => string;
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (!suggestions) return null;

  const title = suggestions.title || suggestions.titulo;
  const description = suggestions.description || suggestions.descripcion;
  const priority = suggestions.priority || suggestions.prioridad;
  const tags = suggestions.tags || suggestions.etiquetas || [];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border bg-card">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-3 h-auto font-normal"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4 text-yellow-500" />
              {tAI("suggestionsTitle")}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <div className="p-3 space-y-3">
            {title && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">{tAI("suggestedTitle")}</p>
                <p className="text-sm font-medium">{title}</p>
              </div>
            )}
            {description && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">{tAI("suggestedDescription")}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            )}
            <div className="flex items-center gap-4 flex-wrap">
              {priority && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{tAI("suggestedPriority")}</p>
                  <Badge
                    variant={
                      priority === "alta" || priority === "high"
                        ? "destructive"
                        : priority === "media" || priority === "medium"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {priority}
                  </Badge>
                </div>
              )}
              {tags.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{tAI("suggestedTags")}</p>
                  <div className="flex gap-1 flex-wrap">
                    {tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export default function AITicketAssistant({
  authToken,
  targetUserId,
  isPrivileged = false,
  organizationId,
}: AssistantProps) {
  const apiBase = useMemo(() => getApiBase(), []);
  const tAI = useTranslationsSafe("aiAssistant");
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: tAI("welcomeMessage"),
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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

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
        throw new Error(tAI("errorRateLimit"));
      }

      if (response.status === 503) {
        throw new Error(tAI("errorUnavailable"));
      }

      if (!response.ok || !payload) {
        const friendlyMessage =
          payload?.error || payload?.message || tAI("errorGeneric");
        throw new Error(friendlyMessage);
      }

      const data: AssistantResponse = payload.data || payload;
      setProvider(data.usedProvider || null);
      setModel(data.modelVersion || null);
      const extracted = extractJsonFromText(data.reply || "");
      const mergedSuggestions = data.suggestions || extracted || null;
      setSuggestions(mergedSuggestions);

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply || tAI("done"),
      };
      const nextMessages = [...baseMessages, assistantMessage];
      setMessages((prev) => [...prev.slice(-(MAX_MESSAGES - 2)), assistantMessage]);

      if (willAutoCreate) {
        if (authToken) {
          await handleCreateTicket(nextMessages, mergedSuggestions);
        } else {
          setCreateError(tAI("errorLoginRequired"));
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : tAI("errorGeneric");
      setError(msg);
      addMessage({
        role: "assistant",
        content: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (
    messagesOverride?: Message[],
    suggestionsOverride?: any
  ) => {
    setCreateError(null);
    setCreatedTicketId(null);
    if (!authToken) {
      setCreateError(tAI("errorLoginRequired"));
      return;
    }
    setCreating(true);
    try {
      const sug =
        suggestionsOverride ||
        suggestions ||
        extractJsonFromText(messages[messages.length - 1]?.content || "");
      const draft =
        sug && typeof sug === "object"
          ? {
              titulo: sug.title || sug.titulo || "",
              descripcion: sug.description || sug.descripcion || "",
              prioridad: sug.priority || sug.prioridad || "media",
              etiquetas: sug.tags || sug.etiquetas || [],
            }
          : null;

      const messagesToSend = [...(messagesOverride || messages)];
      if (draft && (draft.titulo || draft.descripcion)) {
        messagesToSend.push({
          role: "assistant",
          content: `TICKET_DRAFT_JSON:${JSON.stringify(draft)}`,
        });
      }

      const response = await fetch(
        `${apiBase}/ai/ticket-assistant/create-ticket`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            messages: messagesToSend,
            context: draft
              ? {
                  suggestions: sug,
                  draft,
                  usuarioObjetivoId:
                    isPrivileged && targetUserId ? targetUserId : undefined,
                  organizationId: organizationId || undefined,
                }
              : isPrivileged && targetUserId
              ? {
                  usuarioObjetivoId: targetUserId,
                  organizationId: organizationId || undefined,
                }
              : organizationId
              ? { organizationId }
              : undefined,
          }),
        }
      );
      const payload = await response.json().catch(() => null);

      if (response.status === 429) {
        throw new Error(tAI("errorRateLimit"));
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error(tAI("errorSessionExpired"));
      }
      if (!response.ok || !payload) {
        throw new Error(
          payload?.error ||
            payload?.message ||
            `${tAI("errorCreateTicket")} (${response.status}).`
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
      const msg = err instanceof Error ? err.message : tAI("errorUnknown");
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClear = () => {
    setMessages([{ role: "assistant", content: tAI("welcomeMessage") }]);
    setSuggestions(null);
    setError(null);
    setCreateError(null);
    setCreatedTicketId(null);
  };

  return (
    <div className="space-y-4">
      {/* Provider Badge */}
      <div className="flex items-center justify-between">
        {isPrivileged && targetUserId && (
          <Badge variant="outline" className="text-xs">
            {tAI("creatingFor")}: {targetUserId.slice(0, 8)}...
          </Badge>
        )}
        <div className="ml-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant={provider ? "default" : "secondary"}
                  className="flex items-center gap-1.5"
                >
                  {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : provider ? (
                    <Shield className="h-3 w-3" />
                  ) : (
                    <ShieldOff className="h-3 w-3" />
                  )}
                  {provider
                    ? `${provider}${model ? ` · ${model}` : ""}`
                    : tAI("noProvider")}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{provider ? tAI("providerActive") : tAI("providerInactive")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccess && createdTicketId && (
        <Alert className="bg-green-500/10 border-green-500/30">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="flex items-center justify-between text-green-700">
            <span>
              {tAI("ticketCreatedSuccess")} #{createdTicketId.slice(0, 8)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-green-700 hover:text-green-900"
              onClick={() => setShowSuccess(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Messages Area */}
      <ScrollArea className="h-[300px] rounded-lg border bg-muted/20 p-4" ref={scrollRef}>
        <div className="space-y-4 pr-4">
          {messages.map((m, idx) => (
            <MessageBubble key={`${m.role}-${idx}-${m.content.slice(0, 12)}`} message={m} />
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">{tAI("thinking")}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggestions Panel */}
      <SuggestionsPanel suggestions={suggestions} tAI={tAI} />

      {/* Input Area */}
      <div className="space-y-3">
        <Textarea
          placeholder={tAI("inputPlaceholder")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="min-h-[80px] resize-none"
        />

        {/* Error Messages */}
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {createError && (
          <Alert variant="destructive" className="py-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">{createError}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleSubmit} disabled={loading || !input.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {tAI("thinking")}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {tAI("send")}
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tAI("sendTooltip")}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={handleClear} disabled={loading}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  {tAI("clear")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tAI("clearTooltip")}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  onClick={() => handleCreateTicket(undefined, suggestions)}
                  disabled={creating || loading || !suggestions}
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {tAI("creating")}
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      {tAI("createTicket")}
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{suggestions ? tAI("createTicketTooltip") : tAI("createTicketDisabledTooltip")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Created Ticket Confirmation */}
        {createdTicketId && !showSuccess && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            {tAI("ticketCreated", { id: createdTicketId.slice(0, 8) })}
          </div>
        )}
      </div>
    </div>
  );
}
