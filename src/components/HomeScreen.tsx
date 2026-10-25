// Lumora Studio - Photopea-Style Home / Landing Screen Component
import React, { useState } from 'react';
import {
  Sparkles,
  FilePlus,
  FolderOpen,
  LayoutTemplate,
  Download,
  Wand2,
  Keyboard,
  HardDrive,
  Monitor,
  Box,
  Cloud,
  FileText,
  Camera,
  Layers,
  Sparkle
} from 'lucide-react';

interface HomeScreenProps {
  onNewProject: () => void;
  onOpenFromComputer: () => void;
  onOpenTemplates: () => void;
  onShowShortcuts: () => void;
  onGenerateDemo: () => void;
  onDropFile: (file: File) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNewProject,
  onOpenFromComputer,
  onOpenTemplates,
  onShowShortcuts,
  onGenerateDemo,
  onDropFile
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeNav, setActiveNav] = useState<string>('home');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDropFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="lumora-home-container">
      {/* Left Vertical Navigation Menu */}
      <aside className="lumora-home-sidebar">
        <div className="home-nav-group">
          <button
            className={`home-nav-item ${activeNav === 'home' ? 'active' : ''}`}
            onClick={() => setActiveNav('home')}
          >
            <Sparkle size={15} />
            <span>Home</span>
          </button>

          <button
            className="home-nav-item"
            onClick={onOpenFromComputer}
            title="Open from your local computer"
          >
            <Monitor size={15} />
            <span>This Device</span>
          </button>

          <button
            className="home-nav-item"
            onClick={() => alert('Lumora Drive is a local browser-indexed storage for saving your projects directly in memory.')}
            title="Lumora Storage Drive"
          >
            <HardDrive size={15} />
            <span>Lumora Drive</span>
          </button>

          <button
            className="home-nav-item"
            onClick={onOpenFromComputer}
            title="Connect Dropbox"
          >
            <Box size={15} />
            <span>Dropbox</span>
          </button>

          <button
            className="home-nav-item"
            onClick={onOpenFromComputer}
            title="Connect Microsoft OneDrive"
          >
            <Cloud size={15} />
            <span>OneDrive</span>
          </button>

          <button
            className="home-nav-item"
            onClick={onOpenFromComputer}
            title="Connect Google Drive"
          >
            <Cloud size={15} />
            <span>Google Drive</span>
          </button>

          <button
            className="home-nav-item"
            onClick={onOpenFromComputer}
            title="Pick any file from your computer"
          >
            <FolderOpen size={15} />
            <span>Pick any File</span>
          </button>
        </div>

        <div className="home-nav-divider" />

        <div className="home-nav-group">
          <button
            className="home-nav-item"
            onClick={onOpenTemplates}
            title="Browse pre-built design templates"
          >
            <LayoutTemplate size={15} />
            <span>Templates</span>
          </button>

          <button
            className="home-nav-item"
            onClick={onGenerateDemo}
            title="Generate a multi-layer sample artwork"
          >
            <Wand2 size={15} />
            <span>Generate Art</span>
          </button>

          <button
            className="home-nav-item"
            onClick={onShowShortcuts}
            title="View keyboard shortcuts"
          >
            <Keyboard size={15} />
            <span>Shortcuts</span>
          </button>
        </div>
      </aside>

      {/* Main Hero & Drop Zone Area */}
      <main className="lumora-home-main">
        {/* Brand Header */}
        <div className="lumora-home-hero">
          <div className="home-logo-wrap">
            <div className="home-logo-icon">
              <Sparkles size={38} color="#ffffff" />
            </div>
            <h1 className="home-logo-text">Lumora</h1>
          </div>
          <p className="home-subtitle">
            Free, Open-Source Online Photo Editor & Photoshop PSD Studio
          </p>
        </div>

        {/* Primary Action Buttons - Row 1 */}
        <div className="home-buttons-row">
          <button className="home-action-btn primary" onClick={onNewProject}>
            <FilePlus size={16} />
            <span>New Project</span>
          </button>

          <button className="home-action-btn primary" onClick={onOpenFromComputer}>
            <FolderOpen size={16} />
            <span>Open From Computer</span>
          </button>

          <button className="home-action-btn primary" onClick={onOpenTemplates}>
            <LayoutTemplate size={16} />
            <span>Templates</span>
          </button>
        </div>

        {/* Secondary Action Buttons - Row 2 */}
        <div className="home-buttons-row secondary-row">
          <button
            className="home-action-btn secondary"
            onClick={() => {
              if (window.matchMedia('(display-mode: standalone)').matches) {
                alert('Lumora Studio is already running in app mode!');
              } else {
                alert('Install Lumora Studio:\nClick your browser address bar menu (or three dots) and choose "Install Lumora Studio" or "Add to Desktop" for instant standalone offline access.');
              }
            }}
          >
            <Download size={14} />
            <span>Install Lumora</span>
          </button>

          <button className="home-action-btn secondary" onClick={onGenerateDemo}>
            <Wand2 size={14} />
            <span>Generate Demo</span>
          </button>

          <button className="home-action-btn secondary" onClick={onShowShortcuts}>
            <Keyboard size={14} />
            <span>Shortcuts</span>
          </button>
        </div>

        {/* Big Central Drop Area */}
        <div
          className={`home-dropzone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={onOpenFromComputer}
        >
          <div className="dropzone-content">
            <div className="dropzone-icon">
              <Layers size={36} color={isDragOver ? '#38bdf8' : '#777'} />
            </div>
            <span className="dropzone-text">Drop any files here</span>
            <span className="dropzone-hint">
              Supports PSD, AI, XD, FIG, SKETCH, PDF, RAW, PNG, JPEG, WEBP
            </span>
          </div>
        </div>

        {/* Bottom Format Icons Strip */}
        <div className="home-formats-strip">
          <div className="format-badge psd" onClick={onOpenFromComputer} title="Adobe Photoshop (.PSD)">
            <div className="format-icon">PSD</div>
            <span>.PSD</span>
          </div>

          <div className="format-badge ai" onClick={onOpenFromComputer} title="Adobe Illustrator (.AI)">
            <div className="format-icon">AI</div>
            <span>.AI</span>
          </div>

          <div className="format-badge xd" onClick={onOpenFromComputer} title="Adobe XD (.XD)">
            <div className="format-icon">XD</div>
            <span>.XD</span>
          </div>

          <div className="format-badge fig" onClick={onOpenFromComputer} title="Figma (.FIG)">
            <div className="format-icon">FIG</div>
            <span>.FIG</span>
          </div>

          <div className="format-badge sketch" onClick={onOpenFromComputer} title="Sketch (.sketch)">
            <div className="format-icon">💎</div>
            <span>.sketch</span>
          </div>

          <div className="format-badge pdf" onClick={onOpenFromComputer} title="Adobe PDF (.PDF)">
            <div className="format-icon">PDF</div>
            <span>.PDF</span>
          </div>

          <div className="format-badge raw" onClick={onOpenFromComputer} title="Digital Camera RAW">
            <div className="format-icon"><Camera size={13} /></div>
            <span>RAW</span>
          </div>

          <div className="format-badge any" onClick={onOpenFromComputer} title="Standard Images: JPG, PNG, WEBP, SVG, TIFF, GIF">
            <div className="format-icon"><FileText size={13} /></div>
            <span>ANY</span>
          </div>
        </div>
      </main>
    </div>
  );
};
