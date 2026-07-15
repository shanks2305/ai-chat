import { Message } from "./chat-types";
import { OpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { type AgentType, getSystemPrompt, type ToneType } from "./system-promt";

const baseURL = "http://localhost:11434/v1";

export default async function generateAiResponse(
  _content: string,
  model: string,
  conversationHistory: Message[],
  agentType: AgentType = "general",
  tone: ToneType | null = null,
) {
  const openai = new OpenAI({ baseURL, apiKey: "1234567890" });
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: getSystemPrompt(agentType, tone) },
    ...conversationHistory.map(
      (message): ChatCompletionMessageParam => ({
        role: message.role,
        content: message.content,
      }),
    ),
  ];
  const response = await openai.chat.completions.create({
    model,
    messages,
  });

  return {
    content: response.choices[0].message.content,
    role: response.choices[0].message.role,
  };
}