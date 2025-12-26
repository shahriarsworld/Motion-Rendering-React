import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';

export const compositionConfig = {
  id: 'ShapeShifter',
  durationInFrames: 300, // 10 Seconds (30fps)
  fps: 30,
  width: 3840, // 4K Resolution
  height: 2160,
  defaultProps: {
    color: '#ffffff', // Electric Purple
    size: 1200,       // Large size for presence
    thickness: 30,    // Thick, substantial border
  },
};

type Props = typeof compositionConfig.defaultProps;

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const ShapeShifter: React.FC<Props> = ({
  color,
  size,
  thickness,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const halfDuration = durationInFrames / 2;

  // --- 1. THE MORPHING (Breathing) ---
  // animate from Square (0% radius) to Circle (50% radius) and back to Square.
  // Easing.inOut(Easing.ease) creates the smooth, organic "breathing" feel where
  // it slows down slightly as it approaches the perfect square or circle shape.
  const borderRadius = interpolate(
    frame,
    [0, halfDuration, durationInFrames],
    [0, 50, 0], // Output percentage
    {
      easing: Easing.inOut(Easing.ease),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // --- 2. THE ROTATION (Steady) ---
  // A constant, linear spin that completes exactly one revolution per loop.
  const rotation = interpolate(
    frame,
    [0, durationInFrames],
    [0, 360]
  );

  // --- STYLES ---
  const shapeStyle: React.CSSProperties = {
    width: size,
    height: size,
    // The core shape is a thick border
    border: `${thickness}px solid ${color}`,
    // Apply the animated border radius
    borderRadius: `${borderRadius}%`,
    // Apply the steady rotation
    transform: `rotate(${rotation}deg)`,
    // The "Electric" Glow: Layered shadows for depth and intensity
    boxShadow: `
      0 0 20px ${color},      /* Inner tight glow */
      0 0 60px ${color},      /* Middle soft glow */
      0 0 150px ${color}40,   /* Outer atmospheric bloom (lower opacity) */
      inset 0 0 30px ${color} /* Inward glow for dimensionality */
    `,
    // Ensure the rotation happens around the exact center
    transformOrigin: 'center center',
    willChange: 'transform, border-radius',
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000000', // Deep black background for maximum contrast
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={shapeStyle} />
    </AbsoluteFill>
  );
};

export default ShapeShifter;
