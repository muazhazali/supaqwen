import { Settings } from "../types";

export async function fetchQwen(settings: Settings, messages: { role: string; content: string }[]) {
  if (!settings.remoteEndpointEnabled || !settings.remoteEndpointUrl || !settings.apiKey) {
    // Local-first placeholder: no network call
    return { content: "[Local mode] Remote endpoint disabled." };
  }
  const url = settings.remoteEndpointUrl;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${settings.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: settings.model === "qwen-plus" ? "qwen-plus" : "qwen-lite",
      messages,
    }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Qwen API error: ${response.status} ${text}`);
  }
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content ?? "";
  return { content };
}


