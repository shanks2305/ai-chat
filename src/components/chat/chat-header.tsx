import type { AiModel } from "@/lib/ai-list";

interface ChatHeaderProps {
  title: string;
  models: AiModel[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  onOpenSidebar: () => void;
  onSignOut: () => void;
}

export function ChatHeader({
  title,
  models,
  selectedModel,
  onModelChange,
  onOpenSidebar,
  onSignOut,
}: ChatHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
          aria-label="Open sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M4 5h16" />
            <path d="M4 12h16" />
            <path d="M4 19h16" />
          </svg>
        </button>
        <h1 className="truncate text-sm font-medium">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <label>
          <span className="sr-only">AI model</span>
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="max-w-28 truncate rounded-full border-0 bg-muted px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:max-w-none"
          >
            {models.map((item) => (
              <option key={item.model} value={item.model}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={onSignOut}
          className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
