"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSupportChat } from "@/lib/hooks/useSupportChat";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { cn } from "@/lib/utils";
import { Loader2, Send, Wifi, WifiOff } from "lucide-react";

export function SupportChat() {
  const { messages, status, isFallback, sending, sendMessage, retryConnection } = useSupportChat();
  const [input, setInput] = useState("");
  const t = useTranslationsSafe("support");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const current = input;
    setInput("");
    try {
      await sendMessage(current);
    } catch {
      // show toast? For now, put input back
      setInput(current);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            {t("realtimeChat", { defaultValue: "Chat en tiempo real" })}
          </CardTitle>
          <Badge variant={status === "connected" ? "default" : "destructive"} className="flex items-center gap-1.5">
            {status === "connected" ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {status === "connected"
              ? t("statusOnline", { defaultValue: "En línea" })
              : status === "connecting"
              ? t("statusConnecting", { defaultValue: "Conectando..." })
              : t("statusOffline", { defaultValue: "Desconectado" })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 h-[520px]">
        {status === "error" && !isFallback && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              <span>{t("chatError", { defaultValue: "No se pudo conectar al chat en vivo." })}</span>
              <Button variant="outline" size="sm" onClick={retryConnection}>
                {t("retryConnection", { defaultValue: "Reintentar" })}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <ScrollArea className="flex-1 rounded-md border p-4 bg-muted/40">
          <div className="space-y-2">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex", m.from === "client" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                    m.from === "client"
                      ? "bg-primary text-primary-foreground"
                      : m.from === "system"
                      ? "bg-muted text-muted-foreground"
                      : "bg-background border"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={cn("mt-1 text-[10px]", m.from === "client" ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-end">
                <div className="bg-primary/80 text-primary-foreground max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("sending", { defaultValue: "Enviando..." })}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </ScrollArea>

        <div className="space-y-2">
          <Textarea
            placeholder={t("inputPlaceholder", { defaultValue: "Escribe tu mensaje..." })}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="min-h-[72px] resize-none"
            disabled={status === "error"}
          />
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {t("chatNote", { defaultValue: "Soporte responde en promedio en pocos minutos." })}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleSend} disabled={!input.trim() || sending || status === "error"}>
                    {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                    {t("send", { defaultValue: "Enviar" })}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("send", { defaultValue: "Enviar" })}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
