import React, { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';

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

export const AudioManager: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const soundRef = useRef<Howl | null>(null);

  useEffect(() => {
    // Initialize background music
    soundRef.current = new Howl({
      src: ['/audio/chill2.ogg', '/audio/chill2.mp3'], // Fallback formats
      loop: true,
      volume: volume,
      autoplay: true,
      onloaderror: (_id, err) => {
        console.warn('Audio failed to load:', err);
      },
      onplayerror: (_id, err) => {
        console.warn('Audio failed to play:', err);
        // Retry play on user interaction
        const playOnInteraction = () => {
          soundRef.current?.play();
          document.removeEventListener('click', playOnInteraction);
        };
        document.addEventListener('click', playOnInteraction);
      },
    });

    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, []);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        backgroundColor: '#F0F0F0',
        padding: 10,
        border: '2px solid #000',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <button
          onClick={toggleMute}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
          style={{
            width: 48,
            height: 48,
            border: '2px solid #000',
            backgroundColor: isHovered ? '#A8A8FF' : '#FFF',
            filter: isHovered ? 'invert(1)' : 'none',
            fontSize: 24,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.1s ease',
          }}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            disabled={isMuted}
            style={{
              width: 100,
              cursor: isMuted ? 'not-allowed' : 'pointer',
              opacity: isMuted ? 0.5 : 1,
            }}
          />
          <span style={{ fontSize: 12, textAlign: 'center', fontFamily: 'monospace' }}>
            Volume: {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
      
      <Tooltip
        show={isHovered}
        x={mousePos.x}
        y={mousePos.y}
        label={isMuted ? "Unmute" : "Mute"}
        description="Toggle background music on/off"
      />
    </>
  );
};