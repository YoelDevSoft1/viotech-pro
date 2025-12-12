"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LifeBuoy,
  MessageSquare,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { getAccessToken } from "@/lib/auth";
import { SupportSidebar } from "@/components/support/SupportSidebar";
import { ChatWindow } from "@/components/support/ChatWindow";
import { useSupportThreads } from "@/lib/hooks/useSupportThreads";
import { useSupportAgents } from "@/lib/hooks/useSupportAgents";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ClientSupportPage() {
  const router = useRouter();
  const t = useTranslationsSafe("support");
  const [chatId, setChatId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"agents" | "chats">("chats");
  const { threads, createThread, isLoading: isLoadingThreads, isError: isErrorThreads } = useSupportThreads();
  const { agents, isLoading: isLoadingAgents, isError: isErrorAgents } = useSupportAgents();
  const activeThread = threads.find((th) => th.id === chatId);

  const totalAgents = useMemo(
    () => (Array.isArray(agents) ? agents.length : 0),
    [agents]
  );
  const onlineAgents = useMemo(
    () => (Array.isArray(agents) ? agents.filter((a) => a.status === "online").length : 0),
    [agents]
  );
  const activeChats = useMemo(
    () => (Array.isArray(threads) ? threads.filter((c) => !c.hidden).length : 0),
    [threads]
  );
  const unreadTotal = useMemo(
    () => (Array.isArray(threads) ? threads.reduce((acc, th) => acc + (th.unreadCount || 0), 0) : 0),
    [threads]
  );

  // Auto-select first chat
  useEffect(() => {
    if (!chatId && Array.isArray(threads) && threads.length > 0) {
      setChatId(threads[0].id);
    }
  }, [threads, chatId]);

  // Auth check
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login?from=/client/support");
    }
  }, [router]);

  const handleAgentSelect = (agentId: string) => {
    createThread.mutate(
      { agentId },
      {
        onSuccess: (data: any) => {
          const newId = data?.id || data?.chatId;
          if (newId) {
            setChatId(newId);
            setSidebarTab("chats");
          }
        },
      }
    );
  };

  const handleChatSelect = (id: string) => {
    setChatId(id);
  };

  // Sidebar content (reused in desktop and mobile)
  const sidebarContent = (
    <SupportSidebar
      threads={threads}
      agents={agents}
      selectedChatId={chatId}
      activeTab={sidebarTab}
      onTabChange={setSidebarTab}
      onAgentSelect={handleAgentSelect}
      onChatSelect={handleChatSelect}
      isCreatingThread={createThread.isPending}
    />
  );

  // Mostrar alerta discreta si hay errores del servidor (500)
  const hasServerError = (isErrorAgents || isErrorThreads) && 
    (!isLoadingAgents && !isLoadingThreads);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[calc(100vh-6rem)] max-h-[900px]">
        {/* Alerta de error del servidor (discreta) */}
        {hasServerError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("serverError")}
            </AlertDescription>
          </Alert>
        )}

        {/* Compact Header */}
        <header className="flex items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {t("backToDashboard")}
              </TooltipContent>
            </Tooltip>

            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <LifeBuoy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold leading-tight">
                  {t("title")}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {t("liveChat")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Stats badges - hidden on mobile */}
            <div className="hidden sm:flex items-center gap-2">
              {isLoadingAgents ? (
                <Badge variant="secondary" className="gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
                  {t("loading")}
                </Badge>
              ) : totalAgents === 0 ? (
                <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {t("noAgentsAvailable")}
                </Badge>
              ) : onlineAgents > 0 ? (
                <Badge variant="secondary" className="gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {onlineAgents} {t("agentsOnline")}
                </Badge>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="gap-1.5 text-muted-foreground cursor-help">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                      {totalAgents} {t("agentsOffline")}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t("allAgentsOffline")}
                  </TooltipContent>
                </Tooltip>
              )}
              {unreadTotal > 0 && (
                <Badge variant="default" className="gap-1.5">
                  <MessageSquare className="h-3 w-3" />
                  {unreadTotal} {t("unread")}
                </Badge>
              )}
            </div>

            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/client/tickets">
                    <Ticket className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">
                      {t("tickets")}
                    </span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {t("viewTickets")}
              </TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Main Chat Layout - Messenger style */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4 min-w-0">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden min-w-0">
            {sidebarContent}
          </div>
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex min-w-0 w-full">
            {chatId ? (
              <ChatWindow
                chatId={chatId}
                agentName={activeThread?.agentName}
                agentStatus={activeThread?.agentStatus}
              />
            ) : (
              <EmptyChatState
                onStartChat={() => {
                  setSidebarTab("agents");
                  // Si hay agentes disponibles, seleccionar el primero online o el primero disponible
                  if (Array.isArray(agents) && agents.length > 0) {
                    const onlineAgent = agents.find((a) => a.status === "online");
                    const firstAgent = onlineAgent || agents[0];
                    if (firstAgent) {
                      handleAgentSelect(firstAgent.id);
                    }
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function EmptyChatState({ onStartChat }: { onStartChat: () => void }) {
  const t = useTranslationsSafe("support");

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <MessageSquare className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-xl font-semibold mb-2">
        {t("noActiveChat")}
      </h2>
      <p className="text-muted-foreground max-w-sm mb-6">
        {t("selectOrStartChat")}
      </p>
      <Button onClick={onStartChat} className="gap-2">
        <Users className="h-4 w-4" />
        {t("startNewChat")}
      </Button>
    </div>
  );
}
