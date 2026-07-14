interface ChatStatusProps {
  error?: string;
}

export function ChatStatus({ error }: ChatStatusProps) {
  if (!error) return null;

  return (
    <div className="px-4 pb-2 md:px-8">
      <p className="mx-auto max-w-3xl text-sm text-red-500" role="alert">
        {error}
      </p>
    </div>
  );
}
