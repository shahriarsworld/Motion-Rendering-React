import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

// =============================================================================
// CONFIGURATION
// =============================================================================
export const compositionConfig = {
  id: 'NeonSaberCountdown',
  durationInSeconds: 11, // 10 down to 0
  fps: 30,
  width: 3840,
  height: 2160,
  defaultProps: {
    startNumber: 10,
    color: '#00FFFF',      // Neon Cyan
    coreColor: '#FFFFFF',  // White Core
    fontSize: 800,
  },
};

type NeonSaberCountdownProps = typeof compositionConfig.defaultProps;

// =============================================================================
// SUB-COMPONENT: SABER NUMBER
// =============================================================================
const SaberNumber: React.FC<{
  number: number;
  localFrame: number;
  config: NeonSaberCountdownProps;
  fps: number;
}> = ({ number, localFrame, config, fps }) => {

  // --- 1. ENTRY PHYSICS (The "Slam") ---
  // A spring that goes 0 -> 1 quickly but smoothly
  const entryDriver = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.6 },
    durationInFrames: 20,
  });

  // Saber Draw: Maps 0->1 to Stroke Offset
  const pathLength = 3500;
  const strokeOffset = interpolate(entryDriver, [0, 1], [pathLength, 0]);

  // Entrance Scale: Starts large (1.5) and lands at 1.0
  const entryScale = interpolate(entryDriver, [0, 1], [1.5, 1]);
  
  // Entrance Blur: Starts blurry (motion blur) and focuses to 0
  const entryBlur = interpolate(entryDriver, [0, 0.6], [20, 0], {
    extrapolateRight: 'clamp',
  });

  // --- 2. EXIT PHYSICS (The "Burn Out") ---
  // Triggered in the last 8 frames (Smoother transition window)
  const exitProgress = interpolate(localFrame, [fps - 8, fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Exit Scale: Slight pop up before vanishing
  const exitScale = interpolate(exitProgress, [0, 1], [1, 1.1]);
  
  // Exit Blur: Blurs out as it disappears (Dissolve effect)
  const exitBlur = interpolate(exitProgress, [0, 1], [0, 30]);

  // Flash: Brightness spike
  const flash = interpolate(exitProgress, [0, 0.4, 1], [1, 2.5, 0]);
  
  // Opacity: Fades out at the very end
  const exitOpacity = interpolate(exitProgress, [0.5, 1], [1, 0]);

  // --- 3. COMBINED VALUES ---
  const totalScale = entryScale * exitScale;
  const totalBlur = entryBlur + exitBlur;

  // --- STYLES ---
  const fontStyle = {
    fontFamily: '"Kanit", "Arial Black", sans-serif',
    fontWeight: 900,
    fontSize: config.fontSize,
    textAnchor: 'middle',
    dominantBaseline: 'central',
  } as const;

  // Helper to generate layered strokes
  const getStrokeProps = (col: string, w: number, baseBlur: number, opacityMultiplier: number) => ({
    fill: 'none',
    stroke: col,
    strokeWidth: w,
    strokeDasharray: pathLength,
    strokeDashoffset: strokeOffset,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { 
        // Combine base blur (for glow) with motion blur (animation)
        filter: `blur(${baseBlur + totalBlur}px)`, 
        opacity: opacityMultiplier * exitOpacity,
        willChange: 'transform, opacity, filter', // Performance hint
    },
  });

  return (
    <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        transform: `scale(${totalScale})`, // Apply the Zoom/Slam
        filter: `brightness(${flash})`,    // Apply the Flash
    }}>
      <svg width="100%" height="100%" viewBox="0 0 2000 1200" style={{ overflow: 'visible' }}>
        
        {/* Layer 1: Aura (The Atmosphere) - Heavily blurred */}
        <text 
          x="1000" y="600" 
          {...fontStyle} 
          {...getStrokeProps(config.color, 60, 40, 0.5)} 
        >
          {number}
        </text>

        {/* Layer 2: The Blade Glow (The Color) */}
        <text 
          x="1000" y="600" 
          {...fontStyle} 
          {...getStrokeProps(config.color, 25, 10, 1)} 
          // Add drop shadow for extra depth
          style={{
             ...getStrokeProps(config.color, 25, 10, 1).style,
             filter: `drop-shadow(0 0 30px ${config.color}) blur(${totalBlur}px)`
          }}
        >
          {number}
        </text>

        {/* Layer 3: The Plasma Core (The Heat) */}
        <text 
          x="1000" y="600" 
          {...fontStyle} 
          {...getStrokeProps(config.coreColor, 8, 0, 1)} 
        >
          {number}
        </text>

      </svg>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const NeonSaberCountdown: React.FC<NeonSaberCountdownProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- SEQUENCER ---
  const currentSecondIndex = Math.floor(frame / fps);
  const displayNumber = props.startNumber - currentSecondIndex;
  const localFrame = frame % fps;

  if (displayNumber < 0) return <AbsoluteFill style={{ backgroundColor: '#000000' }} />;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <SaberNumber
        key={displayNumber} 
        number={displayNumber}
        localFrame={localFrame}
        config={props}
        fps={fps}
      />
    </AbsoluteFill>
  );
};

export default NeonSaberCountdown;
