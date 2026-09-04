import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { RAGConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RAGConfig;
  onSaveConfig: (newConfig: RAGConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [form, setForm] = useState<RAGConfig>({ ...config });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Settings</div>
          <button className="sidebar-collapse-btn" onClick={onClose} title="Close">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Mock Mode Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              borderRadius: '8px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>Mock Mode</div>
                <div className="setting-desc">Simulate streaming & RAG offline</div>
              </div>
              <input
                type="checkbox"
                checked={form.mockMode}
                onChange={(e) => setForm({ ...form, mockMode: e.target.checked })}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#10a37f' }}
              />
            </div>

            {/* Backend URL */}
            <div className="setting-item" style={{ opacity: form.mockMode ? 0.5 : 1 }}>
              <label className="setting-label">VPS API URL</label>
              <input
                type="text"
                className="setting-input"
                value={form.backendUrl}
                disabled={form.mockMode}
                onChange={(e) => setForm({ ...form, backendUrl: e.target.value })}
                placeholder="http://localhost:8000"
              />
            </div>

            {/* Model Selector */}
            <div className="setting-item">
              <label className="setting-label">Model</label>
              <select
                className="setting-input"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              >
                <option value="Qwen 2.5 7B">Qwen 2.5 7B (Default)</option>
                <option value="Llama 3.1 8B">Llama 3.1 8B</option>
                <option value="Mistral 7B">Mistral 7B</option>
                <option value="Custom Model">Custom VPS Model</option>
              </select>
            </div>

            {/* Similarity Threshold */}
            <div className="setting-item">
              <div className="setting-label">
                <span>RAG Similarity Threshold</span>
                <span>{(form.similarityThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.90"
                step="0.05"
                value={form.similarityThreshold}
                onChange={(e) => setForm({ ...form, similarityThreshold: parseFloat(e.target.value) })}
                style={{ accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary-neu" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-neu">
              Save Parameters
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
