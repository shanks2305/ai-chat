import { getDb } from "@/lib/db";
import type { Conversation, Message } from "@/lib/chat-types";
import { type AgentType, isAgentType, parseStoredTone, serializeTone, type ToneType } from "@/lib/system-promt";

interface ConversationRow {
  id: number;
  user_id: number;
  title: string;
  agent_type: AgentType;
  tones: string;
  created_at: string;
  updated_at: string;
}

interface MessageRow {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ConversationListRow extends ConversationRow {
  preview: string | null;
}

function formatRelativeDate(isoDate: string) {
  const date = new Date(isoDate.includes("T") ? isoDate : `${isoDate}Z`);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function toMessage(row: MessageRow): Message {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
  };
}

function toConversation(row: ConversationListRow): Conversation {
  return {
    id: row.id,
    title: row.title,
    updatedAt: formatRelativeDate(row.updated_at),
    preview: row.preview ?? "No messages yet",
    agentType: isAgentType(row.agent_type) ? row.agent_type : "general",
    tone: parseStoredTone(row.tones),
  };
}

export function listConversations(userId: number): Conversation[] {
  const rows = getDb()
    .prepare(
      `
      SELECT
        c.id,
        c.user_id,
        c.title,
        c.agent_type,
        c.tones,
        c.created_at,
        c.updated_at,
        (
          SELECT content
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC, m.id DESC
          LIMIT 1
        ) AS preview
      FROM conversations c
      WHERE c.user_id = ?
      ORDER BY c.updated_at DESC
    `,
    )
    .all(userId) as ConversationListRow[];

  return rows.map(toConversation);
}

export function getConversation(userId: number, conversationId: number) {
  return getDb()
    .prepare(
      "SELECT * FROM conversations WHERE id = ? AND user_id = ?",
    )
    .get(conversationId, userId) as ConversationRow | undefined;
}

export function createConversation(
  userId: number,
  title = "New chat",
  agentType: AgentType = "general",
  tone: ToneType | null = null,
) {
  const result = getDb()
    .prepare(
      "INSERT INTO conversations (user_id, title, agent_type, tones) VALUES (?, ?, ?, ?)",
    )
    .run(userId, title, agentType, serializeTone(tone));

  const conversationId = Number(result.lastInsertRowid);
  return getConversation(userId, conversationId);
}

export function updateConversation(
  userId: number,
  conversationId: number,
  updates: { title?: string },
) {
  if (updates.title) {
    getDb()
      .prepare(
        `
        UPDATE conversations
        SET title = ?, updated_at = datetime('now')
        WHERE id = ? AND user_id = ?
      `,
      )
      .run(updates.title, conversationId, userId);
  } else {
    getDb()
      .prepare(
        `
        UPDATE conversations
        SET updated_at = datetime('now')
        WHERE id = ? AND user_id = ?
      `,
      )
      .run(conversationId, userId);
  }

  return getConversation(userId, conversationId);
}

export function listMessages(
  userId: number,
  conversationId: number,
): Message[] {
  const conversation = getConversation(userId, conversationId);
  if (!conversation) return [];

  const rows = getDb()
    .prepare(
      `
      SELECT *
      FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC
    `,
    )
    .all(conversationId) as MessageRow[];

  return rows.map(toMessage);
}

export function createMessage(
  userId: number,
  conversationId: number,
  role: "user" | "assistant",
  content: string,
) {
  const conversation = getConversation(userId, conversationId);
  if (!conversation) return null;

  const result = getDb()
    .prepare(
      "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)",
    )
    .run(conversationId, role, content);

  updateConversation(userId, conversationId, {});

  return getDb()
    .prepare("SELECT * FROM messages WHERE id = ?")
    .get(Number(result.lastInsertRowid)) as MessageRow;
}

export function deriveTitle(content: string) {
  const trimmed = content.trim().replace(/\s+/g, " ");
  if (!trimmed) return "New chat";
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}...` : trimmed;
}
