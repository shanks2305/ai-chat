import { OpenAI } from "openai";
import { deriveTitle } from "./chat-db";
import { openaiBaseURL } from "./openai-config";

function normalizeTitle(title: string) {
  const trimmed = title.trim().replace(/^["'`]+|["'`]+$/g, "").replace(/\s+/g, " ");
  if (!trimmed) return "";
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}...` : trimmed;
}

export async function generateConversationTitle(
  userMessage: string,
  model: string,
) {
  try {
    const openai = new OpenAI({ baseURL: openaiBaseURL, apiKey: "1234567890" });
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "Generate a short, descriptive title for a chat conversation based on the user's first message. Reply with only the title: 3-8 words, no quotes, no trailing punctuation, no explanation.",
        },
        { role: "user", content: userMessage },
      ],
      max_tokens: 30,
    });

    const title = normalizeTitle(response.choices[0].message.content ?? "");
    return title || deriveTitle(userMessage);
  } catch (error) {
    console.error("Generate conversation title error:", error);
    return deriveTitle(userMessage);
  }
}
