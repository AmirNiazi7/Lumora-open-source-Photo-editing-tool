// Lumora Studio - Contextual Tool Options Bar
import React from 'react';
import {
  ToolType,
  ToolOptions
} from '../types';
import {
  Bold,
  Italic,
  Square,
  Circle,
  Minus,
  Check,
  X,
  FlipHorizontal,
  FlipVertical,
  RotateCw
} from 'lucide-react';

interface ToolOptionsBarProps {
  activeTool: ToolType;
  options: ToolOptions;
  onOptionsChange: (newOptions: Partial<ToolOptions>) => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onRotate90: () => void;
  onFitToScreen: () => void;
  onActualSize: () => void;
}

export const ToolOptionsBar: React.FC<ToolOptionsBarProps> = ({
  activeTool,
  options,
  onOptionsChange,
  onApplyCrop,
  onCancelCrop,
  onFlipHorizontal,
  onFlipVertical,
  onRotate90,
  onFitToScreen,
  onActualSize
}) => {
  return (
    <div className="lumora-optionsbar">
      {/* Move Tool Options */}
      {activeTool === 'move' && (
        <>
          <div className="option-group">
            <input
              type="checkbox"
              id="opt-autoselect"
              checked={options.move.autoSelect}
              onChange={(e) =>
                onOptionsChange({
                  move: { ...options.move, autoSelect: e.target.checked }
                })
              }
            />
            <label htmlFor="opt-autoselect" className="option-label" style={{ cursor: 'pointer' }}>
              Auto-Select
            </label>
          </div>

          <div className="option-group">
            <input
              type="checkbox"
              id="opt-transform"
              checked={options.move.showTransformControls}
              onChange={(e) =>
                onOptionsChange({
                  move: { ...options.move, showTransformControls: e.target.checked }
                })
              }
            />
            <label htmlFor="opt-transform" className="option-label" style={{ cursor: 'pointer' }}>
              Transform controls
            </label>
          </div>

          <div style={{ width: '1px', height: '16px', backgroundColor: '#444', margin: '0 4px' }} />

          <div className="option-group">
            <button className="layer-action-btn" title="Flip Horizontal" onClick={onFlipHorizontal}>
              <FlipHorizontal size={13} />
            </button>
            <button className="layer-action-btn" title="Flip Vertical" onClick={onFlipVertical}>
              <FlipVertical size={13} />
            </button>
            <button className="layer-action-btn" title="Rotate 90°" onClick={onRotate90}>
              <RotateCw size={13} />
            </button>
          </div>
        </>
      )}

      {/* Brush Tool Options */}
      {activeTool === 'brush' && (
        <>
          <div className="option-group">
            <span className="option-label">Size:</span>
            <input
              type="range"
              min="1"
              max="150"
              value={options.brush.size}
              onChange={(e) =>
                onOptionsChange({
                  brush: { ...options.brush, size: Number(e.target.value) }
                })
              }
              style={{ width: '80px' }}
            />
            <span style={{ minWidth: '28px', color: '#fff', fontSize: '11px' }}>
              {options.brush.size}px
            </span>
          </div>

          <div className="option-group">
            <span className="option-label">Opacity:</span>
            <input
              type="range"
              min="1"
              max="100"
              value={Math.round(options.brush.opacity * 100)}
              onChange={(e) =>
                onOptionsChange({
                  brush: { ...options.brush, opacity: Number(e.target.value) / 100 }
                })
              }
              style={{ width: '70px' }}
            />
            <span style={{ minWidth: '32px', color: '#fff', fontSize: '11px' }}>
              {Math.round(options.brush.opacity * 100)}%
            </span>
          </div>

          <div className="option-group">
            <span className="option-label">Color:</span>
            <input
              type="color"
              value={options.brush.color}
              onChange={(e) =>
                onOptionsChange({
                  brush: { ...options.brush, color: e.target.value },
                  activeColor: e.target.value
                })
              }
              style={{ width: '22px', height: '22px', border: 'none', background: 'none', cursor: 'pointer' }}
            />
          </div>
        </>
      )}

      {/* Eraser Tool Options */}
      {activeTool === 'eraser' && (
        <>
          <div className="option-group">
            <span className="option-label">Size:</span>
            <input
              type="range"
              min="1"
              max="150"
              value={options.eraser.size}
              onChange={(e) =>
                onOptionsChange({
                  eraser: { ...options.eraser, size: Number(e.target.value) }
                })
              }
              style={{ width: '80px' }}
            />
            <span style={{ minWidth: '28px', color: '#fff', fontSize: '11px' }}>
              {options.eraser.size}px
            </span>
          </div>

          <div className="option-group">
            <span className="option-label">Opacity:</span>
            <input
              type="range"
              min="1"
              max="100"
              value={Math.round(options.eraser.opacity * 100)}
              onChange={(e) =>
                onOptionsChange({
                  eraser: { ...options.eraser, opacity: Number(e.target.value) / 100 }
                })
              }
              style={{ width: '70px' }}
            />
            <span style={{ minWidth: '32px', color: '#fff', fontSize: '11px' }}>
              {Math.round(options.eraser.opacity * 100)}%
            </span>
          </div>
        </>
      )}

      {/* Text Tool Options */}
      {activeTool === 'text' && (
        <>
          <div className="option-group">
            <span className="option-label">Font:</span>
            <select
              value={options.text.fontFamily}
              onChange={(e) =>
                onOptionsChange({
                  text: { ...options.text, fontFamily: e.target.value }
                })
              }
              style={{ width: '110px' }}
            >
              <option value="Inter, sans-serif">Inter</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
              <option value="Impact, fantasy">Impact</option>
            </select>
          </div>

          <div className="option-group">
            <span className="option-label">Size:</span>
            <input
              type="number"
              min="8"
              max="240"
              value={options.text.fontSize}
              onChange={(e) =>
                onOptionsChange({
                  text: { ...options.text, fontSize: Number(e.target.value) }
                })
              }
              style={{ width: '52px' }}
            />
            <span className="option-label">px</span>
          </div>

          <div className="option-group">
            <button
              className={`layer-action-btn ${options.text.bold ? 'active' : ''}`}
              title="Bold"
              style={{ backgroundColor: options.text.bold ? '#2675d9' : 'transparent', color: '#fff' }}
              onClick={() =>
                onOptionsChange({
                  text: { ...options.text, bold: !options.text.bold }
                })
              }
            >
              <Bold size={13} />
            </button>
            <button
              className={`layer-action-btn ${options.text.italic ? 'active' : ''}`}
              title="Italic"
              style={{ backgroundColor: options.text.italic ? '#2675d9' : 'transparent', color: '#fff' }}
              onClick={() =>
                onOptionsChange({
                  text: { ...options.text, italic: !options.text.italic }
                })
              }
            >
              <Italic size={13} />
            </button>
          </div>

          <div className="option-group">
            <span className="option-label">Color:</span>
            <input
              type="color"
              value={options.text.color}
              onChange={(e) =>
                onOptionsChange({
                  text: { ...options.text, color: e.target.value },
                  activeColor: e.target.value
                })
              }
              style={{ width: '22px', height: '22px', border: 'none', background: 'none', cursor: 'pointer' }}
            />
          </div>
        </>
      )}

      {/* Shape Tool Options */}
      {activeTool === 'shape' && (
        <>
          <div className="option-group">
            <span className="option-label">Shape:</span>
            <div style={{ display: 'flex', gap: '2px' }}>
              <button
                className={`layer-action-btn ${options.shape.shapeType === 'rect' ? 'active' : ''}`}
                style={{ backgroundColor: options.shape.shapeType === 'rect' ? '#2675d9' : 'transparent', color: '#fff' }}
                title="Rectangle"
                onClick={() =>
                  onOptionsChange({
                    shape: { ...options.shape, shapeType: 'rect' }
                  })
                }
              >
                <Square size={13} />
              </button>
              <button
                className={`layer-action-btn ${options.shape.shapeType === 'circle' ? 'active' : ''}`}
                style={{ backgroundColor: options.shape.shapeType === 'circle' ? '#2675d9' : 'transparent', color: '#fff' }}
                title="Circle / Ellipse"
                onClick={() =>
                  onOptionsChange({
                    shape: { ...options.shape, shapeType: 'circle' }
                  })
                }
              >
                <Circle size={13} />
              </button>
              <button
                className={`layer-action-btn ${options.shape.shapeType === 'line' ? 'active' : ''}`}
                style={{ backgroundColor: options.shape.shapeType === 'line' ? '#2675d9' : 'transparent', color: '#fff' }}
                title="Line"
                onClick={() =>
                  onOptionsChange({
                    shape: { ...options.shape, shapeType: 'line' }
                  })
                }
              >
                <Minus size={13} />
              </button>
            </div>
          </div>

          <div className="option-group">
            <span className="option-label">Fill:</span>
            <input
              type="color"
              value={options.shape.fill}
              onChange={(e) =>
                onOptionsChange({
                  shape: { ...options.shape, fill: e.target.value }
                })
              }
              style={{ width: '22px', height: '22px', border: 'none', background: 'none', cursor: 'pointer' }}
            />
          </div>

          <div className="option-group">
            <span className="option-label">Stroke:</span>
            <input
              type="color"
              value={options.shape.stroke}
              onChange={(e) =>
                onOptionsChange({
                  shape: { ...options.shape, stroke: e.target.value }
                })
              }
              style={{ width: '22px', height: '22px', border: 'none', background: 'none', cursor: 'pointer' }}
            />
            <input
              type="number"
              min="0"
              max="50"
              value={options.shape.strokeWidth}
              onChange={(e) =>
                onOptionsChange({
                  shape: { ...options.shape, strokeWidth: Number(e.target.value) }
                })
              }
              style={{ width: '45px' }}
            />
            <span className="option-label">px</span>
          </div>
        </>
      )}

      {/* Crop Tool Options */}
      {activeTool === 'crop' && (
        <>
          <div className="option-group">
            <span className="option-label">Ratio:</span>
            <select
              value={options.crop.aspectRatio}
              onChange={(e) =>
                onOptionsChange({
                  crop: { ...options.crop, aspectRatio: e.target.value as any }
                })
              }
            >
              <option value="free">Freeform</option>
              <option value="1:1">1:1 Square</option>
              <option value="16:9">16:9 Landscape</option>
              <option value="4:3">4:3 Standard</option>
            </select>
          </div>

          <div className="option-group" style={{ marginLeft: '12px' }}>
            <button
              onClick={onApplyCrop}
              style={{
                backgroundColor: '#2675d9',
                color: '#fff',
                padding: '3px 10px',
                borderRadius: '3px',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 500
              }}
            >
              <Check size={12} /> Apply Crop
            </button>
            <button
              onClick={onCancelCrop}
              style={{
                backgroundColor: '#3f3f3f',
                color: '#ddd',
                padding: '3px 10px',
                borderRadius: '3px',
                gap: '4px',
                fontSize: '11px'
              }}
            >
              <X size={12} /> Cancel
            </button>
          </div>
        </>
      )}

      {/* Zoom Tool Options */}
      {activeTool === 'zoom' && (
        <>
          <div className="option-group">
            <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={onActualSize}>
              100%
            </button>
            <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={onFitToScreen}>
              Fit Screen
            </button>
          </div>
        </>
      )}

      {/* Hand Tool Options */}
      {activeTool === 'hand' && (
        <span className="option-label">Click and drag to pan the canvas</span>
      )}

      {/* Select / Marquee Tool Options */}
      {activeTool === 'select' && (
        <span className="option-label">Marquee Selection (Click and drag to select area)</span>
      )}

      {/* Eyedropper Options */}
      {activeTool === 'eyedropper' && (
        <span className="option-label">Click anywhere on canvas to sample color</span>
      )}
    </div>
  );
};
