import { useState, useEffect } from 'react';
import Starfield from './components/Starfield';
import MatrixRain from './components/MatrixRain';
import WaveInterference from './components/WaveInterference';
import ParticleExplosion from './components/ParticleExplosion';
import DigitalClock from './components/DigitalClock';
import SpeedDial from './components/SpeedDial';
import './App.css';

const animations = [
  { name: 'Starfield', component: Starfield },
  { name: 'Matrix Rain', component: MatrixRain },
  { name: 'Wave Interference', component: WaveInterference },
  { name: 'Particle Explosion', component: ParticleExplosion },
  { name: 'Digital Clock', component: DigitalClock },
];

function App() {
  const [currentAnimation, setCurrentAnimation] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [autoSwitch, setAutoSwitch] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let interval: number;
    if (autoSwitch) {
      interval = setInterval(() => {
        setCurrentAnimation((prev) => (prev + 1) % animations.length);
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoSwitch]);

  useEffect(() => {
    let timeout: number;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  const CurrentAnimationComponent = animations[currentAnimation].component;

  return (
    <div className="screensaver">
      <CurrentAnimationComponent speed={speed} />
      
      <div className={`controls ${showControls ? 'visible' : 'hidden'}`}>
        <div className="control-panel">
          <h2>Screensaver Controls</h2>
          <div className="animation-buttons">
            {animations.map((animation, index) => (
              <button
                key={index}
                className={currentAnimation === index ? 'active' : ''}
                onClick={() => setCurrentAnimation(index)}
              >
                {animation.name}
              </button>
            ))}
          </div>
          <SpeedDial speed={speed} onSpeedChange={setSpeed} />
          <div className="options">
            <label>
              <input
                type="checkbox"
                checked={autoSwitch}
                onChange={(e) => setAutoSwitch(e.target.checked)}
              />
              Auto-switch animations (30s)
            </label>
          </div>
          <button
            className={`fullscreen-button ${isFullscreen ? 'active' : ''}`}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? '🗗' : '🗖'} {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
          <div className="current-animation">
            Current: {animations[currentAnimation].name}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
