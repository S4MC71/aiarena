import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatNavbar } from './components/ChatNavbar';
import { MessageItem } from './components/MessageItem';
import { KnowledgeBaseModal } from './components/KnowledgeBaseModal';
import { SettingsModal } from './components/SettingsModal';
import { ChatInput } from './components/ChatInput';
import { APIService } from './services/apiService';
import { INITIAL_DOCUMENTS } from './services/mockData';
import type { ChatSession, Message, DocumentItem, RAGConfig } from './types';
import { ShieldCheck } from 'lucide-react';

const DEFAULT_CONFIG: RAGConfig = {
  mockMode: false,
  backendUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000',
  model: 'qwen2.5:14b',
  topK: 4,
  similarityThreshold: 0.50,
  systemPrompt: 'You are the official AI Assistant for Arena Web Security students. You assist students with course modules, class schedules, lab VPN setup, and ethical hacking concepts with safe, educational guidance.',
  temperature: 0.2
};

const INITIAL_SESSIONS: ChatSession[] = [
  {
    id: 'session-1',
    title: 'Lab & OpenVPN Setup Guide',
    createdAt: 'Today',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Arena প্র্যাকটিস ল্যাবে কিভাবে VPN কানেক্ট করব?',
        timestamp: '10:15 AM'
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `**Arena Practice Lab**-এ যুক্ত হওয়ার নির্দেশিকা নিচে দেওয়া হলো:

### 🔌 VPN কানেকশন স্টেপস (Kali Linux / Ubuntu):
1. **VPN ফাইল ডাউনলোড**: আপনার Student Portal ড্যাশবোর্ডে গিয়ে **Download VPN Config** থেকে \`arena-student.ovpn\` ফাইলটি ডাউনলোড করুন।
2. **টার্মিনাল থেকে রান করুন**:
\`\`\`bash
# OpenVPN দিয়ে কানেক্ট করার কমান্ড
sudo openvpn --config arena-student.ovpn
\`\`\`
3. **কানেকশন ভেরিফিকেশন**: টার্মিনালে \`Initialization Sequence Completed\` দেখার পর আরেকটি ট্যাবে ল্যাব গেটওয়ে টেস্ট করুন:
\`\`\`bash
ping -c 3 10.10.10.1
\`\`\`
সফল হলে আপনার ট্রাফিক সরাসরি এরিনার ডেডিকেটেড ল্যাব নেটওয়ার্কে যুক্ত হয়ে যাবে।

### ⚠️ ল্যাব রুলস ও রিসেট গাইড:
* টার্গেট মেশিনগুলো প্রতি **২ ঘণ্টা পর পর অটো-রিসেট** হয়।
* কোনো টার্গেট আইপি রেসপন্স না করলে পোর্টাল ড্যাশবোর্ড থেকে **"Reset Instance"** বাটনে ক্লিক করে নতুন ক্লিন মেশিন চালু করতে পারবেন।`,
        timestamp: '10:15 AM',
        status: 'done' as const,
        isFallback: false,
        citations: []
      }
    ]
  },
  {
    id: 'session-2',
    title: 'Course Syllabus & Modules',
    createdAt: 'Yesterday',
    messages: []
  }
];

export const App: React.FC = () => {
  const [config, setConfig] = useState<RAGConfig>(() => {
    const saved = localStorage.getItem('arena_rag_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          mockMode: false,
          model: 'qwen2.5:14b',
          backendUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000'
        };
      } catch (e) {
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    // Reset to cybersec docs if old hr docs exist
    const saved = localStorage.getItem('arena_rag_docs');
    if (saved && !saved.includes('Company_HR')) {
      return JSON.parse(saved);
    }
    return INITIAL_DOCUMENTS;
  });

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('arena_rag_sessions_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_SESSIONS;
  });
  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0]?.id || 'session-1');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [kbModalOpen, setKbModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiServiceRef = useRef<APIService>(new APIService(config));

  useEffect(() => {
    apiServiceRef.current.updateConfig(config);
    localStorage.setItem('arena_rag_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('arena_rag_sessions_v3', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('arena_rag_docs', JSON.stringify(documents));
  }, [documents]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isStreaming]);

  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'নতুন সেশন',
      createdAt: 'Just now',
      messages: []
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== id);
    if (updated.length === 0) {
      handleNewChat();
    } else {
      setSessions(updated);
      if (activeSessionId === id) {
        setActiveSessionId(updated[0].id);
      }
    }
  };

  const handleSendMessage = async (queryText: string) => {
    if (!activeSession) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const assistantPlaceholderId = `msg-asst-${Date.now()}`;
    const assistantPlaceholder: Message = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'streaming' as const
    };

    const isFirst = activeSession.messages.length === 0;
    const sessionTitle = isFirst ? (queryText.length > 24 ? queryText.slice(0, 24) + '...' : queryText) : activeSession.title;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: sessionTitle,
            messages: [...s.messages, userMessage, assistantPlaceholder]
          };
        }
        return s;
      })
    );

    setIsStreaming(true);

    await apiServiceRef.current.streamChat(
      queryText,
      activeSessionId,
      (token: string) => {
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              const updatedMessages = s.messages.map((m) => {
                if (m.id === assistantPlaceholderId) {
                  return {
                    ...m,
                    content: m.content + token
                  };
                }
                return m;
              });
              return { ...s, messages: updatedMessages };
            }
            return s;
          })
        );
      },
      (result) => {
        setIsStreaming(false);
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              const updatedMessages = s.messages.map((m) => {
                if (m.id === assistantPlaceholderId) {
                  return {
                    ...m,
                    content: result.content,
                    citations: result.citations,
                    isFallback: result.isFallback,
                    similarity: result.similarity,
                    status: 'done' as const
                  };
                }
                return m;
              });
              return { ...s, messages: updatedMessages };
            }
            return s;
          })
        );
      },
      (error) => {
        setIsStreaming(false);
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              const updatedMessages = s.messages.map((m) => {
                if (m.id === assistantPlaceholderId) {
                  return {
                    ...m,
                    content: `[সার্ভার ত্রুটি]: ${error.message}। সেটিংস থেকে মক মোড টেস্ট করতে পারেন।`,
                    status: 'error' as const
                  };
                }
                return m;
              });
              return { ...s, messages: updatedMessages };
            }
            return s;
          })
        );
      }
    );
  };

  const handleStopStreaming = () => {
    setIsStreaming(false);
  };

  const handleUploadFile = async (file: File) => {
    const newDoc = await apiServiceRef.current.uploadDocument(file);
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleDeleteDocument = async (id: string) => {
    await apiServiceRef.current.deleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        documents={documents}
        onOpenKnowledgeBase={() => setKbModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        config={config}
      />

      {/* Main Viewport */}
      <main className="chat-main">
        <ChatNavbar
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(false)}
          config={config}
          onNewChat={handleNewChat}
          onOpenSettings={() => setSettingsModalOpen(true)}
        />

        {/* Messages */}
        <div className="messages-scroll">
          {(!activeSession || activeSession.messages.length === 0) ? (
            /* Student AI Assistant Welcome Hero */
            <div className="empty-chat-hero">
              <div className="hero-neu-emblem">
                <ShieldCheck size={28} />
              </div>
              <h1 className="empty-chat-title">Arena Web Security AI</h1>
              <p className="empty-chat-sub">
                কোর্স সিলেবাস, লাইভ ক্লাসের রুটিন, প্র্যাকটিস ল্যাব VPN কানেকশন এবং সাইবার সিকিউরিটি টপিক নিয়ে যেকোনো প্রশ্ন জিজ্ঞাসা করুন।
              </p>
              <div className="starter-chips-container">
                <button
                  className="starter-chip-neu"
                  onClick={() => handleSendMessage('Web Security কোর্সের সিলেবাস ও মডিউলগুলো কি কি?')}
                >
                  🛡️ "কোর্সের সিলেবাস ও মডিউলগুলো কি কি?"
                </button>
                <button
                  className="starter-chip-neu"
                  onClick={() => handleSendMessage('Arena প্র্যাকটিস ল্যাব ও VPN কিভাবে কানেক্ট করব?')}
                >
                  🔑 "প্র্যাকটিস ল্যাব ও VPN কানেক্ট করার নিয়ম"
                </button>
                <button
                  className="starter-chip-neu"
                  onClick={() => handleSendMessage('লাইভ ক্লাসের শিডিউল ও রেকর্ডিং পাওয়ার নিয়ম কি?')}
                >
                  📅 "ক্লাসের রুটিন ও রেকর্ডিং কবে পাওয়া যাবে?"
                </button>
                <button
                  className="starter-chip-neu"
                  onClick={() => handleSendMessage('SQL Injection এবং XSS-এর মধ্যে মূল পার্থক্য কি?')}
                >
                  ⚔️ "SQLi বনাম XSS ভালনারেবিলিটির তফাত কি?"
                </button>
              </div>
            </div>
          ) : (
            <div className="messages-inner">
              {activeSession.messages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          onStopStreaming={handleStopStreaming}
          onOpenKnowledgeBase={() => setKbModalOpen(true)}
        />
      </main>

      {/* Modals */}
      <KnowledgeBaseModal
        isOpen={kbModalOpen}
        onClose={() => setKbModalOpen(false)}
        documents={documents}
        onUploadFile={handleUploadFile}
        onDeleteDocument={handleDeleteDocument}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        config={config}
        onSaveConfig={(newConfig) => setConfig(newConfig)}
      />
    </div>
  );
};

export default App;
