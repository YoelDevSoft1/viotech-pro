"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supportApi, Message } from "@/lib/api/support";
import { getAccessToken } from "@/lib/auth";

export type ChatMessage = {
  id: string;
  tempId?: string;
  from: "client" | "agent" | "system";
  body: string;
  createdAt: string;
  status?: "sending" | "sent" | "delivered" | "read";
  attachments?: { name: string; url: string; type?: string }[];
};

export type AttachmentInput = {
  fileName: string;
  fileType: string;
  fileSize: number;
  storageUrl: string;
  storagePath: string;
};

export type ChatStatus = "connecting" | "connected" | "error";

const buildWsUrl = (path: string, token?: string | null) => {
  if (typeof window === "undefined") return null;
  const base =
    process.env.NEXT_PUBLIC_WS_URL ||
    `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;
  const qs = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${base}${path}${qs}`;
};

export function useSupportChat(chatId?: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("connecting");
  const [sending, setSending] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const wsFailedRef = useRef<boolean>(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimestamp = useMemo(
    () => messages[messages.length - 1]?.createdAt ?? null,
    [messages]
  );

  const chatIdRef = useRef<string | undefined>(chatId || undefined);

  useEffect(() => {
    chatIdRef.current = chatId || undefined;
    // reset messages when chat changes
    setMessages([]);
    setStatus("connecting");
    wsFailedRef.current = false;
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, [chatId]);

  const setChatMessages = (list: ChatMessage[]) => {
    setMessages((prev) => {
      // Si es otro chat, reiniciar
      if (chatIdRef.current === undefined) return list;
      return list;
    });
  };

  // Load initial history usando el endpoint correcto
  useEffect(() => {
    let mounted = true;
    if (!chatIdRef.current) {
      setMessages([]);
      return;
    }
    
    supportApi
      .getMessages(chatIdRef.current, undefined, 100)
      .then((list: Message[]) => {
        if (mounted && Array.isArray(list)) {
          // Convertir Message[] a ChatMessage[]
          const chatMessages: ChatMessage[] = list.map((msg) => ({
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
          setChatMessages(chatMessages);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [chatId]);

  // WebSocket connection
  useEffect(() => {
    if (wsFailedRef.current) {
      setStatus("error");
      return;
    }
    const token = getAccessToken();
    const url = buildWsUrl("/ws/support", token);
    if (!url) return;
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(url);
    } catch (err) {
      wsFailedRef.current = true;
      setStatus("error");
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => setStatus("connected");
    ws.onerror = () => {
      wsFailedRef.current = true;
      setStatus("error");
    };
    ws.onclose = () => {
      wsFailedRef.current = true;
      setStatus("error");
    };
    ws.onmessage = (evt) => {
      try {
        const payload = JSON.parse(evt.data);

        // Evento de conexión establecida
        if (payload?.type === "chat_status") {
          console.log("[WS] Chat status:", payload.status, payload.message);
          return;
        }

        // Nuevo mensaje recibido
        if (payload?.type === "chat_message" && payload.payload) {
          const { chatId: msgChatId, message } = payload.payload as {
            chatId: string;
            message: {
              id: string;
              senderId: string;
              senderType: "user" | "agent";
              body: string;
              status: string;
              createdAt: string;
            };
          };

          // Solo agregar si es para este chat
          if (!msgChatId || msgChatId === chatIdRef.current) {
            const incoming: ChatMessage = {
              id: message.id,
              tempId: message.id,
              from: message.senderType === "user" ? "client" : "agent",
              body: message.body,
              createdAt: message.createdAt,
              status: message.status as ChatMessage["status"],
            };

            // Evitar duplicados
            setMessages((prev) => {
              const exists = prev.some((m) => m.id === incoming.id);
              if (exists) return prev;
              return [...prev, incoming];
            });
          }
        }

        // Actualización de estado de mensaje
        if (payload?.type === "message_status" && payload.data) {
          const { messageId, status: mStatus } = payload.data as { messageId: string; status: ChatMessage["status"] };
          setMessages((prev) =>
            prev.map((m) => (m.id === messageId ? { ...m, status: mStatus } : m))
          );
        }

        // Actualización de presencia de agente (puede ser útil para actualizar UI)
        if (payload?.type === "presence_update" && payload.payload) {
          const { agentId, status: agentStatus } = payload.payload as {
            agentId: string;
            status: "online" | "offline" | "away" | "busy";
          };
          console.log("[WS] Agent presence update:", agentId, agentStatus);
          // Aquí podrías emitir un evento para actualizar el estado del agente en la UI
        }
      } catch {
        // ignore malformed messages
      }
    };

    return () => {
      ws?.close();
    };
  }, [chatId]);

  // Polling fallback when WS fails
  useEffect(() => {
    if (status !== "error") return;
    if (pollRef.current) return;
    if (!chatIdRef.current) return;

    const fetchUpdates = async () => {
      try {
        // Usar el endpoint de mensajes con paginación
        // Si hay lastTimestamp, cargar mensajes después de esa fecha
        const newMessages = await supportApi.getMessages(chatIdRef.current!, undefined, 50);
        
        if (!Array.isArray(newMessages) || newMessages.length === 0) return;
        
        // Filtrar mensajes nuevos (después de lastTimestamp)
        const filteredMessages = lastTimestamp
          ? newMessages.filter((msg) => new Date(msg.createdAt) > new Date(lastTimestamp))
          : newMessages;
        
        if (filteredMessages.length > 0) {
          // Convertir Message[] a ChatMessage[]
          const chatMessages: ChatMessage[] = filteredMessages.map((msg) => ({
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
          
          setMessages((prev) => {
            // Evitar duplicados
            const existingIds = new Set(prev.map((m) => m.id));
            const newOnes = chatMessages.filter((m) => !existingIds.has(m.id));
            return [...prev, ...newOnes];
          });
        }
      } catch (err) {
        // Silenciar errores en polling
      }
    };

    // activar fallback y marcar estado conectado
    setIsFallback(true);
    setStatus("connected");
    fetchUpdates();

    pollRef.current = setInterval(fetchUpdates, 4000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status, lastTimestamp, chatId]);

  const sendMessage = async (body: string, tempId?: string, attachments: AttachmentInput[] = []) => {
    const trimmed = body.trim();
    if ((!trimmed && attachments.length === 0) || !chatIdRef.current) return;
    
    const messageTempId = tempId || crypto.randomUUID();
    const optimistic: ChatMessage = {
      id: messageTempId,
      tempId: messageTempId,
      from: "client",
      body: trimmed || "📎 Archivo adjunto",
      createdAt: new Date().toISOString(),
      status: "sending",
      attachments: attachments.map((att) => ({
        name: att.fileName,
        url: att.storageUrl,
        type: att.fileType,
      })),
    };
    setMessages((prev) => [...prev, optimistic]);
    setSending(true);
    try {
      // Usar el endpoint correcto según la guía
      const persisted = await supportApi.sendMessage(
        chatIdRef.current,
        trimmed || "📎 Archivo adjunto",
        messageTempId,
        attachments
      );
      if (persisted?.id) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageTempId ? { ...m, id: persisted.id, status: "sent" } : m))
        );
      }
    } catch (err) {
      // remove optimistic on failure
      setMessages((prev) => prev.filter((m) => m.id !== messageTempId));
      throw err;
    } finally {
      setSending(false);
    }
  };

  const retryConnection = () => {
    wsFailedRef.current = false;
    setIsFallback(false);
    setStatus("connecting");
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  return {
    messages,
    status,
    isFallback,
    sending,
    sendMessage,
    retryConnection,
  };
}
