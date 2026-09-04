import type { Citation, DocumentItem, RAGConfig } from '../types';
import { getMockRAGResponse, INITIAL_DOCUMENTS } from './mockData';

export class APIService {
  private config: RAGConfig;

  constructor(config: RAGConfig) {
    this.config = config;
  }

  updateConfig(config: RAGConfig) {
    this.config = config;
  }

  /**
   * Send chat query and stream response back to UI
   */
  async streamChat(
    query: string,
    sessionId: string,
    onToken: (token: string) => void,
    onDone: (result: { content: string; citations: Citation[]; isFallback: boolean; similarity: number }) => void,
    onError: (error: Error) => void
  ) {
    if (this.config.mockMode) {
      // Execute Mock Streaming
      try {
        const mockResult = getMockRAGResponse(query, this.config.similarityThreshold);
        const tokens = mockResult.content.split(' ');
        let accumulated = '';

        for (let i = 0; i < tokens.length; i++) {
          const piece = (i === 0 ? '' : ' ') + tokens[i];
          accumulated += piece;
          onToken(piece);
          // Realistic jitter delay (15ms - 40ms)
          await new Promise((r) => setTimeout(r, Math.random() * 25 + 15));
        }

        onDone(mockResult);
      } catch (err) {
        onError(err as Error);
      }
      return;
    }

    // Live Mode with VPS Backend (SSE Stream)
    try {
      const response = await fetch(`${this.config.backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream'
        },
        body: JSON.stringify({
          query,
          session_id: sessionId,
          model: this.config.model,
          top_k: this.config.topK,
          similarity_threshold: this.config.similarityThreshold,
          system_prompt: this.config.systemPrompt,
          temperature: this.config.temperature
        })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by browser or backend');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let citations: Citation[] = [];
      let isFallback = false;
      let similarity = 0.0;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.token) {
                fullContent += parsed.token;
                onToken(parsed.token);
              }
              if (parsed.citations) {
                citations = parsed.citations;
              }
              if (parsed.is_fallback !== undefined) {
                isFallback = parsed.is_fallback;
              }
              if (parsed.similarity !== undefined) {
                similarity = parsed.similarity;
              }
            } catch {
              // Raw text chunk fallback
              fullContent += dataStr;
              onToken(dataStr);
            }
          }
        }
      }

      onDone({
        content: fullContent,
        citations,
        isFallback,
        similarity
      });
    } catch (err) {
      onError(err as Error);
    }
  }

  /**
   * Upload Document for Embedding
   */
  async uploadDocument(file: File): Promise<DocumentItem> {
    if (this.config.mockMode) {
      // Simulate indexing delay
      await new Promise((r) => setTimeout(r, 1200));
      const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr = Number(sizeMB) > 0 ? `${sizeMB} MB` : `${Math.round(file.size / 1024)} KB`;

      return {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: sizeStr,
        chunksCount: Math.floor(Math.random() * 25) + 8,
        uploadedAt: 'Just now',
        status: 'ready',
        type: ext as 'pdf' | 'docx' | 'txt' | 'csv' | 'md'
      };
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${this.config.backendUrl}/api/documents/upload`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.statusText}`);
    }

    return await res.json();
  }

  /**
   * Get List of Documents
   */
  async getDocuments(): Promise<DocumentItem[]> {
    if (this.config.mockMode) {
      return INITIAL_DOCUMENTS;
    }

    const res = await fetch(`${this.config.backendUrl}/api/documents`);
    if (!res.ok) throw new Error('Failed to fetch documents');
    return await res.json();
  }

  /**
   * Delete Document
   */
  async deleteDocument(docId: string): Promise<void> {
    if (this.config.mockMode) {
      return;
    }

    const res = await fetch(`${this.config.backendUrl}/api/documents/${docId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete document');
  }
}
