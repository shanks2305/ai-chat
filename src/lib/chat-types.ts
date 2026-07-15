import type { AgentType, ToneType } from "@/lib/system-promt";

export type MessageRole = "user" | "assistant";

export interface Message {
  id: number;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: number;
  title: string;
  updatedAt: string;
  preview: string;
  agentType: AgentType;
  tone: ToneType | null;
}
