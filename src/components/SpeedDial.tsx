import React, { useState, useCallback } from 'react';

interface SpeedDialProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
}

const SpeedDial: React.FC<SpeedDialProps> = ({ speed, onSpeedChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleInteraction = useCallback((clientX: number, clientY: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    let angle = Math.atan2(deltaX, -deltaY);
    if (angle < 0) angle += Math.PI * 2;
    
    const percentage = angle / (Math.PI * 2);
    
    const rawSpeed = 0.1 + percentage * 2.9;
    const newSpeed = Math.round(rawSpeed * 20) / 20;
    
    onSpeedChange(Math.max(0.1, Math.min(3.0, newSpeed)));
  }, [onSpeedChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const element = e.currentTarget as HTMLElement;
    handleInteraction(e.clientX, e.clientY, element);

    const handleMouseMove = (event: MouseEvent) => {
      handleInteraction(event.clientX, event.clientY, element);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const element = e.currentTarget as HTMLElement;
    const touch = e.touches[0];
    handleInteraction(touch.clientX, touch.clientY, element);

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      handleInteraction(touch.clientX, touch.clientY, element);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const rotation = ((speed - 0.1) / 2.9) * 360;

  const getSpeedColor = () => {
    if (speed <= 0.5) return '#4ade80';
    if (speed <= 1.5) return '#3b82f6';
    if (speed <= 2.5) return '#f59e0b';
    return '#ef4444';
  };

  const speedColor = getSpeedColor();

  return (
    <div className="speed-dial-container">
      <label className="speed-label">Animation Speed</label>
      <div 
        className={`speed-dial ${isDragging ? 'dragging' : ''} ${isHovered ? 'hovered' : ''}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="dial-background">
          <div className="dial-outer-ring" />
          
          <div className="speed-zones">
            <div className="speed-zone slow" style={{ '--zone-color': '#4ade80' } as React.CSSProperties} />
            <div className="speed-zone normal" style={{ '--zone-color': '#3b82f6' } as React.CSSProperties} />
            <div className="speed-zone fast" style={{ '--zone-color': '#f59e0b' } as React.CSSProperties} />
            <div className="speed-zone very-fast" style={{ '--zone-color': '#ef4444' } as React.CSSProperties} />
          </div>
          
          <div className="dial-major-marks">
            {[0, 3, 6, 9].map((i) => (
              <div
                key={i}
                className="dial-major-mark"
                style={{ transform: `rotate(${i * 30}deg)` }}
              />
            ))}
          </div>
          
          <div className="dial-minor-marks">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`dial-minor-mark ${[0, 3, 6, 9].includes(i) ? 'hidden' : ''}`}
                style={{ transform: `rotate(${i * 30}deg)` }}
              />
            ))}
          </div>
          
          <div 
            className="dial-handle" 
            style={{ 
              transform: `rotate(${rotation}deg)`,
              '--handle-color': speedColor
            } as React.CSSProperties}
          >
            <div className="handle-grip">
              <div className="grip-dot" />
              <div className="grip-dot" />
              <div className="grip-dot" />
            </div>
            <div className="handle-glow" />
          </div>
          
          <div 
            className="speed-arc"
            style={{
              '--arc-rotation': `${rotation}deg`,
              '--arc-color': speedColor
            } as React.CSSProperties}
          />
          
          <div className="dial-center">
            <div className="speed-display" style={{ color: speedColor }}>
              <div className="speed-value-large">{speed.toFixed(1)}</div>
              <div className="speed-unit">x</div>
            </div>
          </div>
        </div>
      </div>
      <div className="speed-labels">
        <span className="speed-label-min">0.1x</span>
        <span className="speed-label-max">3.0x</span>
      </div>
    </div>
  );
};

export default SpeedDial;
