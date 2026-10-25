// Lumora Studio - Layers Panel
import React, { useState } from 'react';
import { Layer, BlendMode } from '../types';
import {
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Plus,
  ChevronUp,
  ChevronDown,
  Lock,
  Unlock,
  Type,
  Square,
  Image as ImageIcon,
  Paintbrush
} from 'lucide-react';

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onNewLayer: () => void;
  onDuplicateLayer: () => void;
  onDeleteLayer: () => void;
  onMoveLayerUp: () => void;
  onMoveLayerDown: () => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  activeLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onUpdateLayer,
  onNewLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onMoveLayerUp,
  onMoveLayerDown
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const activeLayer = layers.find((l) => l.id === activeLayerId);

  const startRename = (layer: Layer) => {
    setEditingId(layer.id);
    setEditingName(layer.name);
  };

  const finishRename = () => {
    if (editingId && editingName.trim()) {
      onUpdateLayer(editingId, { name: editingName.trim() });
    }
    setEditingId(null);
  };

  const renderLayerIcon = (type: Layer['type']) => {
    switch (type) {
      case 'text':
        return <Type size={12} color="#60a5fa" />;
      case 'shape':
        return <Square size={12} color="#34d399" />;
      case 'image':
        return <ImageIcon size={12} color="#f472b6" />;
      case 'paint':
      default:
        return <Paintbrush size={12} color="#fbbf24" />;
    }
  };

  // Layers are stored from bottom (index 0) to top (last).
  // Display from top to bottom (reversed) like Photoshop/Photopea.
  const displayLayers = [...layers].reverse();

  return (
    <div className="layers-container">
      {/* Blend Mode & Opacity Controls */}
      <div className="layers-controls">
        <select
          value={activeLayer?.blendMode || 'source-over'}
          disabled={!activeLayer}
          onChange={(e) => {
            if (activeLayerId) {
              onUpdateLayer(activeLayerId, { blendMode: e.target.value as BlendMode });
            }
          }}
          style={{ width: '120px' }}
        >
          <option value="source-over">Normal</option>
          <option value="multiply">Multiply</option>
          <option value="screen">Screen</option>
          <option value="overlay">Overlay</option>
          <option value="darken">Darken</option>
          <option value="lighten">Lighten</option>
          <option value="color-dodge">Color Dodge</option>
          <option value="color-burn">Color Burn</option>
          <option value="difference">Difference</option>
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: '#888' }}>Opacity:</span>
          <input
            type="number"
            min="0"
            max="100"
            value={activeLayer ? Math.round(activeLayer.opacity * 100) : 100}
            disabled={!activeLayer}
            onChange={(e) => {
              if (activeLayerId) {
                const val = Math.max(0, Math.min(100, Number(e.target.value)));
                onUpdateLayer(activeLayerId, { opacity: val / 100 });
              }
            }}
            style={{ width: '42px', textAlign: 'right' }}
          />
          <span style={{ fontSize: '11px', color: '#888' }}>%</span>
        </div>
      </div>

      {/* Layer List */}
      <div className="layers-list">
        {displayLayers.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#777', fontSize: '11px' }}>
            No layers. Click + to create a layer.
          </div>
        ) : (
          displayLayers.map((layer) => {
            const isActive = layer.id === activeLayerId;
            return (
              <div
                key={layer.id}
                className={`layer-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectLayer(layer.id)}
              >
                {/* Visibility Toggle */}
                <button
                  className="layer-action-btn"
                  style={{ width: '20px', height: '20px' }}
                  title={layer.visible ? 'Hide layer' : 'Show layer'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(layer.id);
                  }}
                >
                  {layer.visible ? <Eye size={13} /> : <EyeOff size={13} color="#666" />}
                </button>

                {/* Lock Toggle */}
                <button
                  className="layer-action-btn"
                  style={{ width: '18px', height: '18px' }}
                  title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLock(layer.id);
                  }}
                >
                  {layer.locked ? <Lock size={11} color="#f59e0b" /> : <Unlock size={11} color="#555" />}
                </button>

                {/* Layer Thumbnail / Type Icon */}
                <div className="layer-thumbnail">{renderLayerIcon(layer.type)}</div>

                {/* Layer Name (Double click to rename) */}
                {editingId === layer.id ? (
                  <input
                    type="text"
                    className="layer-name-input"
                    value={editingName}
                    autoFocus
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={finishRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') finishRename();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className="layer-name-text"
                    title="Double-click to rename"
                    onDoubleClick={() => startRename(layer)}
                  >
                    {layer.name}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Layer Action Bar */}
      <div className="layers-actions">
        <button className="layer-action-btn" title="Move Layer Up" onClick={onMoveLayerUp} disabled={!activeLayerId}>
          <ChevronUp size={14} />
        </button>
        <button className="layer-action-btn" title="Move Layer Down" onClick={onMoveLayerDown} disabled={!activeLayerId}>
          <ChevronDown size={14} />
        </button>
        <div style={{ width: '1px', height: '14px', backgroundColor: '#444', margin: '0 2px' }} />
        <button className="layer-action-btn" title="Duplicate Layer (Ctrl+J)" onClick={onDuplicateLayer} disabled={!activeLayerId}>
          <Copy size={13} />
        </button>
        <button className="layer-action-btn" title="New Layer" onClick={onNewLayer}>
          <Plus size={15} />
        </button>
        <button
          className="layer-action-btn"
          title="Delete Layer (Del)"
          onClick={onDeleteLayer}
          disabled={!activeLayerId || layers.length <= 1}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};
