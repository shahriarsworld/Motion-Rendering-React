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
  id: 'NeonGrowth',
  durationInSeconds: 10,
  fps: 30,
  width: 3840,
  height: 2160,
  defaultProps: {
    neonColor: '#ffffffff', // Electric Green
    baseScale: 2.5,       // Size Multiplier
  }
};

type GrowthProps = typeof compositionConfig.defaultProps;

// =============================================================================
// SUB-COMPONENT: NEON BLOCK ARROW (With Optional Text)
// =============================================================================
const NeonBlockArrow = ({ 
    color, 
    scale, 
    blurIntensity, 
    text 
}: { 
    color: string, 
    scale: number, 
    blurIntensity: number, 
    text?: string 
}) => {
    
    // Custom Path: Wider shaft to fit text
    // Canvas is 100x100
    const arrowPath = "M 50 5 L 90 45 L 70 45 L 70 95 L 30 95 L 30 45 L 10 45 Z";

    return (
        <svg 
            width={200 * scale} 
            height={200 * scale} 
            viewBox="0 0 100 100" 
            style={{ overflow: 'visible' }}
        >
            {/* GLOW LAYER (Behind) */}
            <path 
                d={arrowPath} 
                fill="none" 
                stroke={color} 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ filter: `blur(${blurIntensity}px)`, opacity: 0.8 }}
            />
            
            {/* MAIN SHAPE LAYER */}
            <path 
                d={arrowPath} 
                fill="none" 
                stroke={color} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />

            {/* OPTIONAL TEXT (Dollar Sign) */}
            {text && (
                <text
                    x="50"
                    y="85" // Positioned in the bottom shaft
                    textAnchor="middle" // Horizontally Centered
                    fill={color}
                    fontSize="40"
                    fontFamily="Arial, sans-serif"
                    fontWeight="900"
                    style={{
                        filter: `drop-shadow(0 0 ${blurIntensity/2}px ${color})`
                    }}
                >
                    {text}
                </text>
            )}
        </svg>
    );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export const NeonGrowth: React.FC<GrowthProps> = ({ neonColor, baseScale }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // --- 1. FLOATING ANIMATION (Bigger & Faster) ---
  const getFloat = (offset: number) => {
      // Increased speed (PI * 4) and amplitude (40px)
      return Math.sin((frame + offset) / durationInFrames * Math.PI * 4) * 80;
  };

  const floatL = getFloat(0);
  const floatC = getFloat(20); // Center is offset
  const floatR = getFloat(40);

  // --- 2. PULSING GLOW ANIMATION ---
  // The neon glow breathes from 10px to 25px
  const glowPulse = interpolate(
      Math.sin(frame / 10), 
      [-1, 1], 
      [10, 25] 
  );

  return (
    <AbsoluteFill style={{ 
        backgroundColor: '#000000', 
        justifyContent: 'center', 
        alignItems: 'center' 
    }}>
      
      <div style={{
          display: 'flex',
          alignItems: 'flex-end', // Align bottoms
          justifyContent: 'center',
          gap: 20 * baseScale, // Adjusted gap
          marginBottom: 100
      }}>

        {/* LEFT ARROW */}
        <div style={{ transform: `translateY(${floatL}px)` }}>
            <NeonBlockArrow 
                color={neonColor} 
                scale={baseScale} 
                blurIntensity={glowPulse} 
            />
        </div>

        {/* CENTER ARROW (With Dollar) */}
        <div style={{ 
            transform: `translateY(${floatC - 80}px)`, // Lifted higher
            zIndex: 10 
        }}>
            <NeonBlockArrow 
                color={neonColor} 
                scale={baseScale * 1.2} // Center is slightly larger
                blurIntensity={glowPulse} 
                text="$" // Passed directly into SVG
            />
        </div>

        {/* RIGHT ARROW */}
        <div style={{ transform: `translateY(${floatR}px)` }}>
            <NeonBlockArrow 
                color={neonColor} 
                scale={baseScale} 
                blurIntensity={glowPulse} 
            />
        </div>

      </div>

    </AbsoluteFill>
  );
};

export default NeonGrowth;
