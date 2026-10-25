// Lumora Studio - New Document Modal
import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, width: number, height: number, dpi: number, background: 'transparent' | 'white' | 'black') => void;
}

interface Preset {
  name: string;
  category: string;
  width: number;
  height: number;
}

const PRESETS: Preset[] = [
  { name: 'Full HD', category: 'Screen', width: 1920, height: 1080 },
  { name: 'Square Post', category: 'Social', width: 1080, height: 1080 },
  { name: 'HD Standard', category: 'Screen', width: 1280, height: 720 },
  { name: 'Story / Reel', category: 'Social', width: 1080, height: 1920 },
  { name: 'Standard Web', category: 'Web', width: 800, height: 600 },
  { name: 'Twitter/FB Banner', category: 'Social', width: 1200, height: 630 }
];

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [name, setName] = useState('New Project');
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [dpi, setDpi] = useState(72);
  const [background, setBackground] = useState<'transparent' | 'white' | 'black'>('white');
  const [selectedPreset, setSelectedPreset] = useState<string>('HD Standard');

  if (!isOpen) return null;

  const handleSelectPreset = (p: Preset) => {
    setSelectedPreset(p.name);
    setWidth(p.width);
    setHeight(p.height);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (width > 0 && height > 0) {
      onCreate(name.trim() || 'New Project', width, height, dpi, background);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#2675d9" />
            <span className="modal-title">New Project</span>
          </div>
          <button className="layer-action-btn" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleCreate}>
          <div className="modal-body">
            {/* Project Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: '#999' }}>Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Design"
                required
              />
            </div>

            {/* Presets Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: '#999' }}>Popular Canvas Presets</label>
              <div className="preset-grid">
                {PRESETS.map((p) => (
                  <div
                    key={p.name}
                    className={`preset-card ${selectedPreset === p.name ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(p)}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#fff' }}>{p.name}</div>
                    <div style={{ fontSize: '10px', color: '#888' }}>
                      {p.width} x {p.height}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Dimensions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#999' }}>Width (px)</label>
                <input
                  type="number"
                  min="32"
                  max="8192"
                  value={width}
                  onChange={(e) => {
                    setWidth(Number(e.target.value));
                    setSelectedPreset('');
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#999' }}>Height (px)</label>
                <input
                  type="number"
                  min="32"
                  max="8192"
                  value={height}
                  onChange={(e) => {
                    setHeight(Number(e.target.value));
                    setSelectedPreset('');
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#999' }}>DPI</label>
                <select value={dpi} onChange={(e) => setDpi(Number(e.target.value))}>
                  <option value={72}>72 (Screen)</option>
                  <option value={150}>150 (Medium)</option>
                  <option value={300}>300 (Print)</option>
                </select>
              </div>
            </div>

            {/* Background Choice */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: '#999' }}>Background</label>
              <select value={background} onChange={(e) => setBackground(e.target.value as any)}>
                <option value="white">White</option>
                <option value="transparent">Transparent (Checkerboard)</option>
                <option value="black">Black</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
