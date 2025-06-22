import React, { useState, useRef, useEffect } from 'react';
import GIF from 'gif.js';
import { useDrawing } from '../contexts/DrawingContext';

interface TooltipProps {
  show: boolean;
  x: number;
  y: number;
  label: string;
  description?: string;
}

const MAX_FRAMES = 30; // 1 second at 30fps
const FRAME_DELAY = 33; // ~30fps

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

export const RecordingControls: React.FC = () => {
  const { isRecording, setRecording } = useDrawing();
  const [frameCount, setFrameCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [animationOffset, setAnimationOffset] = useState(0);
  const gifRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const startRecording = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    canvasRef.current = canvas;
    setFrameCount(0);
    setRecording(true);
    
    // Initialize GIF encoder
    gifRef.current = new GIF({
      workers: 2,
      quality: 10,
      width: canvas.width,
      height: canvas.height,
    });
    
    // Set up GIF completion handler
    gifRef.current.on('finished', (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shake-art-${Date.now()}.gif`;
      a.click();
      URL.revokeObjectURL(url);
      setIsProcessing(false);
    });
    
    // Start capturing frames
    intervalRef.current = setInterval(() => {
      if (frameCount >= MAX_FRAMES) {
        stopRecording();
        return;
      }
      
      // Add current canvas frame to GIF
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        gifRef.current.addFrame(imageData, { delay: FRAME_DELAY });
        setFrameCount(prev => prev + 1);
      }
    }, FRAME_DELAY);
  };
  
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setAnimationOffset(Math.abs(Math.sin(Date.now() / 200) * 4));
      }, 16);
      return () => clearInterval(interval);
    }
  }, [isRecording]);
  
  const stopRecording = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setRecording(false);
    
    if (gifRef.current && frameCount > 0) {
      setIsProcessing(true);
      gifRef.current.render();
    }
  };
  
  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };
  
  const getButtonStyle = () => {
    const baseStyle = {
      width: 48,
      height: 48,
      border: '2px solid #000',
      cursor: isProcessing ? 'not-allowed' : 'pointer',
      fontSize: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative' as const,
      opacity: isProcessing ? 0.5 : 1,
      transition: 'all 0.1s ease',
    };
    
    if (isRecording) {
      return {
        ...baseStyle,
        backgroundColor: '#000',
        transform: `translate(-${animationOffset}px, -${animationOffset}px)`,
        boxShadow: `${animationOffset}px ${animationOffset}px 0 #FFF`,
      };
    } else if (isHovered && !isProcessing) {
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
      <div style={{
        padding: 20,
        backgroundColor: '#F0F0F0',
        border: '2px solid #000',
        margin: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: 16 }}>Record GIF</h3>
        
        <button
          onClick={handleToggleRecording}
          disabled={isProcessing}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
          style={getButtonStyle()}
        >
          {isProcessing ? '⏳' : (isRecording ? '🔴' : '📷')}
        </button>
        
        <div style={{ marginTop: 10, textAlign: 'center', fontFamily: 'monospace', fontSize: 12 }}>
          {isRecording && (
            <div>
              <p style={{ margin: 0, color: '#FF0000', fontWeight: 'bold' }}>RECORDING</p>
              <p style={{ margin: 0 }}>
                Frame {frameCount}/{MAX_FRAMES}
              </p>
            </div>
          )}
          {isProcessing && (
            <p style={{ margin: 0 }}>Processing...</p>
          )}
          {!isRecording && !isProcessing && (
            <p style={{ margin: 0 }}>Ready</p>
          )}
        </div>
      </div>
      
      <Tooltip
        show={isHovered && !isProcessing}
        x={mousePos.x}
        y={mousePos.y}
        label="Record GIF"
        description={isRecording 
          ? "Recording in progress. Click to stop." 
          : "Records a 1 second GIF of the current canvas. May freeze temporarily on browser but that's just loading!"}
      />
    </>
  );
};