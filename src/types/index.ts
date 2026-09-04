export interface Citation {
  id: string;
  docId: string;
  docName: string;
  chunkId: number;
  score: number; // 0.0 - 1.0 (e.g. 0.89 for 89%)
  page?: number;
  text: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  status?: 'sending' | 'streaming' | 'done' | 'error';
  citations?: Citation[];
  isFallback?: boolean; // True if answer was generated without Knowledge Base match
  similarity?: number; // Top similarity score
  tokensUsed?: number;
}

export interface DocumentItem {
  id: string;
  name: string;
  size: string;
  chunksCount: number;
  uploadedAt: string;
  status: 'indexing' | 'ready' | 'error';
  type: 'pdf' | 'docx' | 'txt' | 'csv' | 'md';
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
}

export interface RAGConfig {
  mockMode: boolean;
  backendUrl: string;
  model: string;
  topK: number;
  similarityThreshold: number;
  systemPrompt: string;
  temperature: number;
}
