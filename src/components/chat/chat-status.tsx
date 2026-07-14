interface ChatStatusProps {
  error?: string;
  isSending?: boolean;
}

export function ChatStatus({ error, isSending }: ChatStatusProps) {
  if (!error && !isSending) return null;

  return (
    <div className="px-4 pb-2 md:px-8">
      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
      {isSending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
          </span>
          AI is typing...
        </div>
      )}
    </div>
  );
}
