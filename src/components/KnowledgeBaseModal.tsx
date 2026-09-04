import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Trash2, 
  CheckCircle2
} from 'lucide-react';
import type { DocumentItem } from '../types';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  onUploadFile: (file: File) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  documents,
  onUploadFile,
  onDeleteDocument
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      try {
        await onUploadFile(e.target.files[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Knowledge Base</div>
          <button 
            className="sidebar-collapse-btn" 
            onClick={onClose}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* File Upload Bar */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt,.csv,.md"
            style={{ display: 'none' }}
          />

          <button
            className="btn-secondary-neu"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <UploadCloud size={16} />
            <span>{uploading ? 'Processing document...' : 'Upload Document (PDF, TXT, DOCX)'}</span>
          </button>

          {/* Clean Document List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Indexed Files ({documents.length})
            </div>

            {documents.length === 0 ? (
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                No files uploaded yet.
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.86rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <FileText size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> Ready
                    </span>
                    <button
                      className="history-item-delete"
                      style={{ opacity: 1 }}
                      onClick={() => onDeleteDocument(doc.id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary-neu" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
