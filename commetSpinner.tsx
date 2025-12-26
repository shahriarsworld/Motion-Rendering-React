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
  id: 'SpeedDemonSpinner',
  durationInFrames: 300, // 10 seconds for a long, seamless loop
  fps: 30,
  width: 3840, // 4K
  height: 2160,
  defaultProps: {
    cyanColor: '#00FFFF', // Bright Cyan Head
    iconSize: 1200,
    strokeThickness: 40, // Beefy, powerful stroke
  },
};

type Props = typeof compositionConfig.defaultProps;

// =============================================================================
// ANIMATION PHYSICS (The Speed Ramping)
// =============================================================================
// We want a "Heavy Rush -> Slow Down -> Heavy Rush" pattern.
// A standard ease-in-out is slow->fast->slow. We need the opposite.
// We use a custom bezier curve that is steep at the start/end and flat in the middle.
// Handles: (X1, Y1, X2, Y2). Steep start (high Y1, low X1), Steep end (low Y2, high X2).
const heavyRushEasing = Easing.bezier(0.8, 0.0, 0.2, 1.0);

// =============================================================================
// HELPER: COMET SEGMENT COMPONENT
// =============================================================================
// To create a smooth, high-performance fading tail without complex SVG masks,
// we render multiple overlapping stroke segments with decreasing opacity and offset.
interface CometSegmentProps {
  center: number;
  radius: number;
  thickness: number;
  color: string;
  rotation: number;
  opacity: number;
  blur: number;
  perimeter: number;
  tailLengthRatio: number; // 0 to 1, how much of the circle the tail covers
}

const CometSegment: React.FC<CometSegmentProps> = ({
  center, radius, thickness, color, rotation, opacity, blur, perimeter, tailLengthRatio
}) => {
    // Calculate dash array: [visible length, gap length]
    // The visible length depends on the tail ratio.
    const visibleLength = perimeter * tailLengthRatio;
    // We want the "head" of the dash to be at the front of rotation.
    // A standard dasharray starts drawing from 3 o'clock. We offset it negative visibleLength.
    const dashOffset = -visibleLength;
    const dashArray = `${visibleLength} ${perimeter}`;

    return (
        <circle
            cx={center} cy={center} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round" // Rounded head for modern look
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            style={{
                opacity,
                filter: `blur(${blur}px)`,
                transformOrigin: `${center}px ${center}px`,
                // Crucial: Rotate the entire segment based on animation
                transform: `rotate(${rotation}deg)` 
            }}
        />
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const SpeedDemonSpinner: React.FC<Props> = ({ cyanColor, iconSize, strokeThickness }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // --- GEOMETRY ---
  const center = iconSize / 2;
  const radius = (iconSize / 2) - strokeThickness;
  const perimeter = 2 * Math.PI * radius;

  // --- MOTION CALCULATION (The Speed Ramp) ---
  // We want 2 complete cycles of "Rush -> Slow -> Rush" over 10 seconds for a dynamic feel.
  const cycles = 2;
  const framesPerCycle = durationInFrames / cycles;
  const currentCycleIndex = Math.floor(frame / framesPerCycle);
  const frameInCycle = frame % framesPerCycle;

  // Calculate rotation for one cycle (0 to 360) using the heavy easing curve.
  const cycleRotation = interpolate(
      frameInCycle,
      [0, framesPerCycle],
      [0, 360],
      { easing: heavyRushEasing }
  );

  // Combine cycle index and cycle rotation for total continuous rotation
  const totalRotation = (currentCycleIndex * 360) + cycleRotation;


  // --- TAIL GENERATION (The Comet Effect) ---
  // We stack multiple segments.
  // Layer 0: The bright head (sharp, opaque, leading).
  // Layers 1-N: The tail (blurrier, more transparent, lagging behind).
  const numTailSegments = 20; // More segments = smoother tail gradient
  const tailStack = useMemo(() => {
      return Array.from({ length: numTailSegments }).map((_, i) => {
          const isHead = i === 0;
          // Head is opacity 1, tail fades to 0
          const opacity = interpolate(i, [0, numTailSegments - 1], [1, 0]);
          // Head is sharp, tail gets blurrier
          const blur = interpolate(i, [0, numTailSegments - 1], [0, 20]);
          // Each segment lags slightly behind the previous one
          const rotationLag = i * 2.5; // degrees of lag per segment
          // Tail segments are slightly longer to fill gaps, head is shortest/brightest
          const tailLengthRatio = interpolate(i, [0, numTailSegments-1], [0.1, 0.35]);

          return (
              <CometSegment 
                  key={i}
                  center={center} radius={radius} thickness={strokeThickness} color={cyanColor} perimeter={perimeter}
                  // Dynamic props based on stack position
                  opacity={opacity}
                  blur={blur}
                  rotation={totalRotation - rotationLag}
                  tailLengthRatio={tailLengthRatio}
              />
          );
      });
       // Reverse so the head (index 0) is rendered last (on top)
  }, [center, radius, strokeThickness, cyanColor, perimeter, totalRotation]).reverse();


  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000000', // Deep black background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Container for the spinner */}
      <div style={{ width: iconSize, height: iconSize, position: 'relative' }}>
        
        {/* Optional subtle background track for high-end tech feel */}
        <svg width={iconSize} height={iconSize} style={{ position: 'absolute', opacity: 0.1 }}>
            <circle cx={center} cy={center} r={radius} fill="none" stroke={cyanColor} strokeWidth={strokeThickness/2} />
        </svg>

        {/* The Comet Tail Stack */}
        <svg width={iconSize} height={iconSize} style={{ position: 'absolute', overflow: 'visible' }}>
            {/* Add a global bloom filter for that extra "powerful light" feel */}
            <defs>
                <filter id="powerful-bloom">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                    <feColorMatrix in="blur" type="matrix" values="
                        1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        0 0 0 1 -0.2" result="contrastBlur" />
                    <feMerge>
                        <feMergeNode in="contrastBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            
            <g filter="url(#powerful-bloom)">
                 {tailStack}
            </g>
        </svg>
        
      </div>
    </AbsoluteFill>
  );
};

export default SpeedDemonSpinner;
