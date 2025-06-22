import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { DrawingState, Line, Tool, HSVColor } from '../types';

interface DrawingContextType extends DrawingState {
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setHSVColor: (hsv: HSVColor) => void;
  setLineWidth: (width: number) => void;
  setShakeOffset: (offset: number) => void;
  setShakeSpeed: (speed: number) => void;
  setTotalIntensity: (intensity: number) => void;
  setBackgroundColor: (color: string) => void;
  addLine: (line: Line) => void;
  addLineBehind: (line: Line) => void;
  updateCurrentLine: (line: Line | null) => void;
  removeLine: (id: string) => void;
  deleteLine: (id: string) => void;
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
  setRecording: (recording: boolean) => void;
  undoStack: Line[][];
  redoStack: Line[][];
}

const DrawingContext = createContext<DrawingContextType | undefined>(undefined);

export const useDrawing = () => {
  const context = useContext(DrawingContext);
  if (!context) {
    throw new Error('useDrawing must be used within DrawingProvider');
  }
  return context;
};

interface DrawingProviderProps {
  children: ReactNode;
}

export const DrawingProvider: React.FC<DrawingProviderProps> = ({ children }) => {
  const [lines, setLines] = useState<Line[]>([]);
  const [currentLine, setCurrentLine] = useState<Line | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [isRecording, setRecording] = useState(false);
  const [tool, setTool] = useState<Tool>('freehand');
  const [color, setColor] = useState('#A8A8FF');
  const [lineWidth, setLineWidth] = useState(3);
  const [shakeOffset, setShakeOffset] = useState(2);
  const [shakeSpeed, setShakeSpeed] = useState(1);
  const [totalIntensity, setTotalIntensity] = useState(1);
  const [undoStack, setUndoStack] = useState<Line[][]>([]);
  const [redoStack, setRedoStack] = useState<Line[][]>([]);

  const setHSVColor = (hsv: HSVColor) => {
    // Convert HSV to hex
    const h = hsv.h / 360;
    const s = hsv.s / 100;
    const v = hsv.v / 100;
    
    const c = v * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = v - c;
    
    let r = 0, g = 0, b = 0;
    
    if (h < 1/6) {
      r = c; g = x; b = 0;
    } else if (h < 2/6) {
      r = x; g = c; b = 0;
    } else if (h < 3/6) {
      r = 0; g = c; b = x;
    } else if (h < 4/6) {
      r = 0; g = x; b = c;
    } else if (h < 5/6) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    const toHex = (n: number) => {
      const hex = Math.round((n + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    setColor(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
  };

  const addLine = (line: Line) => {
    const newLines = [...lines, line];
    setLines(newLines);
    setUndoStack([...undoStack, lines]);
    setRedoStack([]);
  };

  const addLineBehind = (line: Line) => {
    const newLines = [line, ...lines];
    setLines(newLines);
    setUndoStack([...undoStack, lines]);
    setRedoStack([]);
  };

  const updateCurrentLine = (line: Line | null) => {
    setCurrentLine(line);
  };

  const removeLine = (id: string) => {
    const newLines = lines.filter(line => line.id !== id);
    setLines(newLines);
    setUndoStack([...undoStack, lines]);
    setRedoStack([]);
  };

  const deleteLine = (id: string) => {
    setUndoStack([...undoStack, lines]);
    setRedoStack([]);
    setLines(lines.filter(line => line.id !== id));
  };

  const clearCanvas = () => {
    if (lines.length > 0) {
      setUndoStack([...undoStack, lines]);
      setRedoStack([]);
      setLines([]);
    }
  };

  const undo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setRedoStack([...redoStack, lines]);
      setLines(previousState);
      setUndoStack(undoStack.slice(0, -1));
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack([...undoStack, lines]);
      setLines(nextState);
      setRedoStack(redoStack.slice(0, -1));
    }
  };

  const value: DrawingContextType = {
    lines,
    currentLine,
    backgroundColor,
    isRecording,
    tool,
    color,
    lineWidth,
    shakeOffset,
    shakeSpeed,
    totalIntensity,
    undoStack,
    redoStack,
    setTool,
    setColor,
    setHSVColor,
    setLineWidth,
    setShakeOffset,
    setShakeSpeed,
    setTotalIntensity,
    setBackgroundColor,
    addLine,
    addLineBehind,
    updateCurrentLine,
    removeLine,
    deleteLine,
    undo,
    redo,
    clearCanvas,
    setRecording,
  };

  return <DrawingContext.Provider value={value}>{children}</DrawingContext.Provider>;
};