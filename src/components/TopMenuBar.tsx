// Lumora Studio - Top Menu Bar
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Undo2, Redo2 } from 'lucide-react';

interface TopMenuBarProps {
  onNewDocument: () => void;
  onOpenImage: () => void;
  onSaveProject: () => void;
  onOpenProject: () => void;
  onExportPng: () => void;
  onExportJpeg: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenAdjustments: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onRotate90: () => void;
  onNewLayer: () => void;
  onDeleteLayer: () => void;
  onDuplicateLayer: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onActualSize: () => void;
  onShowShortcuts: () => void;
}

export const TopMenuBar: React.FC<TopMenuBarProps> = ({
  onNewDocument,
  onOpenImage,
  onSaveProject,
  onOpenProject,
  onExportPng,
  onExportJpeg,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenAdjustments,
  onFlipHorizontal,
  onFlipVertical,
  onRotate90,
  onNewLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onActualSize,
  onShowShortcuts
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleMenuClick = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleMenuHover = (menu: string) => {
    if (openMenu !== null) {
      setOpenMenu(menu);
    }
  };

  const executeAndClose = (action: () => void) => {
    action();
    setOpenMenu(null);
  };

  return (
    <div className="lumora-menubar" ref={menuBarRef}>
      <div className="lumora-brand">
        <div className="lumora-brand-logo">
          <Sparkles size={11} />
        </div>
        <span>Lumora</span>
      </div>

      {/* File Menu */}
      <div className="menu-item">
        <button
          className={`menu-trigger ${openMenu === 'file' ? 'active' : ''}`}
          onClick={() => handleMenuClick('file')}
          onMouseEnter={() => handleMenuHover('file')}
        >
          File
        </button>
        {openMenu === 'file' && (
          <div className="menu-dropdown">
            <button className="dropdown-item" onClick={() => executeAndClose(onNewDocument)}>
              <span>New Project...</span>
              <span className="dropdown-shortcut">Ctrl+N</span>
            </button>
            <button className="dropdown-item" onClick={() => executeAndClose(onOpenImage)}>
              <span>Open Image...</span>
              <span className="dropdown-shortcut">Ctrl+O</span>
            </button>
            <button className="dropdown-item" onClick={() => executeAndClose(onOpenProject)}>
              <span>Open .lumora Project...</span>
            </button>
            <div className="dropdown-divider" />
            <button className="dropdown-item" onClick={() => executeAndClose(onSaveProject)}>
              <span>Save Project (.lumora)</span>
              <span className="dropdown-shortcut">Ctrl+S</span>
            </button>
            <button className="dropdown-item" onClick={() => executeAndClose(onExportPng)}>
              <span>Export as PNG</span>
            </button>
            <button className="dropdown-item" onClick={() => executeAndClose(onExportJpeg)}>
              <span>Export as JPEG...</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Menu */}
      <div className="menu-item">
        <button
          className={`menu-trigger ${openMenu === 'edit' ? 'active' : ''}`}
          onClick={() => handleMenuClick('edit')}
          onMouseEnter={() => handleMenuHover('edit')}
        >
          Edit
        </button>
        {openMenu === 'edit' && (
          <div className="menu-dropdown">
            <button
              className={`dropdown-item ${!canUndo ? 'disabled' : ''}`}
              onClick={() => executeAndClose(onUndo)}
            >
              <span>Undo</span>
              <span className="dropdown-shortcut">Ctrl+Z</span>
            </button>
            <button
              className={`dropdown-item ${!canRedo ? 'disabled' : ''}`}
              onClick={() => executeAndClose(onRedo)}
            >
              <span>Redo</span>
              <span className="dropdown-shortcut">Ctrl+Y</span>
            </button>
            <div className="dropdown-divider" />
            <button className="dropdown-item" onClick={() => executeAndClose(onDuplicateLayer)}>
              <span>Duplicate Layer</span>
              <span className="dropdown-shortcut">Ctrl+J</span>
            </button>
            <button className="dropdown-item" onClick={() => executeAndClose(onDeleteLayer)}>
              <span>Delete Layer</span>
              <span className="dropdown-shortcut">Del</span>
            </button>
          </div>
        )}
      </div>

      {/* Image Menu */}
      <div className="menu-item">
        <button
          className={`menu-trigger ${openMenu === 'image' ? 'active' : ''}`}
          onClick={() => handleMenuClick('image')}
          onMouseEnter={() => handleMenuHover('image')}
        >
          Image
        </button>
        {openMenu === 'image' && (
          <div className="menu-dropdown">
            <button className="dropdown-item" onClick={() => executeAndClose(onOpenAdjustments)}>
              <span>Adjustments & Color...</span>
              <span className="dropdown-shortcut">Ctrl+M</span>
            </button>
            <div className="dropdown-divider" />
            <button className="dropdown-item" onClick={() => executeAndClose(onFlipHorizontal)}>
              <span>Flip Horizontal</span>
            </button>
            <button className="dropdown-item" onClick={() => executeAndClose(onFlipVertical)}>
              <span>Flip Vertical</span>
            </button>
            <button className="dropdown-item" onClick={() => executeAndClose(onRotate90)}>
              <span>Rotate 90° Clockwise</span>
            </button>
          </div>
        )}
      </div>

      {/* Layer Menu */}
      <div className="menu-item">
        <button
          className={`menu-trigger ${openMenu === 'layer' ? 'active' : ''}`}
          onClick={() => handleMenuClick('layer')}
          onMouseEnter={() => handleMenuHover('layer')}
        >
          Layer
        </button>
        {openMenu === 'layer' && (
          <div className="menu-dropdown">
            <button className="dropdown-item" onClick={() => executeAndClose(onNewLayer)}>
              <span>New Layer</span>
              <span className="dropdown-shortcut">Shift+Ctrl+N</span>
            </button>
            <button className="dropdown-item" onClick={() => executeAndClose(onDuplicateLayer)}>
              <span>Duplicate Layer</span>
              <span className="dropdown-shortcut">Ctrl+J</span>
            </button>
            <button className="dropdown-item" onClick={() => executeAndClose(onDeleteLayer)}>
              <span>Delete Layer</span>
            </button>
          </div>
        )}
      </div>

      {/* View Menu */}
      <div className="menu-item">
        <button
          className={`menu-trigger ${openMenu === 'view' ? 'active' : ''}`}
          onClick={() => handleMenuClick('view')}
          onMouseEnter={() => handleMenuHover('view')}
        >
          View
        </button>
        {openMenu === 'view' && (
          <div className="menu-dropdown">
            <button className="dropdown-item" onClick={() => executeAndClose(onZoomIn)}>
              <span>Zoom In</span>
              <span className="dropdown-shortcut">Ctrl++</span>
            </button>
            <button className="dropdown-item" onClick={() => executeAndClose(onZoomOut)}>
              <span>Zoom Out</span>
              <span className="dropdown-shortcut">Ctrl+-</span>
            </button>
            <button className="dropdown-item" onClick={() => executeAndClose(onFitToScreen)}>
              <span>Fit to Screen</span>
              <span className="dropdown-shortcut">Ctrl+0</span>
            </button>
            <button className="dropdown-item" onClick={() => executeAndClose(onActualSize)}>
              <span>100% Actual Size</span>
              <span className="dropdown-shortcut">Ctrl+1</span>
            </button>
          </div>
        )}
      </div>

      {/* Help Menu */}
      <div className="menu-item">
        <button
          className={`menu-trigger ${openMenu === 'help' ? 'active' : ''}`}
          onClick={() => handleMenuClick('help')}
          onMouseEnter={() => handleMenuHover('help')}
        >
          Help
        </button>
        {openMenu === 'help' && (
          <div className="menu-dropdown">
            <button className="dropdown-item" onClick={() => executeAndClose(onShowShortcuts)}>
              <span>Keyboard Shortcuts</span>
            </button>
            <button
              className="dropdown-item"
              onClick={() => executeAndClose(() => alert('Lumora Studio v1.0.0\nProfessional Browser-Based Photo Editor'))}
            >
              <span>About Lumora Studio</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Action Undo/Redo Buttons */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          className="layer-action-btn"
          title="Undo (Ctrl+Z)"
          disabled={!canUndo}
          style={{ opacity: canUndo ? 1 : 0.4 }}
          onClick={onUndo}
        >
          <Undo2 size={13} />
        </button>
        <button
          className="layer-action-btn"
          title="Redo (Ctrl+Y)"
          disabled={!canRedo}
          style={{ opacity: canRedo ? 1 : 0.4 }}
          onClick={onRedo}
        >
          <Redo2 size={13} />
        </button>
      </div>
    </div>
  );
};
