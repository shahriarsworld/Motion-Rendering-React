import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';

// =============================================================================
// CONFIGURATION
// =============================================================================
export const compositionConfig = {
  id: 'ErrorCross',
  durationInFrames: 120, // 4 seconds
  fps: 30,
  width: 3840, // 4K Resolution
  height: 2160,
  defaultProps: {
    color: '#FF0000', // Bright Neon Red
    strokeWidth: 30,
    iconSize: 800, // Large size for 4K center
  },
};

type Props = typeof compositionConfig.defaultProps;

// =============================================================================
// ANIMATION PHYSICS CONFIG
// =============================================================================
const springConfig = {
  mass: 1,
  damping: 12,
  stiffness: 150,
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const ErrorCross: React.FC<Props> = ({ color, strokeWidth, iconSize }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- GEOMETRY CALCULATIONS ---
  const center = iconSize / 2;
  const radius = iconSize * 0.45;
  const circlePerimeter = 2 * Math.PI * radius;

  // Calculate X path points to fit snugly inside
  const xOffset = iconSize * 0.25;
  const xPathData = `
    M ${center - xOffset} ${center - xOffset}
    L ${center + xOffset} ${center + xOffset}
    M ${center + xOffset} ${center - xOffset}
    L ${center - xOffset} ${center + xOffset}
  `;

  // --- PHASE A: CIRCLE DRAW (Frames 0-30) ---
  const circleDrawSpring = spring({
    frame,
    fps,
    config: { ...springConfig, damping: 20 }, // Slightly smoother draw
    durationInFrames: 30,
  });
  
  const circleDashOffset = interpolate(
    circleDrawSpring,
    [0, 1],
    [circlePerimeter, 0]
  );

  // --- PHASE B: 'X' SCALE POP (Frames 20-50) ---
  const scaleStartFrame = 20;
  const xScaleSpring = spring({
    frame,
    fps,
    delay: scaleStartFrame,
    config: springConfig, // Snappy elastic pop
  });

  // --- PHASE C: THE REJECTION SHAKE (Decaying Sine Wave) ---
  // Start shaking exactly when the X starts popping in quickly
  const shakeStartFrame = scaleStartFrame + 5; 
  const shakeFrame = Math.max(0, frame - shakeStartFrame);
  
  // Physics parameters for the "locked door" feel:
  const shakeFrequency = 0.9; // High frequency = fast vibration
  const shakeAmplitude = 60;  // Max pixels to move left/right
  const shakeDecayRate = 0.18; // Higher = stops faster

  // Formula: Sine Wave * Exponential Decay
  // Math.exp(-time * rate) creates a curve that starts at 1 and tends to 0
  const decayEnvelope = Math.exp(-shakeFrame * shakeDecayRate);
  const sineWave = Math.sin(shakeFrame * shakeFrequency);
  
  // Only apply shake if we passed the start frame
  const translateX = frame > shakeStartFrame ? sineWave * shakeAmplitude * decayEnvelope : 0;

  // --- STYLES ---
  const commonPathProps = {
    fill: 'none',
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    // Intense Neon Glow Effect (Double drop-shadow for extra bloom)
    filter: `drop-shadow(0 0 30px ${color}) drop-shadow(0 0 10px ${color})`,
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000000', // Deep black background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* SVG Container - The whole container shakes horizontally */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox={`0 0 ${iconSize} ${iconSize}`}
        style={{ 
            overflow: 'visible',
            // Apply the calculated decaying sine wave to the X-axis transform
            transform: `translateX(${translateX}px)` 
        }} 
      >
        {/* THE CIRCLE OUTLINE */}
        <circle
          cx={center} cy={center} r={radius}
          {...commonPathProps}
          strokeDasharray={circlePerimeter}
          strokeDashoffset={circleDashOffset}
          transform={`rotate(-90 ${center} ${center})`}
        />

        {/* THE 'X' PATH */}
        <path
          d={xPathData}
          {...commonPathProps}
          // Scale animation from center
          transform={`scale(${xScaleSpring})`}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />
      </svg>
    </AbsoluteFill>
  );
};

export default ErrorCross;
