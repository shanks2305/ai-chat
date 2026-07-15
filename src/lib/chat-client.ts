import type { Conversation, Message } from "@/lib/chat-types";
import type { AgentType, ToneType } from "@/lib/system-promt";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

async function getJson<T>(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  return { ok: res.ok, data: (await res.json()) as T };
}

function apiError(data: object, fallback: string) {
  return "error" in data && typeof data.error === "string" ? data.error : fallback;
}

export async function fetchCurrentUser() {
  const { ok, data } = await getJson<{ user: AuthUser }>("/api/auth/me");
  return ok ? data.user : null;
}

export async function fetchConversations() {
  const { ok, data } = await getJson<{ conversations: Conversation[] }>(
    "/api/chat/conversations",
  );
  return ok ? data.conversations : [];
}

export async function fetchMessages(id: number) {
  const { ok, data } = await getJson<{ messages: Message[] }>(
    `/api/chat/conversations/${id}/messages`,
  );
  return ok ? data.messages : [];
}

export async function createConversation(
  content: string,
  model: string,
  agentType: AgentType,
  tone: ToneType | null,
) {
  return await getJson<{ conversation: Conversation; messages: Message[] }>(
    "/api/chat/conversations",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, model, agentType, tone }),
    },
  );
}

export async function sendMessage(conversationId: number, content: string, model: string) {
  return await getJson<{ messages: Message[] }>(
    `/api/chat/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, model }),
    },
  );
}

export async function signOut() {
  await fetch("/api/auth/logout", { method: "POST" });
}

type SubmitResult =
  | { ok: true; kind: "new"; conversation: Conversation; messages: Message[] }
  | { ok: true; kind: "reply"; messages: Message[] }
  | { ok: false; error: string };

export async function submitChatMessage(
  conversationId: number | null,
  content: string,
  model: string,
  agentType: AgentType,
  tone: ToneType | null,
): Promise<SubmitResult> {
  if (conversationId === null) {
    const { ok, data } = await createConversation(content, model, agentType, tone);
    if (!ok) return { ok: false, error: apiError(data, "Failed to send message") };
    return { ok: true, kind: "new", conversation: data.conversation, messages: data.messages };
  }
  const { ok, data } = await sendMessage(conversationId, content, model);
  if (!ok) return { ok: false, error: apiError(data, "Failed to send message") };
  return { ok: true, kind: "reply", messages: data.messages };
}
