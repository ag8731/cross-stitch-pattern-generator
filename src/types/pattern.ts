export interface DMCColor {
  id: string;
  name: string;
  hex: string;
  rgb: [number, number, number];
  lab?: [number, number, number];
}

export interface PatternCell {
  x: number;
  y: number;
  color: DMCColor | null;
  symbol: string;
}

export interface CrossStitchPattern {
  width: number;
  height: number;
  cells: PatternCell[][];
  colors: DMCColor[];
  title: string;
  clothCount: number;
}

export interface PatternSettings {
  width: number;
  height: number;
  clothCount: number;
  maxColors: number;
  ditheringMethod: 'none' | 'floyd-steinberg';
  lockAspectRatio: boolean;
  sourceAspectRatio?: number;
}

export interface Tool {
  type: 'draw' | 'erase' | 'fill' | 'colorPicker';
  color?: DMCColor | null;
  size?: number;
}
