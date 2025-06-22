import React, { useState, useEffect, useRef } from 'react';
import { useDrawing } from '../contexts/DrawingContext';
import type { HSVColor } from '../types';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  description?: string;
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

const Slider: React.FC<SliderProps> = ({ label, value, min, max, step = 1, onChange, description }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };
  
  const getSliderPosition = () => {
    const percentage = ((value - min) / (max - min)) * 100;
    return `${percentage}%`;
  };
  
  return (
    <div style={{ marginBottom: 15 }}>
      <label style={{ display: 'block', marginBottom: 5, fontSize: 14 }}>
        {label}: {value}
      </label>
      <div
        ref={sliderRef}
        style={{ position: 'relative', padding: '8px 0' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Slider track */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: 18,
          backgroundColor: '#FFF',
          border: '1px solid #000',
          transform: 'translateY(-50%)',
        }} />
        
        {/* Slider handle */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: getSliderPosition(),
          width: 16,
          height: 32,
          backgroundColor: '#C0C0C0',
          border: '2px solid #000',
          transform: 'translate(-50%, -50%)',
          cursor: 'grab',
          boxShadow: isDragging ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none',
        }} />
        
        {/* Invisible input for accessibility */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          style={{
            width: '100%',
            opacity: 0,
            cursor: 'grab',
            position: 'relative',
            zIndex: 1,
          }}
        />
      </div>
      
      <Tooltip
        show={isHovered && !isDragging && !!description}
        x={mousePos.x}
        y={mousePos.y}
        label={label}
        description={description}
      />
    </div>
  );
};

export const ControlsPanel: React.FC = () => {
  const {
    color,
    lineWidth,
    shakeOffset,
    shakeSpeed,
    totalIntensity,
    setHSVColor,
    setLineWidth,
    setShakeOffset,
    setShakeSpeed,
    setTotalIntensity,
  } = useDrawing();

  const [hsv, setHsv] = useState<HSVColor>({ h: 168, s: 107, v: 168 });
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Convert hex color to HSV
  const hexToHSV = (hex: string): HSVColor => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
      if (max === r) {
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
      } else if (max === g) {
        h = ((b - r) / delta + 2) / 6;
      } else {
        h = ((r - g) / delta + 4) / 6;
      }
    }

    const s = max === 0 ? 0 : delta / max;
    const v = max;

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100),
    };
  };

  useEffect(() => {
    setHsv(hexToHSV(color));
  }, [color]);

  const handleHSVChange = (newHsv: Partial<HSVColor>) => {
    const updated = { ...hsv, ...newHsv };
    setHsv(updated);
    setHSVColor(updated);
  };

  // Draw preview line
  useEffect(() => {
    const drawPreviewLine = (timestamp: number) => {
      const canvas = previewCanvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Generate preview points with shake
      const points: { x: number; y: number }[] = [];
      const numPoints = 20;
      const startX = 10;
      const endX = canvas.width - 10;
      const centerY = canvas.height / 2;
      
      for (let i = 0; i < numPoints; i++) {
        const t = i / (numPoints - 1);
        const x = startX + (endX - startX) * t;
        const shakeAmount = Math.sin(timestamp / 200 + i * 0.5) * shakeOffset * totalIntensity;
        const y = centerY + shakeAmount;
        points.push({ x, y });
      }
      
      // Draw the line
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      points.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
      
      // Draw end caps
      ctx.fillStyle = color;
      points.forEach((point, i) => {
        if (i === 0 || i === points.length - 1) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, lineWidth / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      animationRef.current = requestAnimationFrame(drawPreviewLine);
    };
    
    animationRef.current = requestAnimationFrame(drawPreviewLine);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [color, lineWidth, shakeOffset, totalIntensity]);

  return (
    <div style={{
      padding: 20,
      backgroundColor: '#F0F0F0',
      border: '2px solid #000',
      margin: 10,
      minWidth: 250,
    }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: 16 }}>Controls</h3>
      
      {/* Preview Line */}
      <div style={{ 
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        border: '1px solid #999',
      }}>
        <label style={{ display: 'block', marginBottom: 10, fontSize: 14, fontWeight: 'bold' }}>
          Preview
        </label>
        <canvas
          ref={previewCanvasRef}
          width={230}
          height={60}
          style={{
            width: '100%',
            height: 60,
            backgroundColor: '#FFF',
            border: '1px solid #000',
            imageRendering: 'pixelated',
          }}
        />
      </div>
      
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 10, fontSize: 14 }}>
          Color
        </label>
        <div style={{ 
          width: 50, 
          height: 50, 
          backgroundColor: color,
          border: '2px solid #000',
          marginBottom: 10,
        }} />
        
        <Slider
          label="Hue"
          value={hsv.h}
          min={0}
          max={360}
          onChange={(h) => handleHSVChange({ h })}
          description="Changes the hue of the color."
        />
        
        <Slider
          label="Saturation"
          value={hsv.s}
          min={0}
          max={100}
          onChange={(s) => handleHSVChange({ s })}
          description="Changes the saturation of the color."
        />
        
        <Slider
          label="Value"
          value={hsv.v}
          min={0}
          max={100}
          onChange={(v) => handleHSVChange({ v })}
          description="Changes the brightness of the color."
        />
      </div>

      <Slider
        label="Line Width"
        value={lineWidth}
        min={1}
        max={20}
        onChange={setLineWidth}
        description="Changes the width of the line to be drawn."
      />

      <Slider
        label="Shake Offset"
        value={shakeOffset}
        min={0}
        max={10}
        onChange={setShakeOffset}
        description="Controls how far lines can shake from their original position."
      />

      <Slider
        label="Shake Speed"
        value={shakeSpeed}
        min={0.1}
        max={5}
        step={0.1}
        onChange={setShakeSpeed}
        description="Changes the refresh speed of the line to be drawn."
      />

      <Slider
        label="Total Intensity"
        value={totalIntensity}
        min={0}
        max={2}
        step={0.1}
        onChange={setTotalIntensity}
        description="Changes the intensity of the line to be drawn."
      />
    </div>
  );
};