export type ModelId = "qwen-plus" | "qwen-lite" | "local";

export interface Settings {
  theme: "system" | "light" | "dark";
  language: string;
  model: ModelId;
  remoteEndpointEnabled: boolean;
  remoteEndpointUrl?: string;
  apiKey?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  folderId?: string;
}

export type Role = "user" | "assistant" | "system";

export interface Message {
  id: string;
  conversationId: string;
  role: Role;
  content: string;
  createdAt: number;
  notes?: string;
  pinned?: boolean;
}

export interface PromptTemplate {
  id: string;
  title: string;
  content: string;
  isFavorite?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SearchResult {
  messageId: string;
  conversationId: string;
  snippet: string;
  createdAt: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string | null;
  color?: string;
  createdAt: number;
  updatedAt: number;
}


