import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/api-auth";
import {
  createMessage,
  getConversation,
  listMessages,
  updateConversation,
} from "@/lib/chat-db";
import generateAiResponse from "@/lib/generate-ai-response";
import { generateConversationTitle } from "@/lib/generate-conversation-title";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAuthUser();
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const conversationId = Number(id);
  if (!conversationId) {
    return NextResponse.json(
      { error: "Invalid conversation id" },
      { status: 400 },
    );
  }

  const conversation = getConversation(auth.user.id, conversationId);
  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 },
    );
  }

  const messages = listMessages(auth.user.id, conversationId);
  return NextResponse.json({ messages });
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAuthUser();
  if (auth.response) return auth.response;

  try {
    const { id } = await context.params;
    const conversationId = Number(id);
    if (!conversationId) {
      return NextResponse.json(
        { error: "Invalid conversation id" },
        { status: 400 },
      );
    }

    const conversation = getConversation(auth.user.id, conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const content =
      typeof body.content === "string" ? body.content.trim() : "";
    const model = typeof body.model === "string" ? body.model.trim() : "";

    if (!content || !model) {
      return NextResponse.json(
        { error: "Message content and model are required" },
        { status: 400 },
      );
    }

    const userRow = createMessage(
      auth.user.id,
      conversationId,
      "user",
      content,
    );
    if (!userRow) {
      return NextResponse.json(
        { error: "Failed to save message" },
        { status: 500 },
      );
    }

    const conversationHistory = listMessages(auth.user.id, conversationId);
    const needsTitle = conversation.title === "New chat";
    const [{ content: assistantContent, role: assistantRole }, title] =
      await Promise.all([
        generateAiResponse(content, model, conversationHistory),
        needsTitle
          ? generateConversationTitle(content, model)
          : Promise.resolve(null),
      ]);
    if (!assistantContent || !assistantRole) {
      return NextResponse.json(
        { error: "Failed to generate assistant content" },
        { status: 500 },
      );
    }

    const assistantRow = createMessage(
      auth.user.id,
      conversationId,
      assistantRole,
      assistantContent,
    );
    if (!assistantRow) {
      return NextResponse.json(
        { error: "Failed to save assistant response" },
        { status: 500 },
      );
    }

    if (title) {
      updateConversation(auth.user.id, conversationId, { title });
    } else {
      updateConversation(auth.user.id, conversationId, {});
    }

    return NextResponse.json({
      messages: [
        {
          id: userRow.id,
          role: userRow.role,
          content: userRow.content,
          createdAt: userRow.created_at,
        },
        {
          id: assistantRow.id,
          role: assistantRow.role,
          content: assistantRow.content,
          createdAt: assistantRow.created_at,
        },
      ],
    });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
