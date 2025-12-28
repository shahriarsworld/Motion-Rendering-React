import React, { useMemo } from 'react';
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
  id: 'SegmentedCountdown',
  durationInSeconds: 30,
  fps: 30,
  width: 3840, // 4K Resolution
  height: 2160,
  defaultProps: {
    ticksCount: 100,       // Higher count for a smoother, high-end look
    radius: 450,           // Radius of the ring
    tickLength: 60,        // Length of each segment
    tickWidth: 12,         // Thickness of each segment
    activeColor: '#00F0FF', // Cyan Glow
    trackColor: '#1a1a1a04', // Dark grey background track
    fontFamily: 'Roboto, Inter, Helvetica, Arial, sans-serif',
  },
};

type CountdownProps = typeof compositionConfig.defaultProps;

// =============================================================================
// SUB-COMPONENT: TICK MARK
// =============================================================================
const Tick: React.FC<{
  angle: number;
  opacity: number;
  radius: number;
  length: number;
  width: number;
  color: string;
  glow: boolean;
}> = ({ angle, opacity, radius, length, width, color, glow }) => {
  // Trigonometry to place ticks in a circle
  // We subtract 90 degrees so 0 starts at the top (12 o'clock)
  const rad = (angle - 90) * (Math.PI / 180);
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: length,
        height: width,
        backgroundColor: color,
        borderRadius: width / 2, // Fully rounded caps
        // Center the pivot point, then rotate, then push out by radius
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle}deg)`,
        opacity: opacity,
        boxShadow: glow ? `0 0 15px ${color}` : 'none',
        // Slight transition to smooth out any frame jitter
        transition: 'opacity 0.1s linear', 
      }}
    />
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const SegmentedCountdown: React.FC<CountdownProps> = ({
  ticksCount,
  radius,
  tickLength,
  tickWidth,
  activeColor,
  trackColor,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 1. Calculate Time
  // Counts down from 30 to 0
  const remainingSeconds = Math.ceil(
    interpolate(frame, [0, durationInFrames], [30, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  // 2. Heartbeat Animation
  // Subtle pulse every second on the text
  const beat = (frame % fps) / fps;
  const textScale = interpolate(beat, [0, 0.1, 1], [1, 1.02, 1], {
    easing: Easing.out(Easing.quad),
  });

  // 3. Ring Logic
  // Calculate exactly "how many ticks" are left as a float (e.g., 45.5 ticks)
  const progress = interpolate(frame, [0, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  // The exact index of the "current" tick that is fading out
  const currentTickThreshold = progress * ticksCount;

  // Pre-calculate angles
  const ticks = useMemo(() => {
    return new Array(ticksCount).fill(0).map((_, i) => (360 / ticksCount) * i);
  }, [ticksCount]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000000',
        fontFamily: fontFamily,
        display: 'flex',            // FLEXBOX ENSURES PERFECT CENTERING
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* CONTAINER: Holds both the ring and the text.
        We use a defined size box to ensure elements are relative to each other.
      */}
      <div style={{ position: 'relative', width: radius * 2 + 200, height: radius * 2 + 200 }}>
        
        {/* LAYER 1: The Background Track (Dark Grey Ticks) */}
        {ticks.map((angle, i) => (
          <Tick
            key={`track-${i}`}
            angle={angle}
            opacity={1} 
            radius={radius}
            length={tickLength}
            width={tickWidth}
            color={trackColor}
            glow={false}
          />
        ))}

        {/* LAYER 2: The Active Countdown (Colored Ticks) */}
        {ticks.map((angle, i) => {
          // Logic for Smooth Reduction:
          // If this tick is fully "behind" the time, opacity is 1.
          // If this tick is "ahead" of time, opacity is 0.
          // If this is the "current" tick, fade it out based on decimals.
          
          let opacity = 0;
          const diff = currentTickThreshold - i;
          
          if (diff > 1) opacity = 1;      // Fully visible
          else if (diff < 0) opacity = 0; // Fully invisible
          else opacity = diff;            // Fading out (0.0 to 1.0)

          return (
            <Tick
              key={`active-${i}`}
              angle={angle}
              opacity={opacity}
              radius={radius}
              length={tickLength}
              width={tickWidth}
              color={activeColor}
              glow={true}
            />
          );
        })}

        {/* LAYER 3: The Text (Absolutely Centered) */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${textScale})`, // Perfect centering + Pulse
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 320, // Large, readable font
              fontWeight: 700,
              color: 'white',
              fontVariantNumeric: 'tabular-nums', // Prevents numbers jumping left/right
              lineHeight: 0.8, // Tighter vertical spacing
              letterSpacing: -10,
              textShadow: `0 0 40px ${activeColor}60`, // Soft text glow matching the ring
            }}
          >
            {remainingSeconds}
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 400,
              color: activeColor,
              letterSpacing: 12,
              opacity: 0.8,
              marginTop: 20, // Space between number and label
            }}
          >
            SECONDS
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default SegmentedCountdown;
