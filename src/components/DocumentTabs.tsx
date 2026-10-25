// Lumora Studio - Document Tabs Bar
import React from 'react';
import { DocumentProject } from '../types';
import { X, ZoomIn, ZoomOut, Maximize2, Sparkle } from 'lucide-react';

interface DocumentTabsProps {
  document: DocumentProject | null;
  activeView: 'home' | 'editor';
  onSwitchToHome: () => void;
  onSwitchToEditor: () => void;
  onCloseDocument: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onActualSize: () => void;
}

export const DocumentTabs: React.FC<DocumentTabsProps> = ({
  document,
  activeView,
  onSwitchToHome,
  onSwitchToEditor,
  onCloseDocument,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onActualSize
}) => {
  return (
    <div className="lumora-tabs">
      {/* Home Tab */}
      <div
        className={`doc-tab ${activeView === 'home' ? 'active' : ''}`}
        onClick={onSwitchToHome}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <Sparkle size={13} color={activeView === 'home' ? '#38bdf8' : '#888'} />
        <span>Home</span>
      </div>

      {/* Document Tab (if open) */}
      {document && (
        <div
          className={`doc-tab ${activeView === 'editor' ? 'active' : ''}`}
          onClick={onSwitchToEditor}
          style={{ cursor: 'pointer' }}
        >
          <span>
            {document.name} @ {Math.round(document.zoom * 100)}% ({document.width} × {document.height}px)
          </span>
          <span
            className="doc-tab-close"
            title="Close document"
            onClick={(e) => {
              e.stopPropagation();
              onCloseDocument();
            }}
          >
            <X size={12} />
          </span>
        </div>
      )}

      {/* Zoom & View Controls (active when in editor) */}
      {activeView === 'editor' && document && (
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button className="layer-action-btn" title="Zoom Out" onClick={onZoomOut}>
            <ZoomOut size={13} />
          </button>
          <span
            style={{
              fontSize: '11px',
              color: '#aaa',
              fontFamily: 'monospace',
              cursor: 'pointer',
              minWidth: '42px',
              textAlign: 'center'
            }}
            title="Click to reset to 100%"
            onClick={onActualSize}
          >
            {Math.round(document.zoom * 100)}%
          </span>
          <button className="layer-action-btn" title="Zoom In" onClick={onZoomIn}>
            <ZoomIn size={13} />
          </button>
          <button className="layer-action-btn" title="Fit to Screen" onClick={onFitToScreen}>
            <Maximize2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

