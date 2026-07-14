import { Message } from "./chat-types";
import { OpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { systemPrompt } from "./system-promt";

const baseURL = "http://localhost:11434/v1";

export default async function generateAiResponse(
  _content: string,
  model: string,
  conversationHistory: Message[],
) {
  const openai = new OpenAI({ baseURL, apiKey: "1234567890" });
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map(
      (message): ChatCompletionMessageParam => ({
        role: message.role,
        content: message.content,
      }),
    ),
  ];
  console.log(messages);
  const response = await openai.chat.completions.create({
    model,
    messages,
  });

  return {
    content: response.choices[0].message.content,
    role: response.choices[0].message.role,
  };
}