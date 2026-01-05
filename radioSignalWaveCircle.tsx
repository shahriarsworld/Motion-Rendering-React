import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  useVideoConfig,
} from 'remotion';

// =============================================================================
// CONFIGURATION
// =============================================================================
export const compositionConfig = {
  id: 'NeonRadioWaves',
  durationInSeconds: 10,
  fps: 30,
  width: 3840, // 4K Resolution
  height: 2160,
  defaultProps: {
    waveCount: 8,          // Number of simultaneous waves
    waveLifeTime: 120,     // How long one wave lasts (in frames) - 4 seconds
    maxRadius: 1000,       // How far they expand (pixels)
    color: '#ff1100ff',      // Neon Green
    strokeWidth: 8,        // Thickness of the line
  }
};

type WaveProps = typeof compositionConfig.defaultProps;

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export const NeonRadioWaves: React.FC<WaveProps> = ({
  waveCount,
  waveLifeTime,
  maxRadius,
  color,
  strokeWidth
}) => {
  const frame = useCurrentFrame();
  
  // Create an array of IDs to map through
  const waves = new Array(waveCount).fill(0).map((_, i) => i);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
      
      {/* Optional: Center Glow "Core" */}
      <div style={{
          position: 'absolute',
          width: 20, height: 20,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 50px 20px ${color}`,
          opacity: 0.5,
      }}/>

      {/* Render the expanding waves */}
      {waves.map((index) => {
        
        // --- LOOP LOGIC ---
        // Calculate a staggered start time for each wave
        const offset = index * (waveLifeTime / waveCount);
        
        // Progress from 0 to 1, looping repeatedly
        const progress = ((frame + offset) % waveLifeTime) / waveLifeTime;

        // --- ANIMATION VALUES ---
        
        // 1. Expansion (Linear or slightly eased out)
        const radius = interpolate(progress, [0, 1], [0, maxRadius]);
        
        // 2. Opacity (Fade in quick, fade out slow)
        const opacity = interpolate(
            progress, 
            [0, 0.1, 0.8, 1], 
            [0, 1, 1, 0] // Fade out at the very end
        );

        // 3. Stroke Thinning (Optional: makes it look like energy dissipating)
        const currentStroke = interpolate(progress, [0, 1], [strokeWidth, strokeWidth * 0.5]);

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              width: radius * 2,
              height: radius * 2,
              borderRadius: '50%',
              border: `${currentStroke}px solid ${color}`,
              opacity: opacity,
              // DOUBLE GLOW for that intense "Neon" look
              boxShadow: `
                0 0 10px ${color}, 
                inset 0 0 10px ${color},
                0 0 30px ${color}
              `,
              // Center the div perfectly
              transform: 'translate(-50%, -50%)', 
              top: '50%',
              left: '50%',
              // Optimization: Use will-change for smoother playback
              willChange: 'transform, opacity',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export default NeonRadioWaves;
