"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import type { Message } from "@/lib/chat-types";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface MessageBubbleProps {
  message: Message;
  userName?: string;
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 list-disc pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 list-decimal pl-5">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        h1: ({ children }) => <h1 className="mb-2 text-lg font-semibold">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-2 text-base font-semibold">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-2 text-sm font-semibold">{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="mb-2 border-l-2 border-border pl-3 text-muted-foreground">
            {children}
          </blockquote>
        ),
        pre: ({ children }) => (
          <pre className="code-block my-2 overflow-x-auto rounded-lg border p-3 text-xs">
            {children}
          </pre>
        ),
        code: ({ className, children, ...props }) => {
          const isBlock =
            className?.includes("language-") || className?.includes("hljs");

          if (isBlock) {
            return (
              <code
                className={`font-mono text-[0.8125rem] leading-relaxed ${className ?? ""}`}
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <code className="inline-code rounded px-1.5 py-0.5 font-mono text-xs">
              {children}
            </code>
          );
        },
        a: ({ href, children }) => (
          <a
            href={href}
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="my-2 overflow-x-auto">
            <table className="w-full border-collapse text-xs">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-border px-2 py-1 text-left font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-border px-2 py-1">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function MessageBubble({ message, userName }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {isUser ? (userName ? getInitials(userName) : "Y") : "AI"}
      </div>

      <div
        className={`max-w-[min(75%,42rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "rounded-tr-sm bg-user-bubble text-primary-foreground"
            : "rounded-tl-sm bg-assistant-bubble text-foreground"
        }`}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{message.content}</span>
        ) : (
          <MarkdownContent content={message.content} />
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex w-full gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
        AI
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-assistant-bubble px-4 py-3">
        <span className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
        </span>
      </div>
    </div>
  );
}

interface MessageListProps {
  messages: Message[];
  isSending?: boolean;
  userName?: string;
}

export function MessageList({ messages, isSending, userName }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const frame = requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    });

    return () => cancelAnimationFrame(frame);
  }, [messages, isSending]);

  const showEmptyState = messages.length === 0 && !isSending;

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-6 md:px-8">
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6">
        {showEmptyState ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7 text-accent-foreground"
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
            <div>
              <h2 className="text-lg font-semibold">Start a conversation</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Ask anything — coding help, writing, brainstorming, and more.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              userName={userName}
            />
          ))
        )}

        {isSending && <TypingIndicator />}
      </div>
    </div>
  );
}
