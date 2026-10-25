// Lumora Studio - Central Interactive Canvas Viewport
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  DocumentProject,
  Layer,
  ToolType,
  ToolOptions
} from '../types';
import { LumoraEngine, TransformHandle } from '../engine/LumoraEngine';
import { createLayerFromImageFile } from '../engine/ProjectIO';

interface CanvasViewportProps {
  document: DocumentProject;
  activeTool: ToolType;
  toolOptions: ToolOptions;
  onUpdateDocument: (updates: Partial<DocumentProject>) => void;
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void;
  onAddLayer: (layer: Layer) => void;
  onRecordHistory: (action: string) => void;
  onSelectLayer: (layerId: string) => void;
  onColorSampled: (color: string) => void;
  cropRect: { x: number; y: number; width: number; height: number } | null;
  onCropRectChange: (rect: { x: number; y: number; width: number; height: number } | null) => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  document: doc,
  activeTool,
  toolOptions,
  onUpdateDocument,
  onUpdateLayer,
  onAddLayer,
  onRecordHistory,
  onSelectLayer,
  onColorSampled,
  cropRect,
  onCropRectChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dragging and interaction state
  const isInteracting = useRef(false);
  const interactionMode = useRef<'pan' | 'transform' | 'brush' | 'eraser' | 'shape' | 'crop' | 'select' | null>(null);
  const activeHandle = useRef<TransformHandle>(null);

  // Position trackers
  const startMousePos = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  const startLayerState = useRef<{ x: number; y: number; width: number; height: number; rotation: number } | null>(null);
  const startDocPan = useRef({ panX: 0, panY: 0 });
  const spacePressed = useRef(false);

  // Offscreen temporary canvas for brush/eraser strokes and shape drawing preview
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active layer shortcut
  const activeLayer = doc.layers.find((l) => l.id === doc.activeLayerId);

  // Setup / Resize Viewport Canvas
  const resizeCanvas = useCallback(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvasRef.current.width = rect.width * dpr;
    canvasRef.current.height = rect.height * dpr;

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    }

    LumoraEngine.renderViewport(
      canvasRef.current,
      doc,
      activeTool,
      toolOptions,
      tempCanvasRef.current
    );
  }, [doc, activeTool, toolOptions]);

  // Re-render when doc, tool, or options change
  useEffect(() => {
    resizeCanvas();
  }, [doc, activeTool, toolOptions, resizeCanvas]);

  // Window resize observer
  useEffect(() => {
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resizeCanvas]);

  // Spacebar pan listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !spacePressed.current && (e.target as HTMLElement).tagName !== 'INPUT') {
        spacePressed.current = true;
        if (containerRef.current) containerRef.current.style.cursor = 'grab';
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spacePressed.current = false;
        if (containerRef.current) containerRef.current.style.cursor = 'default';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize crop rect when Crop tool is selected
  useEffect(() => {
    if (activeTool === 'crop' && !cropRect) {
      onCropRectChange({
        x: 0,
        y: 0,
        width: doc.width,
        height: doc.height
      });
    }
  }, [activeTool, cropRect, doc.width, doc.height, onCropRectChange]);

  // Wheel Zoom and Wheel Pan
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (e.ctrlKey || e.metaKey || activeTool === 'zoom') {
      // Zoom centered at cursor
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      const newZoom = Math.max(0.05, Math.min(32.0, doc.zoom * zoomFactor));

      // Zoom towards cursor formula:
      const centerX = rect.width / 2 + doc.panX;
      const centerY = rect.height / 2 + doc.panY;
      const newPanX = doc.panX + (mouseX - centerX) * (1 - zoomFactor);
      const newPanY = doc.panY + (mouseY - centerY) * (1 - zoomFactor);

      onUpdateDocument({ zoom: newZoom, panX: newPanX, panY: newPanY });
    } else {
      // Pan
      onUpdateDocument({
        panX: doc.panX - e.deltaX,
        panY: doc.panY - e.deltaY
      });
    }
  };

  // Convert mouse event to screen coords relative to container
  const getScreenPos = (e: React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // Pointer Down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const screenPos = getScreenPos(e);
    startMousePos.current = screenPos;
    lastMousePos.current = screenPos;
    isInteracting.current = true;

    // Check for Hand tool or Space+Pan
    if (activeTool === 'hand' || spacePressed.current || e.button === 1) {
      interactionMode.current = 'pan';
      startDocPan.current = { panX: doc.panX, panY: doc.panY };
      if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
      return;
    }

    // Check for Zoom tool
    if (activeTool === 'zoom') {
      const zoomFactor = e.altKey || e.shiftKey ? 0.75 : 1.33;
      const newZoom = Math.max(0.05, Math.min(32.0, doc.zoom * zoomFactor));
      onUpdateDocument({ zoom: newZoom });
      isInteracting.current = false;
      return;
    }

    // Check for Eyedropper tool
    if (activeTool === 'eyedropper') {
      sampleColorAtScreenPos(screenPos.x, screenPos.y);
      isInteracting.current = false;
      return;
    }

    // Check for Move Tool / Transform handles
    if (activeTool === 'move') {
      const rect = containerRef.current.getBoundingClientRect();

      // Check handle on active layer first
      if (activeLayer && activeLayer.visible && !activeLayer.locked) {
        const handle = LumoraEngine.hitTestHandle(
          screenPos.x,
          screenPos.y,
          rect.width,
          rect.height,
          doc,
          activeLayer
        );

        if (handle) {
          activeHandle.current = handle;
          interactionMode.current = 'transform';
          startLayerState.current = {
            x: activeLayer.x,
            y: activeLayer.y,
            width: activeLayer.width,
            height: activeLayer.height,
            rotation: activeLayer.rotation
          };
          return;
        }
      }

      // If auto-select enabled, test hitting any visible layer from top to bottom
      if (toolOptions.move.autoSelect) {
        for (let i = doc.layers.length - 1; i >= 0; i--) {
          const l = doc.layers[i];
          if (!l.visible || l.locked) continue;
          const handle = LumoraEngine.hitTestHandle(
            screenPos.x,
            screenPos.y,
            rect.width,
            rect.height,
            doc,
            l
          );
          if (handle) {
            onSelectLayer(l.id);
            activeHandle.current = handle;
            interactionMode.current = 'transform';
            startLayerState.current = {
              x: l.x,
              y: l.y,
              width: l.width,
              height: l.height,
              rotation: l.rotation
            };
            return;
          }
        }
      }
    }

    // Check for Text tool click
    if (activeTool === 'text') {
      const rect = containerRef.current.getBoundingClientRect();
      const docCoords = LumoraEngine.screenToDocumentCoords(
        screenPos.x,
        screenPos.y,
        rect.width,
        rect.height,
        doc
      );

      const defaultText = prompt('Enter Text:', 'Lumora Studio');
      if (defaultText && defaultText.trim()) {
        const textCanvas = document.createElement('canvas');
        textCanvas.width = 600;
        textCanvas.height = 160;

        const newTextLayer: Layer = {
          id: 'text_' + Date.now(),
          name: defaultText.slice(0, 15),
          type: 'text',
          visible: true,
          locked: false,
          opacity: 1,
          blendMode: 'source-over',
          x: Math.max(0, docCoords.docX),
          y: Math.max(0, docCoords.docY),
          width: 500,
          height: 120,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          canvas: textCanvas,
          textConfig: {
            text: defaultText,
            fontSize: toolOptions.text.fontSize,
            fontFamily: toolOptions.text.fontFamily,
            color: toolOptions.text.color,
            bold: toolOptions.text.bold,
            italic: toolOptions.text.italic
          },
          adjustments: {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            grayscale: false,
            invert: false,
            sepia: 0,
            blur: 0
          }
        };

        onAddLayer(newTextLayer);
        onRecordHistory('Add Text Layer');
      }
      isInteracting.current = false;
      return;
    }

    // Check for Brush Tool
    if (activeTool === 'brush') {
      if (!activeLayer || activeLayer.locked || !activeLayer.visible) {
        alert('Please select or create an editable paint/image layer to draw on.');
        isInteracting.current = false;
        return;
      }
      interactionMode.current = 'brush';
      initTempDrawCanvas();
      drawStroke(screenPos, screenPos, true);
      return;
    }

    // Check for Eraser Tool
    if (activeTool === 'eraser') {
      if (!activeLayer || activeLayer.locked || !activeLayer.visible) {
        alert('Please select an unlocked visible layer to erase from.');
        isInteracting.current = false;
        return;
      }
      interactionMode.current = 'eraser';
      erasePixels(screenPos, screenPos);
      return;
    }

    // Check for Shape Tool
    if (activeTool === 'shape') {
      interactionMode.current = 'shape';
      initTempDrawCanvas();
      return;
    }
  };

  // Pointer Move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const screenPos = getScreenPos(e);

    // Update dynamic cursor if not interacting
    if (!isInteracting.current) {
      updateHoverCursor(screenPos);
      return;
    }

    const dx = screenPos.x - lastMousePos.current.x;
    const dy = screenPos.y - lastMousePos.current.y;
    const totalDx = screenPos.x - startMousePos.current.x;
    const totalDy = screenPos.y - startMousePos.current.y;

    // Pan Mode
    if (interactionMode.current === 'pan') {
      onUpdateDocument({
        panX: startDocPan.current.panX + totalDx,
        panY: startDocPan.current.panY + totalDy
      });
      lastMousePos.current = screenPos;
      return;
    }

    // Transform Mode (Move, Resize, Rotate layer)
    if (interactionMode.current === 'transform' && activeLayer && startLayerState.current) {
      const handle = activeHandle.current;
      const docDx = totalDx / doc.zoom;
      const docDy = totalDy / doc.zoom;

      if (handle === 'move') {
        onUpdateLayer(activeLayer.id, {
          x: Math.round(startLayerState.current.x + docDx),
          y: Math.round(startLayerState.current.y + docDy)
        });
      } else if (handle === 'rot') {
        // Rotation handle
        const rect = containerRef.current.getBoundingClientRect();
        const docCoords = LumoraEngine.screenToDocumentCoords(screenPos.x, screenPos.y, rect.width, rect.height, doc);
        const layerCenterX = activeLayer.x + activeLayer.width / 2;
        const layerCenterY = activeLayer.y + activeLayer.height / 2;
        const angle = Math.atan2(docCoords.docY - layerCenterY, docCoords.docX - layerCenterX);
        const degrees = Math.round((angle * 180) / Math.PI + 90);
        onUpdateLayer(activeLayer.id, { rotation: (degrees + 360) % 360 });
      } else if (handle) {
        // Resize handle
        let newX = startLayerState.current.x;
        let newY = startLayerState.current.y;
        let newW = startLayerState.current.width;
        let newH = startLayerState.current.height;

        if (handle.includes('e')) newW = Math.max(20, startLayerState.current.width + docDx);
        if (handle.includes('s')) newH = Math.max(20, startLayerState.current.height + docDy);
        if (handle.includes('w')) {
          const delta = Math.min(docDx, startLayerState.current.width - 20);
          newX = startLayerState.current.x + delta;
          newW = startLayerState.current.width - delta;
        }
        if (handle.includes('n')) {
          const delta = Math.min(docDy, startLayerState.current.height - 20);
          newY = startLayerState.current.y + delta;
          newH = startLayerState.current.height - delta;
        }

        onUpdateLayer(activeLayer.id, {
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH)
        });
      }

      lastMousePos.current = screenPos;
      return;
    }

    // Brush Mode
    if (interactionMode.current === 'brush') {
      drawStroke(lastMousePos.current, screenPos, false);
      lastMousePos.current = screenPos;
      return;
    }

    // Eraser Mode
    if (interactionMode.current === 'eraser') {
      erasePixels(lastMousePos.current, screenPos);
      lastMousePos.current = screenPos;
      return;
    }

    // Shape Drawing Preview Mode
    if (interactionMode.current === 'shape') {
      drawShapePreview(startMousePos.current, screenPos);
      lastMousePos.current = screenPos;
      return;
    }
  };

  // Pointer Up / Commit Action
  const handleMouseUp = () => {
    if (!isInteracting.current) return;
    isInteracting.current = false;

    if (interactionMode.current === 'transform') {
      onRecordHistory('Transform Layer');
    } else if (interactionMode.current === 'brush' && activeLayer && tempCanvasRef.current) {
      // Commit stroke from tempCanvas to active layer canvas
      const ctx = activeLayer.canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.globalAlpha = toolOptions.brush.opacity;
        ctx.drawImage(tempCanvasRef.current, 0, 0);
        ctx.restore();
      }
      clearTempCanvas();
      onRecordHistory('Brush Stroke');
    } else if (interactionMode.current === 'eraser') {
      onRecordHistory('Eraser Stroke');
    } else if (interactionMode.current === 'shape') {
      commitShapeLayer();
    }

    interactionMode.current = null;
    activeHandle.current = null;
    if (containerRef.current) {
      containerRef.current.style.cursor = spacePressed.current ? 'grab' : 'default';
    }
    resizeCanvas();
  };

  // Eyedropper Color Sampler
  const sampleColorAtScreenPos = (screenX: number, screenY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const docCoords = LumoraEngine.screenToDocumentCoords(screenX, screenY, rect.width, rect.height, doc);

    const merged = LumoraEngine.renderMergedCanvas(doc);
    const mctx = merged.getContext('2d');
    if (!mctx) return;

    if (docCoords.docX >= 0 && docCoords.docX < doc.width && docCoords.docY >= 0 && docCoords.docY < doc.height) {
      const pixel = mctx.getImageData(docCoords.docX, docCoords.docY, 1, 1).data;
      const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
      onColorSampled(hex);
    }
  };

  // Initialize Temporary Canvas for Stroke/Shape Buffering
  const initTempDrawCanvas = () => {
    if (!activeLayer) return;
    if (!tempCanvasRef.current) {
      tempCanvasRef.current = document.createElement('canvas');
    }
    tempCanvasRef.current.width = activeLayer.canvas.width;
    tempCanvasRef.current.height = activeLayer.canvas.height;
    const tctx = tempCanvasRef.current.getContext('2d');
    if (tctx) tctx.clearRect(0, 0, tempCanvasRef.current.width, tempCanvasRef.current.height);
  };

  const clearTempCanvas = () => {
    if (tempCanvasRef.current) {
      const tctx = tempCanvasRef.current.getContext('2d');
      if (tctx) tctx.clearRect(0, 0, tempCanvasRef.current.width, tempCanvasRef.current.height);
    }
  };

  // Convert screen pos to layer-local coordinates
  const screenToLayerCoords = (screenPos: { x: number; y: number }) => {
    if (!containerRef.current || !activeLayer) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const docCoords = LumoraEngine.screenToDocumentCoords(screenPos.x, screenPos.y, rect.width, rect.height, doc);
    return {
      x: docCoords.docX - activeLayer.x,
      y: docCoords.docY - activeLayer.y
    };
  };

  // Draw Smooth Brush Stroke
  const drawStroke = (
    fromScreen: { x: number; y: number },
    toScreen: { x: number; y: number },
    isStart: boolean
  ) => {
    if (!activeLayer || !tempCanvasRef.current) return;
    const tctx = tempCanvasRef.current.getContext('2d');
    if (!tctx) return;

    const from = screenToLayerCoords(fromScreen);
    const to = screenToLayerCoords(toScreen);

    tctx.save();
    tctx.strokeStyle = toolOptions.brush.color;
    tctx.fillStyle = toolOptions.brush.color;
    tctx.lineWidth = toolOptions.brush.size;
    tctx.lineCap = 'round';
    tctx.lineJoin = 'round';

    tctx.beginPath();
    if (isStart) {
      tctx.arc(to.x, to.y, toolOptions.brush.size / 2, 0, Math.PI * 2);
      tctx.fill();
    } else {
      tctx.moveTo(from.x, from.y);
      tctx.lineTo(to.x, to.y);
      tctx.stroke();
    }
    tctx.restore();

    resizeCanvas();
  };

  // Erase Pixels Directly On Layer Canvas
  const erasePixels = (fromScreen: { x: number; y: number }, toScreen: { x: number; y: number }) => {
    if (!activeLayer) return;
    const ctx = activeLayer.canvas.getContext('2d');
    if (!ctx) return;

    const from = screenToLayerCoords(fromScreen);
    const to = screenToLayerCoords(toScreen);

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = toolOptions.eraser.opacity;
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.lineWidth = toolOptions.eraser.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();

    resizeCanvas();
  };

  // Preview Shape Dragging
  const drawShapePreview = (startScreen: { x: number; y: number }, currentScreen: { x: number; y: number }) => {
    if (!tempCanvasRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const startDoc = LumoraEngine.screenToDocumentCoords(startScreen.x, startScreen.y, rect.width, rect.height, doc);
    const currDoc = LumoraEngine.screenToDocumentCoords(currentScreen.x, currentScreen.y, rect.width, rect.height, doc);

    const tctx = tempCanvasRef.current.getContext('2d');
    if (!tctx) return;

    tctx.clearRect(0, 0, tempCanvasRef.current.width, tempCanvasRef.current.height);

    const x = Math.min(startDoc.docX, currDoc.docX);
    const y = Math.min(startDoc.docY, currDoc.docY);
    const w = Math.abs(currDoc.docX - startDoc.docX);
    const h = Math.abs(currDoc.docY - startDoc.docY);

    tctx.save();
    tctx.fillStyle = toolOptions.shape.fill;
    tctx.strokeStyle = toolOptions.shape.stroke;
    tctx.lineWidth = toolOptions.shape.strokeWidth;

    if (toolOptions.shape.shapeType === 'rect') {
      tctx.fillRect(x, y, w, h);
      if (toolOptions.shape.strokeWidth > 0) tctx.strokeRect(x, y, w, h);
    } else if (toolOptions.shape.shapeType === 'circle') {
      tctx.beginPath();
      tctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      tctx.fill();
      if (toolOptions.shape.strokeWidth > 0) tctx.stroke();
    } else if (toolOptions.shape.shapeType === 'line') {
      tctx.beginPath();
      tctx.moveTo(startDoc.docX, startDoc.docY);
      tctx.lineTo(currDoc.docX, currDoc.docY);
      tctx.stroke();
    }
    tctx.restore();

    resizeCanvas();
  };

  // Commit Created Shape to a New Shape Layer
  const commitShapeLayer = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const startDoc = LumoraEngine.screenToDocumentCoords(startMousePos.current.x, startMousePos.current.y, rect.width, rect.height, doc);
    const endDoc = LumoraEngine.screenToDocumentCoords(lastMousePos.current.x, lastMousePos.current.y, rect.width, rect.height, doc);

    const x = Math.min(startDoc.docX, endDoc.docX);
    const y = Math.min(startDoc.docY, endDoc.docY);
    const w = Math.max(10, Math.abs(endDoc.docX - startDoc.docX));
    const h = Math.max(10, Math.abs(endDoc.docY - startDoc.docY));

    const shapeCanvas = document.createElement('canvas');
    shapeCanvas.width = w;
    shapeCanvas.height = h;

    const newShapeLayer: Layer = {
      id: 'shape_' + Date.now(),
      name: `${toolOptions.shape.shapeType.toUpperCase()} Shape`,
      type: 'shape',
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'source-over',
      x,
      y,
      width: w,
      height: h,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      canvas: shapeCanvas,
      shapeConfig: {
        shapeType: toolOptions.shape.shapeType,
        fill: toolOptions.shape.fill,
        stroke: toolOptions.shape.stroke,
        strokeWidth: toolOptions.shape.strokeWidth
      },
      adjustments: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        grayscale: false,
        invert: false,
        sepia: 0,
        blur: 0
      }
    };

    onAddLayer(newShapeLayer);
    clearTempCanvas();
    onRecordHistory(`Add ${toolOptions.shape.shapeType} Shape`);
  };

  // Update Dynamic Cursor
  const updateHoverCursor = (screenPos: { x: number; y: number }) => {
    if (!containerRef.current) return;

    if (spacePressed.current || activeTool === 'hand') {
      containerRef.current.style.cursor = 'grab';
      return;
    }

    if (activeTool === 'zoom') {
      containerRef.current.style.cursor = 'zoom-in';
      return;
    }

    if (activeTool === 'eyedropper') {
      containerRef.current.style.cursor = 'crosshair';
      return;
    }

    if (activeTool === 'brush' || activeTool === 'eraser') {
      containerRef.current.style.cursor = 'crosshair';
      return;
    }

    if (activeTool === 'text') {
      containerRef.current.style.cursor = 'text';
      return;
    }

    if (activeTool === 'move' && activeLayer && activeLayer.visible && !activeLayer.locked) {
      const rect = containerRef.current.getBoundingClientRect();
      const handle = LumoraEngine.hitTestHandle(screenPos.x, screenPos.y, rect.width, rect.height, doc, activeLayer);

      if (handle === 'rot') containerRef.current.style.cursor = 'crosshair';
      else if (handle === 'nw' || handle === 'se') containerRef.current.style.cursor = 'nwse-resize';
      else if (handle === 'ne' || handle === 'sw') containerRef.current.style.cursor = 'nesw-resize';
      else if (handle === 'n' || handle === 's') containerRef.current.style.cursor = 'ns-resize';
      else if (handle === 'e' || handle === 'w') containerRef.current.style.cursor = 'ew-resize';
      else if (handle === 'move') containerRef.current.style.cursor = 'move';
      else containerRef.current.style.cursor = 'default';
      return;
    }

    containerRef.current.style.cursor = 'default';
  };

  // Drag and Drop File Import
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const { layer } = await createLayerFromImageFile(file);
        onAddLayer(layer);
        onRecordHistory(`Import ${file.name}`);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="viewport-canvas-container"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <canvas ref={canvasRef} className="viewport-canvas" />
    </div>
  );
};
