// Lumora Studio - Pixel Adjustments & Color Filters
import { LayerAdjustments } from '../types';

export function applyAdjustmentsToImageData(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  adjustments: LayerAdjustments
): void {
  const { brightness, contrast, saturation, grayscale, invert, sepia } = adjustments;

  // If no adjustments active, skip processing
  if (
    brightness === 0 &&
    contrast === 0 &&
    saturation === 0 &&
    !grayscale &&
    !invert &&
    sepia === 0
  ) {
    return;
  }

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const len = data.length;

  // Pre-calculate contrast factor: (259 * (contrast + 255)) / (255 * (259 - contrast))
  const cFactor = contrast !== 0 ? (259 * (contrast + 255)) / (255 * (259 - contrast)) : 1;
  const bDelta = (brightness / 100) * 255;
  const sFactor = 1 + saturation / 100;
  const sepiaRatio = sepia / 100;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const a = data[i + 3];

    // Skip fully transparent pixels
    if (a === 0) continue;

    // 1. Brightness
    if (brightness !== 0) {
      r += bDelta;
      g += bDelta;
      b += bDelta;
    }

    // 2. Contrast
    if (contrast !== 0) {
      r = cFactor * (r - 128) + 128;
      g = cFactor * (g - 128) + 128;
      b = cFactor * (b - 128) + 128;
    }

    // 3. Invert
    if (invert) {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    // 4. Grayscale or Saturation
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    if (grayscale) {
      r = gray;
      g = gray;
      b = gray;
    } else if (saturation !== 0) {
      r = gray + (r - gray) * sFactor;
      g = gray + (g - gray) * sFactor;
      b = gray + (b - gray) * sFactor;
    }

    // 5. Sepia
    if (sepiaRatio > 0) {
      const sr = r * 0.393 + g * 0.769 + b * 0.189;
      const sg = r * 0.349 + g * 0.686 + b * 0.168;
      const sb = r * 0.272 + g * 0.534 + b * 0.131;
      r = r * (1 - sepiaRatio) + sr * sepiaRatio;
      g = g * (1 - sepiaRatio) + sg * sepiaRatio;
      b = b * (1 - sepiaRatio) + sb * sepiaRatio;
    }

    // Clamp values between 0 and 255
    data[i] = r < 0 ? 0 : r > 255 ? 255 : r;
    data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
    data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
  }

  ctx.putImageData(imgData, 0, 0);
}

export function defaultAdjustments(): LayerAdjustments {
  return {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    grayscale: false,
    invert: false,
    sepia: 0,
    blur: 0
  };
}
