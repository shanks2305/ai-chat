import type { Conversation } from "@/lib/chat-types";

interface ChatUser {
  name: string;
  email: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: number | null;
  user: ChatUser | null;
  onSelect: (id: number) => void;
  onNewChat: () => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ChatSidebar({
  conversations,
  activeId,
  user,
  onSelect,
  onNewChat,
}: ChatSidebarProps) {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M12 8V4H8" />
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2" />
              <path d="M20 14h2" />
              <path d="M15 13v2" />
              <path d="M9 13v2" />
            </svg>
          </div>
          <span className="font-semibold text-sidebar-foreground">AI Chat</span>
        </div>
      </div>

      <div className="p-3">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          New chat
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Recent
        </p>
        <ul className="space-y-0.5">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <button
                type="button"
                onClick={() => onSelect(conversation.id)}
                className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                  activeId === conversation.id
                    ? "bg-accent text-accent-foreground"
                    : "text-sidebar-foreground hover:bg-muted"
                }`}
              >
                <p className="truncate text-sm font-medium">{conversation.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {conversation.preview}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {user ? getInitials(user.name) : "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name ?? "Guest"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email ?? "Not signed in"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
