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
  id: 'ZenProgressBar',
  durationInSeconds: 12, // Slow, calming duration between 10-15s
  fps: 30,
  width: 3840, // 4K Canvas
  height: 2160,
  defaultProps: {
    containerWidth: 2000, // "Big size" width constraint
    barHeight: 90,        // Sleek, not too thick
    colorStart: '#89CFF0', // Soft Sky Blue
    colorEnd: '#9FE2BF',   // Seafoam Green
    text: 'Please wait...',
  },
};

type ZenProgressProps = typeof compositionConfig.defaultProps;

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const ZenProgressBar: React.FC<ZenProgressProps> = ({
  containerWidth,
  barHeight,
  colorStart,
  colorEnd,
  text,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // --- 1. PROGRESS MOTION (The Calm Fill) ---
  // We use a very gentle bezier curve for deliberate, smooth motion.
  // Starts slow, picks up gently, slows down smoothly at the end.
  const progressEase = Easing.bezier(0.25, 0.1, 0.25, 1.0);
  
  const progressPercent = interpolate(
    frame,
    [0, durationInFrames],
    [0, 100],
    {
      easing: progressEase,
      extrapolateRight: 'clamp',
    }
  );

  // --- 2. TEXT BREATHING ANIMATION ---
  // A slow sine wave oscillation.
  // Divisor 30 determines the speed of breathing (higher = slower).
  const breathWave = Math.sin(frame / 30); 
  
  // Map sine wave (-1 to 1) to opacity (0.7 to 1.0)
  const textOpacity = interpolate(breathWave, [-1, 1], [0.7, 1]);

  // --- STYLES ---

  // The shared gradient aesthetic
  const gradientStyle = `linear-gradient(90deg, ${colorStart}, ${colorEnd})`;

  const trackStyle: React.CSSProperties = {
    width: '100%',
    height: barHeight,
    backgroundColor: '#1a1a1a', // Subtle dark grey track, slightly lighter than bg
    borderRadius: 999, // perfectly rounded corners
    overflow: 'hidden', // Ensures the fill and its inner glow stay inside the track
    boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)', // subtle inner depth
    position: 'relative',
  };

  const fillStyle: React.CSSProperties = {
    height: '100%',
    width: `${progressPercent}%`, // Animated Width
    background: gradientStyle,
    borderRadius: 999,
    // The "Frosted Glow": Multi-layered soft shadows.
    // We use the start color for the glow to keep it soothing.
    boxShadow: `
      0 0 20px 5px ${colorStart}40, /* Soft, wide dispersion (low opacity) */
      0 0 10px 2px ${colorStart}60  /* Tighter, slightly brighter core */
    `,
    // Ensure smooth width transitions
    willChange: 'width',
    transition: 'width 0.1s linear', //Micro-smoothing against frame drops
  };

  const textStyle: React.CSSProperties = {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', // Clean modern sans
    color: '#ffffff',
    fontSize: 40, // Big, readable size
    fontWeight: 300, // Light weight for elegance
    letterSpacing: '1px',
    marginTop: 40, // Spacing below bar
    textAlign: 'center',
    opacity: textOpacity, // Breathing animation
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000000', // Solid Deep Black Background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Main Container limiting width to 1200px */}
      <div style={{ width: containerWidth, display: 'flex', flexDirection: 'column' }}>
        
        {/* The Progress Bar Track */}
        <div style={trackStyle}>
          {/* The Animated Fill */}
          <div style={fillStyle} />
        </div>

        {/* The Breathing Text */}
        <div style={textStyle}>
          {text}
        </div>

      </div>
    </AbsoluteFill>
  );
};

export default ZenProgressBar;
