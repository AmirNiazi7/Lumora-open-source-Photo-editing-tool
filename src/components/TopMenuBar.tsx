// Lumora Studio - Top Menu Bar
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Undo2, Redo2, Maximize, Search } from 'lucide-react';

interface TopMenuBarProps {
  onGoHome?: () => void;
  onNewDocument: () => void;
  onOpenImage: () => void;
  onSaveProject: () => void;
  onOpenProject: () => void;
  onExportPsd: () => void;
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
  onGoHome,
  onNewDocument,
  onOpenImage,
  onSaveProject,
  onOpenProject,
  onExportPsd,
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

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className="lumora-menubar" ref={menuBarRef}>
      <div
        className="lumora-brand"
        onClick={onGoHome}
        style={{ cursor: 'pointer' }}
        title="Go to Home Screen"
      >
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
            {onGoHome && (
              <>
                <button className="dropdown-item" onClick={() => executeAndClose(onGoHome)}>
                  <span>Home Screen</span>
                  <span className="dropdown-shortcut">Alt+H</span>
                </button>
                <div className="dropdown-divider" />
              </>
            )}
            <button className="dropdown-item" onClick={() => executeAndClose(onNewDocument)}>
              <span>New Project...</span>
              <span className="dropdown-shortcut">Ctrl+N</span>
            </button>
            <button className="dropdown-item" onClick={() => executeAndClose(onOpenProject)}>
              <span>Open PSD / Project...</span>
              <span className="dropdown-shortcut">Ctrl+O</span>
            </button>
            <button className="dropdown-item" onClick={() => executeAndClose(onOpenImage)}>
              <span>Insert Image as Layer...</span>
            </button>
            <div className="dropdown-divider" />
            <button className="dropdown-item" onClick={() => executeAndClose(onSaveProject)}>
              <span>Save Project (.lumora)</span>
              <span className="dropdown-shortcut">Ctrl+S</span>
            </button>
            <button className="dropdown-item" onClick={() => executeAndClose(onExportPsd)}>
              <span>Export as PSD (Photoshop)...</span>
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

      {/* Right-aligned Header Controls Matching Photopea */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '6px', flexShrink: 0 }}>
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

        <div style={{ width: '1px', height: '14px', background: '#3f3f46', margin: '0 4px' }} />

        {/* Account Button (Photopea Signature Red Pill) */}
        <button
          className="account-btn"
          onClick={() => alert('Account: You are in guest mode. All edits are saved locally with full privacy.')}
          style={{
            background: '#e02424',
            color: '#ffffff',
            border: 'none',
            borderRadius: '3px',
            padding: '2px 9px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.3px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Account / Profile"
        >
          <span>Account</span>
        </button>

        {/* Search / Command Palette Icon */}
        <button
          className="layer-action-btn"
          title="Search tools and commands"
          onClick={onShowShortcuts}
        >
          <Search size={13} />
        </button>

        {/* Fullscreen Toggle */}
        <button
          className="layer-action-btn"
          title="Toggle Fullscreen"
          onClick={toggleFullScreen}
        >
          <Maximize size={13} />
        </button>

        {/* GitHub Link */}
        <a
          href="https://github.com/AmirNiazi7/Lumora-open-source-Photo-editing-tool"
          target="_blank"
          rel="noopener noreferrer"
          className="layer-action-btn"
          title="View GitHub Repository"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </a>
      </div>
    </div>
  );
};
