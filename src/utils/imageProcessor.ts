import { DMCColor, CrossStitchPattern, PatternCell, PatternSettings } from '@/types/pattern';
import { findClosestDMCColor, SYMBOLS } from '@/data/dmc-colors';

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

  processImage(
    img: HTMLImageElement,
    settings: PatternSettings
  ): CrossStitchPattern {
    if (!this.canvas || !this.ctx) {
      throw new Error('Canvas not initialized. Make sure you are in a browser environment.');
    }

    const { width, height, maxColors, dithering } = settings;

    // Set canvas size to pattern dimensions
    this.canvas.width = width;
    this.canvas.height = height;

    // Draw and scale image
    this.ctx.drawImage(img, 0, 0, width, height);

    // Get image data
    const imageData = this.ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    // Create pattern cells
    const cells: PatternCell[][] = [];
    const colorMap = new Map<string, DMCColor>();
    const usedColors: DMCColor[] = [];

    for (let y = 0; y < height; y++) {
      const row: PatternCell[] = [];
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        const r = pixels[pixelIndex];
        const g = pixels[pixelIndex + 1];
        const b = pixels[pixelIndex + 2];
        const a = pixels[pixelIndex + 3];

        let color: DMCColor | null = null;

        if (a > 128) { // Only process non-transparent pixels
          if (dithering && Math.random() > 0.5) {
            // Simple dithering effect
            const adjustedR = Math.min(255, r + Math.random() * 20 - 10);
            const adjustedG = Math.min(255, g + Math.random() * 20 - 10);
            const adjustedB = Math.min(255, b + Math.random() * 20 - 10);
            color = findClosestDMCColor([adjustedR, adjustedG, adjustedB]);
          } else {
            color = findClosestDMCColor([r, g, b]);
          }
        }

        // Limit number of colors
        if (color && usedColors.length >= maxColors) {
          const closestExistingColor = this.findClosestExistingColor(color, usedColors);
          color = closestExistingColor;
        }

        if (color && !colorMap.has(color.id)) {
          colorMap.set(color.id, color);
          usedColors.push(color);
        }

        const symbol = color ? SYMBOLS[usedColors.indexOf(color) % SYMBOLS.length] : '';

        row.push({
          x,
          y,
          color,
          symbol
        });
      }
      cells.push(row);
    }

    return {
      width,
      height,
      cells,
      colors: usedColors,
      title: 'Untitled Pattern',
      clothCount: settings.clothCount
    };
  }

  private findClosestExistingColor(color: DMCColor, existingColors: DMCColor[]): DMCColor {
    let minDistance = Infinity;
    let closestColor = existingColors[0];

    for (const existingColor of existingColors) {
      const distance = Math.sqrt(
        Math.pow(color.rgb[0] - existingColor.rgb[0], 2) +
        Math.pow(color.rgb[1] - existingColor.rgb[1], 2) +
        Math.pow(color.rgb[2] - existingColor.rgb[2], 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = existingColor;
      }
    }

    return closestColor;
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

    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
  }
}
