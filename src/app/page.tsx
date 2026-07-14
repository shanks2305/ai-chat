import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
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

      <h1 className="mt-6 text-4xl font-semibold tracking-tight">AI Chat</h1>
      <p className="mt-3 max-w-md text-center text-muted-foreground">
        A modern chat interface for intelligent conversations. Sign in to get
        started.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/login">
          <Button size="lg" className="min-w-[140px]">
            Sign in
          </Button>
        </Link>
        <Link href="/register">
          <Button variant="secondary" size="lg" className="min-w-[140px]">
            Create account
          </Button>
        </Link>
      </div>
    </div>
  );
}
