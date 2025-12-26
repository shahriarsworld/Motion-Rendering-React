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
  id: 'CyberpunkDataRing',
  durationInFrames: 300, // 10 seconds for a seamless loop
  fps: 30,
  width: 3840, // 4K Resolution
  height: 2160,
  defaultProps: {
    primaryColor: '#00ff00', // Neon Green
    iconSize: 1200,
  },
};

type Props = typeof compositionConfig.defaultProps;

// =============================================================================
// HELPER: RING LAYER COMPONENT
// =============================================================================
interface RingLayerProps {
  radius: number;
  thickness: number;
  color: string;
  rotationSpeed: number; // Multiplier for rotation speed
  dashArray: string;
  rotationDirection: 1 | -1; // 1 for clockwise, -1 for counter-clockwise
}

const RingLayer: React.FC<RingLayerProps> = ({
  radius,
  thickness,
  color,
  rotationSpeed,
  dashArray,
  rotationDirection,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Calculate continuous rotation based on frame and speed.
  // Ensure it loops perfectly by ending on a multiple of 360.
  const totalRotation = 360 * rotationSpeed * rotationDirection;
  const currentRotation = interpolate(
    frame,
    [0, durationInFrames],
    [0, totalRotation]
  );

  // SVG path geometry for a circle
  const size = (radius + thickness) * 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Heavy neon glow filter
  const glowFilter = useMemo(() => `drop-shadow(0 0 15px ${color}) drop-shadow(0 0 30px ${color})`, [color]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: size,
        height: size,
        transform: `translate(-50%, -50%) rotate(${currentRotation}deg)`,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={dashArray}
          style={{ filter: glowFilter }}
        />
      </svg>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const CyberpunkDataRing: React.FC<Props> = ({ primaryColor, iconSize }) => {
  const { width, height } = useVideoConfig();

  // Calculate ring radii and thicknesses relative to the container size
  const outerRadius = iconSize * 0.45;
  const outerThickness = iconSize * 0.03;
  const innerRadius = iconSize * 0.3;
  const innerThickness = iconSize * 0.02;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000000', // Deep black background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Digital Noise/Glitch Overlay Texture */}
      <AbsoluteFill
        style={{
          opacity: 0.15,
          backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent 0%, transparent 2px, rgba(0, 255, 0, 0.1) 3px, transparent 4px)',
          backgroundSize: '100% 100%',
        }}
      />
      
      {/* The 1200px Container for the Rings */}
      <div style={{ width: iconSize, height: iconSize, position: 'relative' }}>
        
        {/* OUTER RING: Slow, clockwise, longer segments */}
        <RingLayer
          radius={outerRadius}
          thickness={outerThickness}
          color={primaryColor}
          rotationSpeed={1} // 1 full rotation per loop
          dashArray={`${outerRadius * 0.5} ${outerRadius * 0.2}`}
          rotationDirection={1} // Clockwise
        />

        {/* INNER RING: Fast, counter-clockwise, shorter segments */}
        <RingLayer
          radius={innerRadius}
          thickness={innerThickness}
          color={primaryColor}
          rotationSpeed={3} // 3 full rotations per loop
          dashArray={`${innerRadius * 0.2} ${innerRadius * 0.2}`}
          rotationDirection={-1} // Counter-clockwise
        />
        
      </div>
    </AbsoluteFill>
  );
};

export default CyberpunkDataRing;
