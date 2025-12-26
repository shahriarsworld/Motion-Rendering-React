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
  id: 'SuccessCheckmark',
  durationInFrames: 150, // 5 seconds at 30fps
  fps: 30,
  width: 3840, // 4K Resolution
  height: 2160,
  defaultProps: {
    color: '#39FF14', // Bright Neon Green
    strokeWidth: 30,
    iconSize: 800, // Large size for 4K
  },
};

type Props = typeof compositionConfig.defaultProps;

// =============================================================================
// ANIMATION CONFIGURATION
// =============================================================================
const springConfig = {
  mass: 1,
  damping: 12,
  stiffness: 150,
  // A slightly higher damping for the drawing part to make it smooth but snappy
  dampingDrawing: 20,
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const SuccessCheckmark: React.FC<Props> = ({ color, strokeWidth, iconSize }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate geometry based on the desired icon size
  const center = iconSize / 2;
  const radius = iconSize * 0.45; // Circle radius
  const circlePerimeter = 2 * Math.PI * radius;

  // --- PHASE A: DRAW THE CIRCLE (Frames 0-30) ---
  // Using spring for a snappy start and finish to the drawing
  const circleDrawSpring = spring({
    frame,
    fps,
    config: { ...springConfig, damping: springConfig.dampingDrawing },
    durationInFrames: 30,
  });
  
  // Interpolate spring value (0 to 1) to dash offset (perimeter to 0)
  const circleDashOffset = interpolate(
    circleDrawSpring,
    [0, 1],
    [circlePerimeter, 0]
  );

  // --- PHASE B: SCALE UP THE CHECKMARK (Frames 20-50) ---
  // Starts slightly before circle finishes for overlap
  const checkmarkScaleSpring = spring({
    frame,
    fps,
    // Delay the start by 20 frames
    delay: 20,
    config: springConfig, // Snappy elastic pop
  });

  // --- PHASE C: GENTLE PULSE (Frames 50+) ---
  // Only start pulsing after the checkmark has landed
  const pulseStartFrame = 50;
  const pulseFrame = Math.max(0, frame - pulseStartFrame);
  // Use a sine wave for a continuous, gentle breathe effect
  const pulseSine = Math.sin((pulseFrame / fps) * Math.PI * 2); // 1 pulse per second
  // Interpolate sine (-1 to 1) to scale (1.0 to 1.05)
  const pulseScale = interpolate(pulseSine, [-1, 1], [1.0, 1.05]);

  // Combine the initial pop scale with the pulse scale.
  // Once the pop is done (spring reaches 1), the pulse takes over.
  const finalScale = checkmarkScaleSpring * (frame > pulseStartFrame ? pulseScale : 1);

  // --- COMMON STYLES ---
  const commonPathProps = {
    fill: 'none',
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    // Neon Glow Effect
    filter: `drop-shadow(0 0 20px ${color})`,
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000000', // Pure black background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* SVG Container centered on screen */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox={`0 0 ${iconSize} ${iconSize}`}
        // Allow the glow to spill outside the bounding box
        style={{ overflow: 'visible' }} 
      >
        {/* THE CIRCLE OUTLINE */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          {...commonPathProps}
          // Dash array must be >= perimeter for the drawing effect
          strokeDasharray={circlePerimeter}
          // Animate offset from full perimeter (hidden) to 0 (drawn)
          strokeDashoffset={circleDashOffset}
          // Rotate -90deg to start drawing from the top
          transform={`rotate(-90 ${center} ${center})`}
        />

        {/* THE CHECKMARK PATH */}
        {/* Define checkmark points relative to the icon size */}
        <path
          d={`M ${iconSize * 0.28} ${iconSize * 0.53} 
             L ${iconSize * 0.45} ${iconSize * 0.7} 
             L ${iconSize * 0.72} ${iconSize * 0.35}`}
          {...commonPathProps}
          // Scale animation from center
          transform={`scale(${finalScale})`}
          style={{
            // Set transform origin for scaling
            transformOrigin: `${center}px ${center}px`,
          }}
        />
      </svg>
    </AbsoluteFill>
  );
};

export default SuccessCheckmark;
