import React, { useState, useEffect } from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [spinTimer, setSpinTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpinTimer((prev) => prev + 1);
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    onStart();
  };

  const topTextRotation = Math.sin(spinTimer / 45) * 10;
  const bottomTextRotation = -Math.sin(spinTimer / 45) * 10;

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#E8E8E8',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        fontFamily: 'monospace',
      }}
    >
      <div
        style={{
          fontSize: 48,
          color: '#FFA500',
          marginBottom: 100,
          transform: `rotate(${topTextRotation}deg)`,
          transition: 'transform 0.1s',
        }}
      >
        click to start!!
      </div>
      
      <div
        style={{
          fontSize: 48,
          color: '#FFA500',
          transform: `rotate(${bottomTextRotation}deg)`,
          transition: 'transform 0.1s',
        }}
      >
        made with ❤️ by nokoi
      </div>
      
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          fontSize: 16,
          color: '#666',
        }}
      >
        React port by you
      </div>
    </div>
  );
};