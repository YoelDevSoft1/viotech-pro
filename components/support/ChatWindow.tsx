"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupportChat, ChatMessage } from "@/lib/hooks/useSupportChat";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Send,
  RefreshCw,
  MoreVertical,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  Clock,
  Wifi,
  WifiOff,
  ChevronLeft,
  Paperclip,
  Smile,
  Image as ImageIcon,
  Circle,
} from "lucide-react";

interface ChatWindowProps {
  chatId?: string | null;
  agentName?: string;
  agentStatus?: "online" | "offline" | "away";
  onBack?: () => void;
}

export function ChatWindow({
  chatId,
  agentName,
  agentStatus,
  onBack,
}: ChatWindowProps) {
  const {
    messages,
    status,
    isFallback,
    sending,
    sendMessage,
    retryConnection,
  } = useSupportChat(chatId);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = useTranslationsSafe("support");

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending, chatId]);

  // Focus textarea when chat changes
  useEffect(() => {
    if (chatId) {
      textareaRef.current?.focus();
    }
  }, [chatId]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !chatId) return;
    setInput("");
    try {
      await sendMessage(trimmed);
    } catch {
      setInput(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = "";

    messages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt).toLocaleDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  }, [messages]);

  const initials = agentName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <header className="flex items-center justify-between gap-3 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile back button */}
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden flex-shrink-0"
            onClick={onBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="relative flex-shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {initials || "?"}
              </AvatarFallback>
            </Avatar>
            <StatusDot status={agentStatus} />
          </div>

          <div className="min-w-0">
            <h2 className="font-semibold text-sm truncate">
              {agentName || t("selectChat", { defaultValue: "Selecciona un chat" })}
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ConnectionStatus status={status} isFallback={isFallback} t={t} />
              {agentStatus && (
                <>
                  <span className="text-muted-foreground/50">·</span>
                  <span>
                    {agentStatus === "online"
                      ? t("statusOnline", { defaultValue: "En línea" })
                      : agentStatus === "away"
                      ? t("statusAway", { defaultValue: "Ausente" })
                      : t("statusOffline", { defaultValue: "Desconectado" })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Phone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("call", { defaultValue: "Llamar" })}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Video className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t("videoCall", { defaultValue: "Videollamada" })}
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Info className="h-4 w-4 mr-2" />
                {t("chatInfo", { defaultValue: "Info del chat" })}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={retryConnection}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("reconnect", { defaultValue: "Reconectar" })}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Connection Error Alert */}
      {status === "error" && !isFallback && (
        <Alert variant="destructive" className="m-4 mb-0">
          <AlertDescription className="flex items-center justify-between">
            <span>{t("chatError", { defaultValue: "No se pudo conectar al chat en vivo." })}</span>
            <Button variant="outline" size="sm" onClick={retryConnection}>
              {t("retryConnection", { defaultValue: "Reintentar" })}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth"
      >
        {groupedMessages.map((group) => (
          <div key={group.date} className="space-y-3">
            {/* Date divider */}
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium px-2">
                {formatDateHeader(group.date, t)}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Messages */}
            {group.messages.map((msg, idx) => {
              const isClient = msg.from === "client";
              const isSystem = msg.from === "system";
              const showAvatar =
                !isClient &&
                !isSystem &&
                (idx === 0 || group.messages[idx - 1]?.from === "client");

              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isClient={isClient}
                  isSystem={isSystem}
                  showAvatar={showAvatar}
                  agentInitials={initials}
                  t={t}
                />
              );
            })}
          </div>
        ))}

        {/* Typing indicator / Sending state */}
        {sending && (
          <div className="flex items-end gap-2">
            <div className="h-8 w-8" /> {/* Avatar placeholder */}
            <div className="bg-primary text-primary-foreground rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[80%]">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-primary-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-primary-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 && !sending && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Send className="h-8 w-8 text-primary" />
            </div>
            <p className="font-medium mb-1">
              {t("startConversation", { defaultValue: "Inicia la conversación" })}
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t("startConversationDesc", {
                defaultValue: "Envía un mensaje para comenzar a chatear con el agente de soporte.",
              })}
            </p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <footer className="p-4 border-t bg-background">
        <div className="flex items-end gap-2">
          {/* Attachment buttons */}
          <div className="hidden sm:flex items-center gap-1 pb-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {t("attachFile", { defaultValue: "Adjuntar archivo" })}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {t("attachImage", { defaultValue: "Adjuntar imagen" })}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Text input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              placeholder={t("inputPlaceholder", { defaultValue: "Escribe tu mensaje..." })}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[44px] max-h-32 resize-none pr-12 rounded-2xl bg-muted/50 border-0 focus-visible:ring-1"
              disabled={!chatId}
              rows={1}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                >
                  <Smile className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {t("emoji", { defaultValue: "Emoji" })}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Send button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || sending || !chatId}
                size="icon"
                className="h-11 w-11 rounded-full flex-shrink-0"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t("send", { defaultValue: "Enviar" })} (Enter)
            </TooltipContent>
          </Tooltip>
        </div>
      </footer>
    </div>
  );
}

function MessageBubble({
  message,
  isClient,
  isSystem,
  showAvatar,
  agentInitials,
  t,
}: {
  message: ChatMessage;
  isClient: boolean;
  isSystem: boolean;
  showAvatar: boolean;
  agentInitials?: string;
  t: (key: string, opts?: any) => string;
}) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded-full">
          {message.body}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-end gap-2 group",
        isClient ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className="w-8 flex-shrink-0">
        {!isClient && showAvatar && (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
              {agentInitials || "AG"}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          "max-w-[75%] space-y-1",
          isClient ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-sm break-words",
            "transition-all duration-200",
            isClient
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted rounded-bl-md"
          )}
        >
          <p className="whitespace-pre-wrap">{message.body}</p>
        </div>

        {/* Message meta */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-1 text-[10px] text-muted-foreground",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            isClient ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span>{time}</span>
          {isClient && message.status && (
            <MessageStatus status={message.status} />
          )}
        </div>
      </div>
    </div>
  );
}

function MessageStatus({ status }: { status: ChatMessage["status"] }) {
  switch (status) {
    case "sending":
      return <Clock className="h-3 w-3" />;
    case "sent":
      return <Check className="h-3 w-3" />;
    case "delivered":
      return <CheckCheck className="h-3 w-3" />;
    case "read":
      return <CheckCheck className="h-3 w-3 text-primary" />;
    default:
      return null;
  }
}

function StatusDot({ status }: { status?: "online" | "offline" | "away" }) {
  return (
    <span
      className={cn(
        "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background",
        status === "online" && "bg-green-500",
        status === "away" && "bg-yellow-400",
        (!status || status === "offline") && "bg-muted-foreground"
      )}
    />
  );
}

function ConnectionStatus({
  status,
  isFallback,
  t,
}: {
  status: "connecting" | "connected" | "error";
  isFallback: boolean;
  t: (key: string, opts?: any) => string;
}) {
  if (isFallback) {
    return (
      <span className="flex items-center gap-1 text-yellow-600">
        <WifiOff className="h-3 w-3" />
        {t("fallbackMode", { defaultValue: "Modo respaldo" })}
      </span>
    );
  }

  switch (status) {
    case "connecting":
      return (
        <span className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          {t("statusConnecting", { defaultValue: "Conectando..." })}
        </span>
      );
    case "connected":
      return (
        <span className="flex items-center gap-1 text-green-600">
          <Wifi className="h-3 w-3" />
          {t("connected", { defaultValue: "Conectado" })}
        </span>
      );
    case "error":
      return (
        <span className="flex items-center gap-1 text-destructive">
          <WifiOff className="h-3 w-3" />
          {t("disconnected", { defaultValue: "Desconectado" })}
        </span>
      );
  }
}

function formatDateHeader(
  dateStr: string,
  t: (key: string, opts?: any) => string
) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return t("today", { defaultValue: "Hoy" });
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return t("yesterday", { defaultValue: "Ayer" });
  }
  return date.toLocaleDateString();
}
