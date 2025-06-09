import { useEffect, useRef } from 'react';

interface DigitalClockProps {
  speed?: number;
}

const DigitalClock: React.FC<DigitalClockProps> = ({ speed = 1.0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      // Clear screen with solid black
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Get current time
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}:${seconds}`;

      // Calculate font size based on screen size
      const fontSize = Math.min(canvas.width / 8, canvas.height / 4);
      
      // Set up text properties
      ctx.font = `${fontSize}px monospace`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw time
      ctx.fillText(timeString, centerX, centerY);

      // Draw date below time
      const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      ctx.font = `${fontSize * 0.3}px monospace`;
      ctx.fillStyle = '#888888';
      ctx.fillText(dateString, centerX, centerY + fontSize * 0.7);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'black',
        zIndex: -1,
      }}
    />
  );
};

export default DigitalClock;
