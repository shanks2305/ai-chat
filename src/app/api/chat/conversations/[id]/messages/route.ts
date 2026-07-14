import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/api-auth";
import {
  createMessage,
  deriveTitle,
  getConversation,
  listMessages,
  updateConversation,
} from "@/lib/chat-db";
import { generateDummyResponse } from "@/lib/dummy-ai";

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

    if (!content) {
      return NextResponse.json(
        { error: "Message content is required" },
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

    const assistantContent = generateDummyResponse(content);
    const assistantRow = createMessage(
      auth.user.id,
      conversationId,
      "assistant",
      assistantContent,
    );
    if (!assistantRow) {
      return NextResponse.json(
        { error: "Failed to save assistant response" },
        { status: 500 },
      );
    }

    if (conversation.title === "New chat") {
      updateConversation(auth.user.id, conversationId, {
        title: deriveTitle(content),
      });
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
