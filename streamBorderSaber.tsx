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
  id: 'DualNeonChase',
  durationInSeconds: 10,
  fps: 30,
  width: 3840, // 4K Resolution
  height: 2160,
  defaultProps: {
    color1: '#39FF14', // Electric Cyan (Left side of image)
    color2: '#39FF14', // Hot Magenta (Right side of image)
    thickness: 15,     // Thickness of the neon tube
    glowIntensity: 1,
  },
};

type Props = typeof compositionConfig.defaultProps;

// =============================================================================
// COMPONENT
// =============================================================================
const DualNeonChase: React.FC<Props> = ({
  color1,
  color2,
  thickness,
  glowIntensity,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // --- 1. GEOMETRY (Rounded Rectangle) ---
  // We define a rectangle slightly smaller than 4K to fit the glow safely
  const rectW = 3400;
  const rectH = 1900;
  const cornerRadius = 60; // Rounded corners as seen in image

  const startX = (width - rectW) / 2;
  const startY = (height - rectH) / 2;

  // Generate SVG Path for rounded rectangle
  // Move to top-left (after radius), Line to top-right, Arc, Line to bottom-right...
  const pathData = useMemo(() => {
    const l = startX;
    const t = startY;
    const r = startX + rectW;
    const b = startY + rectH;
    const rad = cornerRadius;

    return `
      M ${l + rad} ${t}
      L ${r - rad} ${t}
      A ${rad} ${rad} 0 0 1 ${r} ${t + rad}
      L ${r} ${b - rad}
      A ${rad} ${rad} 0 0 1 ${r - rad} ${b}
      L ${l + rad} ${b}
      A ${rad} ${rad} 0 0 1 ${l} ${b - rad}
      L ${l} ${t + rad}
      A ${rad} ${rad} 0 0 1 ${l + rad} ${t}
      Z
    `;
  }, [startX, startY, rectW, rectH, cornerRadius]);

  // Calculate Perimeter for Dash Math
  // (Width - 2r) * 2 + (Height - 2r) * 2 + (2 * PI * r)
  const perimeter = useMemo(() => {
    return (rectW - 2 * cornerRadius) * 2 + 
           (rectH - 2 * cornerRadius) * 2 + 
           (2 * Math.PI * cornerRadius);
  }, [rectW, rectH, cornerRadius]);

  // --- 2. ANIMATION LOGIC ---
  
  // Continuous movement 0 -> -Perimeter (Seamless Loop)
  const baseOffset = interpolate(frame, [0, durationInFrames], [0, -perimeter]);

  // We want two lines chasing each other.
  // Visual Length: Each line covers about 40% of the border, with 10% gaps.
  const beamLength = perimeter * 0.40;
  const gapLength = perimeter * 0.10; // Gap between tail of one and head of next
  
  // The DashArray creates the "Solid Line" then "Empty Space" pattern
  // Pattern: [Beam, Gap, Beam, Gap]... actually we just need [Beam, TotalPerimeter - Beam]
  // and we render the path twice with different start offsets.
  const dashArray = `${beamLength} ${perimeter - beamLength}`;

  // --- 3. HELPER: RENDER BEAM ---
  const renderBeam = (color: string, offsetModifier: number) => {
    // We calculate the specific offset for this beam color
    // We add the offsetModifier (0 for blue, perimeter/2 for pink) to place them opposite
    const currentOffset = baseOffset - offsetModifier;

    return (
      <g>
        {/* WIDE ATMOSPHERE GLOW (Soft blur) */}
        <path
          d={pathData}
          stroke={color}
          strokeWidth={thickness * 3}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={dashArray}
          strokeDashoffset={currentOffset}
          style={{ filter: 'blur(30px)', opacity: 0.6 * glowIntensity }}
        />
        
        {/* TIGHT GLOW (Bright) */}
        <path
          d={pathData}
          stroke={color}
          strokeWidth={thickness * 1.5}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={dashArray}
          strokeDashoffset={currentOffset}
          style={{ filter: 'blur(10px)', opacity: 0.8 * glowIntensity }}
        />

        {/* CORE TUBE (Solid Color) */}
        <path
          d={pathData}
          stroke={color}
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={dashArray}
          strokeDashoffset={currentOffset}
          style={{ opacity: 1 }}
        />

        {/* WHITE HOT CENTER (The Bulb effect) */}
        <path
          d={pathData}
          stroke="#ffffff"
          strokeWidth={thickness * 0.3}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={dashArray}
          strokeDashoffset={currentOffset}
          style={{ opacity: 0.9 }}
        />
      </g>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Beam 1: Cyan (Starts at 0) */}
        {renderBeam(color1, 0)}

        {/* Beam 2: Pink (Starts halfway around the perimeter) */}
        {renderBeam(color2, perimeter / 2)}
      </svg>
      
      {/* Optional: Vignette to darken corners like the reference photo */}
      <AbsoluteFill style={{
          background: 'radial-gradient(circle, transparent 60%, black 100%)',
          pointerEvents: 'none'
      }} />
    </AbsoluteFill>
  );
};

export default DualNeonChase;
