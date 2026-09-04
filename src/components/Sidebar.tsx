import React from 'react';
import { 
  Plus, 
  Trash2, 
  Sliders, 
  Database,
  PanelLeftClose,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import type { ChatSession, DocumentItem, RAGConfig } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  documents: DocumentItem[];
  onOpenKnowledgeBase: () => void;
  onOpenSettings: () => void;
  config: RAGConfig;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isCollapsed,
  onToggleCollapse,
  documents,
  onOpenKnowledgeBase,
  onOpenSettings
}) => {
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Industrial Brand Top */}
      <div className="sidebar-top">
        <div className="brand-slot">
          <div className="brand-icon-box">
            <ShieldCheck size={18} />
          </div>
          <div className="brand-name">
            <span>ARENA</span>
            <span style={{ color: 'var(--accent-cyan)' }}>//</span>
            <span>SEC</span>
            <span className="brand-tech-tag">ACADEMY</span>
          </div>
        </div>

        <button 
          className="header-icon-neu" 
          onClick={onToggleCollapse} 
          title="Collapse Panel"
          id="collapse-sidebar-btn"
          style={{ width: '28px', height: '28px' }}
        >
          <PanelLeftClose size={15} />
        </button>
      </div>

      {/* Tactile Neumorphic New Chat Button */}
      <button 
        className="btn-new-chat-neu" 
        onClick={onNewChat}
        id="new-chat-btn"
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} color="var(--accent-cyan)" />
          <span>New Session</span>
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.66rem',
          color: 'var(--text-muted)',
          background: 'var(--bg-inset)',
          padding: '2px 6px',
          borderRadius: '4px'
        }}>+N</span>
      </button>

      {/* History Items with Industrial Neumorphic Inset */}
      <div className="history-scroll-area">
        <div className="history-category-label">Active Threads</div>
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`history-tactile-item ${session.id === activeSessionId ? 'active' : ''}`}
            onClick={() => onSelectSession(session.id)}
            id={`session-item-${session.id}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
              <MessageSquare size={13} style={{ opacity: session.id === activeSessionId ? 1 : 0.5, flexShrink: 0 }} />
              <span className="history-item-title">{session.title}</span>
            </div>
            <button
              className="history-delete-btn"
              onClick={(e) => onDeleteSession(session.id, e)}
              title="Delete session"
              id={`delete-session-${session.id}`}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Industrial Footer Tools */}
      <div className="sidebar-footer">
        <button 
          className="footer-neu-btn" 
          onClick={onOpenKnowledgeBase}
          id="sidebar-kb-btn"
        >
          <Database size={15} color="var(--accent-cyan)" />
          <span style={{ flex: 1, textAlign: 'left' }}>Vector Knowledge Base</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--accent-steel)',
            background: 'var(--bg-inset)',
            padding: '1px 6px',
            borderRadius: '4px'
          }}>{documents.length}</span>
        </button>

        <button 
          className="footer-neu-btn" 
          onClick={onOpenSettings}
          id="sidebar-settings-btn"
        >
          <Sliders size={15} style={{ opacity: 0.8 }} />
          <span style={{ flex: 1, textAlign: 'left' }}>System Parameters</span>
        </button>
      </div>
    </aside>
  );
};
