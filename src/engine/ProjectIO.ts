// Lumora Studio - Project Import/Export, PSD & Image Handling
import { DocumentProject, Layer, SerializedLumoraProject, BlendMode } from '../types';
import { defaultAdjustments } from './Adjustments';
import { LumoraEngine } from './LumoraEngine';
import { readPsd, writePsd } from 'ag-psd';

export async function exportCanvasAsBlob(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.92
): Promise<Blob> {
  const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create canvas blob'));
      },
      mimeType,
      quality
    );
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------
// PSD (Adobe Photoshop) Support
// ---------------------------------------------------------------------

function mapPsdBlendMode(mode?: string): BlendMode {
  switch (mode) {
    case 'multiply':
      return 'multiply';
    case 'screen':
      return 'screen';
    case 'overlay':
      return 'overlay';
    case 'darken':
      return 'darken';
    case 'lighten':
      return 'lighten';
    case 'color dodge':
      return 'color-dodge';
    case 'color burn':
      return 'color-burn';
    case 'difference':
      return 'difference';
    default:
      return 'source-over';
  }
}

function mapToPsdBlendMode(mode?: BlendMode): any {
  switch (mode) {
    case 'multiply':
      return 'multiply';
    case 'screen':
      return 'screen';
    case 'overlay':
      return 'overlay';
    case 'darken':
      return 'darken';
    case 'lighten':
      return 'lighten';
    case 'color-dodge':
      return 'color dodge';
    case 'color-burn':
      return 'color burn';
    case 'difference':
      return 'difference';
    default:
      return 'normal';
  }
}

export async function openPsdFile(file: File): Promise<DocumentProject> {
  const arrayBuffer = await file.arrayBuffer();
  const psd = readPsd(arrayBuffer);

  const docWidth = psd.width || 1280;
  const docHeight = psd.height || 720;
  const loadedLayers: Layer[] = [];

  function processLayer(l: any) {
    if (l.children && l.children.length > 0) {
      // Group / Folder - recursively flatten
      for (const child of l.children) {
        processLayer(child);
      }
      return;
    }

    const canvas = document.createElement('canvas');
    const w = l.canvas ? l.canvas.width : Math.max(1, (l.right ?? docWidth) - (l.left ?? 0));
    const h = l.canvas ? l.canvas.height : Math.max(1, (l.bottom ?? docHeight) - (l.top ?? 0));
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (ctx && l.canvas) {
      ctx.drawImage(l.canvas, 0, 0);
    }

    let layerType: Layer['type'] = 'image';
    let textConfig = undefined;

    if (l.text && l.text.text) {
      layerType = 'text';
      textConfig = {
        text: l.text.text,
        fontSize: l.text.style?.fontSize ? Math.round(l.text.style.fontSize) : 36,
        fontFamily: l.text.style?.font?.name || 'Inter, sans-serif',
        color: l.text.style?.fillColor
          ? `rgb(${Math.round(l.text.style.fillColor.r)}, ${Math.round(l.text.style.fillColor.g)}, ${Math.round(l.text.style.fillColor.b)})`
          : '#ffffff',
        bold: !!l.text.style?.fauxBold,
        italic: !!l.text.style?.fauxItalic
      };
    }

    loadedLayers.push({
      id: 'layer_psd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: l.name || 'PSD Layer',
      type: layerType,
      visible: !l.hidden,
      locked: false,
      opacity: typeof l.opacity === 'number' ? l.opacity : 1,
      blendMode: mapPsdBlendMode(l.blendMode),
      x: l.left ?? 0,
      y: l.top ?? 0,
      width: w,
      height: h,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      canvas: canvas,
      textConfig,
      adjustments: defaultAdjustments()
    });
  }

  if (psd.children && psd.children.length > 0) {
    for (const layer of psd.children) {
      processLayer(layer);
    }
  }

  // If layers list is empty, fallback to composite preview canvas
  if (loadedLayers.length === 0 && psd.canvas) {
    const canvas = document.createElement('canvas');
    canvas.width = psd.canvas.width;
    canvas.height = psd.canvas.height;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.drawImage(psd.canvas, 0, 0);

    loadedLayers.push({
      id: 'layer_psd_bg',
      name: 'Background',
      type: 'image',
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'source-over',
      x: 0,
      y: 0,
      width: docWidth,
      height: docHeight,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      canvas,
      adjustments: defaultAdjustments()
    });
  }

  return {
    id: 'doc_' + Date.now(),
    name: file.name.replace(/\.[^/.]+$/, ''),
    width: docWidth,
    height: docHeight,
    dpi: 72,
    background: 'transparent',
    layers: loadedLayers,
    activeLayerId: loadedLayers.length > 0 ? loadedLayers[loadedLayers.length - 1].id : null,
    zoom: 1.0,
    panX: 0,
    panY: 0
  };
}

export function exportProjectAsPsd(doc: DocumentProject): void {
  const psdLayers = doc.layers.map((l) => ({
    name: l.name,
    left: Math.round(l.x),
    top: Math.round(l.y),
    right: Math.round(l.x + l.width),
    bottom: Math.round(l.y + l.height),
    opacity: l.opacity,
    hidden: !l.visible,
    blendMode: mapToPsdBlendMode(l.blendMode),
    canvas: l.canvas
  }));

  const psd = {
    width: doc.width,
    height: doc.height,
    children: psdLayers,
    canvas: LumoraEngine.renderMergedCanvas(doc)
  };

  const buffer = writePsd(psd as any);
  const blob = new Blob([buffer], { type: 'image/vnd.adobe.photoshop' });
  downloadBlob(blob, `${doc.name}.psd`);
}

// ---------------------------------------------------------------------
// Lumora Native Project Serialization (.lumora)
// ---------------------------------------------------------------------

export function serializeProject(doc: DocumentProject): SerializedLumoraProject {
  const serializedLayers = doc.layers.map((layer) => {
    return {
      id: layer.id,
      name: layer.name,
      type: layer.type,
      visible: layer.visible,
      locked: layer.locked,
      opacity: layer.opacity,
      blendMode: layer.blendMode,
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height,
      rotation: layer.rotation,
      scaleX: layer.scaleX,
      scaleY: layer.scaleY,
      dataUrl: layer.canvas.toDataURL('image/png'),
      textConfig: layer.textConfig ? { ...layer.textConfig } : undefined,
      shapeConfig: layer.shapeConfig ? { ...layer.shapeConfig } : undefined,
      adjustments: { ...layer.adjustments }
    };
  });

  return {
    version: '1.0',
    lumoraFormat: true,
    meta: {
      name: doc.name,
      width: doc.width,
      height: doc.height,
      dpi: doc.dpi,
      background: doc.background,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    layers: serializedLayers
  };
}

export function saveProjectFile(doc: DocumentProject): void {
  const projectData = serializeProject(doc);
  const jsonString = JSON.stringify(projectData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const filename = doc.name.endsWith('.lumora') ? doc.name : `${doc.name}.lumora`;
  downloadBlob(blob, filename);
}

export async function deserializeProject(jsonText: string): Promise<DocumentProject> {
  const data: SerializedLumoraProject = JSON.parse(jsonText);
  if (!data.lumoraFormat || data.version !== '1.0') {
    throw new Error('Unsupported or invalid Lumora project file.');
  }

  const loadedLayers: Layer[] = [];

  for (const sLayer of data.layers) {
    const layerCanvas = document.createElement('canvas');
    layerCanvas.width = sLayer.width;
    layerCanvas.height = sLayer.height;
    const ctx = layerCanvas.getContext('2d');

    if (sLayer.dataUrl && ctx) {
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          resolve();
        };
        img.onerror = () => reject(new Error('Failed to load layer image data'));
        img.src = sLayer.dataUrl;
      });
    }

    loadedLayers.push({
      id: sLayer.id,
      name: sLayer.name,
      type: sLayer.type,
      visible: sLayer.visible,
      locked: sLayer.locked,
      opacity: sLayer.opacity,
      blendMode: sLayer.blendMode,
      x: sLayer.x,
      y: sLayer.y,
      width: sLayer.width,
      height: sLayer.height,
      rotation: sLayer.rotation,
      scaleX: sLayer.scaleX,
      scaleY: sLayer.scaleY,
      canvas: layerCanvas,
      textConfig: sLayer.textConfig,
      shapeConfig: sLayer.shapeConfig,
      adjustments: sLayer.adjustments || defaultAdjustments()
    });
  }

  return {
    id: 'doc_' + Date.now(),
    name: data.meta.name || 'Imported Project',
    width: data.meta.width,
    height: data.meta.height,
    dpi: data.meta.dpi || 72,
    background: data.meta.background || 'transparent',
    layers: loadedLayers,
    activeLayerId: loadedLayers.length > 0 ? loadedLayers[loadedLayers.length - 1].id : null,
    zoom: 1.0,
    panX: 0,
    panY: 0
  };
}

export async function createLayerFromImageFile(
  file: File,
  maxCanvasWidth: number = 4096,
  maxCanvasHeight: number = 4096
): Promise<{ layer: Layer; imageWidth: number; imageHeight: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Downscale gracefully if image exceeds extreme bounds
        if (width > maxCanvasWidth || height > maxCanvasHeight) {
          const ratio = Math.min(maxCanvasWidth / width, maxCanvasHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get 2D context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const layer: Layer = {
          id: 'layer_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          name: file.name.replace(/\.[^/.]+$/, ''),
          type: 'image',
          visible: true,
          locked: false,
          opacity: 1,
          blendMode: 'source-over',
          x: 0,
          y: 0,
          width: width,
          height: height,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          canvas: canvas,
          adjustments: defaultAdjustments()
        };

        resolve({ layer, imageWidth: width, imageHeight: height });
      };
      img.onerror = () => reject(new Error('Invalid or corrupted image format.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}
