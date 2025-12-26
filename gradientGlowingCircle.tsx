import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';

// =============================================================================
// CONFIGURATION
// =============================================================================
export const compositionConfig = {
  id: 'NeonCircleFrame',
  durationInFrames: 300, // 10 seconds (Seamless Loop)
  fps: 30,
  width: 3840, // 4K Resolution
  height: 2160,
  defaultProps: {
    cyanColor: '#00FFFF', // Electric Cyan
    pinkColor: '#FF00FF', // Hot Magenta
    iconSize: 1200, 
    strokeThickness: 40,
  },
};

type Props = typeof compositionConfig.defaultProps;

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const NeonCircleFrame: React.FC<Props> = ({
  cyanColor,
  pinkColor,
  iconSize,
  strokeThickness,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // --- ANIMATION ---
  // Constant rotation for seamless loop
  const rotation = interpolate(frame, [0, durationInFrames], [0, 360], {
    easing: Easing.linear,
  });

  // --- GRADIENT LOGIC ---
  // The 'conic-gradient' creates the colorful sweep.
  // Note: We use 'from ${rotation}deg' to rotate the colors themselves.
  const gradient = `conic-gradient(from ${rotation}deg, ${cyanColor}, ${pinkColor}, ${cyanColor})`;

  // --- STYLES ---
  
  // 1. The Base Shape (The colorful disc)
  const discStyle: React.CSSProperties = {
    position: 'absolute',
    width: iconSize,
    height: iconSize,
    borderRadius: '50%',
    background: gradient,
    // Center it
    top: 0, left: 0,
  };

  // 2. The Inner Cover (The black hole)
  // This sits on top to turn the disc into a ring
  const holeSize = iconSize - (strokeThickness * 2);
  const holeStyle: React.CSSProperties = {
    position: 'absolute',
    width: holeSize,
    height: holeSize,
    borderRadius: '50%',
    backgroundColor: '#000000', // Must match background to look transparent
    // Center it relative to the container
    top: strokeThickness,
    left: strokeThickness,
    zIndex: 10, // Ensure it sits on top
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* The Container holds everything centered */}
      <div style={{ position: 'relative', width: iconSize, height: iconSize }}>

        {/* --- LAYER 1: ATMOSPHERIC BLOOM (Deep Glow) --- */}
        {/* Very blurred, low opacity. Creates the ambiance. */}
        <div
          style={{
            ...discStyle,
            filter: 'blur(100px)',
            opacity: 0.6,
            transform: 'scale(1.1)', // Slightly larger to spread light
          }}
        />

        {/* --- LAYER 2: INTENSE GLOW (Mid Glow) --- */}
        {/* Moderately blurred. Creates the "hot" feel. */}
        <div
          style={{
            ...discStyle,
            filter: 'blur(40px)',
            opacity: 0.8,
          }}
        />

        {/* --- LAYER 3: CORE RING (Sharp) --- */}
        {/* The actual sharp neon line. */}
        <div style={discStyle} />

        {/* --- LAYER 4: THE BLACK HOLE --- */}
        {/* Covers the center to make it a ring */}
        <div style={holeStyle} />
        
      </div>
    </AbsoluteFill>
  );
};

export default NeonCircleFrame;
