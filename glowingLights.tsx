import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  random,
} from 'remotion';

// =============================================================================
// CONFIGURATION
// =============================================================================
export const compositionConfig = {
  id: 'GlowingLightsString',
  durationInSeconds: 10,
  fps: 30,
  width: 3840,  // 4K Width
  height: 2160, // 4K Height
  defaultProps: {
    bulbCount: 15,        // Bulbs per string
    wireColor: '#4a3b2a', // Dark brownish wire
    glowColor: '#ffdd55', // Warm yellow light
    baseColor: '#ffaa00', // Inner bulb color
    sagStrength: 240,     // Gravity effect
  },
};

type GlowingLightsProps = typeof compositionConfig.defaultProps;

// =============================================================================
// HELPER: MATH & GEOMETRY
// =============================================================================
// Quadratic Bezier: Returns a point {x,y} along a curve at percentage t (0 to 1)
const getPointOnCurve = (
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  t: number
) => {
  const invT = 1 - t;
  const x = invT * invT * p0.x + 2 * invT * t * p1.x + t * t * p2.x;
  const y = invT * invT * p0.y + 2 * invT * t * p1.y + t * t * p2.y;
  return { x, y };
};

// =============================================================================
// SUB-COMPONENT: INDIVIDUAL BULB
// =============================================================================
const Bulb: React.FC<{
  x: number;
  y: number;
  scale: number;
  seed: number;
  color: string;
  glowColor: string;
  durationInFrames: number;
  currentFrame: number;
}> = ({ x, y, scale, seed, color, glowColor, durationInFrames, currentFrame }) => {
  
  // --- SEAMLESS FLICKER MATH (UPDATED FOR SPEED) ---
  const progress = currentFrame / durationInFrames;
  
  // Frequency increased significantly (e.g., 15 cycles instead of 3) for faster shimmering.
  // Must remain integers for seamless loops.
  const flickerRaw = 
    Math.sin(progress * Math.PI * 2 * 15 + seed * 10) * 0.1 + // Fast shimmer
    Math.sin(progress * Math.PI * 2 * 7 + seed * 20) * 0.05;  // Medium wobble

  // Normalize flicker range roughly between 0.8 and 1.15
  const flicker = flickerRaw + 1.0; 

  // Higher minimum opacity so they don't look "dead" when dim
  const opacity = interpolate(flicker, [0.85, 1.15], [0.7, 1]);
  
  // Dynamic brightness pop
  const brightnessBoost = interpolate(flicker, [0.85, 1.15], [1, 1.8]);

  const size = 24 * scale; 

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        transform: `translate(-50%, 0)`, // Center horizontally
        opacity: opacity,
        // UPDATED: Much more intense, layered glow styles
        boxShadow: `
          0px 0px ${10 * scale}px ${2 * scale}px ${color}, 
          0px 0px ${40 * scale}px ${15 * scale}px ${glowColor},
          0px 0px ${100 * scale}px ${30 * scale}px rgba(255, 160, 50, 0.6),
          inset 0px 0px ${10 * scale}px rgba(255,255,200, 0.8)
        `,
        // Adding brightness filter for extra "hot" look
        filter: `brightness(${brightnessBoost}) contrast(1.2)`,
      }}
    />
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const GlowingLights: React.FC<GlowingLightsProps> = ({
  bulbCount,
  wireColor,
  glowColor,
  baseColor,
  sagStrength,
}) => {
  const frame = useCurrentFrame();
  const { width, durationInFrames } = useVideoConfig();

  // --- SCENE LAYOUT ---
  const strings = useMemo(() => [
    { start: { x: -100, y: 100 }, end: { x: width * 0.4, y: 300 }, sag: sagStrength },
    { start: { x: width * 0.3, y: 200 }, end: { x: width * 0.8, y: 160 }, sag: sagStrength + 40 },
    { start: { x: width * 0.7, y: 80 }, end: { x: width + 100, y: 360 }, sag: sagStrength + 20 },
    { start: { x: -40, y: 500 }, end: { x: width * 0.5, y: 700 }, sag: sagStrength + 100 },
    { start: { x: width * 0.4, y: 640 }, end: { x: width + 40, y: 560 }, sag: sagStrength + 120 },
  ], [width, sagStrength]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#050302', overflow: 'hidden' }}>
      
      {/* BACKGROUND ATMOSPHERE (Darker for contrast) */}
      <div 
         style={{ 
            position: 'absolute', 
            top: 0, left: 0, right: 0, height: '1500px',
            background: 'radial-gradient(ellipse at center top, #3a2f1a 0%, transparent 80%)',
            opacity: 0.6 
         }} 
      />

      {strings.map((str, index) => {
        // --- WIRE GEOMETRY ---
        const midX = (str.start.x + str.end.x) / 2;
        const midY = (str.start.y + str.end.y) / 2 + str.sag;
        const pathData = `M ${str.start.x} ${str.start.y} Q ${midX} ${midY + str.sag} ${str.end.x} ${str.end.y}`;
        
        // --- BULB PLACEMENT ---
        const currentBulbCount = bulbCount + (index % 2 === 0 ? 5 : 0);
        const bulbs = new Array(currentBulbCount).fill(0).map((_, i) => {
          const t = (i + 1) / (currentBulbCount + 1);
          const pos = getPointOnCurve(str.start, { x: midX, y: midY + str.sag }, str.end, t);
          return { ...pos, id: i, seed: random(index * 100 + i) };
        });

        return (
          <React.Fragment key={index}>
             {/* 1. THE WIRE */}
             <svg style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'visible' }}>
               <path
                 d={pathData}
                 fill="none"
                 stroke={wireColor}
                 strokeWidth={4}
                 strokeLinecap="round"
                 style={{ filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.5))' }}
               />
             </svg>

             {/* 2. THE BULBS */}
             {bulbs.map((b) => (
               <Bulb
                 key={b.id}
                 x={b.x}
                 y={b.y + 8}
                 scale={random(b.seed) * 0.5 + 0.8}
                 seed={b.seed}
                 color={baseColor}
                 glowColor={glowColor}
                 durationInFrames={durationInFrames}
                 currentFrame={frame}
               />
             ))}
          </React.Fragment>
        );
      })}

      {/* FOREGROUND VIGNETTE (Darker edges to pop lights) */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
         <div style={{
            width: '100%', height: '100%',
            background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.6) 100%)'
         }}/>
      </AbsoluteFill>

    </AbsoluteFill>
  );
};

export default GlowingLights;
