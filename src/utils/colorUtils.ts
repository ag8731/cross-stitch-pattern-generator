/**
 * Color utility functions for perceptual color matching.
 * Implements RGB -> CIE Lab conversion and CIEDE2000 color difference.
 */

import { DMCColor } from '@/types/pattern';
import { DMC_COLORS } from '@/data/dmc-colors';

// ============================================================
// RGB -> XYZ -> CIE Lab conversion
// ============================================================

/**
 * Convert sRGB [0-255] to linear RGB [0-1].
 * Applies inverse sRGB companding (gamma correction).
 */
function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * Convert RGB [0-255] to CIE XYZ using D65 illuminant.
 */
function rgbToXyz(r: number, g: number, b: number): [number, number, number] {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  // sRGB to XYZ (D65) matrix
  const x = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375;
  const y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750;
  const z = lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041;

  return [x * 100, y * 100, z * 100];
}

/**
 * CIE Lab f(t) function.
 */
function labF(t: number): number {
  const delta = 6 / 29;
  return t > delta * delta * delta
    ? Math.cbrt(t)
    : t / (3 * delta * delta) + 4 / 29;
}

/**
 * Convert RGB [0-255] to CIE Lab using D65 illuminant.
 */
export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const [x, y, z] = rgbToXyz(r, g, b);

  // D65 reference white point
  const xn = 95.047;
  const yn = 100.000;
  const zn = 108.883;

  const fx = labF(x / xn);
  const fy = labF(y / yn);
  const fz = labF(z / zn);

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const bLab = 200 * (fy - fz);

  return [L, a, bLab];
}

// ============================================================
// CIEDE2000 Color Difference
// ============================================================

/** Convert degrees to radians */
function deg2rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Convert radians to degrees */
function rad2deg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Calculate CIEDE2000 color difference between two CIE Lab colors.
 * Returns a perceptual distance value (lower = more similar).
 *
 * Reference: Sharma, Wu, Dalal (2005)
 * "The CIEDE2000 Color-Difference Formula: Implementation Notes,
 *  Supplementary Test Data, and Mathematical Observations"
 */
export function ciede2000(
  lab1: [number, number, number],
  lab2: [number, number, number]
): number {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;

  // Step 1: Calculate C'ab, h'ab
  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cab = (C1 + C2) / 2;

  const Cab7 = Math.pow(Cab, 7);
  const G = 0.5 * (1 - Math.sqrt(Cab7 / (Cab7 + Math.pow(25, 7))));

  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  let h1p = rad2deg(Math.atan2(b1, a1p));
  if (h1p < 0) h1p += 360;

  let h2p = rad2deg(Math.atan2(b2, a2p));
  if (h2p < 0) h2p += 360;

  // Step 2: Calculate delta L', delta C', delta H'
  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp: number;
  if (C1p * C2p === 0) {
    dhp = 0;
  } else if (Math.abs(h2p - h1p) <= 180) {
    dhp = h2p - h1p;
  } else if (h2p - h1p > 180) {
    dhp = h2p - h1p - 360;
  } else {
    dhp = h2p - h1p + 360;
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(deg2rad(dhp / 2));

  // Step 3: Calculate CIEDE2000 color difference
  const Lp = (L1 + L2) / 2;
  const Cp = (C1p + C2p) / 2;

  let hp: number;
  if (C1p * C2p === 0) {
    hp = h1p + h2p;
  } else if (Math.abs(h1p - h2p) <= 180) {
    hp = (h1p + h2p) / 2;
  } else if (h1p + h2p < 360) {
    hp = (h1p + h2p + 360) / 2;
  } else {
    hp = (h1p + h2p - 360) / 2;
  }

  const T =
    1 -
    0.17 * Math.cos(deg2rad(hp - 30)) +
    0.24 * Math.cos(deg2rad(2 * hp)) +
    0.32 * Math.cos(deg2rad(3 * hp + 6)) -
    0.20 * Math.cos(deg2rad(4 * hp - 63));

  const Lp50sq = (Lp - 50) * (Lp - 50);
  const SL = 1 + 0.015 * Lp50sq / Math.sqrt(20 + Lp50sq);
  const SC = 1 + 0.045 * Cp;
  const SH = 1 + 0.015 * Cp * T;

  const Cp7 = Math.pow(Cp, 7);
  const RT =
    -2 *
    Math.sqrt(Cp7 / (Cp7 + Math.pow(25, 7))) *
    Math.sin(deg2rad(60 * Math.exp(-Math.pow((hp - 275) / 25, 2))));

  const dE = Math.sqrt(
    Math.pow(dLp / SL, 2) +
    Math.pow(dCp / SC, 2) +
    Math.pow(dHp / SH, 2) +
    RT * (dCp / SC) * (dHp / SH)
  );

  return dE;
}

// ============================================================
// DMC Color Matching with Lab Cache
// ============================================================

/** Cached Lab values for all DMC colors, keyed by color id */
let dmcLabCache: Map<string, [number, number, number]> | null = null;

/**
 * Initialize the Lab cache for all DMC colors.
 * Called lazily on first use.
 */
function ensureLabCache(): Map<string, [number, number, number]> {
  if (dmcLabCache) return dmcLabCache;

  dmcLabCache = new Map();
  for (const color of DMC_COLORS) {
    const lab = rgbToLab(color.rgb[0], color.rgb[1], color.rgb[2]);
    dmcLabCache.set(color.id, lab);
    // Also store on the color object for external use
    color.lab = lab;
  }
  return dmcLabCache;
}

/**
 * Get the pre-computed Lab value for a DMC color.
 */
export function getDMCLab(color: DMCColor): [number, number, number] {
  const cache = ensureLabCache();
  const lab = cache.get(color.id);
  if (lab) return lab;
  // Fallback: compute on the fly
  return rgbToLab(color.rgb[0], color.rgb[1], color.rgb[2]);
}

/**
 * Find the closest DMC color to a given RGB value using CIEDE2000.
 * This produces perceptually accurate matches.
 */
export function findClosestDMCColor(rgb: [number, number, number]): DMCColor {
  ensureLabCache();
  const targetLab = rgbToLab(rgb[0], rgb[1], rgb[2]);

  let minDistance = Infinity;
  let closestColor = DMC_COLORS[0];

  for (const color of DMC_COLORS) {
    const colorLab = getDMCLab(color);
    const distance = ciede2000(targetLab, colorLab);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  }

  return closestColor;
}

/**
 * Find the closest color from a given palette using CIEDE2000.
 */
export function findClosestFromPalette(
  rgb: [number, number, number],
  palette: DMCColor[]
): DMCColor {
  const targetLab = rgbToLab(rgb[0], rgb[1], rgb[2]);

  let minDistance = Infinity;
  let closestColor = palette[0];

  for (const color of palette) {
    const colorLab = getDMCLab(color);
    const distance = ciede2000(targetLab, colorLab);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  }

  return closestColor;
}

/**
 * Find the closest color from a palette, given a Lab value (avoids re-conversion).
 */
export function findClosestFromPaletteLab(
  targetLab: [number, number, number],
  palette: DMCColor[]
): DMCColor {
  let minDistance = Infinity;
  let closestColor = palette[0];

  for (const color of palette) {
    const colorLab = getDMCLab(color);
    const distance = ciede2000(targetLab, colorLab);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  }

  return closestColor;
}

/**
 * Calculate CIEDE2000 distance between two DMC colors.
 */
export function dmcColorDistance(a: DMCColor, b: DMCColor): number {
  return ciede2000(getDMCLab(a), getDMCLab(b));
}
