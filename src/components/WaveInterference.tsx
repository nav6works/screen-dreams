import { useEffect, useRef } from 'react';

interface WaveSource {
  x: number;
  y: number;
  frequency: number;
  amplitude: number;
  phase: number;
}

interface WaveInterferenceProps {
  speed?: number;
}

const WaveInterference: React.FC<WaveInterferenceProps> = ({ speed = 1.0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const sourcesRef = useRef<WaveSource[]>([]);

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

    const sources: WaveSource[] = [
      { x: canvas.width * 0.3, y: canvas.height * 0.3, frequency: 0.02, amplitude: 50, phase: 0 },
      { x: canvas.width * 0.7, y: canvas.height * 0.7, frequency: 0.025, amplitude: 45, phase: Math.PI },
      { x: canvas.width * 0.6, y: canvas.height * 0.2, frequency: 0.018, amplitude: 40, phase: Math.PI / 2 },
    ];

    sourcesRef.current = sources;

    const animate = () => {
      timeRef.current += 0.02 * speed;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let x = 0; x < canvas.width; x += 2) {
        for (let y = 0; y < canvas.height; y += 2) {
          let amplitude = 0;
          
          sourcesRef.current.forEach(source => {
            const distance = Math.sqrt((x - source.x) ** 2 + (y - source.y) ** 2);
            const wave = source.amplitude * Math.sin(source.frequency * distance - timeRef.current + source.phase);
            amplitude += wave / (1 + distance * 0.001);
          });

          const intensity = Math.max(0, Math.min(255, 128 + amplitude * 2));
          const hue = (intensity / 255) * 240;
          
          const rgb = hslToRgb(hue / 360, 0.8, intensity / 512 + 0.2);
          
          const index = (y * canvas.width + x) * 4;
          if (index < data.length) {
            data[index] = rgb[0];
            data[index + 1] = rgb[1];
            data[index + 2] = rgb[2];
            data[index + 3] = 255;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      sourcesRef.current.forEach(source => {
        const glow = Math.sin(timeRef.current * 3) * 0.3 + 0.7;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        
        const gradient = ctx.createRadialGradient(source.x, source.y, 0, source.x, source.y, 20);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${glow})`);
        gradient.addColorStop(0.5, `rgba(100, 200, 255, ${glow * 0.5})`);
        gradient.addColorStop(1, 'rgba(0, 100, 200, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(source.x, source.y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

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

  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h < 1/6) {
      r = c; g = x; b = 0;
    } else if (h < 2/6) {
      r = x; g = c; b = 0;
    } else if (h < 3/6) {
      r = 0; g = c; b = x;
    } else if (h < 4/6) {
      r = 0; g = x; b = c;
    } else if (h < 5/6) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  };

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

export default WaveInterference;
