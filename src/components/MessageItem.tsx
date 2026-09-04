import React, { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Message } from '../types';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleCopy = () => {
    // Copy clean text without any bracket markers
    const clean = message.content.replace(/\[\[\d+\]\]/g, '').replace(/\[\d+\]/g, '');
    navigator.clipboard.writeText(clean);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Render clean markdown and code blocks
   */
  const renderFormattedContent = (content: string) => {
    // Strip citation markers [[1]], [[2]], etc. so the output is 100% clean
    const cleanContent = content.replace(/\[\[\d+\]\]/g, '').replace(/\s{2,}/g, ' ');
    const parts = cleanContent.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const language = lines[0].trim();
        const codeText = lines.slice(1).join('\n');

        return (
          <div key={index} style={{ margin: '14px 0' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-inset)',
              padding: '6px 14px',
              borderTopLeftRadius: '10px',
              borderTopRightRadius: '10px',
              border: '1px solid var(--border-subtle)',
              borderBottom: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'var(--accent-steel)'
            }}>
              <span>{language || 'TERMINAL'}</span>
              <button
                className="msg-action-btn-neu"
                onClick={() => navigator.clipboard.writeText(codeText)}
                title="Copy code"
              >
                <Copy size={12} />
              </button>
            </div>
            <pre style={{ margin: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      const lines = part.split('\n');
      return (
        <div key={index}>
          {lines.map((line, lIdx) => {
            if (!line.trim()) return <div key={lIdx} style={{ height: '8px' }} />;

            if (line.startsWith('### ')) {
              return <h3 key={lIdx}>{parseBoldItalic(line.replace('### ', ''))}</h3>;
            }
            if (line.startsWith('## ')) {
              return <h2 key={lIdx}>{parseBoldItalic(line.replace('## ', ''))}</h2>;
            }
            if (line.startsWith('# ')) {
              return <h1 key={lIdx}>{parseBoldItalic(line.replace('# ', ''))}</h1>;
            }

            if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
              return (
                <div key={lIdx} style={{ display: 'flex', gap: '8px', marginBottom: '4px', paddingLeft: '4px' }}>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>•</span>
                  <span>{parseBoldItalic(line.trim().slice(2))}</span>
                </div>
              );
            }

            if (line.startsWith('> ')) {
              return (
                <blockquote key={lIdx}>
                  {parseBoldItalic(line.replace('> ', ''))}
                </blockquote>
              );
            }

            return <p key={lIdx}>{parseBoldItalic(line)}</p>;
          })}
        </div>
      );
    });
  };

  const parseBoldItalic = (raw: string): React.ReactNode => {
    const boldParts = raw.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**')) {
        return <strong key={bIdx} style={{ color: '#fff', fontWeight: 600 }}>{bPart.slice(2, -2)}</strong>;
      }
      const codeParts = bPart.split(/(`.*?`)/g);
      return codeParts.map((cPart, cIdx) => {
        if (cPart.startsWith('`') && cPart.endsWith('`')) {
          return <code key={cIdx}>{cPart.slice(1, -1)}</code>;
        }
        return cPart;
      });
    });
  };

  return (
    <div className={`msg-row ${isUser ? 'user' : 'assistant'}`}>
      {isUser ? (
        /* User Neumorphic Raised Bubble */
        <div className="user-bubble">
          {message.content}
        </div>
      ) : (
        /* Assistant Clean Answer */
        <div className="assistant-card">
          {renderFormattedContent(message.content)}
          {message.status === 'streaming' && (
            <span style={{
              display: 'inline-block',
              width: '6px',
              height: '14px',
              backgroundColor: 'var(--accent-cyan)',
              boxShadow: '0 0 8px var(--accent-cyan)',
              marginLeft: '4px',
              verticalAlign: 'middle',
              animation: 'blink 1s infinite'
            }} />
          )}

          {/* Clean Action Row */}
          {message.status !== 'streaming' && (
            <div className="msg-actions">
              <button className="msg-action-btn-neu" onClick={handleCopy} title="Copy text">
                {copied ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button 
                className="msg-action-btn-neu" 
                onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                style={{ color: feedback === 'up' ? 'var(--accent-emerald)' : undefined }}
              >
                <ThumbsUp size={13} />
              </button>
              <button 
                className="msg-action-btn-neu" 
                onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                style={{ color: feedback === 'down' ? 'var(--accent-danger)' : undefined }}
              >
                <ThumbsDown size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
