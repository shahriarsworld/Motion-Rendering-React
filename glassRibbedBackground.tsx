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
  id: 'ReededGlassPink',
  durationInSeconds: 10,
  fps: 30,
  width: 3840, // 4K Resolution
  height: 2160,
  defaultProps: {
    stripCount: 40,        // Number of vertical glass "reeds"
    glassBlur: 25,         // How much the glass diffuses the light
    colors: [              // The Cyberpunk/Magenta palette from the image
      '#ffcc33', // Hot Pink
      '#ffb347', // Magenta
      '#ffffff', // Deep Purple
      '#fdf5e6', // Deep Black
    ],
  },
};

type ReededGlassProps = typeof compositionConfig.defaultProps;

// =============================================================================
// SUB-COMPONENT: MOVING GRADIENT BACKGROUND
// =============================================================================
const GradientBackground: React.FC<{ colors: string[] }> = ({ colors }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // We create 3 large moving distinct blobs to simulate the light sources
  // appearing behind the glass.
  const blobs = useMemo(() => [0, 1, 2], []);

  return (
    <AbsoluteFill style={{ backgroundColor: '#050005' }}>
      {blobs.map((i) => {
        // Seamless circular motion
        const progress = frame / durationInFrames;
        const offset = i * (Math.PI * 2 / blobs.length);
        
        const x = Math.sin(progress * Math.PI * 2 + offset) * (width * 0.3) + (width / 2);
        const y = Math.cos(progress * Math.PI * 2 * 2 + offset) * (height * 0.2) + (height / 2);
        const scale = interpolate(Math.sin(progress * Math.PI * 4 + offset), [-1, 1], [1, 1.5]);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: width * 0.6,
              height: width * 0.6,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${colors[i % colors.length]} 0%, transparent 70%)`,
              opacity: 0.8,
              filter: 'blur(100px)', // High blur to blend them initially
            }}
          />
        );
      })}
      
      {/* Secondary Noise Texture to prevent banding */}
      <AbsoluteFill 
        style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
            opacity: 0.15,
            mixBlendMode: 'overlay'
        }} 
      />
    </AbsoluteFill>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const ReededGlassEffect: React.FC<ReededGlassProps> = ({
  stripCount,
  glassBlur,
  colors,
}) => {
  const { width } = useVideoConfig();
  
  // Calculate width of each glass strip
  const stripWidth = width / stripCount;

  // Generate the strips
  const strips = useMemo(() => new Array(stripCount).fill(0), [stripCount]);

  return (
    <AbsoluteFill>
      
      {/* 1. The Light Source (Behind) */}
      <GradientBackground colors={colors} />

      {/* 2. The Glass Layer (Foreground) */}
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        {strips.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '100%',
              position: 'relative',
              
              // --- THE REEDED GLASS PHYSICS ---
              // 1. Blur the background per strip to create distortion
              backdropFilter: `blur(${glassBlur}px)`,
              
              // 2. The Cylindrical Shape (Gradient Overlay)
              // This makes the flat div look like a round tube
              background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 80%, rgba(0,0,0,0.4) 100%)',
              
              // 3. Edges
              borderLeft: '1px solid rgba(255,255,255,0.15)', // Highlight edge
              borderRight: '1px solid rgba(0,0,0,0.3)',      // Shadow edge
              
              // 4. Inner refraction (Inset Shadow)
              boxShadow: 'inset 10px 0 20px rgba(255,255,255,0.05)',
              
              // 5. Contrast boost to make the colors pop through the glass
              // (Reeded glass tends to darken the image slightly where the glass is thick)
            }}
          />
        ))}
      </div>

      {/* 3. Global Vignette/Polish */}
      <AbsoluteFill
        style={{
            background: 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.6) 100%)',
            pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

export default ReededGlassEffect;
