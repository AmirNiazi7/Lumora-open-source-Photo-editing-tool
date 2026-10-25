// Lumora Studio - Left Toolbar
import React from 'react';
import { ToolType, ToolOptions } from '../types';
import {
  Move,
  Crop,
  Brush,
  Eraser,
  Type,
  Square,
  Pipette,
  Hand,
  ZoomIn,
  BoxSelect,
  ArrowUpDown
} from 'lucide-react';

interface LeftToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  options: ToolOptions;
  onOptionsChange: (newOptions: Partial<ToolOptions>) => void;
}

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
  activeTool,
  onSelectTool,
  options,
  onOptionsChange
}) => {
  const tools: { type: ToolType; label: string; shortcut: string; icon: React.ReactNode }[] = [
    { type: 'move', label: 'Move Tool', shortcut: 'V', icon: <Move size={16} /> },
    { type: 'select', label: 'Marquee Select', shortcut: 'M', icon: <BoxSelect size={16} /> },
    { type: 'crop', label: 'Crop Tool', shortcut: 'C', icon: <Crop size={16} /> },
    { type: 'brush', label: 'Brush Tool', shortcut: 'B', icon: <Brush size={16} /> },
    { type: 'eraser', label: 'Eraser Tool', shortcut: 'E', icon: <Eraser size={16} /> },
    { type: 'text', label: 'Type Tool', shortcut: 'T', icon: <Type size={16} /> },
    { type: 'shape', label: 'Rectangle / Shape Tool', shortcut: 'U', icon: <Square size={16} /> },
    { type: 'eyedropper', label: 'Eyedropper Tool', shortcut: 'I', icon: <Pipette size={16} /> },
    { type: 'hand', label: 'Hand Tool', shortcut: 'H', icon: <Hand size={16} /> },
    { type: 'zoom', label: 'Zoom Tool', shortcut: 'Z', icon: <ZoomIn size={16} /> }
  ];

  const handleSwapColors = () => {
    onOptionsChange({
      activeColor: options.secondaryColor,
      secondaryColor: options.activeColor,
      brush: { ...options.brush, color: options.secondaryColor },
      text: { ...options.text, color: options.secondaryColor },
      shape: { ...options.shape, fill: options.secondaryColor }
    });
  };

  return (
    <div className="lumora-toolbar">
      {tools.map((t) => (
        <button
          key={t.type}
          className={`tool-button ${activeTool === t.type ? 'active' : ''}`}
          title={`${t.label} (${t.shortcut})`}
          onClick={() => onSelectTool(t.type)}
        >
          {t.icon}
        </button>
      ))}

      {/* Foreground & Background Color Swatches */}
      <div className="color-swatches" title="Foreground and Background colors">
        <input
          type="color"
          className="color-primary"
          value={options.activeColor}
          onChange={(e) =>
            onOptionsChange({
              activeColor: e.target.value,
              brush: { ...options.brush, color: e.target.value },
              text: { ...options.text, color: e.target.value },
              shape: { ...options.shape, fill: e.target.value }
            })
          }
          style={{ backgroundColor: options.activeColor }}
        />
        <input
          type="color"
          className="color-secondary"
          value={options.secondaryColor}
          onChange={(e) =>
            onOptionsChange({
              secondaryColor: e.target.value
            })
          }
          style={{ backgroundColor: options.secondaryColor }}
        />
      </div>

      <button
        style={{ width: '16px', height: '16px', color: '#888', marginBottom: '4px' }}
        title="Swap Foreground / Background Colors (X)"
        onClick={handleSwapColors}
      >
        <ArrowUpDown size={11} />
      </button>
    </div>
  );
};
