// Lumora Studio - Adjustments & Color Balance Modal
import React, { useState, useEffect } from 'react';
import { LayerAdjustments } from '../types';
import { defaultAdjustments } from '../engine/Adjustments';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface AdjustmentsModalProps {
  isOpen: boolean;
  initialAdjustments: LayerAdjustments;
  layerName: string;
  onClose: () => void;
  onApply: (adjustments: LayerAdjustments) => void;
}

export const AdjustmentsModal: React.FC<AdjustmentsModalProps> = ({
  isOpen,
  initialAdjustments,
  layerName,
  onClose,
  onApply
}) => {
  const [adj, setAdj] = useState<LayerAdjustments>(initialAdjustments);

  useEffect(() => {
    setAdj(initialAdjustments);
  }, [initialAdjustments, isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    setAdj(defaultAdjustments());
  };

  const handleSave = () => {
    onApply(adj);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ width: '400px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SlidersHorizontal size={14} color="#2675d9" />
            <span className="modal-title">Adjustments ({layerName})</span>
          </div>
          <button className="layer-action-btn" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body">
          {/* Brightness */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#ccc' }}>
              <span>Brightness</span>
              <span style={{ color: '#2675d9', fontFamily: 'monospace' }}>{adj.brightness}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adj.brightness}
              onChange={(e) => setAdj({ ...adj, brightness: Number(e.target.value) })}
            />
          </div>

          {/* Contrast */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#ccc' }}>
              <span>Contrast</span>
              <span style={{ color: '#2675d9', fontFamily: 'monospace' }}>{adj.contrast}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adj.contrast}
              onChange={(e) => setAdj({ ...adj, contrast: Number(e.target.value) })}
            />
          </div>

          {/* Saturation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#ccc' }}>
              <span>Saturation</span>
              <span style={{ color: '#2675d9', fontFamily: 'monospace' }}>{adj.saturation}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adj.saturation}
              onChange={(e) => setAdj({ ...adj, saturation: Number(e.target.value) })}
            />
          </div>

          {/* Sepia */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#ccc' }}>
              <span>Sepia Warmth</span>
              <span style={{ color: '#2675d9', fontFamily: 'monospace' }}>{adj.sepia}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={adj.sepia}
              onChange={(e) => setAdj({ ...adj, sepia: Number(e.target.value) })}
            />
          </div>

          {/* Blur Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#ccc' }}>
              <span>Gaussian Blur Radius</span>
              <span style={{ color: '#2675d9', fontFamily: 'monospace' }}>{adj.blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={adj.blur}
              onChange={(e) => setAdj({ ...adj, blur: Number(e.target.value) })}
            />
          </div>

          {/* Checkboxes: Grayscale & Invert */}
          <div style={{ display: 'flex', gap: '16px', paddingTop: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={adj.grayscale}
                onChange={(e) => setAdj({ ...adj, grayscale: e.target.checked })}
              />
              <span>Grayscale (B&W)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={adj.invert}
                onChange={(e) => setAdj({ ...adj, invert: e.target.checked })}
              />
              <span>Invert Colors</span>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleReset}
            style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <RotateCcw size={12} /> Reset
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};
