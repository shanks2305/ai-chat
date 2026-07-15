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
import type { AgentType, ToneType } from "@/lib/system-promt";

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
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType>("general");
  const [selectedTone, setSelectedTone] = useState<ToneType | null>(null);

  const selectConversation = useCallback(async (id: number) => {
    setError("");
    setActiveConversationId(id);
    setIsSidebarOpen(false);
    setIsLoading(true);
    const conversation = conversations.find((item) => item.id === id);
    if (conversation) {
      setSelectedAgentType(conversation.agentType);
      setSelectedTone(conversation.tone);
    }
    setMessages(await fetchMessages(id));
    setIsLoading(false);
  }, [conversations]);

  useEffect(() => {
    (async () => {
      const currentUser = await fetchCurrentUser();
      if (!currentUser) return router.replace("/login");
      setUser(currentUser);
      const loaded = await fetchConversations();
      setConversations(loaded);
      if (loaded[0]) {
        setActiveConversationId(loaded[0].id);
        setSelectedAgentType(loaded[0].agentType);
        setSelectedTone(loaded[0].tone);
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
    const optimisticId = -Date.now();
    const optimisticMessage: Message = {
      id: optimisticId,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setIsSending(true);

    try {
      const result = await submitChatMessage(
        activeConversationId,
        content,
        selectedModel,
        selectedAgentType,
        selectedTone,
      );
      if (!result.ok) {
        setMessages((prev) => prev.filter((message) => message.id !== optimisticId));
        setError(result.error);
        return;
      }

      if (result.kind === "new") {
        setConversations((prev) => [result.conversation, ...prev]);
        setActiveConversationId(result.conversation.id);
        setSelectedAgentType(result.conversation.agentType);
        setSelectedTone(result.conversation.tone);
        setMessages(result.messages);
        return;
      }

      setMessages((prev) => {
        const withoutOptimistic = prev.filter((message) => message.id !== optimisticId);
        return [...withoutOptimistic, ...result.messages];
      });
      setConversations(await fetchConversations());
    } catch {
      setMessages((prev) => prev.filter((message) => message.id !== optimisticId));
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  }, [activeConversationId, selectedModel, selectedAgentType, selectedTone]);

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
    selectedAgentType,
    selectedTone,
    isNewChat: activeConversationId === null,
    activeConversation: conversations.find((c) => c.id === activeConversationId),
    setIsSidebarOpen,
    setSelectedModel,
    setSelectedAgentType,
    setSelectedTone,
    handleNewChat,
    selectConversation,
    handleSend,
    handleSignOut,
  };
}
