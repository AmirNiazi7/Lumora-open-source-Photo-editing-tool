// Lumora Studio - Contextual Tool Options Bar
import React from 'react';
import {
  ToolType,
  ToolOptions,
  Layer,
  ShapeConfig,
  TextConfig
} from '../types';
import { LumoraEngine } from '../engine/LumoraEngine';
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
  RotateCw,
  Ban,
  Move
} from 'lucide-react';

interface ToolOptionsBarProps {
  activeTool: ToolType;
  options: ToolOptions;
  onOptionsChange: (newOptions: Partial<ToolOptions>) => void;
  activeLayer?: Layer;
  onUpdateActiveLayer?: (updates: Partial<Layer>) => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onRotate90: () => void;
  onFitToScreen: () => void;
  onActualSize: () => void;
}

const PRESET_COLORS = [
  '#2675d9',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#ffffff',
  '#111827'
];

export const ToolOptionsBar: React.FC<ToolOptionsBarProps> = ({
  activeTool,
  options,
  onOptionsChange,
  activeLayer,
  onUpdateActiveLayer,
  onApplyCrop,
  onCancelCrop,
  onFlipHorizontal,
  onFlipVertical,
  onRotate90,
  onFitToScreen,
  onActualSize
}) => {
  // Shape update helper - synchronizes options, activeLayer shapeConfig, and raster canvas
  const handleShapeUpdate = (shapeUpdates: Partial<ShapeConfig>, layerUpdates?: Partial<Layer>) => {
    onOptionsChange({
      shape: { ...options.shape, ...shapeUpdates }
    });

    if (activeLayer && activeLayer.type === 'shape' && onUpdateActiveLayer) {
      const updatedLayer: Layer = {
        ...activeLayer,
        ...layerUpdates,
        shapeConfig: {
          ...activeLayer.shapeConfig!,
          ...shapeUpdates
        }
      };
      LumoraEngine.updateShapeRasterCanvas(updatedLayer);
      onUpdateActiveLayer({
        ...layerUpdates,
        shapeConfig: updatedLayer.shapeConfig,
        canvas: updatedLayer.canvas
      });
    }
  };

  // Text update helper - synchronizes options, activeLayer textConfig, and raster canvas
  const handleTextUpdate = (textUpdates: Partial<TextConfig>, layerUpdates?: Partial<Layer>) => {
    onOptionsChange({
      text: { ...options.text, ...textUpdates }
    });

    if (activeLayer && activeLayer.type === 'text' && onUpdateActiveLayer) {
      const updatedLayer: Layer = {
        ...activeLayer,
        ...layerUpdates,
        textConfig: {
          ...activeLayer.textConfig!,
          ...textUpdates
        }
      };
      LumoraEngine.updateTextRasterCanvas(updatedLayer);
      onUpdateActiveLayer({
        ...layerUpdates,
        textConfig: updatedLayer.textConfig,
        canvas: updatedLayer.canvas
      });
    }
  };

  // Layer coordinates update helper
  const handleCoordinateChange = (prop: 'x' | 'y' | 'width' | 'height', value: number) => {
    if (!activeLayer || !onUpdateActiveLayer) return;
    const updates: Partial<Layer> = { [prop]: value };
    if (activeLayer.type === 'shape') {
      const updated = { ...activeLayer, ...updates };
      LumoraEngine.updateShapeRasterCanvas(updated);
      updates.canvas = updated.canvas;
    }
    onUpdateActiveLayer(updates);
  };

  // Resolve current active shape/text config (prefer selected layer values, fallback to tool options)
  const isShapeActive = activeTool === 'shape' || (activeTool === 'move' && activeLayer?.type === 'shape');
  const isTextActive = activeTool === 'text' || (activeTool === 'move' && activeLayer?.type === 'text');

  const currentShape: ShapeConfig =
    activeLayer?.type === 'shape' && activeLayer.shapeConfig ? activeLayer.shapeConfig : options.shape;
  const currentText: TextConfig =
    activeLayer?.type === 'text' && activeLayer.textConfig ? activeLayer.textConfig : options.text;

  return (
    <div className="lumora-optionsbar">
      {/* 1. Shape Options (Show when Shape Tool is active OR when a Shape Layer is selected with Move tool) */}
      {isShapeActive && (
        <>
          <div className="option-group">
            <span className="option-label" style={{ fontWeight: 600, color: '#60a5fa' }}>
              Shape:
            </span>
            <div style={{ display: 'flex', gap: '2px' }}>
              <button
                className={`layer-action-btn ${currentShape.shapeType === 'rect' ? 'active' : ''}`}
                style={{ backgroundColor: currentShape.shapeType === 'rect' ? '#2675d9' : 'transparent', color: '#fff' }}
                title="Rectangle / Frame"
                onClick={() => handleShapeUpdate({ shapeType: 'rect' })}
              >
                <Square size={13} />
              </button>
              <button
                className={`layer-action-btn ${currentShape.shapeType === 'circle' ? 'active' : ''}`}
                style={{ backgroundColor: currentShape.shapeType === 'circle' ? '#2675d9' : 'transparent', color: '#fff' }}
                title="Circle / Ellipse"
                onClick={() => handleShapeUpdate({ shapeType: 'circle' })}
              >
                <Circle size={13} />
              </button>
              <button
                className={`layer-action-btn ${currentShape.shapeType === 'line' ? 'active' : ''}`}
                style={{ backgroundColor: currentShape.shapeType === 'line' ? '#2675d9' : 'transparent', color: '#fff' }}
                title="Line"
                onClick={() => handleShapeUpdate({ shapeType: 'line' })}
              >
                <Minus size={13} />
              </button>
            </div>
          </div>

          <div style={{ width: '1px', height: '16px', backgroundColor: '#444', margin: '0 4px' }} />

          {/* Fill Color Controls */}
          <div className="option-group">
            <span className="option-label">Fill:</span>
            {currentShape.fill === 'transparent' || currentShape.fill === 'none' ? (
              <span
                style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  border: '1px dashed #6b7280',
                  padding: '2px 5px',
                  borderRadius: '3px'
                }}
              >
                No Fill
              </span>
            ) : (
              <input
                type="color"
                value={currentShape.fill.startsWith('#') ? currentShape.fill : '#2675d9'}
                onChange={(e) => handleShapeUpdate({ fill: e.target.value })}
                style={{ width: '22px', height: '22px', border: 'none', background: 'none', cursor: 'pointer' }}
                title="Choose Fill Color"
              />
            )}

            <button
              className="layer-action-btn"
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                color: currentShape.fill === 'transparent' ? '#60a5fa' : '#aaa',
                border: currentShape.fill === 'transparent' ? '1px solid #2675d9' : '1px solid #444'
              }}
              title="Transparent Fill (Wireframe / Outline)"
              onClick={() => handleShapeUpdate({ fill: 'transparent' })}
            >
              <Ban size={10} style={{ marginRight: '3px' }} /> No Fill
            </button>

            {/* Quick palette swatches */}
            <div style={{ display: 'flex', gap: '3px', marginLeft: '2px' }}>
              {PRESET_COLORS.map((c) => (
                <div
                  key={c}
                  onClick={() => handleShapeUpdate({ fill: c })}
                  title={`Fill ${c}`}
                  style={{
                    width: '13px',
                    height: '13px',
                    backgroundColor: c,
                    borderRadius: '2px',
                    border: currentShape.fill === c ? '2px solid #38bdf8' : '1px solid #555',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ width: '1px', height: '16px', backgroundColor: '#444', margin: '0 4px' }} />

          {/* Stroke Controls */}
          <div className="option-group">
            <span className="option-label">Stroke:</span>
            {currentShape.stroke === 'transparent' || currentShape.stroke === 'none' || currentShape.strokeWidth === 0 ? (
              <span
                style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  border: '1px dashed #6b7280',
                  padding: '2px 5px',
                  borderRadius: '3px'
                }}
              >
                No Stroke
              </span>
            ) : (
              <input
                type="color"
                value={currentShape.stroke.startsWith('#') ? currentShape.stroke : '#111827'}
                onChange={(e) => handleShapeUpdate({ stroke: e.target.value })}
                style={{ width: '22px', height: '22px', border: 'none', background: 'none', cursor: 'pointer' }}
                title="Choose Stroke Color"
              />
            )}

            <button
              className="layer-action-btn"
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                color: currentShape.stroke === 'transparent' || currentShape.strokeWidth === 0 ? '#60a5fa' : '#aaa',
                border: currentShape.stroke === 'transparent' || currentShape.strokeWidth === 0 ? '1px solid #2675d9' : '1px solid #444'
              }}
              title="Remove Stroke"
              onClick={() => handleShapeUpdate({ stroke: 'transparent', strokeWidth: 0 })}
            >
              <Ban size={10} style={{ marginRight: '3px' }} /> No Stroke
            </button>

            <span className="option-label">Width:</span>
            <input
              type="number"
              min="0"
              max="50"
              value={currentShape.strokeWidth}
              onChange={(e) => {
                const w = Math.max(0, Number(e.target.value));
                handleShapeUpdate({
                  strokeWidth: w,
                  stroke: w > 0 && (currentShape.stroke === 'transparent' || currentShape.stroke === 'none') ? '#111827' : currentShape.stroke
                });
              }}
              style={{ width: '42px', textAlign: 'right' }}
            />
            <span className="option-label">px</span>
          </div>

          {/* Corner Radius Controls for Rectangles */}
          {currentShape.shapeType === 'rect' && (
            <>
              <div style={{ width: '1px', height: '16px', backgroundColor: '#444', margin: '0 4px' }} />
              <div className="option-group">
                <span className="option-label">Radius:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={currentShape.cornerRadius || 0}
                  onChange={(e) => handleShapeUpdate({ cornerRadius: Math.max(0, Number(e.target.value)) })}
                  style={{ width: '42px', textAlign: 'right' }}
                  title="Corner Radius in pixels"
                />
                <span className="option-label">px</span>
              </div>
            </>
          )}

          {/* Position & Size Inputs for selected shape */}
          {activeLayer && activeLayer.type === 'shape' && (
            <>
              <div style={{ width: '1px', height: '16px', backgroundColor: '#444', margin: '0 4px' }} />
              <div className="option-group" title="Exact layer coordinates and size">
                <span className="option-label">X:</span>
                <input
                  type="number"
                  value={Math.round(activeLayer.x)}
                  onChange={(e) => handleCoordinateChange('x', Number(e.target.value))}
                  style={{ width: '48px', textAlign: 'right' }}
                />
                <span className="option-label">Y:</span>
                <input
                  type="number"
                  value={Math.round(activeLayer.y)}
                  onChange={(e) => handleCoordinateChange('y', Number(e.target.value))}
                  style={{ width: '48px', textAlign: 'right' }}
                />
                <span className="option-label">W:</span>
                <input
                  type="number"
                  min="2"
                  value={Math.round(activeLayer.width)}
                  onChange={(e) => handleCoordinateChange('width', Math.max(2, Number(e.target.value)))}
                  style={{ width: '48px', textAlign: 'right' }}
                />
                <span className="option-label">H:</span>
                <input
                  type="number"
                  min="2"
                  value={Math.round(activeLayer.height)}
                  onChange={(e) => handleCoordinateChange('height', Math.max(2, Number(e.target.value)))}
                  style={{ width: '48px', textAlign: 'right' }}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* 2. Text Tool Options (Show when Text Tool is active OR when a Text Layer is selected with Move tool) */}
      {!isShapeActive && isTextActive && (
        <>
          <div className="option-group">
            <span className="option-label" style={{ fontWeight: 600, color: '#60a5fa' }}>
              Text:
            </span>
            <input
              type="text"
              value={currentText.text}
              placeholder="Edit text content..."
              onChange={(e) => handleTextUpdate({ text: e.target.value })}
              style={{ width: '130px', padding: '2px 6px', fontSize: '11px', color: '#fff', backgroundColor: '#2a2a2a', border: '1px solid #444', borderRadius: '3px' }}
              title="Edit text content"
            />
          </div>

          <div className="option-group">
            <span className="option-label">Font:</span>
            <select
              value={currentText.fontFamily}
              onChange={(e) => handleTextUpdate({ fontFamily: e.target.value })}
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
              value={currentText.fontSize}
              onChange={(e) => handleTextUpdate({ fontSize: Math.max(6, Number(e.target.value)) })}
              style={{ width: '48px', textAlign: 'right' }}
            />
            <span className="option-label">px</span>
          </div>

          <div className="option-group">
            <button
              className={`layer-action-btn ${currentText.bold ? 'active' : ''}`}
              title="Bold"
              style={{ backgroundColor: currentText.bold ? '#2675d9' : 'transparent', color: '#fff' }}
              onClick={() => handleTextUpdate({ bold: !currentText.bold })}
            >
              <Bold size={13} />
            </button>
            <button
              className={`layer-action-btn ${currentText.italic ? 'active' : ''}`}
              title="Italic"
              style={{ backgroundColor: currentText.italic ? '#2675d9' : 'transparent', color: '#fff' }}
              onClick={() => handleTextUpdate({ italic: !currentText.italic })}
            >
              <Italic size={13} />
            </button>
          </div>

          <div className="option-group">
            <span className="option-label">Color:</span>
            <input
              type="color"
              value={currentText.color}
              onChange={(e) => {
                handleTextUpdate({ color: e.target.value });
                onOptionsChange({ activeColor: e.target.value });
              }}
              style={{ width: '22px', height: '22px', border: 'none', background: 'none', cursor: 'pointer' }}
            />
          </div>

          {/* Quick text color swatches */}
          <div style={{ display: 'flex', gap: '3px' }}>
            {PRESET_COLORS.map((c) => (
              <div
                key={c}
                onClick={() => handleTextUpdate({ color: c })}
                title={`Text Color ${c}`}
                style={{
                  width: '13px',
                  height: '13px',
                  backgroundColor: c,
                  borderRadius: '2px',
                  border: currentText.color === c ? '2px solid #38bdf8' : '1px solid #555',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>

          {activeLayer && activeLayer.type === 'text' && (
            <>
              <div style={{ width: '1px', height: '16px', backgroundColor: '#444', margin: '0 4px' }} />
              <div className="option-group" title="Exact layer coordinates">
                <span className="option-label">X:</span>
                <input
                  type="number"
                  value={Math.round(activeLayer.x)}
                  onChange={(e) => handleCoordinateChange('x', Number(e.target.value))}
                  style={{ width: '48px', textAlign: 'right' }}
                />
                <span className="option-label">Y:</span>
                <input
                  type="number"
                  value={Math.round(activeLayer.y)}
                  onChange={(e) => handleCoordinateChange('y', Number(e.target.value))}
                  style={{ width: '48px', textAlign: 'right' }}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* 3. Move Tool Options (when NOT shape and NOT text) */}
      {activeTool === 'move' && !isShapeActive && !isTextActive && (
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

          {activeLayer && (
            <>
              <div style={{ width: '1px', height: '16px', backgroundColor: '#444', margin: '0 4px' }} />
              <div className="option-group" title="Selected layer position and size">
                <span className="option-label">X:</span>
                <input
                  type="number"
                  value={Math.round(activeLayer.x)}
                  onChange={(e) => handleCoordinateChange('x', Number(e.target.value))}
                  style={{ width: '48px', textAlign: 'right' }}
                />
                <span className="option-label">Y:</span>
                <input
                  type="number"
                  value={Math.round(activeLayer.y)}
                  onChange={(e) => handleCoordinateChange('y', Number(e.target.value))}
                  style={{ width: '48px', textAlign: 'right' }}
                />
                <span className="option-label">W:</span>
                <input
                  type="number"
                  min="2"
                  value={Math.round(activeLayer.width)}
                  onChange={(e) => handleCoordinateChange('width', Math.max(2, Number(e.target.value)))}
                  style={{ width: '48px', textAlign: 'right' }}
                />
                <span className="option-label">H:</span>
                <input
                  type="number"
                  min="2"
                  value={Math.round(activeLayer.height)}
                  onChange={(e) => handleCoordinateChange('height', Math.max(2, Number(e.target.value)))}
                  style={{ width: '48px', textAlign: 'right' }}
                />
              </div>
            </>
          )}

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

      {/* 4. Brush Tool Options */}
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

          {/* Preset brush color swatches */}
          <div style={{ display: 'flex', gap: '3px' }}>
            {PRESET_COLORS.map((c) => (
              <div
                key={c}
                onClick={() =>
                  onOptionsChange({
                    brush: { ...options.brush, color: c },
                    activeColor: c
                  })
                }
                title={`Brush Color ${c}`}
                style={{
                  width: '13px',
                  height: '13px',
                  backgroundColor: c,
                  borderRadius: '2px',
                  border: options.brush.color === c ? '2px solid #38bdf8' : '1px solid #555',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* 5. Eraser Tool Options */}
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

      {/* 6. Crop Tool Options */}
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

      {/* 7. Zoom Tool Options */}
      {activeTool === 'zoom' && (
        <div className="option-group">
          <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={onActualSize}>
            100%
          </button>
          <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={onFitToScreen}>
            Fit Screen
          </button>
        </div>
      )}

      {/* 8. Hand Tool Options */}
      {activeTool === 'hand' && (
        <span className="option-label">Click and drag or hold Space to pan the canvas</span>
      )}

      {/* 9. Select / Marquee Tool Options */}
      {activeTool === 'select' && (
        <span className="option-label">Marquee Selection (Click and drag to select area)</span>
      )}

      {/* 10. Eyedropper Options */}
      {activeTool === 'eyedropper' && (
        <span className="option-label">Click anywhere on canvas to sample color into Foreground swatch</span>
      )}
    </div>
  );
};
