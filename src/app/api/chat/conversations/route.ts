import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/api-auth";
import {
  createConversation,
  createMessage,
  listConversations,
  listMessages,
  updateConversation,
} from "@/lib/chat-db";
import generateAiResponse from "@/lib/generate-ai-response";
import { generateConversationTitle } from "@/lib/generate-conversation-title";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAuthUser();
  if (auth.response) return auth.response;

  const conversations = listConversations(auth.user.id);
  return NextResponse.json({ conversations });
}

export async function POST(request: Request) {
  const auth = await requireAuthUser();
  if (auth.response) return auth.response;

  try {
    const body = await request.json().catch(() => ({}));
    const content =
      typeof body.content === "string" ? body.content.trim() : "";
    const model = typeof body.model === "string" ? body.model.trim() : "";  
    if (!content || !model) {
      return NextResponse.json(
        { error: "Content and model are required" },
        { status: 400 },
      );
    }

    const conversation = createConversation(auth.user.id);
    if (!conversation) {
      return NextResponse.json(
        { error: "Failed to create conversation" },
        { status: 500 },
      );
    }

    const userRow = createMessage(
      auth.user.id,
      conversation.id,
      "user",
      content,
    );
    if (!userRow) {
      return NextResponse.json(
        { error: "Failed to save message" },
        { status: 500 },
      );
    }

    const conversationHistory = listMessages(auth.user.id, conversation.id);
    const [{ content: assistantContent, role: assistantRole }, title] =
      await Promise.all([
        generateAiResponse(content, model, conversationHistory),
        generateConversationTitle(content, model),
      ]);
    if (!assistantContent || !assistantRole) {
      return NextResponse.json(
        { error: "Failed to generate assistant content" },
        { status: 500 },
      );
    }

    const assistantRow = createMessage(
      auth.user.id,
      conversation.id,
      assistantRole,
      assistantContent,
    );

    if (!assistantRow) {
      return NextResponse.json(
        { error: "Failed to save messages" },
        { status: 500 },
      );
    }

    updateConversation(auth.user.id, conversation.id, { title });

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        title,
        updatedAt: "Today",
        preview: assistantContent,
      },
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
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
