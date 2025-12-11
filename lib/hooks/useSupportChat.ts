"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "@/lib/apiClient";
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

  // Load initial history
  useEffect(() => {
    let mounted = true;
    apiClient
      .get("/support/chat/history", { params: { limit: 100, chatId: chatIdRef.current } })
      .then((res) => res?.data?.data || res?.data || [])
      .then((list: ChatMessage[]) => {
        if (mounted && Array.isArray(list)) {
          setChatMessages(list);
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
        if (payload?.type === "chat_message" && payload.data) {
          const incoming = payload.data as ChatMessage & { chatId?: string };
          if (!incoming.chatId || incoming.chatId === chatIdRef.current) {
            setMessages((prev) => [...prev, incoming]);
          }
        }
        if (payload?.type === "message_status" && payload.data) {
          const { messageId, status: mStatus } = payload.data as { messageId: string; status: ChatMessage["status"] };
          setMessages((prev) =>
            prev.map((m) => (m.id === messageId ? { ...m, status: mStatus } : m))
          );
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

    const fetchUpdates = () =>
      apiClient
        .get("/support/chat/updates", {
          params: {
            chatId: chatIdRef.current,
            ...(lastTimestamp ? { since: lastTimestamp } : {}),
          },
        })
        .then((res) => res?.data?.data || res?.data || [])
        .then((list: ChatMessage[]) => {
          if (!Array.isArray(list) || list.length === 0) return;
          setMessages((prev) => [...prev, ...list]);
        })
        .catch(() => {});

    // activar fallback y marcar estado conectado
    setIsFallback(true);
    setStatus("connected");
    fetchUpdates();

    pollRef.current = setInterval(fetchUpdates, 4000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status, lastTimestamp]);

  const sendMessage = async (body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const tempId = crypto.randomUUID();
    const optimistic: ChatMessage = {
      id: tempId,
      tempId,
      from: "client",
      body: trimmed,
      createdAt: new Date().toISOString(),
      status: "sending",
    };
    setMessages((prev) => [...prev, optimistic]);
    setSending(true);
    try {
      const { data } = await apiClient.post("/support/chat/send", {
        message: trimmed,
        tempId,
        chatId: chatIdRef.current,
      });
      const persisted = data?.data || data;
      if (persisted?.id) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, id: persisted.id, status: "sent" } : m))
        );
      }
    } catch (err) {
      // remove optimistic on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
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
