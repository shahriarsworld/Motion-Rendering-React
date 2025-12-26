import React from 'react';
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
  id: 'GyroscopeV2',
  durationInFrames: 300, // 10 seconds
  fps: 30,
  width: 3840,
  height: 2160,
  defaultProps: {
    goldColor: '#00FFFF',
    ringSize: 1000,
    thickness: 20,
  },
};

type Props = typeof compositionConfig.defaultProps;

// =============================================================================
// SUB-COMPONENT: GYRO RING
// =============================================================================
const GyroRing: React.FC<{
  radius: number;
  thickness: number;
  rotation: number;     // The main spinning animation
  wobbleX: number;      // The slow tilt animation
  wobbleY: number;
  dashArray: string;    // Creates gaps so we can SEE it spin
  hasGem?: boolean;     // Adds a physical object to the ring
}> = ({ radius, thickness, rotation, wobbleX, wobbleY, dashArray, hasGem }) => {
  
  const size = radius * 2 + thickness * 4; // Add buffer for gems/glow
  const center = size / 2;

  // 3D Transform: 
  // 1. Wobble (Tilt)
  // 2. Rotation (Spin)
  const transform = `rotateX(${wobbleX}deg) rotateY(${wobbleY}deg) rotateZ(${rotation}deg)`;

  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        left: `calc(50% - ${center}px)`,
        top: `calc(50% - ${center}px)`,
        transform,
        transformStyle: 'preserve-3d',
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="luxGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BF953F" />
            <stop offset="25%" stopColor="#FCF6BA" /> 
            <stop offset="50%" stopColor="#B38728" />
            <stop offset="75%" stopColor="#FBF5B7" />
            <stop offset="100%" stopColor="#AA771C" />
          </linearGradient>
          <filter id="glow">
             <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#B38728" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* The Main Ring Structure */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#luxGold)"
          strokeWidth={thickness}
          strokeDasharray={dashArray} // CRITICAL: This makes movement visible
          strokeLinecap="round"
          style={{ filter: 'url(#glow)' }}
        />

        {/* Optional: A Gem/Bearing on the ring to prove rotation */}
        {hasGem && (
           <circle
             cx={center + radius} // Position at 0 degrees relative to center
             cy={center}
             r={thickness * 1.2}
             fill="#FCF6BA"
             style={{ 
                 filter: 'drop-shadow(0 0 10px white)',
                 // No extra transform needed; it rotates with the parent SVG div
             }}
           />
        )}
      </svg>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const GyroscopeV2: React.FC<Props> = ({ ringSize, thickness }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // --- ANIMATION: SPINNING (Z-Axis) ---
  const innerSpin = interpolate(frame, [0, durationInFrames], [0, 360]);
  const outerSpin = interpolate(frame, [0, durationInFrames], [360, 0]);

  // --- ANIMATION: WOBBLING (Precession) ---
  // We slowly rock the axes so it looks like a floating machine
  const wobbleSlow = Math.sin(frame * 0.02) * 15; // +/- 15 degrees tilt
  
  // Calculate radii
  const innerRadius = ringSize * 0.35;
  const outerRadius = ringSize * 0.5;

  // Dash Arrays (The key to visibility)
  // "Segment Length, Gap Length"
  // Inner: 3 segments
  const innerDash = `${innerRadius * 1.5} ${innerRadius * 0.5}`;
  // Outer: 1 long segment with a gap (C-shape)
  const outerDash = `${outerRadius * 4} ${outerRadius * 1}`;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#080808', // Premium Carbon Black
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        perspective: '1200px', // Strong 3D perspective
        overflow: 'hidden',
      }}
    >
       {/* Background Radial Gradient */}
       <AbsoluteFill style={{ 
           background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 70%)',
           zIndex: -1 
       }} />

      <div style={{ position: 'relative', width: ringSize, height: ringSize, transformStyle: 'preserve-3d' }}>
          
          {/* INNER RING: Spins Clockwise, Tilts Vertically + Wobbles */}
          <GyroRing
            radius={innerRadius}
            thickness={thickness}
            rotation={innerSpin}
            wobbleX={60 + wobbleSlow} // Base 60deg tilt + motion
            wobbleY={10 - wobbleSlow}
            dashArray={innerDash}
            hasGem={true}
          />

          {/* OUTER RING: Spins Counter-Clockwise, Tilts Horizontally + Wobbles */}
          <GyroRing
            radius={outerRadius}
            thickness={thickness}
            rotation={outerSpin}
            wobbleX={-20 - wobbleSlow}
            wobbleY={45 + wobbleSlow}
            dashArray={outerDash}
            hasGem={false}
          />

          {/* CENTRAL CORE: A floating gold sphere */}
          <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: thickness * 4,
              height: thickness * 4,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #fff, #D4AF37)',
              boxShadow: '0 0 30px #D4AF37',
              zIndex: 10
          }} />

      </div>
    </AbsoluteFill>
  );
};

export default GyroscopeV2;
