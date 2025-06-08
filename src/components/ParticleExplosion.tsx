import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  hue: number;
  brightness: number;
  trail: { x: number; y: number; alpha: number; size: number }[];
  type: 'spark' | 'ember' | 'star' | 'bloom';
  rotation: number;
  rotationSpeed: number;
}

interface Explosion {
  x: number;
  y: number;
  timer: number;
  particles: Particle[];
  type: 'firework' | 'burst' | 'cascade' | 'spiral';
}

interface ParticleExplosionProps {
  speed?: number;
}

const ParticleExplosion: React.FC<ParticleExplosionProps> = ({ speed = 1.0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const explosionsRef = useRef<Explosion[]>([]);
  const lastExplosionRef = useRef<number>(0);

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

    const createParticle = (x: number, y: number, explosionType: string): Particle => {
      const particleTypes = ['spark', 'ember', 'star', 'bloom'];
      const type = particleTypes[Math.floor(Math.random() * particleTypes.length)] as any;
      
      let angle, velocity, maxLife, size;
      
      switch (explosionType) {
        case 'firework':
          angle = Math.random() * Math.PI * 2;
          velocity = Math.random() * 6 + 2;
          maxLife = Math.random() * 100 + 80;
          size = Math.random() * 3 + 2;
          break;
        case 'burst':
          angle = Math.random() * Math.PI * 2;
          velocity = Math.random() * 8 + 3;
          maxLife = Math.random() * 60 + 40;
          size = Math.random() * 2 + 1;
          break;
        case 'cascade':
          angle = (Math.random() - 0.5) * Math.PI + Math.PI / 2;
          velocity = Math.random() * 4 + 1;
          maxLife = Math.random() * 150 + 100;
          size = Math.random() * 4 + 1;
          break;
        case 'spiral':
          angle = Math.random() * Math.PI * 2;
          velocity = Math.random() * 3 + 1;
          maxLife = Math.random() * 120 + 80;
          size = Math.random() * 3 + 1.5;
          break;
        default:
          angle = Math.random() * Math.PI * 2;
          velocity = Math.random() * 5 + 2;
          maxLife = Math.random() * 80 + 60;
          size = Math.random() * 3 + 2;
      }

      const hue = Math.random() * 360;
      const brightness = Math.random() * 0.5 + 0.5;
      
      return {
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 0,
        maxLife,
        size,
        color: `hsl(${hue}, 100%, ${brightness * 70}%)`,
        hue,
        brightness,
        trail: [],
        type,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      };
    };

    const createExplosion = (x: number, y: number): Explosion => {
      const explosionTypes = ['firework', 'burst', 'cascade', 'spiral'];
      const explosionType = explosionTypes[Math.floor(Math.random() * explosionTypes.length)];
      
      let particleCount;
      switch (explosionType) {
        case 'firework': particleCount = Math.floor(Math.random() * 40 + 30); break;
        case 'burst': particleCount = Math.floor(Math.random() * 60 + 40); break;
        case 'cascade': particleCount = Math.floor(Math.random() * 80 + 60); break;
        case 'spiral': particleCount = Math.floor(Math.random() * 50 + 35); break;
        default: particleCount = 40;
      }
      
      const particles = Array.from({ length: particleCount }, () => 
        createParticle(x, y, explosionType)
      );
      
      return {
        x,
        y,
        timer: 0,
        particles,
        type: explosionType as any
      };
    };

    const drawParticle = (particle: Particle, ctx: CanvasRenderingContext2D) => {
      const alpha = 1 - particle.life / particle.maxLife;
      const currentSize = particle.size * (1 - particle.life / particle.maxLife * 0.3);
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      
      const glowSize = currentSize * 4;
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(0.3, `hsla(${particle.hue}, 100%, ${particle.brightness * 50}%, 0.6)`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      
      switch (particle.type) {
        case 'spark':
          ctx.rect(-currentSize/2, -currentSize/2, currentSize, currentSize);
          break;
        case 'ember':
          ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
          break;
        case 'star':
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const x = Math.cos(angle) * currentSize;
            const y = Math.sin(angle) * currentSize;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            
            const innerAngle = ((i + 0.5) * Math.PI * 2) / 5;
            const innerX = Math.cos(innerAngle) * currentSize * 0.5;
            const innerY = Math.sin(innerAngle) * currentSize * 0.5;
            ctx.lineTo(innerX, innerY);
          }
          ctx.closePath();
          break;
        case 'bloom':
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            ctx.beginPath();
            ctx.ellipse(
              Math.cos(angle) * currentSize * 0.5,
              Math.sin(angle) * currentSize * 0.5,
              currentSize * 0.8,
              currentSize * 0.3,
              angle,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
          break;
      }
      
      if (particle.type !== 'bloom') {
        ctx.fill();
      }
      
      if (Math.random() < 0.1) {
        ctx.fillStyle = `hsla(${particle.hue + 60}, 100%, 90%, 0.8)`;
        ctx.beginPath();
        ctx.arc(0, 0, currentSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    };

    const animate = () => {
      const currentTime = Date.now();
      
      const explosionInterval = (1500 + Math.random() * 1000) / speed;
      if (currentTime - lastExplosionRef.current > explosionInterval) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        explosionsRef.current.push(createExplosion(x, y));
        lastExplosionRef.current = currentTime;
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      explosionsRef.current = explosionsRef.current.filter(explosion => {
        explosion.timer += speed;
        
        explosion.particles = explosion.particles.filter(particle => {
          particle.life += speed;
          
          if (particle.life >= particle.maxLife) return false;
          
          let gravityForce = 0.08;
          let airResistance = 0.995;
          
          if (explosion.type === 'cascade') {
            gravityForce = 0.12;
            airResistance = 0.98;
          } else if (explosion.type === 'spiral') {
            const spiralForce = 0.02;
            const centerX = explosion.x;
            const centerY = explosion.y;
            const dx = particle.x - centerX;
            const dy = particle.y - centerY;
            particle.vx += -dy * spiralForce;
            particle.vy += dx * spiralForce;
          }
          
          particle.x += particle.vx * speed;
          particle.y += particle.vy * speed;
          particle.vy += gravityForce * speed;
          particle.vx *= airResistance;
          particle.vy *= airResistance;
          particle.rotation += particle.rotationSpeed * speed;
          
          particle.trail.push({ 
            x: particle.x, 
            y: particle.y, 
            alpha: 1 - particle.life / particle.maxLife,
            size: particle.size * (1 - particle.life / particle.maxLife * 0.5)
          });
          
          if (particle.trail.length > 8) {
            particle.trail.shift();
          }
          
          particle.trail.forEach((point, index) => {
            const alpha = point.alpha * (index / particle.trail.length) * 0.4;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
          
          drawParticle(particle, ctx);
          
          return true;
        });
        
        return explosion.particles.length > 0;
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

export default ParticleExplosion;
