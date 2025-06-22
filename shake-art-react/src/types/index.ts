export interface Point {
  x: number;
  y: number;
}

export interface Line {
  id: string;
  points: Point[];
  color: string;
  lineWidth: number;
  shakeOffset: number;
  shakeSpeed: number;
  isShaking: boolean;
  depth?: number; // For line behind functionality
}

export interface DrawingState {
  lines: Line[];
  currentLine: Line | null;
  backgroundColor: string;
  isRecording: boolean;
  tool: Tool;
  color: string;
  lineWidth: number;
  shakeOffset: number;
  shakeSpeed: number;
  totalIntensity: number;
}

export type Tool = 
  | 'freehand'
  | 'line'
  | 'lineNoShake'
  | 'lineBehind'
  | 'eraser'
  | 'fill'
  | 'eyedropper';

export interface HSVColor {
  h: number;
  s: number;
  v: number;
}