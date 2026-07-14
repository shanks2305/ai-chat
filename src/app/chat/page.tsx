import { ChatPage } from "@/components/chat/chat-page";
import getAiList from "@/lib/ai-list";

export default async function ChatRoute() {
  const models = await getAiList();

  return <ChatPage models={models} />;
}
