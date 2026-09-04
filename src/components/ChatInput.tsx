import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square, Plus } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  onOpenKnowledgeBase: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  onOpenKnowledgeBase
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!text.trim() || isStreaming) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="input-capsule-wrapper">
      {/* Sunken/Inset Industrial Tray */}
      <div className="input-tray-inset">
        <button 
          className="header-icon-neu" 
          onClick={onOpenKnowledgeBase}
          title="Upload or Query Knowledge Base"
          id="attach-file-btn"
          style={{ width: '32px', height: '32px', borderRadius: '8px' }}
        >
          <Plus size={16} />
        </button>

        <textarea
          ref={textareaRef}
          className="input-textarea-clean"
          rows={1}
          placeholder="Query intelligence base, system policies, or technical data..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          id="chat-user-input"
        />

        {/* Tactile Send Button */}
        {isStreaming ? (
          <button
            className="btn-send-neu"
            onClick={onStopStreaming}
            title="Halt Generation"
            id="stop-generation-btn"
            style={{ color: 'var(--accent-danger)' }}
          >
            <Square size={14} fill="currentColor" />
          </button>
        ) : (
          <button
            className="btn-send-neu"
            onClick={handleSubmit}
            disabled={!text.trim()}
            title="Execute Query (Enter)"
            id="send-message-btn"
          >
            <ArrowUp size={16} />
          </button>
        )}
      </div>

      <div className="input-disclaimer">
        RAG ENGINE • SIMILARITY SEARCH • BGE-M3 1024-D • VERIFY SOURCED CONTEXT
      </div>
    </div>
  );
};
