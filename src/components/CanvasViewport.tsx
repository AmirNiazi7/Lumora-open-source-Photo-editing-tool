// Lumora Studio - Central Interactive Canvas Viewport
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  DocumentProject,
  Layer,
  ToolType,
  ToolOptions
} from '../types';
import { LumoraEngine, TransformHandle, ShapePreview } from '../engine/LumoraEngine';
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
  onOpenProjectFile?: (file: File) => void;
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
  onCropRectChange,
  onOpenProjectFile
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dragging and interaction state
  const isInteracting = useRef(false);
  const interactionMode = useRef<'pan' | 'transform' | 'brush' | 'eraser' | 'shape' | 'crop' | 'select' | 'eyedropper' | null>(null);
  const activeHandle = useRef<TransformHandle>(null);
  const transformLayerId = useRef<string | null>(null);

  // Position trackers
  const startMousePos = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  const startLayerState = useRef<{ x: number; y: number; width: number; height: number; rotation: number } | null>(null);
  const startDocPan = useRef({ panX: 0, panY: 0 });
  const spacePressed = useRef(false);

  // Real-time eyedropper sampling loupe preview
  const [samplingLoupe, setSamplingLoupe] = useState<{ x: number; y: number; color: string; r: number; g: number; b: number } | null>(null);

  // Offscreen temporary canvas for brush/eraser strokes
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Real-time shape drawing preview
  const shapePreviewRef = useRef<ShapePreview | null>(null);
  // Active marquee selection box
  const marqueeRectRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // Active layer shortcut
  const activeLayer = doc.layers.find((l) => l.id === doc.activeLayerId);

  const docRef = useRef(doc);
  docRef.current = doc;
  const activeLayerRef = useRef(activeLayer);
  activeLayerRef.current = activeLayer;
  const toolOptionsRef = useRef(toolOptions);
  toolOptionsRef.current = toolOptions;
  const onUpdateLayerRef = useRef(onUpdateLayer);
  onUpdateLayerRef.current = onUpdateLayer;
  const onUpdateDocumentRef = useRef(onUpdateDocument);
  onUpdateDocumentRef.current = onUpdateDocument;
  const onColorSampledRef = useRef(onColorSampled);
  onColorSampledRef.current = onColorSampled;

  // Setup / Resize Viewport Canvas
  const resizeCanvas = useCallback(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvasRef.current.width = Math.round(rect.width * dpr);
    canvasRef.current.height = Math.round(rect.height * dpr);

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    }

    LumoraEngine.renderViewport(
      canvasRef.current,
      docRef.current,
      activeTool,
      toolOptionsRef.current,
      tempCanvasRef.current,
      shapePreviewRef.current,
      marqueeRectRef.current,
      rect.width,
      rect.height
    );
  }, [activeTool]);

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
      if (e.key === 'Escape' || (e.ctrlKey && e.key.toLowerCase() === 'd')) {
        if (marqueeRectRef.current) {
          marqueeRectRef.current = null;
          resizeCanvas();
        }
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && (e.target as HTMLElement).tagName !== 'INPUT') {
        if (marqueeRectRef.current && activeLayer && activeLayer.canvas && !activeLayer.locked) {
          const actx = activeLayer.canvas.getContext('2d');
          if (actx) {
            actx.clearRect(
              marqueeRectRef.current.x - activeLayer.x,
              marqueeRectRef.current.y - activeLayer.y,
              marqueeRectRef.current.width,
              marqueeRectRef.current.height
            );
            onUpdateLayer(activeLayer.id, { canvas: activeLayer.canvas });
            onRecordHistory('Clear Selection Area');
            resizeCanvas();
          }
        }
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
  // Pointer Down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const screenPos = getScreenPos(e);
    startMousePos.current = screenPos;
    lastMousePos.current = screenPos;

    // Check for Hand tool or Space+Pan
    if (activeTool === 'hand' || spacePressed.current || e.button === 1) {
      isInteracting.current = true;
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
      isInteracting.current = true;
      interactionMode.current = 'eyedropper';
      sampleColorAtScreenPos(screenPos.x, screenPos.y);
      return;
    }

    // Check for Move Tool / Transform handles
    if (activeTool === 'move') {
      const rect = containerRef.current.getBoundingClientRect();

      // Check handle or body on active layer first!
      if (activeLayer && activeLayer.visible && !activeLayer.locked) {
        const handle = LumoraEngine.hitTestHandle(
          screenPos.x,
          screenPos.y,
          rect.width,
          rect.height,
          docRef.current,
          activeLayer
        );

        if (handle) {
          activeHandle.current = handle;
          transformLayerId.current = activeLayer.id;
          isInteracting.current = true;
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
          // Never auto-select the Background layer if there are other layers
          if (l.name === 'Background' && doc.layers.length > 1) continue;
          if (l.id === activeLayer?.id) continue; // Already checked activeLayer

          const handle = LumoraEngine.hitTestHandle(
            screenPos.x,
            screenPos.y,
            rect.width,
            rect.height,
            docRef.current,
            l
          );
          if (handle) {
            onSelectLayer(l.id);
            activeHandle.current = handle;
            transformLayerId.current = l.id;
            isInteracting.current = true;
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

      // If Move tool clicked empty space without hitting any layer or handle, do not interact
      isInteracting.current = false;
      interactionMode.current = null;
      return;
    }

    // Check for Text tool click
    if (activeTool === 'text') {
      const rect = containerRef.current.getBoundingClientRect();

      // Check if clicking on an existing text layer
      for (let i = doc.layers.length - 1; i >= 0; i--) {
        const l = doc.layers[i];
        if (l.type === 'text' && l.visible && !l.locked) {
          const handle = LumoraEngine.hitTestHandle(screenPos.x, screenPos.y, rect.width, rect.height, doc, l);
          if (handle) {
            onSelectLayer(l.id);
            activeHandle.current = handle;
            interactionMode.current = 'transform';
            startLayerState.current = { x: l.x, y: l.y, width: l.width, height: l.height, rotation: l.rotation };
            return;
          }
        }
      }

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

        LumoraEngine.updateTextRasterCanvas(newTextLayer);
        onAddLayer(newTextLayer);
        onSelectLayer(newTextLayer.id);
        onRecordHistory('Add Text Layer');
      }
      isInteracting.current = false;
      return;
    }

    // Check for Brush Tool
    if (activeTool === 'brush') {
      let targetLayer = activeLayer;
      if (!targetLayer || targetLayer.locked || !targetLayer.visible || (targetLayer.type !== 'paint' && targetLayer.type !== 'image')) {
        const paintCanvas = document.createElement('canvas');
        paintCanvas.width = doc.width;
        paintCanvas.height = doc.height;
        const newLayer: Layer = {
          id: 'paint_' + Date.now(),
          name: `Paint Layer ${doc.layers.length + 1}`,
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
          canvas: paintCanvas,
          adjustments: { brightness: 0, contrast: 0, saturation: 0, grayscale: false, invert: false, sepia: 0, blur: 0 }
        };
        onAddLayer(newLayer);
        onSelectLayer(newLayer.id);
        targetLayer = newLayer;
      }
      isInteracting.current = true;
      interactionMode.current = 'brush';
      initTempDrawCanvas(targetLayer);
      drawStroke(screenPos, screenPos, true, targetLayer);
      return;
    }

    // Check for Eraser Tool
    if (activeTool === 'eraser') {
      if (!activeLayer || activeLayer.locked || !activeLayer.visible) {
        alert('Please select an unlocked visible layer to erase from.');
        isInteracting.current = false;
        return;
      }
      isInteracting.current = true;
      interactionMode.current = 'eraser';
      erasePixels(screenPos, screenPos);
      return;
    }

    // Check for Marquee Selection Tool
    if (activeTool === 'select') {
      isInteracting.current = true;
      interactionMode.current = 'select';
      marqueeRectRef.current = null;
      return;
    }

    // Check for Shape Tool
    if (activeTool === 'shape') {
      const rect = containerRef.current.getBoundingClientRect();

      // If active layer is a shape, check if user clicked on its handles or body to transform/drag it!
      if (activeLayer && activeLayer.type === 'shape' && activeLayer.visible && !activeLayer.locked) {
        const handle = LumoraEngine.hitTestHandle(screenPos.x, screenPos.y, rect.width, rect.height, docRef.current, activeLayer);
        if (handle) {
          activeHandle.current = handle;
          transformLayerId.current = activeLayer.id;
          isInteracting.current = true;
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

      // Check if user clicked another shape layer
      for (let i = doc.layers.length - 1; i >= 0; i--) {
        const l = doc.layers[i];
        if (l.type === 'shape' && l.visible && !l.locked && l.id !== activeLayer?.id) {
          const handle = LumoraEngine.hitTestHandle(screenPos.x, screenPos.y, rect.width, rect.height, docRef.current, l);
          if (handle) {
            onSelectLayer(l.id);
            activeHandle.current = handle;
            transformLayerId.current = l.id;
            isInteracting.current = true;
            interactionMode.current = 'transform';
            startLayerState.current = { x: l.x, y: l.y, width: l.width, height: l.height, rotation: l.rotation };
            return;
          }
        }
      }

      // Otherwise, prepare to draw a brand new shape
      isInteracting.current = true;
      interactionMode.current = 'shape';
      shapePreviewRef.current = null;
      return;
    }
  };

  // Pointer Move (Container Hover - only when not actively dragging)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    if (!isInteracting.current) {
      const screenPos = getScreenPos(e);
      updateHoverCursor(screenPos);
    }
  };

  // Pointer Up / Commit Action
  const handleMouseUp = () => {
    if (!isInteracting.current) return;
    isInteracting.current = false;

    if (interactionMode.current === 'transform') {
      const targetId = transformLayerId.current || activeLayer?.id;
      const target = docRef.current.layers.find((l) => l.id === targetId);
      if (target) {
        onUpdateLayerRef.current(target.id, {
          x: target.x,
          y: target.y,
          width: target.width,
          height: target.height,
          rotation: target.rotation
        });
      }
      onRecordHistory(`Move / Transform ${target ? target.name : 'Layer'}`);
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
    } else if (interactionMode.current === 'eyedropper') {
      setSamplingLoupe(null);
      onRecordHistory('Sample Color');
    } else if (interactionMode.current === 'select') {
      // Marquee selection remains active
      resizeCanvas();
    }

    interactionMode.current = null;
    activeHandle.current = null;
    transformLayerId.current = null;
    if (containerRef.current) {
      containerRef.current.style.cursor = spacePressed.current ? 'grab' : 'default';
    }
    resizeCanvas();
  };

  // Eyedropper Color Sampler - directly samples the rendered screen canvas pixel
  const sampleColorAtScreenPos = (screenX: number, screenY: number) => {
    if (!containerRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasX = Math.round(screenX * dpr);
    const canvasY = Math.round(screenY * dpr);

    if (canvasX >= 0 && canvasX < canvas.width && canvasY >= 0 && canvasY < canvas.height) {
      try {
        const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;

        setSamplingLoupe({
          x: screenX,
          y: screenY,
          color: hex,
          r,
          g,
          b
        });

        onColorSampledRef.current(hex);
      } catch (err) {
        console.warn('Eyedropper pixel read error:', err);
      }
    }
  };

  // Initialize Temporary Canvas for Stroke Buffering
  const initTempDrawCanvas = (targetLayer = activeLayer) => {
    if (!targetLayer) return;
    if (!tempCanvasRef.current) {
      tempCanvasRef.current = document.createElement('canvas');
    }
    tempCanvasRef.current.width = targetLayer.canvas.width;
    tempCanvasRef.current.height = targetLayer.canvas.height;
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
  const screenToLayerCoords = (screenPos: { x: number; y: number }, targetLayer = activeLayer) => {
    if (!containerRef.current || !targetLayer) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const docCoords = LumoraEngine.screenToDocumentCoords(screenPos.x, screenPos.y, rect.width, rect.height, doc);
    return {
      x: docCoords.docX - targetLayer.x,
      y: docCoords.docY - targetLayer.y
    };
  };

  // Draw Smooth Brush Stroke
  const drawStroke = (
    fromScreen: { x: number; y: number },
    toScreen: { x: number; y: number },
    isStart: boolean,
    targetLayer = activeLayer
  ) => {
    if (!targetLayer || !tempCanvasRef.current) return;
    const tctx = tempCanvasRef.current.getContext('2d');
    if (!tctx) return;

    const from = screenToLayerCoords(fromScreen, targetLayer);
    const to = screenToLayerCoords(toScreen, targetLayer);

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

  // Commit Created Shape to a New Shape Layer
  const commitShapeLayer = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentDoc = docRef.current;
    const startDoc = LumoraEngine.screenToDocumentCoords(startMousePos.current.x, startMousePos.current.y, rect.width, rect.height, currentDoc);
    const endDoc = LumoraEngine.screenToDocumentCoords(lastMousePos.current.x, lastMousePos.current.y, rect.width, rect.height, currentDoc);

    let x = Math.min(startDoc.docX, endDoc.docX);
    let y = Math.min(startDoc.docY, endDoc.docY);
    let w = Math.abs(endDoc.docX - startDoc.docX);
    let h = Math.abs(endDoc.docY - startDoc.docY);

    // If single click without dragging (drag distance < 8px), spawn default sized shape centered at click!
    if (w < 8 && h < 8) {
      w = toolOptions.shape.shapeType === 'line' ? 200 : 240;
      h = toolOptions.shape.shapeType === 'line' ? 0 : 160;
      x = Math.round(startDoc.docX - w / 2);
      y = Math.round(startDoc.docY - h / 2);
    }

    const shapeCanvas = document.createElement('canvas');
    shapeCanvas.width = Math.max(1, w);
    shapeCanvas.height = Math.max(1, h);

    const typeLabel =
      toolOptions.shape.shapeType === 'rect' ? 'Rectangle' : toolOptions.shape.shapeType === 'circle' ? 'Circle' : 'Line';

    const newShapeLayer: Layer = {
      id: 'shape_' + Date.now(),
      name: `${typeLabel} ${currentDoc.layers.filter((l) => l.type === 'shape').length + 1}`,
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
        strokeWidth: toolOptions.shape.strokeWidth,
        cornerRadius: toolOptions.shape.cornerRadius || 0
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

    LumoraEngine.updateShapeRasterCanvas(newShapeLayer);
    onAddLayer(newShapeLayer);
    onSelectLayer(newShapeLayer.id);
    transformLayerId.current = newShapeLayer.id;
    activeLayerRef.current = newShapeLayer;
    docRef.current = {
      ...currentDoc,
      layers: [...currentDoc.layers, newShapeLayer],
      activeLayerId: newShapeLayer.id
    };
    shapePreviewRef.current = null;
    clearTempCanvas();
    onRecordHistory(`Add ${newShapeLayer.name}`);
    resizeCanvas();
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

    if (activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'select') {
      containerRef.current.style.cursor = 'crosshair';
      return;
    }

    if (
      (activeTool === 'move' || activeTool === 'shape' || activeTool === 'text') &&
      activeLayer &&
      activeLayer.visible &&
      !activeLayer.locked
    ) {
      const rect = containerRef.current.getBoundingClientRect();
      const handle = LumoraEngine.hitTestHandle(screenPos.x, screenPos.y, rect.width, rect.height, doc, activeLayer);

      if (handle === 'rot') {
        containerRef.current.style.cursor = 'crosshair';
        return;
      }
      if (handle === 'nw' || handle === 'se') {
        containerRef.current.style.cursor = 'nwse-resize';
        return;
      }
      if (handle === 'ne' || handle === 'sw') {
        containerRef.current.style.cursor = 'nesw-resize';
        return;
      }
      if (handle === 'n' || handle === 's') {
        containerRef.current.style.cursor = 'ns-resize';
        return;
      }
      if (handle === 'e' || handle === 'w') {
        containerRef.current.style.cursor = 'ew-resize';
        return;
      }
      if (handle === 'move') {
        containerRef.current.style.cursor = 'move';
        return;
      }
    }

    if (activeTool === 'text') {
      containerRef.current.style.cursor = 'text';
      return;
    }

    if (activeTool === 'shape') {
      containerRef.current.style.cursor = 'crosshair';
      return;
    }

    containerRef.current.style.cursor = 'default';
  };

  // Window-level mouse listeners so dragging never gets dropped or stuck when leaving canvas
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isInteracting.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const screenPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      const currentDoc = docRef.current;
      const currentToolOptions = toolOptionsRef.current;
      const currentActiveLayer = activeLayerRef.current;
      const totalDx = screenPos.x - startMousePos.current.x;
      const totalDy = screenPos.y - startMousePos.current.y;

      if (interactionMode.current === 'pan') {
        onUpdateDocumentRef.current({
          panX: startDocPan.current.panX + totalDx,
          panY: startDocPan.current.panY + totalDy
        });
        lastMousePos.current = screenPos;
      } else if (interactionMode.current === 'eyedropper') {
        sampleColorAtScreenPos(screenPos.x, screenPos.y);
        lastMousePos.current = screenPos;
      } else if (interactionMode.current === 'transform' && startLayerState.current) {
        const targetId = transformLayerId.current || currentActiveLayer?.id;
        const target = currentDoc.layers.find((l) => l.id === targetId);
        if (!target) return;

        const handle = activeHandle.current;
        const docDx = totalDx / currentDoc.zoom;
        const docDy = totalDy / currentDoc.zoom;

        if (handle === 'move') {
          const newX = Math.round(startLayerState.current.x + docDx);
          const newY = Math.round(startLayerState.current.y + docDy);
          target.x = newX;
          target.y = newY;
          if (activeLayerRef.current && activeLayerRef.current.id === target.id) {
            activeLayerRef.current.x = newX;
            activeLayerRef.current.y = newY;
          }
          onUpdateLayerRef.current(target.id, { x: newX, y: newY });
        } else if (handle === 'rot') {
          const docCoords = LumoraEngine.screenToDocumentCoords(screenPos.x, screenPos.y, rect.width, rect.height, currentDoc);
          const layerCenterX = target.x + target.width / 2;
          const layerCenterY = target.y + target.height / 2;
          const angle = Math.atan2(docCoords.docY - layerCenterY, docCoords.docX - layerCenterX);
          const degrees = Math.round((angle * 180) / Math.PI + 90);
          const newRot = (degrees + 360) % 360;
          target.rotation = newRot;
          if (activeLayerRef.current && activeLayerRef.current.id === target.id) {
            activeLayerRef.current.rotation = newRot;
          }
          onUpdateLayerRef.current(target.id, { rotation: newRot });
        } else if (handle) {
          let newX = startLayerState.current.x;
          let newY = startLayerState.current.y;
          let newW = startLayerState.current.width;
          let newH = startLayerState.current.height;

          if (handle.includes('e')) newW = Math.max(10, startLayerState.current.width + docDx);
          if (handle.includes('s')) newH = Math.max(10, startLayerState.current.height + docDy);
          if (handle.includes('w')) {
            const delta = Math.min(docDx, startLayerState.current.width - 10);
            newX = startLayerState.current.x + delta;
            newW = startLayerState.current.width - delta;
          }
          if (handle.includes('n')) {
            const delta = Math.min(docDy, startLayerState.current.height - 10);
            newY = startLayerState.current.y + delta;
            newH = startLayerState.current.height - delta;
          }

          const newXRound = Math.round(newX);
          const newYRound = Math.round(newY);
          const newWRound = Math.round(newW);
          const newHRound = Math.round(newH);

          const updates: Partial<Layer> = {
            x: newXRound,
            y: newYRound,
            width: newWRound,
            height: newHRound
          };
          target.x = newXRound;
          target.y = newYRound;
          target.width = newWRound;
          target.height = newHRound;
          if (activeLayerRef.current && activeLayerRef.current.id === target.id) {
            activeLayerRef.current.x = newXRound;
            activeLayerRef.current.y = newYRound;
            activeLayerRef.current.width = newWRound;
            activeLayerRef.current.height = newHRound;
          }
          if (target.type === 'shape') {
            const updated = { ...target, ...updates };
            LumoraEngine.updateShapeRasterCanvas(updated);
            updates.canvas = updated.canvas;
            target.canvas = updated.canvas;
          }
          onUpdateLayerRef.current(target.id, updates);
        }

        resizeCanvas();
        lastMousePos.current = screenPos;
      } else if (interactionMode.current === 'shape') {
        const startDoc = LumoraEngine.screenToDocumentCoords(startMousePos.current.x, startMousePos.current.y, rect.width, rect.height, currentDoc);
        const currDoc = LumoraEngine.screenToDocumentCoords(screenPos.x, screenPos.y, rect.width, rect.height, currentDoc);
        const x = Math.min(startDoc.docX, currDoc.docX);
        const y = Math.min(startDoc.docY, currDoc.docY);
        const w = Math.max(2, Math.abs(currDoc.docX - startDoc.docX));
        const h = Math.max(2, Math.abs(currDoc.docY - startDoc.docY));

        shapePreviewRef.current = {
          x,
          y,
          width: w,
          height: h,
          shapeType: currentToolOptions.shape.shapeType,
          fill: currentToolOptions.shape.fill,
          stroke: currentToolOptions.shape.stroke,
          strokeWidth: currentToolOptions.shape.strokeWidth,
          cornerRadius: currentToolOptions.shape.cornerRadius || 0
        };
        resizeCanvas();
        lastMousePos.current = screenPos;
      } else if (interactionMode.current === 'select') {
        const startDoc = LumoraEngine.screenToDocumentCoords(startMousePos.current.x, startMousePos.current.y, rect.width, rect.height, currentDoc);
        const currDoc = LumoraEngine.screenToDocumentCoords(screenPos.x, screenPos.y, rect.width, rect.height, currentDoc);
        const x = Math.min(startDoc.docX, currDoc.docX);
        const y = Math.min(startDoc.docY, currDoc.docY);
        const w = Math.max(1, Math.abs(currDoc.docX - startDoc.docX));
        const h = Math.max(1, Math.abs(currDoc.docY - startDoc.docY));

        marqueeRectRef.current = { x, y, width: w, height: h };
        resizeCanvas();
        lastMousePos.current = screenPos;
      } else if (interactionMode.current === 'brush') {
        drawStroke(lastMousePos.current, screenPos, false);
        lastMousePos.current = screenPos;
      } else if (interactionMode.current === 'eraser') {
        erasePixels(lastMousePos.current, screenPos);
        lastMousePos.current = screenPos;
      }
    };

    const handleWindowMouseUp = () => {
      if (isInteracting.current) {
        handleMouseUp();
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [resizeCanvas]);

  // Drag and Drop File Import
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const lower = file.name.toLowerCase();
      if (lower.endsWith('.psd') || lower.endsWith('.lumora') || lower.endsWith('.json')) {
        if (onOpenProjectFile) {
          onOpenProjectFile(file);
        }
      } else if (file.type.startsWith('image/')) {
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

      {/* Real-time Eyedropper Sampling Loupe */}
      {samplingLoupe && (
        <div
          style={{
            position: 'absolute',
            left: `${samplingLoupe.x}px`,
            top: `${samplingLoupe.y}px`,
            transform: 'translate(-50%, -125%)',
            pointerEvents: 'none',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {/* Circular sampling ring */}
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: samplingLoupe.color,
              border: '3px solid #ffffff',
              boxShadow: '0 4px 14px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
          {/* High-contrast HEX badge */}
          <div
            style={{
              backgroundColor: '#181818',
              color: '#ffffff',
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid #444',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.5px'
            }}
          >
            {samplingLoupe.color}
          </div>
        </div>
      )}
    </div>
  );
};
