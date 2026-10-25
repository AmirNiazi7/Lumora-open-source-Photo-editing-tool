// Lumora Studio - Main Application Component
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  DocumentProject,
  Layer,
  ToolType,
  ToolOptions,
  HistoryItem
} from './types';
import { defaultAdjustments } from './engine/Adjustments';
import { HistoryManager } from './engine/HistoryManager';
import { LumoraEngine } from './engine/LumoraEngine';
import {
  exportCanvasAsBlob,
  downloadBlob,
  saveProjectFile,
  deserializeProject,
  createLayerFromImageFile,
  openPsdFile,
  exportProjectAsPsd
} from './engine/ProjectIO';
import { TopMenuBar } from './components/TopMenuBar';
import { ToolOptionsBar } from './components/ToolOptionsBar';
import { LeftToolbar } from './components/LeftToolbar';
import { DocumentTabs } from './components/DocumentTabs';
import { CanvasViewport } from './components/CanvasViewport';
import { RightSidebar } from './components/RightSidebar';
import { NewDocumentModal } from './components/NewDocumentModal';
import { AdjustmentsModal } from './components/AdjustmentsModal';
import { ShortcutsModal } from './components/ShortcutsModal';

const historyManager = new HistoryManager();

export const App: React.FC = () => {
  // Document State (Default: 1280x720 canvas)
  const [doc, setDoc] = useState<DocumentProject>(() => {
    // Initial Background Layer
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 1280;
    bgCanvas.height = 720;
    const bgCtx = bgCanvas.getContext('2d');
    if (bgCtx) {
      bgCtx.fillStyle = '#ffffff';
      bgCtx.fillRect(0, 0, 1280, 720);
    }

    const initialLayer: Layer = {
      id: 'layer_bg',
      name: 'Background',
      type: 'image',
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'source-over',
      x: 0,
      y: 0,
      width: 1280,
      height: 720,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      canvas: bgCanvas,
      adjustments: defaultAdjustments()
    };

    return {
      id: 'doc_' + Date.now(),
      name: 'New Project',
      width: 1280,
      height: 720,
      dpi: 72,
      background: 'white',
      layers: [initialLayer],
      activeLayerId: 'layer_bg',
      zoom: 1.0,
      panX: 0,
      panY: 0
    };
  });

  // Active Tool & Options State
  const [activeTool, setActiveTool] = useState<ToolType>('move');
  const [toolOptions, setToolOptions] = useState<ToolOptions>({
    brush: {
      size: 24,
      opacity: 1,
      color: '#e02424',
      hardness: 0.8
    },
    eraser: {
      size: 32,
      opacity: 1
    },
    text: {
      text: 'Lumora Studio',
      fontSize: 48,
      fontFamily: 'Inter, sans-serif',
      color: '#1a1a1a',
      bold: true,
      italic: false
    },
    shape: {
      shapeType: 'rect',
      fill: '#2675d9',
      stroke: '#111827',
      strokeWidth: 2
    },
    move: {
      autoSelect: true,
      showTransformControls: true
    },
    crop: {
      aspectRatio: 'free'
    },
    activeColor: '#e02424',
    secondaryColor: '#ffffff'
  });

  // History State
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [cropRect, setCropRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Modals
  const [isNewDocOpen, setIsNewDocOpen] = useState(false);
  const [isAdjustmentsOpen, setIsAdjustmentsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Hidden File Pickers
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const projectFileInputRef = useRef<HTMLInputElement>(null);

  // Record initial history state
  useEffect(() => {
    historyManager.clear();
    historyManager.recordState(doc, 'Initial Document');
    setHistoryList(historyManager.getHistoryList());
  }, []);

  const recordHistory = useCallback(
    (actionName: string) => {
      historyManager.recordState(doc, actionName);
      setHistoryList(historyManager.getHistoryList());
    },
    [doc]
  );

  // Document & Layer State Modifiers
  const updateDocument = (updates: Partial<DocumentProject>) => {
    setDoc((prev) => ({ ...prev, ...updates }));
  };

  const updateLayer = (layerId: string, updates: Partial<Layer>) => {
    setDoc((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === layerId ? { ...l, ...updates } : l))
    }));
  };

  const addLayer = (layer: Layer) => {
    setDoc((prev) => ({
      ...prev,
      layers: [...prev.layers, layer],
      activeLayerId: layer.id
    }));
  };

  // Undo / Redo Actions
  const handleUndo = () => {
    const result = historyManager.undo(doc);
    if (result) {
      setDoc((prev) => ({ ...prev, ...result.restoredDoc }));
      setHistoryList(historyManager.getHistoryList());
    }
  };

  const handleRedo = () => {
    const result = historyManager.redo(doc);
    if (result) {
      setDoc((prev) => ({ ...prev, ...result.restoredDoc }));
      setHistoryList(historyManager.getHistoryList());
    }
  };

  const handleJumpToHistory = (index: number) => {
    const restored = historyManager.jumpToHistoryIndex(index, doc);
    if (restored) {
      setDoc((prev) => ({ ...prev, ...restored }));
      setHistoryList(historyManager.getHistoryList());
    }
  };

  // Layer Operations
  const handleNewLayer = () => {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = doc.width;
    newCanvas.height = doc.height;

    const layer: Layer = {
      id: 'layer_' + Date.now(),
      name: `Layer ${doc.layers.length + 1}`,
      type: 'paint',
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'source-over',
      x: 0,
      y: 0,
      width: doc.width,
      height: doc.height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      canvas: newCanvas,
      adjustments: defaultAdjustments()
    };

    addLayer(layer);
    recordHistory('New Layer');
  };

  const handleDuplicateLayer = () => {
    const active = doc.layers.find((l) => l.id === doc.activeLayerId);
    if (!active) return;

    const dupCanvas = document.createElement('canvas');
    dupCanvas.width = active.canvas.width;
    dupCanvas.height = active.canvas.height;
    const ctx = dupCanvas.getContext('2d');
    if (ctx && active.canvas.width > 0) {
      ctx.drawImage(active.canvas, 0, 0);
    }

    const dupLayer: Layer = {
      ...active,
      id: 'layer_' + Date.now(),
      name: `${active.name} copy`,
      x: active.x + 20,
      y: active.y + 20,
      canvas: dupCanvas,
      adjustments: { ...active.adjustments }
    };

    addLayer(dupLayer);
    recordHistory(`Duplicate ${active.name}`);
  };

  const handleDeleteLayer = () => {
    if (doc.layers.length <= 1 || !doc.activeLayerId) return;
    const activeIndex = doc.layers.findIndex((l) => l.id === doc.activeLayerId);
    const deletedName = doc.layers[activeIndex].name;
    const remaining = doc.layers.filter((l) => l.id !== doc.activeLayerId);
    const newActiveId = remaining[Math.max(0, activeIndex - 1)].id;

    setDoc((prev) => ({
      ...prev,
      layers: remaining,
      activeLayerId: newActiveId
    }));
    recordHistory(`Delete ${deletedName}`);
  };

  const handleMoveLayerUp = () => {
    if (!doc.activeLayerId) return;
    const idx = doc.layers.findIndex((l) => l.id === doc.activeLayerId);
    if (idx >= doc.layers.length - 1) return;

    const nextLayers = [...doc.layers];
    const temp = nextLayers[idx];
    nextLayers[idx] = nextLayers[idx + 1];
    nextLayers[idx + 1] = temp;

    setDoc((prev) => ({ ...prev, layers: nextLayers }));
    recordHistory('Reorder Layer Up');
  };

  const handleMoveLayerDown = () => {
    if (!doc.activeLayerId) return;
    const idx = doc.layers.findIndex((l) => l.id === doc.activeLayerId);
    if (idx <= 0) return;

    const nextLayers = [...doc.layers];
    const temp = nextLayers[idx];
    nextLayers[idx] = nextLayers[idx - 1];
    nextLayers[idx - 1] = temp;

    setDoc((prev) => ({ ...prev, layers: nextLayers }));
    recordHistory('Reorder Layer Down');
  };

  const handleFlipHorizontal = () => {
    const active = doc.layers.find((l) => l.id === doc.activeLayerId);
    if (!active) return;
    updateLayer(active.id, { scaleX: (active.scaleX || 1) * -1 });
    recordHistory('Flip Horizontal');
  };

  const handleFlipVertical = () => {
    const active = doc.layers.find((l) => l.id === doc.activeLayerId);
    if (!active) return;
    updateLayer(active.id, { scaleY: (active.scaleY || 1) * -1 });
    recordHistory('Flip Vertical');
  };

  const handleRotate90 = () => {
    const active = doc.layers.find((l) => l.id === doc.activeLayerId);
    if (!active) return;
    updateLayer(active.id, { rotation: ((active.rotation || 0) + 90) % 360 });
    recordHistory('Rotate 90°');
  };

  // Zoom Controls
  const handleZoomIn = () => {
    updateDocument({ zoom: Math.min(32.0, doc.zoom * 1.25) });
  };

  const handleZoomOut = () => {
    updateDocument({ zoom: Math.max(0.05, doc.zoom * 0.8) });
  };

  const handleActualSize = () => {
    updateDocument({ zoom: 1.0, panX: 0, panY: 0 });
  };

  const handleFitToScreen = () => {
    const container = window.document.querySelector('.viewport-canvas-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const margin = 60;
    const scaleX = (rect.width - margin) / doc.width;
    const scaleY = (rect.height - margin) / doc.height;
    const fitZoom = Math.min(scaleX, scaleY, 1.5);
    updateDocument({ zoom: fitZoom, panX: 0, panY: 0 });
  };

  // New Document Creation
  const handleCreateNewDocument = (
    name: string,
    width: number,
    height: number,
    dpi: number,
    background: 'transparent' | 'white' | 'black'
  ) => {
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = width;
    bgCanvas.height = height;
    const bgCtx = bgCanvas.getContext('2d');
    if (bgCtx && background !== 'transparent') {
      bgCtx.fillStyle = background;
      bgCtx.fillRect(0, 0, width, height);
    }

    const bgLayer: Layer = {
      id: 'layer_bg_' + Date.now(),
      name: 'Background',
      type: 'image',
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'source-over',
      x: 0,
      y: 0,
      width,
      height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      canvas: bgCanvas,
      adjustments: defaultAdjustments()
    };

    const newDoc: DocumentProject = {
      id: 'doc_' + Date.now(),
      name,
      width,
      height,
      dpi,
      background,
      layers: [bgLayer],
      activeLayerId: bgLayer.id,
      zoom: 1.0,
      panX: 0,
      panY: 0
    };

    setDoc(newDoc);
    historyManager.clear();
    historyManager.recordState(newDoc, 'Create Project');
    setHistoryList(historyManager.getHistoryList());

    setTimeout(handleFitToScreen, 100);
  };

  // Import Image from Computer
  const handleImageFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const { layer } = await createLayerFromImageFile(file);
      addLayer(layer);
      recordHistory(`Import ${file.name}`);
      e.target.value = '';
    }
  };

  // Open .psd or .lumora Project File
  const handleOpenProjectOrPsdFile = async (file: File) => {
    try {
      let loadedDoc: DocumentProject;
      if (file.name.toLowerCase().endsWith('.psd')) {
        loadedDoc = await openPsdFile(file);
      } else {
        const text = await file.text();
        loadedDoc = await deserializeProject(text);
      }
      setDoc(loadedDoc);
      historyManager.clear();
      historyManager.recordState(loadedDoc, `Open ${file.name}`);
      setHistoryList(historyManager.getHistoryList());
      setTimeout(handleFitToScreen, 100);
    } catch (err: any) {
      alert('Failed to load project: ' + (err?.message || err));
      console.error('File load error:', err);
    }
  };

  const handleProjectFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await handleOpenProjectOrPsdFile(file);
      e.target.value = '';
    }
  };

  // Export as PSD (Adobe Photoshop with layers)
  const handleExportPsd = () => {
    try {
      exportProjectAsPsd(doc);
    } catch (err: any) {
      alert('Failed to export PSD: ' + (err?.message || err));
      console.error('PSD export error:', err);
    }
  };

  // Export as PNG / JPEG
  const handleExportPng = async () => {
    const merged = LumoraEngine.renderMergedCanvas(doc);
    const blob = await exportCanvasAsBlob(merged, 'png');
    downloadBlob(blob, `${doc.name}.png`);
  };

  const handleExportJpeg = async () => {
    const merged = LumoraEngine.renderMergedCanvas(doc);
    const blob = await exportCanvasAsBlob(merged, 'jpeg', 0.92);
    downloadBlob(blob, `${doc.name}.jpg`);
  };

  // Save Project File (.lumora)
  const handleSaveProject = () => {
    saveProjectFile(doc);
  };

  // Apply Crop
  const handleApplyCrop = () => {
    if (!cropRect) return;
    const { width: newW, height: newH, x: cropX, y: cropY } = cropRect;
    if (newW < 20 || newH < 20) return;

    // Shift all layers by -cropX, -cropY
    const croppedLayers = doc.layers.map((l) => ({
      ...l,
      x: l.x - cropX,
      y: l.y - cropY
    }));

    const nextDoc: DocumentProject = {
      ...doc,
      width: Math.round(newW),
      height: Math.round(newH),
      layers: croppedLayers
    };

    setDoc(nextDoc);
    setCropRect(null);
    setActiveTool('move');
    recordHistory('Crop Document');
  };

  const handleCancelCrop = () => {
    setCropRect(null);
    setActiveTool('move');
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'SELECT') {
        return;
      }

      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      if (ctrlOrCmd && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }

      if (ctrlOrCmd && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (ctrlOrCmd && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveProject();
        return;
      }

      if (ctrlOrCmd && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        imageFileInputRef.current?.click();
        return;
      }

      if (ctrlOrCmd && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNewDocOpen(true);
        return;
      }

      if (ctrlOrCmd && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        handleDuplicateLayer();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteLayer();
        return;
      }

      // Single-key Tool Shortcuts
      const key = e.key.toLowerCase();
      if (key === 'v') setActiveTool('move');
      else if (key === 'm') setActiveTool('select');
      else if (key === 'c') setActiveTool('crop');
      else if (key === 'b') setActiveTool('brush');
      else if (key === 'e') setActiveTool('eraser');
      else if (key === 't') setActiveTool('text');
      else if (key === 'u') setActiveTool('shape');
      else if (key === 'i') setActiveTool('eyedropper');
      else if (key === 'h') setActiveTool('hand');
      else if (key === 'z') setActiveTool('zoom');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [doc]);

  const activeLayer = doc.layers.find((l) => l.id === doc.activeLayerId);

  return (
    <div className="lumora-app">
      {/* Hidden File Pickers */}
      <input
        type="file"
        ref={imageFileInputRef}
        style={{ display: 'none' }}
        accept="image/png,image/jpeg,image/webp"
        onChange={handleImageFileSelected}
      />
      <input
        type="file"
        ref={projectFileInputRef}
        style={{ display: 'none' }}
        accept=".psd,.lumora,.json"
        onChange={handleProjectFileSelected}
      />

      {/* Top Menu Bar */}
      <div className="lumora-header">
        <TopMenuBar
          onNewDocument={() => setIsNewDocOpen(true)}
          onOpenImage={() => imageFileInputRef.current?.click()}
          onSaveProject={handleSaveProject}
          onOpenProject={() => projectFileInputRef.current?.click()}
          onExportPsd={handleExportPsd}
          onExportPng={handleExportPng}
          onExportJpeg={handleExportJpeg}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyManager.canUndo()}
          canRedo={historyManager.canRedo()}
          onOpenAdjustments={() => setIsAdjustmentsOpen(true)}
          onFlipHorizontal={handleFlipHorizontal}
          onFlipVertical={handleFlipVertical}
          onRotate90={handleRotate90}
          onNewLayer={handleNewLayer}
          onDeleteLayer={handleDeleteLayer}
          onDuplicateLayer={handleDuplicateLayer}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitToScreen={handleFitToScreen}
          onActualSize={handleActualSize}
          onShowShortcuts={() => setIsShortcutsOpen(true)}
        />

        {/* Tool Options Bar */}
        <ToolOptionsBar
          activeTool={activeTool}
          options={toolOptions}
          onOptionsChange={(newOpts) => setToolOptions((prev) => ({ ...prev, ...newOpts }))}
          onApplyCrop={handleApplyCrop}
          onCancelCrop={handleCancelCrop}
          onFlipHorizontal={handleFlipHorizontal}
          onFlipVertical={handleFlipVertical}
          onRotate90={handleRotate90}
          onFitToScreen={handleFitToScreen}
          onActualSize={handleActualSize}
        />
      </div>

      {/* Main Workspace Layout */}
      <div className="lumora-workspace">
        {/* Left Toolbar */}
        <LeftToolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          options={toolOptions}
          onOptionsChange={(newOpts) => setToolOptions((prev) => ({ ...prev, ...newOpts }))}
        />

        {/* Central Viewport */}
        <div className="lumora-center">
          <DocumentTabs
            document={doc}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitToScreen={handleFitToScreen}
            onActualSize={handleActualSize}
          />

          <CanvasViewport
            document={doc}
            activeTool={activeTool}
            toolOptions={toolOptions}
            onUpdateDocument={updateDocument}
            onUpdateLayer={updateLayer}
            onAddLayer={addLayer}
            onRecordHistory={recordHistory}
            onSelectLayer={(id) => updateDocument({ activeLayerId: id })}
            onColorSampled={(col) =>
              setToolOptions((prev) => ({
                ...prev,
                activeColor: col,
                brush: { ...prev.brush, color: col },
                text: { ...prev.text, color: col },
                shape: { ...prev.shape, fill: col }
              }))
            }
            cropRect={cropRect}
            onCropRectChange={setCropRect}
            onOpenProjectFile={handleOpenProjectOrPsdFile}
          />

          {/* Status Bar */}
          <div className="lumora-statusbar">
            <span>
              Document: {doc.width} × {doc.height}px | DPI: {doc.dpi} | {doc.layers.length} Layers
            </span>
            <span>
              Active: {activeLayer ? `${activeLayer.name} (${activeLayer.type})` : 'None'} | Tool:{' '}
              {activeTool.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Right Sidebar (Layers & History) */}
        <RightSidebar
          layers={doc.layers}
          activeLayerId={doc.activeLayerId}
          historyItems={historyList}
          onSelectLayer={(id) => updateDocument({ activeLayerId: id })}
          onToggleVisibility={(id) => {
            const l = doc.layers.find((ly) => ly.id === id);
            if (l) updateLayer(id, { visible: !l.visible });
          }}
          onToggleLock={(id) => {
            const l = doc.layers.find((ly) => ly.id === id);
            if (l) updateLayer(id, { locked: !l.locked });
          }}
          onUpdateLayer={updateLayer}
          onNewLayer={handleNewLayer}
          onDuplicateLayer={handleDuplicateLayer}
          onDeleteLayer={handleDeleteLayer}
          onMoveLayerUp={handleMoveLayerUp}
          onMoveLayerDown={handleMoveLayerDown}
          onJumpToHistory={handleJumpToHistory}
          onOpenAdjustments={() => setIsAdjustmentsOpen(true)}
        />
      </div>

      {/* Modals */}
      <NewDocumentModal
        isOpen={isNewDocOpen}
        onClose={() => setIsNewDocOpen(false)}
        onCreate={handleCreateNewDocument}
      />

      {activeLayer && (
        <AdjustmentsModal
          isOpen={isAdjustmentsOpen}
          initialAdjustments={activeLayer.adjustments}
          layerName={activeLayer.name}
          onClose={() => setIsAdjustmentsOpen(false)}
          onApply={(newAdj) => {
            updateLayer(activeLayer.id, { adjustments: newAdj });
            recordHistory(`Adjust ${activeLayer.name}`);
          }}
        />
      )}

      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
};
