import React from 'react';
import { X, Layers, FileText, CheckCircle2, Hash, BookOpen } from 'lucide-react';
import type { Citation } from '../types';

interface CitationInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  citations: Citation[];
  selectedCitationId?: string;
  onSelectCitation: (citation: Citation) => void;
}

export const CitationInspector: React.FC<CitationInspectorProps> = ({
  isOpen,
  onClose,
  citations,
  selectedCitationId,
  onSelectCitation
}) => {
  if (!isOpen) return null;

  return (
    <aside className="citation-drawer" id="citation-inspector-drawer">
      <div className="drawer-header">
        <div className="drawer-title">
          <Layers size={17} color="var(--accent-cyan)" />
          <span>Retrieved Context Chunks ({citations.length})</span>
        </div>
        <button 
          className="collapse-sidebar-btn" 
          onClick={onClose}
          title="Close Drawer"
          id="close-citation-drawer-btn"
        >
          <X size={16} />
        </button>
      </div>

      <div className="drawer-content">
        {citations.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60%',
            textAlign: 'center',
            color: 'var(--text-muted)',
            gap: '12px'
          }}>
            <BookOpen size={36} style={{ opacity: 0.4 }} />
            <p style={{ fontSize: '0.86rem' }}>No retrieved context for this message.</p>
            <span style={{ fontSize: '0.75rem' }}>Ask a question about HR, Q3 financials, or VPS to see cited document chunks!</span>
          </div>
        ) : (
          citations.map((cit, index) => {
            const isSelected = selectedCitationId === cit.id;
            const scorePercent = Math.round(cit.score * 100);

            return (
              <div
                key={cit.id || index}
                className={`citation-card ${isSelected ? 'highlighted' : ''}`}
                onClick={() => onSelectCitation(cit)}
                id={`citation-card-${cit.id || index}`}
                style={{ cursor: 'pointer' }}
              >
                <div className="citation-card-header">
                  <div className="citation-doc-name" title={cit.docName}>
                    <FileText size={14} color="var(--accent-violet)" style={{ flexShrink: 0 }} />
                    <span>{cit.docName}</span>
                  </div>
                  <span className="score-badge">
                    {scorePercent}% Match
                  </span>
                </div>

                {/* Chunk text preview */}
                <div className="citation-snippet">
                  "{cit.text}"
                </div>

                {/* Footer metadata */}
                <div className="citation-footer-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Hash size={12} />
                    <span>Chunk #{cit.chunkId}</span>
                  </span>
                  {cit.page && (
                    <span>Page {cit.page}</span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-emerald)' }}>
                    <CheckCircle2 size={11} />
                    <span>Vector DB Verified</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
