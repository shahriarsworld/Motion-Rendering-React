import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  random,
} from 'remotion';

// =============================================================================
// CONFIGURATION
// =============================================================================
export const compositionConfig = {
  id: 'NeonYearLoad',
  durationInSeconds: 5, // FIXED: Now uses Seconds
  fps: 30,
  width: 3840, // 4K Resolution
  height: 2160,
  defaultProps: {
    yearStart: 'DECEMBER',
    yearEnd: 'JANUARY',
    primaryColor: '#c123ffff', // colour
    secondaryColor: '#f9daffff', // White
    glowIntensity: 20,
    gameFont: '"Press Start 2P", "Courier New", monospace', // FIXED: Game Font Stack
  },
};

type NeonProps = typeof compositionConfig.defaultProps;

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export const NeonYearLoad: React.FC<NeonProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig(); // durationInFrames is auto-calculated by Remotion based on Config

  // 1. TIMING & PROGRESS
  // We want the bar to fill up to 100% by the end of the video
  // We subtract 20 frames at the end to let the "100%" sit for a moment
  const progress = interpolate(frame, [0, durationInFrames - 20], [0, 100], {
    extrapolateRight: 'clamp',
  });
  
  // Percentage display (integer)
  const percentDisplay = Math.floor(progress);

  // 2. ANIMATIONS
  // "TO" Pulsing Opacity
  const pulseOpacity = interpolate(Math.sin(frame / 10), [-1, 1], [0.5, 1]);

  // Bar Fill Width
  const fillWidth = `${progress}%`;

  // Neon Flicker (Random subtle changes in glow intensity)
  const flicker = random(frame) * 0.2 + 0.9; // 0.9 to 1.1 multiplier

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* BACKGROUND GLOW SPOT (Ambiance) */}
      <div 
        style={{
            position: 'absolute',
            width: '60%',
            height: '20%',
            background: props.primaryColor,
            filter: 'blur(300px)',
            opacity: 0.15,
            zIndex: 0,
        }} 
      />

      {/* MAIN CONTAINER (Centered) */}
      <div style={{ position: 'relative', width: 2000, zIndex: 10 }}>

        {/* TOP LABELS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'flex-end' }}>
            {/* "LOADING" - Game Font */}
            <h2 style={{
                margin: 0,
                color: props.secondaryColor,
                fontFamily: props.gameFont,
                fontSize: 40, // Slightly smaller for pixel fonts
                letterSpacing: 4,
                textShadow: `0 0 10px ${props.primaryColor}`,
            }}>
                LOADING
            </h2>

            {/* PERCENTAGE */}
            <h2 style={{
                margin: 0,
                color: props.secondaryColor,
                fontFamily: props.gameFont,
                fontSize: 50,
                fontWeight: 'bold',
                textShadow: `0 0 20px ${props.primaryColor}`,
            }}>
                {percentDisplay}%
            </h2>
        </div>

        {/* PROGRESS BAR TRACK */}
        <div style={{
            position: 'relative',
            width: '100%',
            height: 100,
            border: `6px solid ${props.primaryColor}`,
            borderRadius: 10, // Sharper corners for Game UI look
            boxShadow: `0 0 ${props.glowIntensity * flicker}px ${props.primaryColor}, inset 0 0 ${10 * flicker}px ${props.primaryColor}`,
            padding: 8, // Gap between border and fill
            display: 'flex',
            alignItems: 'center',
        }}>
            {/* PROGRESS FILL */}
            <div style={{
                height: '100%',
                width: fillWidth,
                backgroundColor: props.secondaryColor,
                borderRadius: 4, // Sharp corners
                boxShadow: `0 0 40px ${props.secondaryColor}, 0 0 80px ${props.primaryColor}`, // Bright white core, cyan glow
                transition: 'width 0.1s linear', // Smoothen frame jumps slightly
            }} />
        </div>

        {/* BOTTOM LABELS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30, alignItems: 'center' }}>
            {/* 2025 */}
            <h1 style={{
                margin: 0,
                color: props.secondaryColor,
                fontFamily: props.gameFont,
                fontSize: 60,
                fontWeight: 300,
                textShadow: `0 0 15px ${props.primaryColor}`,
            }}>
                {props.yearStart}
            </h1>

            {/* TO */}
            <h3 style={{
                margin: 0,
                color: props.primaryColor, // Make "TO" Cyan for contrast
                fontFamily: props.gameFont,
                fontSize: 30,
                opacity: pulseOpacity,
                letterSpacing: 2,
                textShadow: `0 0 10px ${props.primaryColor}`,
            }}>
                &gt;&gt;
            </h3>

            {/* 2026 */}
            <h1 style={{
                margin: 0,
                color: props.secondaryColor,
                fontFamily: props.gameFont,
                fontSize: 70, // Slightly bigger
                fontWeight: 700, 
                textShadow: `0 0 30px ${props.primaryColor}, 0 0 60px ${props.primaryColor}`,
            }}>
                {props.yearEnd}
            </h1>
        </div>

      </div>

      {/* SCANLINE OVERLAY */}
      <AbsoluteFill 
        style={{
            backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
            backgroundSize: '100% 4px, 6px 100%',
            pointerEvents: 'none',
            zIndex: 99,
            mixBlendMode: 'overlay',
        }} 
      />

    </AbsoluteFill>
  );
};

export default NeonYearLoad;
