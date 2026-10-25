// Lumora Studio - Core Types & Definitions

export type LayerType = 'image' | 'paint' | 'text' | 'shape';

export type ToolType =
  | 'move'
  | 'select'
  | 'crop'
  | 'brush'
  | 'eraser'
  | 'text'
  | 'shape'
  | 'eyedropper'
  | 'hand'
  | 'zoom';

export type BlendMode =
  | 'source-over'     // Normal
  | 'multiply'        // Multiply
  | 'screen'          // Screen
  | 'overlay'         // Overlay
  | 'darken'          // Darken
  | 'lighten'         // Lighten
  | 'color-dodge'     // Color Dodge
  | 'color-burn'      // Color Burn
  | 'difference';     // Difference

export interface TextConfig {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
}

export interface ShapeConfig {
  shapeType: 'rect' | 'circle' | 'line';
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number;
}

export interface LayerAdjustments {
  brightness: number;  // -100 to 100, default 0
  contrast: number;    // -100 to 100, default 0
  saturation: number;  // -100 to 100, default 0
  grayscale: boolean;  // toggle
  invert: boolean;     // toggle
  sepia: number;       // 0 to 100, default 0
  blur: number;        // 0 to 20 px, default 0
}

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number; // 0 to 1
  blendMode: BlendMode;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in degrees
  scaleX: number;
  scaleY: number;
  canvas: HTMLCanvasElement; // Offscreen pixel raster buffer
  textConfig?: TextConfig;
  shapeConfig?: ShapeConfig;
  adjustments: LayerAdjustments;
}

export interface DocumentProject {
  id: string;
  name: string;
  width: number;
  height: number;
  dpi: number;
  background: 'transparent' | 'white' | 'black';
  layers: Layer[];
  activeLayerId: string | null;
  zoom: number; // 0.1 to 32.0 (10% to 3200%)
  panX: number;
  panY: number;
}

export interface ToolOptions {
  brush: {
    size: number;
    opacity: number; // 0 to 1
    color: string;
    hardness: number; // 0 to 1
  };
  eraser: {
    size: number;
    opacity: number;
  };
  text: TextConfig;
  shape: ShapeConfig;
  move: {
    autoSelect: boolean;
    showTransformControls: boolean;
  };
  crop: {
    aspectRatio: 'free' | '1:1' | '16:9' | '4:3';
  };
  activeColor: string;
  secondaryColor: string;
}

export interface HistoryItem {
  id: string;
  action: string;
  timestamp: number;
  documentSnapshot: {
    width: number;
    height: number;
    layers: {
      id: string;
      name: string;
      type: LayerType;
      visible: boolean;
      locked: boolean;
      opacity: number;
      blendMode: BlendMode;
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
      scaleX: number;
      scaleY: number;
      dataUrl: string; // serialized raster data
      textConfig?: TextConfig;
      shapeConfig?: ShapeConfig;
      adjustments: LayerAdjustments;
    }[];
    activeLayerId: string | null;
  };
}

export interface SerializedLumoraProject {
  version: '1.0';
  lumoraFormat: true;
  meta: {
    name: string;
    width: number;
    height: number;
    dpi: number;
    background: 'transparent' | 'white' | 'black';
    createdAt: string;
    updatedAt: string;
  };
  layers: {
    id: string;
    name: string;
    type: LayerType;
    visible: boolean;
    locked: boolean;
    opacity: number;
    blendMode: BlendMode;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    dataUrl: string;
    textConfig?: TextConfig;
    shapeConfig?: ShapeConfig;
    adjustments: LayerAdjustments;
  }[];
}
