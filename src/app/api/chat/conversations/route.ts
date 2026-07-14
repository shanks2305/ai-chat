import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/api-auth";
import {
  createConversation,
  createMessage,
  deriveTitle,
  listConversations,
} from "@/lib/chat-db";
import { generateDummyResponse } from "@/lib/dummy-ai";

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

    if (!content) {
      const conversation = createConversation(auth.user.id);
      if (!conversation) {
        return NextResponse.json(
          { error: "Failed to create conversation" },
          { status: 500 },
        );
      }

      return NextResponse.json({
        conversation: {
          id: conversation.id,
          title: conversation.title,
          updatedAt: conversation.updated_at,
          preview: "No messages yet",
        },
      });
    }

    const title = deriveTitle(content);
    const conversation = createConversation(auth.user.id, title);
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
    const assistantContent = generateDummyResponse(content);
    const assistantRow = createMessage(
      auth.user.id,
      conversation.id,
      "assistant",
      assistantContent,
    );

    if (!userRow || !assistantRow) {
      return NextResponse.json(
        { error: "Failed to save messages" },
        { status: 500 },
      );
    }

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
