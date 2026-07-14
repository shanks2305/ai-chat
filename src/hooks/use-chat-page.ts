"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { AiModel } from "@/lib/ai-list";
import {
  fetchConversations,
  fetchCurrentUser,
  fetchMessages,
  signOut,
  submitChatMessage,
  type AuthUser,
} from "@/lib/chat-client";
import type { Conversation, Message } from "@/lib/chat-types";

export function useChatPage(models: AiModel[]) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [selectedModel, setSelectedModel] = useState(() => models[0]?.model ?? "");

  const selectConversation = useCallback(async (id: number) => {
    setError("");
    setActiveConversationId(id);
    setIsSidebarOpen(false);
    setIsLoading(true);
    setMessages(await fetchMessages(id));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      const currentUser = await fetchCurrentUser();
      if (!currentUser) return router.replace("/login");
      setUser(currentUser);
      const loaded = await fetchConversations();
      setConversations(loaded);
      if (loaded[0]) {
        setActiveConversationId(loaded[0].id);
        setMessages(await fetchMessages(loaded[0].id));
      }
      setIsLoading(false);
    })();
  }, [router]);

  const handleNewChat = useCallback(() => {
    setError(""); setActiveConversationId(null); setMessages([]); setIsSidebarOpen(false);
  }, []);

  const handleSend = useCallback(async (content: string) => {
    setError("");
    setIsSending(true);
    try {
      const result = await submitChatMessage(activeConversationId, content, selectedModel);
      if (!result.ok) return setError(result.error);
      if (result.kind === "new") {
        setConversations((prev) => [result.conversation, ...prev]);
        setActiveConversationId(result.conversation.id);
        setMessages(result.messages);
        return;
      }
      setMessages((prev) => [...prev, ...result.messages]);
      setConversations(await fetchConversations());
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  }, [activeConversationId]);

  const handleSignOut = useCallback(async () => {
    await signOut(); router.push("/login"); router.refresh();
  }, [router]);

  return {
    user,
    conversations,
    activeConversationId,
    messages,
    isSidebarOpen,
    isLoading,
    isSending,
    error,
    selectedModel,
    activeConversation: conversations.find((c) => c.id === activeConversationId),
    setIsSidebarOpen,
    setSelectedModel,
    handleNewChat,
    selectConversation,
    handleSend,
    handleSignOut,
  };
}
