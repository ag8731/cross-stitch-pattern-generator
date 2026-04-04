import { DMCColor, CrossStitchPattern, PatternCell, PatternSettings } from '@/types/pattern';
import { findClosestFromPalette, rgbToLab, getDMCLab, findClosestFromPaletteLab } from '@/utils/colorUtils';
import { medianCut, buildDMCPalette, mergeByFrequency, resolveMerge } from '@/utils/colorQuantization';
import { SYMBOLS } from '@/data/dmc-colors';

export class ImageProcessor {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    // Only initialize canvas in browser environment
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d')!;
    }
  }

  async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Multi-step image scaling for high-quality downsampling.
   * When the target is less than 50% of the source, scales in
   * multiple 50% steps to avoid aliasing artifacts.
   * This produces consistent results across browsers.
   */
  private scaleImage(
    img: HTMLImageElement,
    targetWidth: number,
    targetHeight: number
  ): ImageData {
    if (typeof window === 'undefined') {
      throw new Error('scaleImage is only available in browser environment');
    }

    let currentWidth = img.naturalWidth || img.width;
    let currentHeight = img.naturalHeight || img.height;

    // Create a working canvas
    let srcCanvas = document.createElement('canvas');
    let srcCtx = srcCanvas.getContext('2d')!;
    srcCanvas.width = currentWidth;
    srcCanvas.height = currentHeight;

    // Set high-quality interpolation
    srcCtx.imageSmoothingEnabled = true;
    srcCtx.imageSmoothingQuality = 'high';
    srcCtx.drawImage(img, 0, 0, currentWidth, currentHeight);

    // Multi-step downscaling: halve dimensions until within 2x of target
    while (currentWidth > targetWidth * 2 || currentHeight > targetHeight * 2) {
      const nextWidth = Math.max(targetWidth, Math.floor(currentWidth / 2));
      const nextHeight = Math.max(targetHeight, Math.floor(currentHeight / 2));

      const tmpCanvas = document.createElement('canvas');
      const tmpCtx = tmpCanvas.getContext('2d')!;
      tmpCanvas.width = nextWidth;
      tmpCanvas.height = nextHeight;

      tmpCtx.imageSmoothingEnabled = true;
      tmpCtx.imageSmoothingQuality = 'high';
      tmpCtx.drawImage(srcCanvas, 0, 0, nextWidth, nextHeight);

      srcCanvas = tmpCanvas;
      srcCtx = tmpCtx;
      currentWidth = nextWidth;
      currentHeight = nextHeight;
    }

    // Final scale to exact target dimensions
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d')!;
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;

    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';
    finalCtx.drawImage(srcCanvas, 0, 0, targetWidth, targetHeight);

    return finalCtx.getImageData(0, 0, targetWidth, targetHeight);
  }

  /**
   * Main image processing pipeline:
   * 1. Multi-step scale image to target dimensions
   * 2. Extract all pixel colors
   * 3. Median-cut quantization to reduce to maxColors representative colors
   * 4. Map quantized colors to nearest DMC colors via CIEDE2000
   * 5. Merge least-used DMC colors if palette exceeds maxColors
   * 6. Apply Floyd-Steinberg dithering (if enabled) or direct mapping
   * 7. Build pattern grid
   */
  processImage(
    img: HTMLImageElement,
    settings: PatternSettings
  ): CrossStitchPattern {
    const { width, height, maxColors, ditheringMethod } = settings;

    // Step 1: Scale image with multi-step downsampling
    const imageData = this.scaleImage(img, width, height);
    const pixels = imageData.data;

    // Step 2: Extract all non-transparent pixel colors
    const allPixels: [number, number, number][] = [];
    for (let i = 0; i < pixels.length; i += 4) {
      const a = pixels[i + 3];
      if (a > 128) {
        allPixels.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
      }
    }

    // Step 3: Median-cut quantization
    const quantizedColors = medianCut(allPixels, maxColors);

    // Step 4: Map quantized colors to DMC colors
    let dmcPalette = buildDMCPalette(quantizedColors);

    // Step 5: Frequency-based color limiting
    // First pass: count how many pixels map to each DMC color
    const colorCounts = new Map<string, number>();
    for (const pixel of allPixels) {
      const dmc = findClosestFromPalette(pixel, dmcPalette);
      colorCounts.set(dmc.id, (colorCounts.get(dmc.id) || 0) + 1);
    }

    // Merge least-used colors if palette still exceeds maxColors
    let mergeMap = new Map<string, DMCColor>();
    if (dmcPalette.length > maxColors) {
      const result = mergeByFrequency(dmcPalette, colorCounts, maxColors);
      dmcPalette = result.palette;
      mergeMap = result.mergeMap;
    }

    // Step 6 & 7: Apply dithering and build pattern grid
    const cells: PatternCell[][] = [];
    const usedColors: DMCColor[] = [...dmcPalette];
    const colorIndexMap = new Map<string, number>();
    usedColors.forEach((c, i) => colorIndexMap.set(c.id, i));

    if (ditheringMethod === 'floyd-steinberg') {
      // Floyd-Steinberg error-diffusion dithering
      // Work with floating-point pixel buffer for error accumulation
      const floatPixels = new Float32Array(width * height * 3);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const pi = (y * width + x) * 4;
          const fi = (y * width + x) * 3;
          floatPixels[fi] = pixels[pi];
          floatPixels[fi + 1] = pixels[pi + 1];
          floatPixels[fi + 2] = pixels[pi + 2];
        }
      }

      for (let y = 0; y < height; y++) {
        const row: PatternCell[] = [];
        for (let x = 0; x < width; x++) {
          const pi = (y * width + x) * 4;
          const fi = (y * width + x) * 3;
          const a = pixels[pi + 3];

          let color: DMCColor | null = null;

          if (a > 128) {
            // Clamp to valid range
            const r = Math.max(0, Math.min(255, Math.round(floatPixels[fi])));
            const g = Math.max(0, Math.min(255, Math.round(floatPixels[fi + 1])));
            const b = Math.max(0, Math.min(255, Math.round(floatPixels[fi + 2])));

            // Find closest color in the curated palette
            color = findClosestFromPalette([r, g, b], dmcPalette);

            // Resolve any merges
            color = resolveMerge(color, mergeMap);

            // Calculate quantization error
            const errR = floatPixels[fi] - color.rgb[0];
            const errG = floatPixels[fi + 1] - color.rgb[1];
            const errB = floatPixels[fi + 2] - color.rgb[2];

            // Distribute error to neighbors using Floyd-Steinberg kernel:
            //          current    7/16 ->
            // 3/16 <-   5/16 v   1/16 ->v
            const distribute = (dx: number, dy: number, factor: number) => {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nfi = (ny * width + nx) * 3;
                floatPixels[nfi] += errR * factor;
                floatPixels[nfi + 1] += errG * factor;
                floatPixels[nfi + 2] += errB * factor;
              }
            };

            distribute(1, 0, 7 / 16);
            distribute(-1, 1, 3 / 16);
            distribute(0, 1, 5 / 16);
            distribute(1, 1, 1 / 16);
          }

          const symbol = color ? SYMBOLS[colorIndexMap.get(color.id)! % SYMBOLS.length] : '';
          row.push({ x, y, color, symbol });
        }
        cells.push(row);
      }
    } else {
      // No dithering: direct mapping
      for (let y = 0; y < height; y++) {
        const row: PatternCell[] = [];
        for (let x = 0; x < width; x++) {
          const pixelIndex = (y * width + x) * 4;
          const r = pixels[pixelIndex];
          const g = pixels[pixelIndex + 1];
          const b = pixels[pixelIndex + 2];
          const a = pixels[pixelIndex + 3];

          let color: DMCColor | null = null;

          if (a > 128) {
            color = findClosestFromPalette([r, g, b], dmcPalette);
            color = resolveMerge(color, mergeMap);
          }

          const symbol = color ? SYMBOLS[colorIndexMap.get(color.id)! % SYMBOLS.length] : '';
          row.push({ x, y, color, symbol });
        }
        cells.push(row);
      }
    }

    // Collect actually used colors (some palette colors may not appear after dithering)
    const finalColorSet = new Set<string>();
    for (const row of cells) {
      for (const cell of row) {
        if (cell.color) {
          finalColorSet.add(cell.color.id);
        }
      }
    }
    const finalColors = usedColors.filter(c => finalColorSet.has(c.id));

    // Reassign symbols based on final color list
    const finalColorIndexMap = new Map<string, number>();
    finalColors.forEach((c, i) => finalColorIndexMap.set(c.id, i));

    for (const row of cells) {
      for (const cell of row) {
        if (cell.color) {
          cell.symbol = SYMBOLS[finalColorIndexMap.get(cell.color.id)! % SYMBOLS.length];
        }
      }
    }

    return {
      width,
      height,
      cells,
      colors: finalColors,
      title: 'Untitled Pattern',
      clothCount: settings.clothCount
    };
  }

  resizeImage(img: HTMLImageElement, maxWidth: number, maxHeight: number): HTMLCanvasElement {
    if (typeof window === 'undefined') {
      throw new Error('resizeImage is only available in browser environment');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    let { width, height } = img;

    // Calculate scaling
    const scale = Math.min(maxWidth / width, maxHeight / height, 1);
    width *= scale;
    height *= scale;

    canvas.width = width;
    canvas.height = height;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
  }
}
