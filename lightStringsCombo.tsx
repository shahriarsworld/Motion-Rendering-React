import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';

// =============================================================================
// CONFIGURATION
// =============================================================================
export const compositionConfig = {
  id: 'GlowingStringLights',
  durationInSeconds: 10,
  fps: 30,
  width: 3840, // 4K Resolution
  height: 2160,
  defaultProps: {
    bulbSpacing: 80,       // Spaced out slightly more for the bigger bulbs
    swayIntensity: 20,     // Gentle movement
    colors: {
      warmGold: '#FFB700', // Deep Warm Yellow/Orange
      filament: '#FFFDD0', // Hot center
      wire: '#444444',
    },
  },
};

type LightProps = typeof compositionConfig.defaultProps;

// =============================================================================
// SUB-COMPONENT: SINGLE BULB
// =============================================================================
const GlowingBulb: React.FC<{
  x: number;
  y: number;
  color: string;
  index: number;
  config: LightProps;
}> = ({ x, y, color, index, config }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // --- SEAMLESS LOOP & RANDOM FLICKER LOGIC ---
  // 1. Calculate progress from 0 to 1
  const progress = frame / durationInFrames;
  // 2. Convert to Radians (0 to 2PI) for perfect sine loops
  const rad = progress * Math.PI * 2;
  
  // 3. Generate unique random offsets based on bulb index
  // We use large prime number multipliers to make them look chaotic/random
  const uniqueOffset = index * 1337; 
  const flickerSpeed = (index % 3) + 2; // Varies between 2x and 5x speed

  // 4. Oscillate opacity
  const flicker = interpolate(
    Math.sin(rad * flickerSpeed + uniqueOffset),
    [-1, 1],
    [0.7, 1.0] // Opacity breathes between 70% and 100%
  );

  // 5. Scale breathe (subtle size change with brightness)
  const scale = interpolate(flicker, [0.7, 1], [0.95, 1.05]);

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* 1. The Aura (Glow) - Layered behind */}
      {/* We use two layers of blur for a rich "Bloom" effect */}
      <circle
        cx="0"
        cy="10"
        r="40" 
        fill={color}
        opacity={flicker * 0.4} // The aura fades in and out
        style={{ filter: 'blur(20px)' }} 
      />
      <circle
        cx="0"
        cy="10"
        r="20" 
        fill={color}
        opacity={flicker * 0.6}
        style={{ filter: 'blur(10px)' }}
      />

      {/* 2. The Socket */}
      <rect x="-4" y="-8" width="8" height="12" fill="#222" rx="2" />

      {/* 3. The Bulb Glass (Bigger now) */}
      <circle
        cx="0"
        cy="12"
        r="12" // Increased size
        fill={color}
        opacity={0.9}
      />

      {/* 4. Filament Core (The Hot White Center) */}
      <circle 
        cx="0" 
        cy="12" 
        r="5" 
        fill={config.colors.filament} 
        opacity={flicker} // The core pulses the most
        style={{ filter: 'blur(1px)' }}
      />
    </g>
  );
};

// =============================================================================
// SUB-COMPONENT: STRING GENERATOR
// =============================================================================
const LightString: React.FC<{
  type: 'curve' | 'straight' | 'wave';
  yPos: number;
  config: LightProps;
  swayOffset: number;
}> = ({ type, yPos, config, swayOffset }) => {
  const { width, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  // --- SEAMLESS SWAY PHYSICS ---
  const progress = frame / durationInFrames;
  const loopRad = progress * Math.PI * 2;
  
  // Sway moves back and forth perfectly within the loop duration
  const sway = Math.sin(loopRad + swayOffset) * config.swayIntensity;

  const points = useMemo(() => {
    const pts = [];
    const steps = Math.ceil(width / 20);
    
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      let y = yPos;
      const p = x / width; // 0.0 to 1.0

      if (type === 'curve') {
        // Catenary Curve
        const sag = 200;
        // Add sway influence that diminishes at the anchor points (ends)
        const swayFactor = Math.sin(p * Math.PI); 
        y = yPos + (swayFactor * sag) + (sway * swayFactor);
      } 
      else if (type === 'straight') {
        // Taut line
        y = yPos + (sway * 0.5);
      } 
      else if (type === 'wave') {
        // Sine Wave
        const frequency = 4 * Math.PI; 
        const amplitude = 80;
        y = yPos + Math.sin(p * frequency + (sway/50)) * amplitude;
      }

      pts.push({ x, y });
    }
    return pts;
  }, [width, yPos, type, sway]);

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  // Place Bulbs
  const bulbs = [];
  const bulbCount = Math.floor(width / config.bulbSpacing);
  
  for (let i = 1; i < bulbCount; i++) {
    const index = Math.floor((i / bulbCount) * points.length);
    const pos = points[index];
    if (pos) {
      bulbs.push(
        <GlowingBulb 
          key={i} 
          index={i} 
          x={pos.x} 
          y={pos.y} 
          color={config.colors.warmGold} 
          config={config}
        />
      );
    }
  }

  return (
    <g>
      <path
        d={pathData}
        fill="none"
        stroke={config.colors.wire}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {bulbs}
    </g>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export const GlowingStringLights: React.FC<LightProps> = (props) => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#050300' }}> {/* Very dark warm black */}
      
      <svg
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* 1. TOP STRING: Deep Curve */}
        <LightString
          type="curve"
          yPos={height * 0.1}
          config={props}
          swayOffset={0}
        />

        {/* 2. MIDDLE STRING: Taut/Straight */}
        <LightString
          type="straight"
          yPos={height * 0.5}
          config={props}
          swayOffset={2} // Offset radian for variety
        />

        {/* 3. BOTTOM STRING: Wavy */}
        <LightString
          type="wave"
          yPos={height * 0.75}
          config={props}
          swayOffset={4}
        />
      </svg>
      
      {/* Global Atmosphere Vignette
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.9) 90%)',
          pointerEvents: 'none',
        }}
      /> */}
      
      {/* Subtle Noise Grain for Texture */}
      <AbsoluteFill
        style={{
            opacity: 0.05,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
