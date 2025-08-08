import { Conversation, Message } from "../types";

export function exportConversationAsJSON(conversation: Conversation, messages: Message[]): string {
  const data = { conversation, messages };
  return JSON.stringify(data, null, 2);
}

export function exportConversationAsMarkdown(conversation: Conversation, messages: Message[]): string {
  const lines: string[] = [];
  lines.push(`# ${conversation.title}`);
  lines.push("");
  for (const m of messages) {
    lines.push(`## ${m.role} (${new Date(m.createdAt).toLocaleString()})`);
    lines.push("");
    lines.push(m.content);
    if (m.notes) {
      lines.push("");
      lines.push(`> Notes: ${m.notes}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


