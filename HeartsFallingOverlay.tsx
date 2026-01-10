import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  random,
} from 'remotion';
import { FaHeart } from 'react-icons/fa';

// --- Types ---
interface HeartParticle {
  id: number;
  x: number; // Horizontal start position (0 to 1 scale of width)
  size: number; // Pixel size
  color: string;
  speedMultiplier: number; // Integer to ensure seamless loop
  swayAmplitude: number;
  swayPhase: number; // Offset for sine wave
  rotationSpeed: number;
  rotationPhase: number;
  startYOffset: number; // 0 to 1 scale of loop height
}

const FallingHeartsEmoji: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // --- Configuration ---
  const HEART_COUNT = 50;
  const COLORS = ['#FF2400', '#FF1493', '#FFB6C1']; // Soft Red, Deep Pink, Pale Pink
  
  // The vertical space a particle traverses before wrapping.
  // Must be larger than screen height + max particle size to hide the wrap pop.
  // Screen is 2160. Let's make loop height 2500.
  const LOOP_HEIGHT = height + 400; 

  // --- Particle Generation ---
  // Memoized so random values stay consistent across frames
  const hearts = useMemo<HeartParticle[]>(() => {
    return new Array(HEART_COUNT).fill(0).map((_, i) => {
      const seed = i;
      // Random X: allow slightly outside screen to drift in
      const x = random(seed) * 1.2 - 0.1; 
      
      const size = 40 + random(seed + 1) * 80; // 40px to 120px
      const color = COLORS[Math.floor(random(seed + 2) * COLORS.length)];
      
      // Speed: Must be integer multiple of LOOP_HEIGHT per Duration for seamless loop.
      // 1 = falls 1 loop height in 10s (~250px/s). 
      // 0.5 would be too slow? Let's stick to integer 1 or 2 for perfect looping.
      // Actually, to vary speed, we can say it travels K * LOOP_HEIGHT.
      // If we want slower, maybe we simply make LOOP_HEIGHT smaller? No, that clips.
      // Let's stick to multiplier 1 (slow) and maybe 2 (faster) for variety.
      // Since prompt asks for "VERY slowly" (8-15s), 1 loop (2500px) in 10s is perfect.
      // Let's mostly use 1, maybe rarely 2.
      const speedMultiplier = 1; 

      // Sway:
      const swayAmplitude = 50 + random(seed + 3) * 100; // 50px to 150px sway
      const swayPhase = random(seed + 4) * Math.PI * 2;

      // Rotation:
      const rotationSpeed = (random(seed + 5) - 0.5) * 60; // -30 to +30 deg max
      const rotationPhase = random(seed + 6) * Math.PI * 2;

      // Vertical Offset: where it starts in the loop
      const startYOffset = random(seed + 7) * LOOP_HEIGHT;

      return {
        id: i,
        x,
        size,
        color,
        speedMultiplier,
        swayAmplitude,
        swayPhase,
        rotationSpeed,
        rotationPhase,
        startYOffset,
      };
    });
  }, []);

  // --- Render Loop ---
  const progress = frame / durationInFrames; // 0 to 1

  return (
    <AbsoluteFill style={{ backgroundColor: '#15ff00ff' }}>
      {hearts.map((heart) => {
        // 1. Vertical Movement (Seamless Loop Math)
        // Total distance traveled in one full video duration
        const totalDistance = LOOP_HEIGHT * heart.speedMultiplier;
        
        // Current raw Y position based on time + offset
        const rawY = heart.startYOffset + (progress * totalDistance);
        
        // Wrap with modulo to keep inside [0, LOOP_HEIGHT)
        // We subtract particle size so it wraps cleanly off-screen
        const wrappedY = rawY % LOOP_HEIGHT;
        
        // Adjust coordinate system:
        // wrappedY goes from 0 to 2500.
        // We want 0 to be just above screen (e.g. -200).
        const finalY = wrappedY - 200;

        // 2. Horizontal Sway (Sine Wave)
        // Frequency must be integer multiple of 2PI per duration for seamlessness?
        // Actually, if we use time 0..1, sin(t * PI * 2) loops perfectly.
        // We can multiply freq by integers (1, 2, 3) to vary "wobble" speed.
        const sway = Math.sin(progress * Math.PI * 2 + heart.swayPhase) * heart.swayAmplitude;
        const finalX = (heart.x * width) + sway;

        // 3. Rotation (Sine Wave)
        // Rocking back and forth
        const rot = Math.sin(progress * Math.PI * 2 + heart.rotationPhase) * heart.rotationSpeed;

        return (
          <div
            key={heart.id}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              transform: `translate(${finalX}px, ${finalY}px) rotate(${rot}deg)`,
              color: heart.color,
              fontSize: `${heart.size}px`,
              opacity: 0.85,
              // Drop shadow for depth? Prompt didn't ask, but looks nice on white.
              // Prompt said "Softer layering", keeping it clean.
            }}
          >
            <FaHeart />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const compositionConfig = {
  id: 'FallingHeartsEmoji',
  component: FallingHeartsEmoji,
  width: 3840,
  height: 2160,
  fps: 30,
  durationInSeconds: 10,
  defaultProps: {},
};

export default FallingHeartsEmoji;
