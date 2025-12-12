"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { formatDistanceToNow } from "date-fns";
import { es, enUS, ptBR } from "date-fns/locale";
import type { Locale } from "date-fns";
import { useLocaleContext } from "@/lib/contexts/LocaleContext";
import {
  Loader2,
  MessageCircle,
  Search,
  Archive,
  Users,
  Plus,
  Headphones,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SupportThread } from "@/lib/hooks/useSupportThreads";

type Agent = {
  id: string;
  name: string;
  role?: string;
  status?: "online" | "offline" | "away" | "busy";
  avatarUrl?: string | null;
  skills?: string[];
  isActive?: boolean;
  lastSeenAt?: string | null;
};

const localeMap: Record<string, Locale> = { es, en: enUS, pt: ptBR } as any;

interface SupportSidebarProps {
  threads: SupportThread[];
  agents: Agent[];
  selectedChatId?: string | null;
  activeTab: "agents" | "chats";
  onTabChange: (tab: "agents" | "chats") => void;
  onAgentSelect: (agentId: string) => void;
  onChatSelect: (chatId: string) => void;
  isCreatingThread?: boolean;
}

export function SupportSidebar({
  threads,
  agents,
  selectedChatId,
  activeTab,
  onTabChange,
  onAgentSelect,
  onChatSelect,
  isCreatingThread,
}: SupportSidebarProps) {
  const t = useTranslationsSafe("support");
  const { locale } = useLocaleContext();
  const [search, setSearch] = useState("");
  const localeObj = localeMap[locale] || enUS;

  // Filter threads
  const filteredThreads = useMemo(() => {
    if (!Array.isArray(threads)) return [];
    const q = search.toLowerCase();
    return threads.filter(
      (c) =>
        !c.hidden &&
        (c.agentName.toLowerCase().includes(q) ||
          (c.lastMessage?.body || "").toLowerCase().includes(q))
    );
  }, [threads, search]);

  // Filter agents
  const filteredAgents = useMemo(() => {
    if (!Array.isArray(agents)) return [];
    const q = search.toLowerCase();
    return agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.role || "").toLowerCase().includes(q)
    );
  }, [agents, search]);

  // Sort agents: online first, then away, then busy, then offline
  const sortedAgents = useMemo(() => {
    const order: Record<string, number> = { online: 0, away: 1, busy: 2, offline: 3 };
    return [...filteredAgents].sort(
      (a, b) => (order[a.status || "offline"] ?? 3) - (order[b.status || "offline"] ?? 3)
    );
  }, [filteredAgents]);

  const onlineCount = useMemo(
    () => (Array.isArray(agents) ? agents.filter((a) => a.status === "online").length : 0),
    [agents]
  );

  const unreadCount = useMemo(
    () => (Array.isArray(threads) ? threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0) : 0),
    [threads]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header with search */}
      <div className="p-4 space-y-3 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Headphones className="h-4 w-4 text-primary" />
            {t("supportCenter")}
          </h2>
        </div>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-muted/50"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => onTabChange(v as "agents" | "chats")}
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-full rounded-none border-b bg-transparent h-auto p-0">
          <TabsTrigger
            value="chats"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            {t("chats")}
            {unreadCount > 0 && (
              <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="agents"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 gap-2"
          >
            <Users className="h-4 w-4" />
            {t("agents")}
            {onlineCount > 0 && (
              <Badge
                variant="secondary"
                className="h-5 px-1.5 text-[10px] bg-green-100 text-green-700"
              >
                {onlineCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Chats Tab */}
        <TabsContent value="chats" className="flex-1 m-0 data-[state=inactive]:hidden">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {filteredThreads.length === 0 ? (
                <EmptyState
                  icon={<MessageCircle className="h-8 w-8" />}
                  title={t("noChats")}
                  description={t("noChatsDesc")}
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTabChange("agents")}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {t("newChat")}
                    </Button>
                  }
                />
              ) : (
                filteredThreads.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isSelected={selectedChatId === chat.id}
                    onClick={() => onChatSelect(chat.id)}
                    locale={localeObj}
                    t={t}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="flex-1 m-0 data-[state=inactive]:hidden">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {!Array.isArray(agents) || agents.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-8 w-8" />}
                  title={t("noAgents")}
                  description={t("noAgentsDesc")}
                />
              ) : sortedAgents.length === 0 ? (
                <EmptyState
                  icon={<Search className="h-8 w-8" />}
                  title={t("noAgentsFound")}
                  description={t("noAgentsFoundDesc")}
                />
              ) : (
                sortedAgents.map((agent) => (
                  <AgentItem
                    key={agent.id}
                    agent={agent}
                    onClick={() => onAgentSelect(agent.id)}
                    isCreating={isCreatingThread}
                    locale={localeObj}
                    t={t}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper para validar y formatear fechas de forma segura
function safeFormatDistanceToNow(
  dateStr: string | undefined | null,
  locale: Locale
): string | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    // Verificar que la fecha sea válida
    if (isNaN(date.getTime())) return null;
    return formatDistanceToNow(date, { addSuffix: false, locale });
  } catch {
    return null;
  }
}

function ChatItem({
  chat,
  isSelected,
  onClick,
  locale,
  t,
}: {
  chat: SupportThread;
  isSelected: boolean;
  onClick: () => void;
  locale: Locale;
  t: (key: string, opts?: any) => string;
}) {
  const initials = (chat.agentName || "??")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const timeAgo = safeFormatDistanceToNow(chat.lastMessage?.createdAt, locale);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-xl transition-all duration-200",
        "hover:bg-accent/50 active:scale-[0.98]",
        "flex items-start gap-3",
        isSelected && "bg-primary/10 hover:bg-primary/15 ring-1 ring-primary/20"
      )}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <StatusDot status={chat.agentStatus} className="absolute -bottom-0.5 -right-0.5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm truncate">{chat.agentName}</span>
          {timeAgo && (
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {timeAgo}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground truncate">
            {chat.lastMessage?.body || t("noMessages")}
          </p>
          {(chat.unreadCount ?? 0) > 0 && (
            <Badge
              variant="default"
              className="h-5 min-w-5 px-1.5 text-[10px] flex-shrink-0"
            >
              {chat.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}

function AgentItem({
  agent,
  onClick,
  isCreating,
  locale,
  t,
}: {
  agent: Agent;
  onClick: () => void;
  isCreating?: boolean;
  locale: Locale;
  t: (key: string, opts?: any) => string;
}) {
  const initials = agent.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isOnline = agent.status === "online";
  const isAway = agent.status === "away";
  const isBusy = agent.status === "busy";

  // Formatear "última vez visto" de forma segura
  const lastSeenText = useMemo(() => {
    if (!agent.lastSeenAt) return null;
    try {
      const date = new Date(agent.lastSeenAt);
      if (isNaN(date.getTime())) return null;
      return formatDistanceToNow(date, { addSuffix: true, locale });
    } catch {
      return null;
    }
  }, [agent.lastSeenAt, locale]);

  return (
    <button
      onClick={onClick}
      disabled={isCreating}
      className={cn(
        "w-full text-left p-3 rounded-xl transition-all duration-200",
        "hover:bg-accent/50 active:scale-[0.98]",
        "flex items-center gap-3 group",
        isCreating && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10">
          {agent.avatarUrl && (
            <AvatarImage src={agent.avatarUrl} alt={agent.name} />
          )}
          <AvatarFallback
            className={cn(
              "text-xs font-medium transition-colors",
              isOnline
                ? "bg-green-100 text-green-700"
                : isAway
                ? "bg-yellow-100 text-yellow-700"
                : isBusy
                ? "bg-red-100 text-red-700"
                : "bg-muted text-muted-foreground"
            )}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <StatusDot status={agent.status} className="absolute -bottom-0.5 -right-0.5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{agent.name}</span>
          {agent.isActive && (
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" title={t("activeSession")} />
          )}
        </div>
        <span className="text-xs text-muted-foreground truncate block">
          {agent.role || t("agent")}
        </span>
        {!isOnline && lastSeenText && (
          <span className="text-[10px] text-muted-foreground/70 truncate block">
            {t("lastSeen")} {lastSeenText}
          </span>
        )}
      </div>

      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {isCreating ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {t("startChat")}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </button>
  );
}

function StatusDot({
  status,
  className,
}: {
  status?: "online" | "offline" | "away" | "busy";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "h-3 w-3 rounded-full border-2 border-background",
        status === "online" && "bg-green-500",
        status === "away" && "bg-yellow-400",
        status === "busy" && "bg-red-500",
        (!status || status === "offline") && "bg-muted-foreground",
        className
      )}
    />
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
        {icon}
      </div>
      <p className="font-medium text-sm mb-1">{title}</p>
      <p className="text-xs text-muted-foreground mb-4">{description}</p>
      {action}
    </div>
  );
}
