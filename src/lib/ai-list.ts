export type AiModel = {
  model: string;
  name: string;
};

export default async function getAiList(): Promise<AiModel[]> {
  const list = [
    { model: "llama3.2:latest", name: "Llama 3.2" },
    { model: "phi3:latest", name: "Phi 3" },
    { model: "gemma3:270m", name: "Gemma 3" },
  ];
  return list;
}
