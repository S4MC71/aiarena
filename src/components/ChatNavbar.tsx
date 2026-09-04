import React from 'react';
import { 
  PanelLeft, 
  ChevronDown, 
  SquarePen,
  Sliders
} from 'lucide-react';
import type { RAGConfig } from '../types';

interface ChatNavbarProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  config: RAGConfig;
  onNewChat: () => void;
  onOpenSettings: () => void;
}

export const ChatNavbar: React.FC<ChatNavbarProps> = ({
  isSidebarCollapsed,
  onToggleSidebar,
  config,
  onNewChat,
  onOpenSettings
}) => {
  return (
    <header className="chat-header">
      <div className="header-left">
        {isSidebarCollapsed && (
          <button 
            className="header-icon-neu" 
            onClick={onToggleSidebar}
            title="Open Panel"
            id="expand-sidebar-btn"
          >
            <PanelLeft size={16} />
          </button>
        )}

        {/* Industrial Tactile Model Dial */}
        <button 
          className="model-dial-btn" 
          onClick={onOpenSettings}
          title="Change Inference Engine & Parameters"
          id="model-selector-pill"
        >
          <span className="status-dot-active" />
          <span>{config.model}</span>
          <ChevronDown size={13} style={{ opacity: 0.6, marginLeft: '2px' }} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          className="header-icon-neu"
          onClick={onNewChat}
          title="New session"
          id="navbar-new-chat-btn"
        >
          <SquarePen size={16} />
        </button>

        <button 
          className="header-icon-neu"
          onClick={onOpenSettings}
          title="Parameters"
          id="navbar-settings-btn"
        >
          <Sliders size={16} />
        </button>
      </div>
    </header>
  );
};
