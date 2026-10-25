// Lumora Studio - Core 2D Canvas Engine
import { DocumentProject, Layer, ToolOptions, ToolType } from '../types';
import { applyAdjustmentsToImageData } from './Adjustments';

export type TransformHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rot' | 'move' | null;

export interface ShapePreview {
  x: number;
  y: number;
  width: number;
  height: number;
  shapeType: 'rect' | 'circle' | 'line';
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number;
}

export class LumoraEngine {
  // Checkerboard pattern generator
  private static checkerPattern: CanvasPattern | null = null;

  public static getCheckerboardPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
    if (this.checkerPattern) return this.checkerPattern;

    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 16;
    patternCanvas.height = 16;
    const pctx = patternCanvas.getContext('2d');
    if (!pctx) return null;

    // Dark checkerboard tones matching Photopea (#2c2c2c and #222222)
    pctx.fillStyle = '#2a2a2a';
    pctx.fillRect(0, 0, 16, 16);
    pctx.fillStyle = '#212121';
    pctx.fillRect(0, 0, 8, 8);
    pctx.fillRect(8, 8, 8, 8);

    this.checkerPattern = ctx.createPattern(patternCanvas, 'repeat');
    return this.checkerPattern;
  }

  /**
   * Render the entire document and all layers onto the main viewport canvas
   */
  public static renderViewport(
    screenCanvas: HTMLCanvasElement,
    doc: DocumentProject,
    activeTool: ToolType,
    toolOptions: ToolOptions,
    tempDrawCanvas?: HTMLCanvasElement | null,
    shapePreview?: ShapePreview | null,
    marqueeRect?: { x: number; y: number; width: number; height: number } | null
  ): void {
    const ctx = screenCanvas.getContext('2d');
    if (!ctx) return;

    const viewWidth = screenCanvas.width;
    const viewHeight = screenCanvas.height;

    // 1. Clear entire viewport with dark background (#181818)
    ctx.fillStyle = '#181818';
    ctx.fillRect(0, 0, viewWidth, viewHeight);

    // Save state before viewport transformation
    ctx.save();

    // 2. Center document in viewport + apply Pan and Zoom
    const centerX = viewWidth / 2 + doc.panX;
    const centerY = viewHeight / 2 + doc.panY;
    ctx.translate(centerX, centerY);
    ctx.scale(doc.zoom, doc.zoom);

    // Document top-left coordinate in transformed space
    const docX = -doc.width / 2;
    const docY = -doc.height / 2;

    // 3. Draw Document Drop Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 24 / doc.zoom;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6 / doc.zoom;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(docX, docY, doc.width, doc.height);
    ctx.restore();

    // 4. Fill Document Base (Checkerboard or solid)
    if (doc.background === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(docX, docY, doc.width, doc.height);
    } else if (doc.background === 'black') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(docX, docY, doc.width, doc.height);
    } else {
      // Transparency checkerboard
      const pattern = this.getCheckerboardPattern(ctx);
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(docX, docY, doc.width, doc.height);
      }
    }

    // 5. Clip rendering to document bounds
    ctx.save();
    ctx.beginPath();
    ctx.rect(docX, docY, doc.width, doc.height);
    ctx.clip();

    // 6. Composite Layers from bottom to top
    for (const layer of doc.layers) {
      if (!layer.visible) continue;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, layer.opacity));
      ctx.globalCompositeOperation = layer.blendMode || 'source-over';

      // Transform layer coordinates relative to document
      ctx.translate(docX + layer.x, docY + layer.y);
      if (layer.rotation) {
        const rad = (layer.rotation * Math.PI) / 180;
        ctx.translate(layer.width / 2, layer.height / 2);
        ctx.rotate(rad);
        ctx.translate(-layer.width / 2, -layer.height / 2);
      }
      ctx.scale(layer.scaleX || 1, layer.scaleY || 1);

      // Render layer content
      if (layer.type === 'text' && layer.textConfig) {
        this.renderTextLayer(ctx, layer);
      } else if (layer.type === 'shape' && layer.shapeConfig) {
        this.renderShapeLayer(ctx, layer);
      } else if (layer.canvas) {
        // Raster layer (image or paint)
        this.renderRasterLayer(ctx, layer);
      }

      ctx.restore();
    }

    // If an active in-progress stroke exists on active layer, render it
    if (tempDrawCanvas && doc.activeLayerId) {
      const activeLayer = doc.layers.find((l) => l.id === doc.activeLayerId);
      if (activeLayer && activeLayer.visible) {
        ctx.save();
        ctx.translate(docX + activeLayer.x, docY + activeLayer.y);
        ctx.globalAlpha = activeLayer.opacity;
        ctx.drawImage(tempDrawCanvas, 0, 0);
        ctx.restore();
      }
    }

    // If an in-progress shape preview exists, render it cleanly in document space
    if (shapePreview) {
      ctx.save();
      ctx.translate(docX + shapePreview.x, docY + shapePreview.y);
      this.renderShapeLayer(ctx, {
        width: shapePreview.width,
        height: shapePreview.height,
        shapeConfig: {
          shapeType: shapePreview.shapeType,
          fill: shapePreview.fill,
          stroke: shapePreview.stroke,
          strokeWidth: shapePreview.strokeWidth,
          cornerRadius: shapePreview.cornerRadius
        }
      } as any);

      // Interactive dashed bounding guide
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2 / doc.zoom;
      ctx.setLineDash([4 / doc.zoom, 4 / doc.zoom]);
      ctx.strokeRect(0, 0, shapePreview.width, shapePreview.height);
      ctx.restore();
    }

    // If a marquee selection exists, render marching ants dashed outline
    if (marqueeRect && marqueeRect.width > 0 && marqueeRect.height > 0) {
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2 / doc.zoom;
      ctx.setLineDash([4 / doc.zoom, 4 / doc.zoom]);
      ctx.strokeRect(docX + marqueeRect.x, docY + marqueeRect.y, marqueeRect.width, marqueeRect.height);

      ctx.strokeStyle = '#000000';
      ctx.lineDashOffset = 4 / doc.zoom;
      ctx.strokeRect(docX + marqueeRect.x, docY + marqueeRect.y, marqueeRect.width, marqueeRect.height);
      ctx.restore();
    }

    ctx.restore(); // Restore document clipping

    // 7. Draw Document Thin Border Outline
    ctx.strokeStyle = '#3e3e3e';
    ctx.lineWidth = 1 / doc.zoom;
    ctx.strokeRect(docX, docY, doc.width, doc.height);

    // 8. Draw Transform Controls for Active Layer (Move tool, active shape/text, or Show Transform Controls)
    const activeLayer = doc.layers.find((l) => l.id === doc.activeLayerId);
    if (
      activeLayer &&
      activeLayer.visible &&
      !activeLayer.locked &&
      (activeTool === 'move' ||
        (activeTool === 'shape' && activeLayer.type === 'shape') ||
        (activeTool === 'text' && activeLayer.type === 'text') ||
        toolOptions.move.showTransformControls)
    ) {
      this.renderTransformHandles(ctx, doc, activeLayer, docX, docY);
    }

    ctx.restore(); // Restore initial viewport transform
  }

  /**
   * Render raster layer with applied adjustments
   */
  private static renderRasterLayer(ctx: CanvasRenderingContext2D, layer: Layer): void {
    if (!layer.canvas || layer.canvas.width === 0 || layer.canvas.height === 0) return;

    // Check if layer has active adjustments
    const adj = layer.adjustments;
    const hasAdj =
      adj.brightness !== 0 ||
      adj.contrast !== 0 ||
      adj.saturation !== 0 ||
      adj.grayscale ||
      adj.invert ||
      adj.sepia !== 0 ||
      adj.blur !== 0;

    if (!hasAdj) {
      ctx.drawImage(layer.canvas, 0, 0, layer.width, layer.height);
      return;
    }

    // Apply adjustments using temporary offscreen buffer
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = layer.canvas.width;
    tempCanvas.height = layer.canvas.height;
    const tctx = tempCanvas.getContext('2d');
    if (!tctx) {
      ctx.drawImage(layer.canvas, 0, 0, layer.width, layer.height);
      return;
    }

    if (adj.blur > 0) {
      tctx.filter = `blur(${adj.blur}px)`;
    }
    tctx.drawImage(layer.canvas, 0, 0);
    tctx.filter = 'none';

    applyAdjustmentsToImageData(tctx, tempCanvas.width, tempCanvas.height, adj);
    ctx.drawImage(tempCanvas, 0, 0, layer.width, layer.height);
  }

  /**
   * Render text layer
   */
  public static renderTextLayer(ctx: CanvasRenderingContext2D, layer: Layer): void {
    if (!layer.textConfig) return;
    const { text, fontSize, fontFamily, color, bold, italic } = layer.textConfig;

    ctx.save();
    const fontStyle = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fontSize}px ${fontFamily || 'Inter, sans-serif'}`;
    ctx.font = fontStyle;
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';

    const lines = text.split('\n');
    const lineHeight = fontSize * 1.25;

    lines.forEach((line, index) => {
      ctx.fillText(line, 0, index * lineHeight);
    });

    ctx.restore();
  }

  /**
   * Render vector shape layer
   */
  public static renderShapeLayer(ctx: CanvasRenderingContext2D, layer: Layer): void {
    if (!layer.shapeConfig) return;
    const { shapeType, fill, stroke, strokeWidth } = layer.shapeConfig;
    const radius = layer.shapeConfig.cornerRadius || 0;

    ctx.save();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;

    ctx.beginPath();
    if (shapeType === 'rect') {
      const hasStroke = stroke && stroke !== 'transparent' && stroke !== 'none' && strokeWidth > 0;
      const halfStroke = hasStroke ? strokeWidth / 2 : 0;
      const rx = halfStroke;
      const ry = halfStroke;
      const rw = Math.max(1, layer.width - (hasStroke ? strokeWidth : 0));
      const rh = Math.max(1, layer.height - (hasStroke ? strokeWidth : 0));

      if (radius > 0 && typeof (ctx as any).roundRect === 'function') {
        const safeRadius = Math.min(radius, rw / 2, rh / 2);
        (ctx as any).roundRect(rx, ry, rw, rh, safeRadius);
      } else {
        ctx.rect(rx, ry, rw, rh);
      }
      if (fill && fill !== 'transparent' && fill !== 'none') ctx.fill();
      if (hasStroke) ctx.stroke();
    } else if (shapeType === 'circle') {
      const hasStroke = stroke && stroke !== 'transparent' && stroke !== 'none' && strokeWidth > 0;
      const halfStroke = hasStroke ? strokeWidth / 2 : 0;
      const rx = layer.width / 2;
      const ry = layer.height / 2;
      const radX = Math.max(1, Math.abs(rx) - halfStroke);
      const radY = Math.max(1, Math.abs(ry) - halfStroke);
      ctx.ellipse(rx, ry, radX, radY, 0, 0, Math.PI * 2);
      if (fill && fill !== 'transparent' && fill !== 'none') ctx.fill();
      if (hasStroke) ctx.stroke();
    } else if (shapeType === 'line') {
      ctx.moveTo(0, 0);
      ctx.lineTo(layer.width, layer.height);
      if (stroke && stroke !== 'transparent' && stroke !== 'none' && strokeWidth > 0) ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Synchronize the offscreen canvas pixel buffer of a shape layer
   */
  public static updateShapeRasterCanvas(layer: Layer): void {
    if (layer.type !== 'shape' || !layer.shapeConfig) return;
    const w = Math.max(1, Math.round(Math.abs(layer.width)));
    const h = Math.max(1, Math.round(Math.abs(layer.height)));
    if (!layer.canvas) {
      layer.canvas = document.createElement('canvas');
    }
    layer.canvas.width = w;
    layer.canvas.height = h;
    const ctx = layer.canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    this.renderShapeLayer(ctx, layer);
  }

  /**
   * Synchronize the offscreen canvas pixel buffer of a text layer
   */
  public static updateTextRasterCanvas(layer: Layer): void {
    if (layer.type !== 'text' || !layer.textConfig) return;
    const w = Math.max(1, Math.round(Math.abs(layer.width)));
    const h = Math.max(1, Math.round(Math.abs(layer.height)));
    if (!layer.canvas) {
      layer.canvas = document.createElement('canvas');
    }
    layer.canvas.width = w;
    layer.canvas.height = h;
    const ctx = layer.canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    this.renderTextLayer(ctx, layer);
  }

  /**
   * Draw interactive 8-anchor transform handles and bounding box
   */
  private static renderTransformHandles(
    ctx: CanvasRenderingContext2D,
    doc: DocumentProject,
    layer: Layer,
    docX: number,
    docY: number
  ): void {
    const handleSize = 8 / doc.zoom;
    const lx = docX + layer.x;
    const ly = docY + layer.y;
    const lw = layer.width * (layer.scaleX || 1);
    const lh = layer.height * (layer.scaleY || 1);

    ctx.save();
    ctx.translate(lx, ly);
    if (layer.rotation) {
      ctx.translate(lw / 2, lh / 2);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.translate(-lw / 2, -lh / 2);
    }

    // Bounding Box outline (Photopea-like bright cyan/blue)
    ctx.strokeStyle = '#2675d9';
    ctx.lineWidth = 1.5 / doc.zoom;
    ctx.strokeRect(0, 0, lw, lh);

    // 8 resize handles + rotation handle
    const handles = [
      { x: 0, y: 0 }, // NW
      { x: lw / 2, y: 0 }, // N
      { x: lw, y: 0 }, // NE
      { x: lw, y: lh / 2 }, // E
      { x: lw, y: lh }, // SE
      { x: lw / 2, y: lh }, // S
      { x: 0, y: lh }, // SW
      { x: 0, y: lh / 2 } // W
    ];

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2675d9';
    ctx.lineWidth = 1.2 / doc.zoom;

    handles.forEach((h) => {
      ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
    });

    // Rotation handle stalk at top
    const rotDist = 20 / doc.zoom;
    ctx.beginPath();
    ctx.moveTo(lw / 2, 0);
    ctx.lineTo(lw / 2, -rotDist);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(lw / 2, -rotDist, handleSize / 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Determine which handle is hit at point (mouseX, mouseY) in screen space
   */
  public static hitTestHandle(
    screenX: number,
    screenY: number,
    screenWidth: number,
    screenHeight: number,
    doc: DocumentProject,
    layer: Layer
  ): TransformHandle {
    const centerX = screenWidth / 2 + doc.panX;
    const centerY = screenHeight / 2 + doc.panY;

    // Convert screen coordinates to doc-relative coordinates
    const docX = -doc.width / 2;
    const docY = -doc.height / 2;
    const clickDocX = (screenX - centerX) / doc.zoom;
    const clickDocY = (screenY - centerY) / doc.zoom;

    // Layer position in doc
    const lx = docX + layer.x;
    const ly = docY + layer.y;
    const lw = Math.max(1, Math.abs(layer.width * (layer.scaleX || 1)));
    const lh = Math.max(1, Math.abs(layer.height * (layer.scaleY || 1)));

    // Transform relative to layer top-left
    let relX = clickDocX - lx;
    let relY = clickDocY - ly;

    if (layer.rotation) {
      const cx = lw / 2;
      const cy = lh / 2;
      const rad = (-layer.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const dx = relX - cx;
      const dy = relY - cy;
      relX = dx * cos - dy * sin + cx;
      relY = dx * sin + dy * cos + cy;
    }

    const tolerance = Math.max(8, 12 / doc.zoom);
    const rotDist = 24 / doc.zoom;

    // Rotation handle
    if (Math.hypot(relX - lw / 2, relY - (-rotDist)) <= tolerance) return 'rot';

    // Corner handles
    if (Math.hypot(relX, relY) <= tolerance) return 'nw';
    if (Math.hypot(relX - lw, relY) <= tolerance) return 'ne';
    if (Math.hypot(relX - lw, relY - lh) <= tolerance) return 'se';
    if (Math.hypot(relX, relY - lh) <= tolerance) return 'sw';

    // Edge handles
    if (Math.hypot(relX - lw / 2, relY) <= tolerance) return 'n';
    if (Math.hypot(relX - lw, relY - lh / 2) <= tolerance) return 'e';
    if (Math.hypot(relX - lw / 2, relY - lh) <= tolerance) return 's';
    if (Math.hypot(relX, relY - lh / 2) <= tolerance) return 'w';

    // Body move
    if (relX >= 0 && relX <= lw && relY >= 0 && relY <= lh) {
      return 'move';
    }

    return null;
  }

  /**
   * Convert screen coordinates to canvas document pixel coordinates
   */
  public static screenToDocumentCoords(
    screenX: number,
    screenY: number,
    viewWidth: number,
    viewHeight: number,
    doc: DocumentProject
  ): { docX: number; docY: number } {
    const centerX = viewWidth / 2 + doc.panX;
    const centerY = viewHeight / 2 + doc.panY;
    const xInTransformed = (screenX - centerX) / doc.zoom;
    const yInTransformed = (screenY - centerY) / doc.zoom;

    const docX = Math.round(xInTransformed + doc.width / 2);
    const docY = Math.round(yInTransformed + doc.height / 2);

    return { docX, docY };
  }

  /**
   * Export the merged document to an offscreen canvas at full native resolution
   */
  public static renderMergedCanvas(doc: DocumentProject): HTMLCanvasElement {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = doc.width;
    exportCanvas.height = doc.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return exportCanvas;

    // Background fill
    if (doc.background === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, doc.width, doc.height);
    } else if (doc.background === 'black') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, doc.width, doc.height);
    }

    for (const layer of doc.layers) {
      if (!layer.visible) continue;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, layer.opacity));
      ctx.globalCompositeOperation = layer.blendMode || 'source-over';

      ctx.translate(layer.x, layer.y);
      if (layer.rotation) {
        ctx.translate(layer.width / 2, layer.height / 2);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.translate(-layer.width / 2, -layer.height / 2);
      }
      ctx.scale(layer.scaleX || 1, layer.scaleY || 1);

      if (layer.type === 'text' && layer.textConfig) {
        this.renderTextLayer(ctx, layer);
      } else if (layer.type === 'shape' && layer.shapeConfig) {
        this.renderShapeLayer(ctx, layer);
      } else if (layer.canvas) {
        this.renderRasterLayer(ctx, layer);
      }

      ctx.restore();
    }

    return exportCanvas;
  }
}
