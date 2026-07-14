"use client";

import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatStatus } from "@/components/chat/chat-status";
import { MessageList } from "@/components/chat/message-list";
import { useChatPage } from "@/hooks/use-chat-page";
import type { AiModel } from "@/lib/ai-list";

interface ChatPageProps {
  models: AiModel[];
}

export function ChatPage({ models }: ChatPageProps) {
  const {
    user,
    conversations,
    activeConversationId,
    messages,
    isSidebarOpen,
    isLoading,
    isSending,
    error,
    selectedModel,
    activeConversation,
    setIsSidebarOpen,
    setSelectedModel,
    handleNewChat,
    selectConversation,
    handleSend,
    handleSignOut,
  } = useChatPage(models);

  if (isLoading && !user) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1">
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversationId}
          user={user}
          onSelect={selectConversation}
          onNewChat={handleNewChat}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          title={activeConversation?.title ?? "New chat"}
          models={models}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onSignOut={handleSignOut}
        />

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Loading messages...
          </div>
        ) : (
          <MessageList messages={messages} />
        )}

        <ChatStatus error={error} isSending={isSending} />
        <ChatInput onSend={handleSend} disabled={isSending} />
      </div>
    </div>
  );
}
