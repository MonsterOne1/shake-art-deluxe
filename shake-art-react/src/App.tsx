import { useState } from 'react';
import { DrawingProvider } from './contexts/DrawingContext';
import { DrawingCanvas } from './components/DrawingCanvas';
import { Toolbar } from './components/Toolbar';
import { ControlsPanel } from './components/ControlsPanel';
import { RecordingControls } from './components/RecordingControls';
import { AudioManager } from './components/AudioManager';
import { WelcomeScreen } from './components/WelcomeScreen';
import './App.css';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const handleStart = () => {
    setShowWelcome(false);
    setAudioEnabled(true);
  };

  if (showWelcome) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return (
    <DrawingProvider>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#E8E8E8',
        fontFamily: 'monospace',
      }}>
        <header style={{
          padding: 20,
          backgroundColor: '#333',
          color: '#FFF',
          textAlign: 'center',
        }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>Shake Art Deluxe - React</h1>
          <p style={{ margin: 5, fontSize: 14 }}>PS1-style vertex jitter drawing tool</p>
        </header>
        
        <main style={{
          flex: 1,
          display: 'flex',
          padding: 20,
          gap: 20,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Toolbar />
            <RecordingControls />
          </div>
          
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: 20,
            overflow: 'auto',
          }}>
            <DrawingCanvas />
          </div>
          
          <ControlsPanel />
        </main>
        
        {audioEnabled && <AudioManager />}
      </div>
    </DrawingProvider>
  );
}

export default App
