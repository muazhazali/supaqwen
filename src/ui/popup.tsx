import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import dayjs from "dayjs";
import { addMessage, getMessages, listConversations, loadSettings, searchMessages, upsertConversation, updateMessage } from "../storage/db";
import { Conversation, Message, Role, Settings } from "../types";
import { generateId } from "../utils/id";
import { downloadText, exportConversationAsJSON, exportConversationAsMarkdown } from "../utils/export";

function useAsync<T>(fn: () => Promise<T>, deps: React.DependencyList) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fn()
      .then((d) => mounted && setData(d))
      .catch((e) => mounted && setError(e))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, deps);
  return { data, loading, error } as const;
}

async function ensureDefaultConversation(): Promise<Conversation> {
  const list = await listConversations();
  if (list.length > 0) return list[0];
  const now = Date.now();
  const conv: Conversation = {
    id: generateId("conv"),
    title: "New Chat",
    createdAt: now,
    updatedAt: now,
  };
  await upsertConversation(conv);
  return conv;
}

function Chat() {
  const { data: settings } = useAsync<Settings>(loadSettings, []);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Message[] | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const conv = await ensureDefaultConversation();
      setConversation(conv);
      const msgs = await getMessages(conv.id);
      setMessages(msgs);
    })();
  }, []);

  useEffect(() => {
    const handler = (msg: any) => {
      if (msg?.type === "qwen/append" && typeof msg.text === "string") {
        setInput((t) => (t ? t + "\n" : "") + msg.text);
      }
    };
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(role: Role, content: string) {
    if (!conversation) return;
    const msg: Message = {
      id: generateId("msg"),
      conversationId: conversation.id,
      role,
      content,
      createdAt: Date.now(),
    };
    await addMessage(msg);
    setMessages((m) => [...m, msg]);
  }

  async function onSubmit() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await send("user", text);
    // MVP: local echo assistant to prove offline path; replace with API/local model later
    await send("assistant", `Echo: ${text}`);
  }

  async function onSearch() {
    const q = search.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }
    const results = await searchMessages(q);
    setSearchResults(results);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <header style={{ padding: 8, borderBottom: "1px solid #eee", display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ fontWeight: 600 }}>Qwen Chat</div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search messages"
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          style={{ marginLeft: "auto" }}
        />
        <button onClick={onSearch}>Search</button>
      </header>
      <div ref={listRef} style={{ flex: 1, overflow: "auto", padding: 8 }}>
        {(searchResults ?? messages).map((m) => (
          <div key={m.id} style={{ marginBottom: 8, border: "1px solid #eee", borderRadius: 6, padding: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ fontSize: 12, opacity: 0.7, flex: 1 }}>
                {m.role} · {dayjs(m.createdAt).format("HH:mm:ss")}
              </div>
              <button onClick={() => { setEditingMessageId(m.id); setEditingText(m.notes ?? ""); }}>Notes</button>
            </div>
            <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{m.content}</div>
            {m.notes && (
              <div style={{ marginTop: 6, padding: 6, background: "#fafafa", border: "1px dashed #ddd" }}>
                <strong>Notes:</strong>
                <div style={{ whiteSpace: "pre-wrap" }}>{m.notes}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, padding: 8, borderTop: "1px solid #eee", alignItems: "center" }}>
        <button
          disabled={!conversation}
          onClick={async () => {
            if (!conversation) return;
            const msgs = await getMessages(conversation.id);
            downloadText(`${conversation.title}.json`, exportConversationAsJSON(conversation, msgs));
          }}
        >
          Export JSON
        </button>
        <button
          disabled={!conversation}
          onClick={async () => {
            if (!conversation) return;
            const msgs = await getMessages(conversation.id);
            downloadText(`${conversation.title}.md`, exportConversationAsMarkdown(conversation, msgs));
          }}
        >
          Export MD
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        style={{ display: "flex", gap: 8, padding: 8, borderTop: "1px solid #eee" }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          style={{ flex: 1 }}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>

      {editingMessageId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setEditingMessageId(null)}
        >
          <div
            style={{ background: "white", padding: 16, borderRadius: 8, width: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ marginTop: 0 }}>Edit Notes</h4>
            <textarea
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              rows={6}
              style={{ width: "100%" }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={() => setEditingMessageId(null)}>Cancel</button>
              <button
                onClick={async () => {
                  const target = messages.find((m) => m.id === editingMessageId);
                  if (!target) return;
                  const updated = { ...target, notes: editingText };
                  await updateMessage(updated);
                  setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
                  setEditingMessageId(null);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<Chat />);


