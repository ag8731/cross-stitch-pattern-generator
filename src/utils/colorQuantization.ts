/**
 * Median-cut color quantization algorithm.
 * Reduces an image's color palette to N representative colors,
 * then maps them to the nearest DMC colors.
 */

import { DMCColor } from '@/types/pattern';
import { rgbToLab, ciede2000, findClosestDMCColor, getDMCLab, dmcColorDistance } from './colorUtils';

interface ColorBox {
  pixels: [number, number, number][];
  rMin: number;
  rMax: number;
  gMin: number;
  gMax: number;
  bMin: number;
  bMax: number;
}

/**
 * Create a bounding box for a set of pixels.
 */
function createBox(pixels: [number, number, number][]): ColorBox {
  let rMin = 255, rMax = 0;
  let gMin = 255, gMax = 0;
  let bMin = 255, bMax = 0;

  for (const [r, g, b] of pixels) {
    if (r < rMin) rMin = r;
    if (r > rMax) rMax = r;
    if (g < gMin) gMin = g;
    if (g > gMax) gMax = g;
    if (b < bMin) bMin = b;
    if (b > bMax) bMax = b;
  }

  return { pixels, rMin, rMax, gMin, gMax, bMin, bMax };
}

/**
 * Get the longest axis of a color box.
 */
function longestAxis(box: ColorBox): 'r' | 'g' | 'b' {
  const rRange = box.rMax - box.rMin;
  const gRange = box.gMax - box.gMin;
  const bRange = box.bMax - box.bMin;

  if (rRange >= gRange && rRange >= bRange) return 'r';
  if (gRange >= rRange && gRange >= bRange) return 'g';
  return 'b';
}

/**
 * Split a color box along its longest axis at the median.
 */
function splitBox(box: ColorBox): [ColorBox, ColorBox] {
  const axis = longestAxis(box);
  const channelIndex = axis === 'r' ? 0 : axis === 'g' ? 1 : 2;

  // Sort pixels by the longest axis
  const sorted = [...box.pixels].sort((a, b) => a[channelIndex] - b[channelIndex]);

  const mid = Math.floor(sorted.length / 2);
  const left = sorted.slice(0, mid);
  const right = sorted.slice(mid);

  return [createBox(left), createBox(right)];
}

/**
 * Calculate the average color of a box.
 */
function averageColor(box: ColorBox): [number, number, number] {
  let rSum = 0, gSum = 0, bSum = 0;
  for (const [r, g, b] of box.pixels) {
    rSum += r;
    gSum += g;
    bSum += b;
  }
  const n = box.pixels.length;
  return [
    Math.round(rSum / n),
    Math.round(gSum / n),
    Math.round(bSum / n),
  ];
}

/**
 * Volume of a color box (used for priority queue).
 */
function boxVolume(box: ColorBox): number {
  return (box.rMax - box.rMin + 1) *
         (box.gMax - box.gMin + 1) *
         (box.bMax - box.bMin + 1);
}

/**
 * Perform median-cut quantization to reduce colors to maxColors.
 * Returns an array of representative RGB colors.
 */
export function medianCut(
  pixels: [number, number, number][],
  maxColors: number
): [number, number, number][] {
  if (pixels.length === 0) return [];
  if (maxColors <= 1) {
    return [averageColor(createBox(pixels))];
  }

  // Start with one box containing all pixels
  let boxes: ColorBox[] = [createBox(pixels)];

  // Split boxes until we have enough
  while (boxes.length < maxColors) {
    // Find the box with the largest volume that has more than 1 pixel
    let bestIdx = -1;
    let bestVolume = -1;

    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i].pixels.length > 1) {
        const vol = boxVolume(boxes[i]);
        if (vol > bestVolume) {
          bestVolume = vol;
          bestIdx = i;
        }
      }
    }

    // No more splittable boxes
    if (bestIdx === -1) break;

    const [left, right] = splitBox(boxes[bestIdx]);
    boxes.splice(bestIdx, 1, left, right);
  }

  // Return the average color of each box
  return boxes.map(averageColor);
}

/**
 * Build a DMC palette from quantized colors.
 * Maps each quantized representative color to its nearest DMC color,
 * then deduplicates.
 */
export function buildDMCPalette(
  quantizedColors: [number, number, number][]
): DMCColor[] {
  const paletteMap = new Map<string, DMCColor>();

  for (const rgb of quantizedColors) {
    const dmc = findClosestDMCColor(rgb);
    if (!paletteMap.has(dmc.id)) {
      paletteMap.set(dmc.id, dmc);
    }
  }

  return Array.from(paletteMap.values());
}

/**
 * Merge the least-used DMC colors into their nearest neighbors
 * until the palette is within maxColors.
 *
 * @param palette - Current DMC palette
 * @param colorCounts - Map of DMC color id -> pixel count
 * @param maxColors - Maximum allowed colors
 * @returns Reduced palette and a merge map (old id -> new DMCColor)
 */
export function mergeByFrequency(
  palette: DMCColor[],
  colorCounts: Map<string, number>,
  maxColors: number
): { palette: DMCColor[]; mergeMap: Map<string, DMCColor> } {
  const mergeMap = new Map<string, DMCColor>();
  let currentPalette = [...palette];

  while (currentPalette.length > maxColors) {
    // Find the color with the fewest pixels
    let minCount = Infinity;
    let minIdx = 0;

    for (let i = 0; i < currentPalette.length; i++) {
      const count = colorCounts.get(currentPalette[i].id) || 0;
      if (count < minCount) {
        minCount = count;
        minIdx = i;
      }
    }

    const removedColor = currentPalette[minIdx];

    // Find the nearest remaining color using CIEDE2000
    let nearestIdx = -1;
    let nearestDist = Infinity;

    for (let i = 0; i < currentPalette.length; i++) {
      if (i === minIdx) continue;
      const dist = dmcColorDistance(removedColor, currentPalette[i]);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    if (nearestIdx === -1) break;

    const targetColor = currentPalette[nearestIdx];

    // Transfer pixel count
    const removedCount = colorCounts.get(removedColor.id) || 0;
    const targetCount = colorCounts.get(targetColor.id) || 0;
    colorCounts.set(targetColor.id, targetCount + removedCount);
    colorCounts.delete(removedColor.id);

    // Record the merge
    mergeMap.set(removedColor.id, targetColor);

    // Remove from palette
    currentPalette.splice(minIdx, 1);
  }

  return { palette: currentPalette, mergeMap };
}

/**
 * Resolve a color through the merge map chain.
 * Handles transitive merges (A -> B -> C).
 */
export function resolveMerge(
  color: DMCColor,
  mergeMap: Map<string, DMCColor>
): DMCColor {
  let current = color;
  let iterations = 0;
  while (mergeMap.has(current.id) && iterations < 100) {
    current = mergeMap.get(current.id)!;
    iterations++;
  }
  return current;
}
