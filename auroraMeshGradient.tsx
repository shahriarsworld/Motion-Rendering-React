import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// =============================================================================
// CONFIGURATION
// =============================================================================
export const compositionConfig = {
  id: 'AuroraMeshGradient',
  durationInSeconds: 8, // Seamless loop
  fps: 30,
  width: 4096, // 4K Resolution
  height: 2160,
  defaultProps: {
    // northern lights palette
   colors: [
      '#00d2ff', // Clean Blue (Primary)
      '#00ff9d', // Spring Green (Primary)
      '#006994', // Sea Blue (Primary)
      '#004d40', // Deep Teal (Depth)
      '#e0f7fa', // Very Pale Cyan (Highlight)
    ],
    bgColor: '#00151a', // Deep Teal Black
    blurAmount: 220,    // Higher blur for smoother water effect
    noiseOpacity: 0.02, // Lower noise for clean medical look
  },
};

type AuroraMeshProps = typeof compositionConfig.defaultProps;

// =============================================================================
// SUB-COMPONENT: ORGANIC BLOB
// =============================================================================
const OrganicBlob: React.FC<{
  color: string;
  seed: number;
  baseSize: number;
}> = ({ color, seed, baseSize }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // 1. Calculate Loop Progress (0.0 -> 1.0)
  const progress = frame / durationInFrames;
  
  // 2. Create Unique Motion Paths based on "seed"
  // We use Math.PI * 2 to ensure the motion makes exactly one full cycle (seamless loop)
  const angle = progress * Math.PI * 2;
  
  // Create offsets so every blob has a different path
  const xOffset = Math.sin(seed * 11) * (width * 0.2); 
  const yOffset = Math.cos(seed * 7) * (height * 0.1);

  // Circular/Elliptical Motion Math
  // We mix sine/cos with the seed to randomize the direction and radius
  const orbitRadiusX = width * (0.15 + (seed % 3) * 0.05);
  const orbitRadiusY = height * (0.15 + ((seed + 1) % 3) * 0.05);
  const direction = seed % 2 === 0 ? 1 : -1;

  const x = (width / 2) + xOffset + Math.cos(angle * direction + seed) * orbitRadiusX;
  const y = (height / 2) + yOffset + Math.sin(angle * direction + seed) * orbitRadiusY;

  // Breathing Effect (Scale)
  // Oscillates twice per loop for variation
  const breathe = 1 + Math.sin(angle * 2 + seed) * 0.2;
  const currentSize = baseSize * breathe;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: currentSize,
        height: currentSize,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
        opacity: 0.7,
        mixBlendMode: 'screen', // Makes colors blend vividly
      }}
    />
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const AuroraMeshGradient: React.FC<AuroraMeshProps> = ({
  colors,
  bgColor,
  blurAmount,
  noiseOpacity,
}) => {
  const { width, height } = useVideoConfig();

  // Generate a fixed set of blobs based on the color palette
  // We create 6 blobs (recycling colors if needed) to fill the 4K space
  const blobs = useMemo(() => {
    return [0, 1, 2, 3, 4, 0].map((colorIndex, i) => ({
      color: colors[colorIndex],
      seed: i * 45, // Arbitrary seed for randomness
      baseSize: Math.max(width, height) * 0.6, // Blobs are 60% of screen size
    }));
  }, [colors, width, height]);

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: 'hidden' }}>
      
      {/* 1. The Blended Mesh Layer */}
      {/* We wrap the blobs in a div with massive blur to merge them */}
      <AbsoluteFill style={{ filter: `blur(${blurAmount}px) saturate(1.4)` }}>
        {blobs.map((blob, i) => (
          <OrganicBlob
            key={i}
            color={blob.color}
            seed={blob.seed}
            baseSize={blob.baseSize}
          />
        ))}
      </AbsoluteFill>

      {/* 2. Texture Overlay (Noise) */}
      {/* Prevents color banding and adds the "frosted" premium feel */}
      <AbsoluteFill
        style={{
          opacity: noiseOpacity,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />
    </AbsoluteFill>
  );
};

export default AuroraMeshGradient;
