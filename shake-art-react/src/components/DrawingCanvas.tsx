import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDrawing } from '../contexts/DrawingContext';
import type { Point, Line } from '../types';

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

export const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [shakedLines, setShakedLines] = useState<Map<string, Point[]>>(new Map());
  const lastUpdateTime = useRef<number>(0);
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const [hoveredLineId, setHoveredLineId] = useState<string | null>(null);
  
  const {
    lines,
    currentLine,
    backgroundColor,
    tool,
    color,
    lineWidth,
    shakeOffset,
    shakeSpeed,
    totalIntensity,
    addLine,
    updateCurrentLine,
    undo,
    redo,
    clearCanvas,
    deleteLine,
    addLineBehind,
  } = useDrawing();

  // Convert mouse coordinates to canvas coordinates
  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    // Get mouse position relative to canvas
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Scale to canvas resolution
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    // Apply the original GameMaker transformation
    // Original: mouse_x * 5/8 - 213.75, mouse_y * 5/8
    // But we need to account for the different coordinate system
    return {
      x: mouseX * scaleX,
      y: mouseY * scaleY,
    };
  };

  // Apply shake effect to points
  const applyShake = useCallback((points: Point[], offset: number, intensity: number): Point[] => {
    return points.map(point => ({
      x: point.x + (Math.random() - 0.5) * 2 * offset * intensity,
      y: point.y + (Math.random() - 0.5) * 2 * offset * intensity,
    }));
  }, []);

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // Only left click
    
    const point = getCanvasPoint(e);
    
    switch (tool) {
      case 'freehand':
      case 'line':
      case 'lineNoShake':
      case 'lineBehind':
        setIsDrawing(true);
        setDrawingPoints([point]);
        const newLine: Line = {
          id: Date.now().toString(),
          points: [point],
          color,
          lineWidth,
          shakeOffset: (tool === 'lineNoShake' || tool === 'lineBehind') ? 0 : shakeOffset,
          shakeSpeed,
          isShaking: tool !== 'lineNoShake' && tool !== 'lineBehind',
          depth: tool === 'lineBehind' ? -1 : undefined,
        };
        updateCurrentLine(newLine);
        break;
      case 'eraser':
        // Handle eraser logic
        handleEraser();
        break;
      case 'fill':
        // Handle fill logic
        handleFill();
        break;
      case 'eyedropper':
        // Handle eyedropper logic
        handleEyedropper();
        break;
    }
  };

  // Check if point is near a line
  const isPointNearLine = (point: Point, linePoints: Point[], threshold: number = 10): boolean => {
    for (let i = 0; i < linePoints.length - 1; i++) {
      const p1 = linePoints[i];
      const p2 = linePoints[i + 1];
      
      // Calculate distance from point to line segment
      const A = point.x - p1.x;
      const B = point.y - p1.y;
      const C = p2.x - p1.x;
      const D = p2.y - p1.y;
      
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;
      
      if (lenSq !== 0) param = dot / lenSq;
      
      let xx, yy;
      
      if (param < 0) {
        xx = p1.x;
        yy = p1.y;
      } else if (param > 1) {
        xx = p2.x;
        yy = p2.y;
      } else {
        xx = p1.x + param * C;
        yy = p1.y + param * D;
      }
      
      const dx = point.x - xx;
      const dy = point.y - yy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= threshold) return true;
    }
    return false;
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    setMousePos(point);
    
    // Check for hovered line when using eraser
    if (tool === 'eraser' && !isDrawing) {
      let foundLine = false;
      for (const line of lines) {
        if (isPointNearLine(point, line.points, line.lineWidth + 5)) {
          setHoveredLineId(line.id);
          foundLine = true;
          break;
        }
      }
      if (!foundLine) {
        setHoveredLineId(null);
      }
    }
    
    if (!isDrawing || !currentLine) return;
    
    if (tool === 'freehand' || tool === 'lineBehind') {
      const newPoints = [...drawingPoints, point];
      setDrawingPoints(newPoints);
      updateCurrentLine({ ...currentLine, points: newPoints });
    } else if (tool === 'line' || tool === 'lineNoShake') {
      // For line tools, only update the end point
      const newPoints = [drawingPoints[0], point];
      updateCurrentLine({ ...currentLine, points: newPoints });
    }
  };

  // Handle mouse up
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0 && isDrawing && currentLine) {
      setIsDrawing(false);
      if (tool === 'lineBehind') {
        addLineBehind(currentLine);
      } else {
        addLine(currentLine);
      }
      updateCurrentLine(null);
      setDrawingPoints([]);
    }
  };

  // Handle right click (cancel drawing)
  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (isDrawing && currentLine) {
      setIsDrawing(false);
      updateCurrentLine(null);
      setDrawingPoints([]);
    }
  };

  // Handle eraser
  const handleEraser = () => {
    if (hoveredLineId) {
      deleteLine(hoveredLineId);
      setHoveredLineId(null);
    }
  };

  const handleFill = () => {
    // TODO: Implement fill logic
    // For now, just change background color
    // setBackgroundColor(color);
  };

  const handleEyedropper = () => {
    // TODO: Implement eyedropper logic
    // Find line at point and set current color to that line's color
  };

  // Draw a line segment
  const drawLineSegment = (
    ctx: CanvasRenderingContext2D,
    p1: Point,
    p2: Point,
    color: string,
    width: number
  ) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    
    // Draw circles at endpoints for smooth joints
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p2.x, p2.y, width / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Update shake effect based on shake speed
    const timeDelta = timestamp - lastUpdateTime.current;
    const shouldUpdateShake = timeDelta > (1000 / (60 / shakeSpeed)); // 60fps base, divided by speed

    if (shouldUpdateShake) {
      const newShakedLines = new Map<string, Point[]>();
      lines.forEach(line => {
        if (line.isShaking) {
          newShakedLines.set(line.id, applyShake(line.points, line.shakeOffset, totalIntensity));
        }
      });
      setShakedLines(newShakedLines);
      lastUpdateTime.current = timestamp;
    }

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Sort lines by depth (lines with depth -1 are drawn first)
    const sortedLines = [...lines].sort((a, b) => {
      const depthA = a.depth ?? 0;
      const depthB = b.depth ?? 0;
      return depthA - depthB;
    });

    // Draw all lines
    sortedLines.forEach(line => {
      const points = line.isShaking ? (shakedLines.get(line.id) || line.points) : line.points;
      
      // Change color if this line is hovered with eraser tool
      const lineColor = (tool === 'eraser' && hoveredLineId === line.id) 
        ? '#FF00FF' // Highlight color for eraser
        : line.color;
      
      if (points.length > 1) {
        for (let i = 0; i < points.length - 1; i++) {
          drawLineSegment(ctx, points[i], points[i + 1], lineColor, line.lineWidth);
        }
      }
    });

    // Draw current line
    if (currentLine && currentLine.points.length > 1) {
      const points = currentLine.isShaking 
        ? applyShake(currentLine.points, currentLine.shakeOffset, totalIntensity)
        : currentLine.points;
      
      for (let i = 0; i < points.length - 1; i++) {
        drawLineSegment(ctx, points[i], points[i + 1], currentLine.color, currentLine.lineWidth);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [lines, currentLine, backgroundColor, shakeSpeed, totalIntensity, applyShake, shakedLines]);

  // Start animation loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement) return;
      
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          redo();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        clearCanvas();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, clearCanvas]);

  return (
    <div style={{
      backgroundColor: '#808080',
      padding: 20,
      borderRadius: 8,
      display: 'inline-block',
    }}>
      <div style={{
        backgroundColor: '#C0C0C0',
        padding: 4,
        border: '2px solid #000',
      }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={handleContextMenu}
          style={{
            cursor: tool === 'eyedropper' ? 'crosshair' : 
                    tool === 'eraser' && hoveredLineId ? 'pointer' : 'default',
            imageRendering: 'pixelated',
            display: 'block',
          }}
        />
      </div>
      <div style={{ 
        marginTop: 10, 
        fontSize: 12, 
        fontFamily: 'monospace',
        color: '#000',
        textAlign: 'center',
      }}>
        Mouse: ({Math.round(mousePos.x)}, {Math.round(mousePos.y)})
      </div>
    </div>
  );
};