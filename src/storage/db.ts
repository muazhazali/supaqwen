import { openDB, IDBPDatabase } from "idb";
import { Conversation, Folder, Message, PromptTemplate, Settings } from "../types";

const DB_NAME = "qwen-chat";
const DB_VERSION = 1;

export interface QwenDB extends IDBPDatabase<unknown> {}

export async function getDb(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains("settings")) {
        const store = database.createObjectStore("settings", { keyPath: "id" });
        store.put({ id: "default", theme: "system", language: "en", model: "qwen-lite", remoteEndpointEnabled: false } satisfies Settings & { id: string });
      }
      if (!database.objectStoreNames.contains("conversations")) {
        database.createObjectStore("conversations", { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains("messages")) {
        const store = database.createObjectStore("messages", { keyPath: "id" });
        store.createIndex("byConversation", "conversationId");
        store.createIndex("byCreatedAt", "createdAt");
      }
      if (!database.objectStoreNames.contains("prompts")) {
        database.createObjectStore("prompts", { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains("folders")) {
        const store = database.createObjectStore("folders", { keyPath: "id" });
        store.createIndex("byParent", "parentId");
      }
    },
  });
}

export async function loadSettings(): Promise<Settings> {
  const db = await getDb();
  const record = await db.get("settings", "default");
  return (record as Settings) ?? { theme: "system", language: "en", model: "qwen-lite", remoteEndpointEnabled: false };
}

export async function saveSettings(next: Settings): Promise<void> {
  const db = await getDb();
  await db.put("settings", { id: "default", ...next });
}

export async function listConversations(): Promise<Conversation[]> {
  const db = await getDb();
  return ((await db.getAll("conversations")) as Conversation[]).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function upsertConversation(conversation: Conversation): Promise<void> {
  const db = await getDb();
  await db.put("conversations", conversation);
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(["conversations", "messages"], "readwrite");
  await tx.objectStore("conversations").delete(conversationId);
  const idx = tx.objectStore("messages").index("byConversation");
  let cursor = await idx.openCursor(conversationId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const db = await getDb();
  const messages = (await db.getAllFromIndex("messages", "byConversation", conversationId)) as Message[];
  return messages.sort((a, b) => a.createdAt - b.createdAt);
}

export async function addMessage(message: Message): Promise<void> {
  const db = await getDb();
  await db.put("messages", message);
}

export async function updateMessage(message: Message): Promise<void> {
  const db = await getDb();
  await db.put("messages", message);
}

export async function listPrompts(): Promise<PromptTemplate[]> {
  const db = await getDb();
  const prompts = (await db.getAll("prompts")) as PromptTemplate[];
  return prompts.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function upsertPrompt(prompt: PromptTemplate): Promise<void> {
  const db = await getDb();
  await db.put("prompts", prompt);
}

export async function deletePrompt(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("prompts", id);
}

export async function listFolders(parentId: string | null = null): Promise<Folder[]> {
  const db = await getDb();
  const idx = db.transaction("folders").store.index("byParent");
  const folders = (await idx.getAll(parentId)) as Folder[];
  return folders.sort((a, b) => a.name.localeCompare(b.name));
}

export async function upsertFolder(folder: Folder): Promise<void> {
  const db = await getDb();
  await db.put("folders", folder);
}

export async function deleteFolder(folderId: string): Promise<void> {
  const db = await getDb();
  await db.delete("folders", folderId);
}

export async function searchMessages(query: string): Promise<Message[]> {
  const db = await getDb();
  const all = (await db.getAll("messages")) as Message[];
  const q = query.toLowerCase();
  return all.filter((m) => m.content.toLowerCase().includes(q) || (m.notes ?? "").toLowerCase().includes(q));
}


