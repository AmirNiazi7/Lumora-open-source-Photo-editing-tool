// Lumora Studio - Document Tabs Bar
import React from 'react';
import { DocumentProject } from '../types';
import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface DocumentTabsProps {
  document: DocumentProject;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onActualSize: () => void;
}

export const DocumentTabs: React.FC<DocumentTabsProps> = ({
  document,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onActualSize
}) => {
  return (
    <div className="lumora-tabs">
      <div className="doc-tab active">
        <span>{document.name} @ {Math.round(document.zoom * 100)}% ({document.width} × {document.height}px)</span>
        <span className="doc-tab-close" title="Close document">
          <X size={12} />
        </span>
      </div>

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
    </div>
  );
};
