export interface User {
  id: string;
  email: string;
}

export interface Document {
  id: string;
  filename: string;
  size: number;
  created_at: string;
  chunk_count: number;
}

export interface Citation {
  document_id: string;
  filename: string;
  chunk_text: string;
  score: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  retrieval_ms?: number;
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  messages: Message[];
}
