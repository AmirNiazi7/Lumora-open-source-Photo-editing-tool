// Lumora Studio - Keyboard Shortcuts Guide
import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'V', desc: 'Move Tool & Transform' },
    { key: 'M', desc: 'Rectangular Marquee Select' },
    { key: 'C', desc: 'Crop Tool' },
    { key: 'B', desc: 'Brush Tool' },
    { key: 'E', desc: 'Eraser Tool' },
    { key: 'T', desc: 'Type / Text Tool' },
    { key: 'U', desc: 'Rectangle / Shape Tool' },
    { key: 'I', desc: 'Eyedropper Tool' },
    { key: 'H', desc: 'Hand Tool (Pan Canvas)' },
    { key: 'Z', desc: 'Zoom Tool' },
    { key: 'Space + Drag', desc: 'Quick Pan Canvas' },
    { key: 'Ctrl + Z', desc: 'Undo' },
    { key: 'Ctrl + Y / Shift+Z', desc: 'Redo' },
    { key: 'Ctrl + J', desc: 'Duplicate Active Layer' },
    { key: 'Delete / Backspace', desc: 'Delete Active Layer' },
    { key: 'Ctrl + 0', desc: 'Fit Canvas to Screen' },
    { key: 'Ctrl + 1', desc: '100% Zoom' },
    { key: 'Ctrl + S', desc: 'Save Project (.lumora)' },
    { key: 'Ctrl + O', desc: 'Open Image / Project' },
    { key: 'Ctrl + N', desc: 'New Document' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ width: '460px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Keyboard size={14} color="#2675d9" />
            <span className="modal-title">Keyboard Shortcuts</span>
          </div>
          <button className="layer-action-btn" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '380px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {shortcuts.map((s) => (
              <div
                key={s.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  backgroundColor: '#222',
                  borderRadius: '3px',
                  border: '1px solid #333'
                }}
              >
                <span style={{ fontSize: '11px', color: '#ccc' }}>{s.desc}</span>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    padding: '2px 5px',
                    backgroundColor: '#333',
                    borderRadius: '2px',
                    color: '#fff',
                    border: '1px solid #444'
                  }}
                >
                  {s.key}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
