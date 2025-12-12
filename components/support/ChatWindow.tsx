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
import { supportApi } from "@/lib/api/support";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
  Search,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useChatMessages } from "@/lib/hooks/useChatMessages";

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
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; url: string; type?: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  const [searching, setSearching] = useState(false);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [showSearch, setShowSearch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const t = useTranslationsSafe("support");
  
  // Hook para búsqueda de mensajes
  const { searchMessages } = useChatMessages(chatId || null);

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

  // Marcar como leído cuando se abre el chat
  useEffect(() => {
    if (chatId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.from !== "client") {
        // Solo marcar como leído si el último mensaje es del agente
        import("@/lib/api/support").then(({ supportApi }) => {
          supportApi.markAsRead(chatId, lastMessage.id).catch(() => {
            // Silenciar errores
          });
        });
      }
    }
  }, [chatId, messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if ((!trimmed && attachments.length === 0) || !chatId) return;
    
    const messageText = trimmed;
    const currentAttachments = [...attachments];
    setInput("");
    setAttachments([]);
    
    try {
      // Convertir attachments al formato esperado por la API
      const apiAttachments = currentAttachments.map((att) => ({
        fileName: att.name,
        fileType: att.type || "application/octet-stream",
        fileSize: 0, // Se calculará en el backend
        storageUrl: att.url,
        storagePath: att.url,
      }));
      
      const tempId = crypto.randomUUID();
      await sendMessage(messageText || "📎 Archivo adjunto", tempId, apiAttachments);
    } catch (error) {
      setInput(messageText);
      setAttachments(currentAttachments);
      toast.error(t("sendError", { defaultValue: "Error al enviar mensaje" }));
    }
  };

  const handleFileUpload = async (file: File, isImage: boolean) => {
    if (!chatId) {
      toast.error(t("selectChatFirst", { defaultValue: "Selecciona un chat primero" }));
      return;
    }

    setUploading(true);
    try {
      const attachment = await supportApi.uploadAttachment(file);
      setAttachments((prev) => [
        ...prev,
        {
          name: attachment.fileName,
          url: attachment.storageUrl,
          type: attachment.fileType,
        },
      ]);
      toast.success(t("fileUploaded", { defaultValue: "Archivo subido correctamente" }));
    } catch (error) {
      toast.error(t("uploadError", { defaultValue: "Error al subir archivo" }));
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isImage: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isImage && !file.type.startsWith("image/")) {
      toast.error(t("invalidImage", { defaultValue: "Por favor selecciona una imagen" }));
      return;
    }

    // Limitar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("fileTooLarge", { defaultValue: "El archivo es demasiado grande (máx. 10MB)" }));
      return;
    }

    handleFileUpload(file, isImage);
    // Reset input
    e.target.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Búsqueda de mensajes
  const handleSearch = async (query: string) => {
    if (!chatId || !query.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    setSearching(true);
    try {
      const results = await searchMessages(query.trim());
      // Convertir Message[] a ChatMessage[]
      const chatResults: ChatMessage[] = results.map((msg) => ({
        id: msg.id,
        tempId: msg.id,
        from: msg.senderType === "user" ? "client" : msg.senderType === "agent" ? "agent" : "system",
        body: msg.body,
        createdAt: msg.createdAt,
        status: msg.status,
        attachments: msg.attachments?.map((att) => ({
          name: att.fileName,
          url: att.storageUrl,
          type: att.fileType,
        })) || [],
      }));
      setSearchResults(chatResults);
      setCurrentSearchIndex(chatResults.length > 0 ? 0 : -1);
    } catch (error) {
      toast.error(t("searchError", { defaultValue: "Error al buscar mensajes" }));
      setSearchResults([]);
      setCurrentSearchIndex(-1);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      handleSearch(value);
    } else {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
    }
  };

  const navigateSearch = (direction: "up" | "down") => {
    if (searchResults.length === 0) return;

    const newIndex =
      direction === "up"
        ? currentSearchIndex > 0
          ? currentSearchIndex - 1
          : searchResults.length - 1
        : currentSearchIndex < searchResults.length - 1
        ? currentSearchIndex + 1
        : 0;

    setCurrentSearchIndex(newIndex);
    scrollToMessage(searchResults[newIndex].id);
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = messageRefs.current.get(messageId);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      // Resaltar temporalmente
      messageElement.classList.add("ring-2", "ring-primary", "ring-offset-2");
      setTimeout(() => {
        messageElement.classList.remove("ring-2", "ring-primary", "ring-offset-2");
      }, 2000);
    }
  };

  // Efecto para cerrar búsqueda cuando cambia el chat
  useEffect(() => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    setCurrentSearchIndex(-1);
  }, [chatId]);

  // Efecto para abrir búsqueda con Ctrl+F o Cmd+F
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        if (chatId) {
          setShowSearch(true);
          setTimeout(() => searchInputRef.current?.focus(), 100);
        }
      }
      if (e.key === "Escape" && showSearch) {
        setShowSearch(false);
        setSearchQuery("");
        setSearchResults([]);
        setCurrentSearchIndex(-1);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [chatId, showSearch]);

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
    <div className="flex flex-col h-full w-full min-w-0">
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
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex"
                onClick={() => {
                  if (chatId) {
                    setShowSearch(!showSearch);
                    if (!showSearch) {
                      setTimeout(() => searchInputRef.current?.focus(), 100);
                    }
                  }
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t("searchMessages", { defaultValue: "Buscar mensajes" })} (Ctrl+F)
            </TooltipContent>
          </Tooltip>

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
              <DropdownMenuItem
                onClick={() => {
                  if (chatId) {
                    setShowSearch(!showSearch);
                    if (!showSearch) {
                      setTimeout(() => searchInputRef.current?.focus(), 100);
                    }
                  }
                }}
              >
                <Search className="h-4 w-4 mr-2" />
                {t("searchMessages", { defaultValue: "Buscar mensajes" })}
              </DropdownMenuItem>
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

      {/* Search Bar */}
      {showSearch && chatId && (
        <div className="border-b bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder={t("searchPlaceholder", { defaultValue: "Buscar en mensajes..." })}
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.shiftKey) {
                    e.preventDefault();
                    navigateSearch("up");
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    navigateSearch("down");
                  }
                }}
                className="pl-9 pr-20"
              />
              {searchQuery && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchResults.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {currentSearchIndex + 1} / {searchResults.length}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery("");
                      setSearchResults([]);
                      setCurrentSearchIndex(-1);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => navigateSearch("up")}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t("previousResult", { defaultValue: "Anterior" })} (Shift+Enter)
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => navigateSearch("down")}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t("nextResult", { defaultValue: "Siguiente" })} (Enter)
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
            {searching && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          {searchQuery && !searching && searchResults.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {t("noResults", { defaultValue: "No se encontraron mensajes" })}
            </p>
          )}
        </div>
      )}

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
              
              // Verificar si este mensaje está en los resultados de búsqueda
              const isSearchResult = searchResults.some((r) => r.id === msg.id);
              const isCurrentSearchResult = searchResults[currentSearchIndex]?.id === msg.id;

              return (
                <div
                  key={msg.id}
                  ref={(el) => {
                    if (el) {
                      messageRefs.current.set(msg.id, el);
                    } else {
                      messageRefs.current.delete(msg.id);
                    }
                  }}
                  className={cn(
                    isCurrentSearchResult && "ring-2 ring-primary ring-offset-2 rounded-lg transition-all",
                    isSearchResult && searchQuery && !isCurrentSearchResult && "opacity-70"
                  )}
                >
                  <MessageBubble
                    message={msg}
                    isClient={isClient}
                    isSystem={isSystem}
                    showAvatar={showAvatar}
                    agentInitials={initials}
                    searchQuery={searchQuery}
                    t={t}
                  />
                </div>
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
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFileSelect(e, false)}
              accept="*/*"
            />
            <input
              ref={imageInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFileSelect(e, true)}
              accept="image/*"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || !chatId}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Paperclip className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {t("attachFile", { defaultValue: "Adjuntar archivo" })}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading || !chatId}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {t("attachImage", { defaultValue: "Adjuntar imagen" })}
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Show attached files */}
          {attachments.length > 0 && (
            <div className="w-full mb-2 flex flex-wrap gap-2">
              {attachments.map((att, idx) => (
                <Badge key={idx} variant="secondary" className="gap-2">
                  <Paperclip className="h-3 w-3" />
                  <span className="text-xs truncate max-w-[100px]">{att.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    ×
                  </Button>
                </Badge>
              ))}
            </div>
          )}

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

// Función helper para resaltar texto de búsqueda
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    if (regex.test(part)) {
      return (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 px-0.5 rounded">
          {part}
        </mark>
      );
    }
    return part;
  });
}

function MessageBubble({
  message,
  isClient,
  isSystem,
  showAvatar,
  agentInitials,
  searchQuery,
  t,
}: {
  message: ChatMessage;
  isClient: boolean;
  isSystem: boolean;
  showAvatar: boolean;
  agentInitials?: string;
  searchQuery?: string;
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
          {searchQuery ? highlightText(message.body, searchQuery) : message.body}
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
          <p className="whitespace-pre-wrap">
            {searchQuery ? highlightText(message.body, searchQuery) : message.body}
          </p>
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
