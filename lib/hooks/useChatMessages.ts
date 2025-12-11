"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supportApi, Message } from "@/lib/api/support";

/**
 * Hook para manejar mensajes de un chat específico
 * Basado en la guía completa de implementación
 */
export function useChatMessages(chatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(
    async (before?: string) => {
      if (!chatId) return;

      try {
        setLoading(true);
        setError(null);
        const newMessages = await supportApi.getMessages(chatId, before, 50);

        if (before) {
          // Cargar más mensajes (paginación hacia atrás)
          setMessages((prev) => [...newMessages, ...prev]);
        } else {
          // Cargar mensajes iniciales
          setMessages(newMessages);
        }

        setHasMore(newMessages.length === 50);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar mensajes");
      } finally {
        setLoading(false);
      }
    },
    [chatId]
  );

  useEffect(() => {
    if (chatId) {
      loadMessages();
    } else {
      setMessages([]);
      setHasMore(true);
    }
  }, [chatId, loadMessages]);

  const sendMessage = useCallback(
    async (body: string, tempId?: string, attachments: any[] = []) => {
      if (!chatId) throw new Error("No hay chat seleccionado");

      // Optimistic update
      const tempMessage: Message = {
        id: tempId || `temp-${Date.now()}`,
        body,
        senderType: "user",
        senderId: "", // Se llenará con el ID real del usuario
        status: "sending",
        createdAt: new Date().toISOString(),
        attachments,
      };

      setMessages((prev) => [...prev, tempMessage]);
      setSending(true);

      try {
        const sentMessage = await supportApi.sendMessage(chatId, body, tempId, attachments);
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? sentMessage : msg))
        );
        return sentMessage;
      } catch (err) {
        // Revertir optimistic update
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        throw err;
      } finally {
        setSending(false);
      }
    },
    [chatId]
  );

  const loadMore = useCallback(() => {
    if (hasMore && messages.length > 0 && !loading) {
      const oldestMessage = messages[0];
      loadMessages(oldestMessage.createdAt);
    }
  }, [hasMore, messages, loading, loadMessages]);

  const markAsRead = useCallback(
    async (lastMessageId?: string) => {
      if (!chatId) return;
      try {
        await supportApi.markAsRead(chatId, lastMessageId);
      } catch (err) {
        console.error("Error marcando como leído:", err);
      }
    },
    [chatId]
  );

  const searchMessages = useCallback(
    async (query: string) => {
      if (!chatId) return [];
      try {
        return await supportApi.searchMessages(chatId, query);
      } catch (err) {
        console.error("Error buscando mensajes:", err);
        return [];
      }
    },
    [chatId]
  );

  return {
    messages,
    loading,
    error,
    hasMore,
    sending,
    sendMessage,
    loadMore,
    markAsRead,
    searchMessages,
    refetch: () => loadMessages(),
  };
}

