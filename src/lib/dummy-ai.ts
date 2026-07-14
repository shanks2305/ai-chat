const DUMMY_RESPONSES = [
  "Thanks for your message! This is a dummy response — connect a real AI provider when you're ready.",
  "That's an interesting question. Here's a placeholder answer while the AI backend is not connected yet.",
  "I received your message. In production, this would be a streamed response from an LLM.",
  "Good point! For now I'm returning canned text, but the chat route and database persistence are working.",
  "Here's a sample reply: your message was saved to SQLite and this assistant response is generated server-side.",
];

export function generateDummyResponse(userMessage: string) {
  const index =
    Math.abs(
      userMessage.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0),
    ) % DUMMY_RESPONSES.length;

  return DUMMY_RESPONSES[index];
}
