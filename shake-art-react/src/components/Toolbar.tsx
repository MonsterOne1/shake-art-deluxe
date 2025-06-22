import React, { useState, useEffect } from 'react';
import { useDrawing } from '../contexts/DrawingContext';
import type { Tool } from '../types';

interface ToolButtonProps {
  tool: Tool;
  icon: string;
  label: string;
  description?: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

interface TooltipProps {
  show: boolean;
  x: number;
  y: number;
  label: string;
  description?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ show, x, y, label, description }) => {
  if (!show) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        left: x + 10,
        top: y,
        backgroundColor: '#808000',
        border: '2px solid #000',
        padding: '8px 12px',
        fontFamily: 'monospace',
        fontSize: 14,
        zIndex: 1000,
        pointerEvents: 'none',
        minWidth: 200,
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: description ? 8 : 0 }}>
        {label}
      </div>
      {description && (
        <div style={{ fontSize: 12 }}>
          {description}
        </div>
      )}
    </div>
  );
};

const ToolButton: React.FC<ToolButtonProps> = ({ icon, label, description, isActive, onClick, disabled = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [animationOffset, setAnimationOffset] = useState(0);
  
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setAnimationOffset(Math.abs(Math.sin(Date.now() / 200) * 4));
      }, 16);
      return () => clearInterval(interval);
    }
  }, [isActive]);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };
  
  const getButtonStyle = () => {
    const baseStyle = {
      width: 48,
      height: 48,
      border: '2px solid #000',
      cursor: disabled ? 'not-allowed' : 'pointer',
      margin: 4,
      fontSize: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative' as const,
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.1s ease',
    };
    
    if (isActive) {
      return {
        ...baseStyle,
        backgroundColor: '#000',
        transform: `translate(-${animationOffset}px, -${animationOffset}px)`,
        boxShadow: `${animationOffset}px ${animationOffset}px 0 #A8A8FF`,
      };
    } else if (isHovered && !disabled) {
      return {
        ...baseStyle,
        backgroundColor: '#A8A8FF',
        filter: 'invert(1)',
      };
    }
    
    return {
      ...baseStyle,
      backgroundColor: '#FFF',
    };
  };
  
  return (
    <>
      <button
        className={`tool-button ${isActive ? 'active' : ''}`}
        onClick={disabled ? undefined : onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        style={getButtonStyle()}
      >
        {icon}
      </button>
      <Tooltip 
        show={isHovered && !disabled}
        x={mousePos.x}
        y={mousePos.y}
        label={label}
        description={description}
      />
    </>
  );
};

export const Toolbar: React.FC = () => {
  const { tool, setTool, undo, redo, undoStack, redoStack } = useDrawing();

  const tools: Array<{ tool: Tool; icon: string; label: string; description?: string }> = [
    { tool: 'freehand', icon: '✏️', label: 'Freehand', description: 'Draws a freehand line. Go slower for smoother lines!' },
    { tool: 'line', icon: '📏', label: 'Line', description: 'Draws a straight line with shake effect.' },
    { tool: 'lineNoShake', icon: '📐', label: 'Line (No Shake)', description: 'Draws a perfectly straight line without shake.' },
    { tool: 'lineBehind', icon: '⬇️', label: 'Line Behind', description: 'Draws lines behind existing lines.' },
    { tool: 'eraser', icon: '🧹', label: 'Line Eraser', description: 'Erases lines. The line that will be erased changes color while hovered.' },
    { tool: 'fill', icon: '🪣', label: 'Fill', description: 'Fills an enclosed area with color.' },
    { tool: 'eyedropper', icon: '💉', label: 'Eyedropper', description: 'Picks a color from the canvas.' },
  ];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      padding: 10,
      backgroundColor: '#F0F0F0',
      border: '2px solid #000',
      margin: 10,
    }}>
      <div style={{ marginBottom: 10 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Tools</h3>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: 168 }}>
        {tools.map(({ tool: t, icon, label, description }) => (
          <ToolButton
            key={t}
            tool={t}
            icon={icon}
            label={label}
            description={description}
            isActive={tool === t}
            onClick={() => setTool(t)}
          />
        ))}
      </div>
      
      <div style={{ marginTop: 20, borderTop: '1px solid #CCC', paddingTop: 10 }}>
        <ToolButton
          tool={'undo' as Tool}
          icon="↩️"
          label="Undo"
          description="Undoes. Press R to clear the canvas."
          isActive={false}
          onClick={undo}
          disabled={undoStack.length === 0}
        />
        <ToolButton
          tool={'redo' as Tool}
          icon="↪️"
          label="Redo"
          isActive={false}
          onClick={redo}
          disabled={redoStack.length === 0}
        />
      </div>
    </div>
  );
};