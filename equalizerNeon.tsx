import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  interpolateColors,
} from 'remotion';

const NeonEqualizer: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // --- Configuration ---
  const BAR_COUNT = 30;
  const SEGMENT_COUNT = 15;
  const BAR_WIDTH = 60;
  const BAR_GAP = 30;
  const SEGMENT_HEIGHT = 40;
  const SEGMENT_GAP = 10;
  
  // Colors
  const COLOR_START = '#00FFFF'; // Cyan
  const COLOR_END = '#AA00FF';   // Purple

  // Layout calculations
  const totalBarWidth = BAR_WIDTH + BAR_GAP;
  const totalWidth = BAR_COUNT * totalBarWidth - BAR_GAP;
  const startX = (width - totalWidth) / 2;
  const centerY = height / 2;
  const maxBarHeight = SEGMENT_COUNT * (SEGMENT_HEIGHT + SEGMENT_GAP);

  // --- Helper: Generate Noise/Beat ---
  const getBarHeight = (index: number) => {
    // We use a normalized time t (0 to 2PI) for perfect looping over duration
    const t = (frame / durationInFrames) * Math.PI * 2;
    
    // Create organic movement using sum of sines with integer frequencies
    // Frequency multipliers must be integers to ensure t=0 matches t=2PI
    const offset = index * 0.5;
    
    // Wave 1: Slow swell
    const w1 = Math.sin(t * 2 + offset); 
    // Wave 2: Faster beat
    const w2 = Math.sin(t * 4 + offset * 1.5);
    // Wave 3: High freq jitter
    const w3 = Math.cos(t * 6 + index);

    // Combine and normalize to 0..1 range approximately
    const raw = (w1 + w2 * 0.5 + w3 * 0.3);
    
    // Map to 0.1 to 1.0 range (keep minimum height)
    // Using interpolate to clamp logic neatly
    return interpolate(raw, [-2, 2], [0.1, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  };

  // --- Render Single Bar ---
  const renderBar = (index: number, opacityMultiplier: number = 1) => {
    const intensity = getBarHeight(index);
    const activeSegments = Math.ceil(intensity * SEGMENT_COUNT);
    
    // Calculate color for this specific bar based on horizontal position
    const barColor = interpolateColors(
      index,
      [0, BAR_COUNT - 1],
      [COLOR_START, COLOR_END]
    );

    const segments = [];
    for (let i = 0; i < SEGMENT_COUNT; i++) {
      // Determine if this segment is "on"
      const isOn = i < activeSegments;
      
      // Opacity: Lit segments get full opacity, unlit get very dim
      const segmentOpacity = isOn ? 1 : 0.1;
      
      // Calculate Y position (stacking from bottom up)
      // For the main equalizer, y=0 is the bottom baseline, so we subtract height
      const yPos = -(i * (SEGMENT_HEIGHT + SEGMENT_GAP)) - SEGMENT_HEIGHT;

      segments.push(
        <rect
          key={`seg-${index}-${i}`}
          x={0}
          y={yPos}
          width={BAR_WIDTH}
          height={SEGMENT_HEIGHT}
          fill={barColor}
          rx={4}
          ry={4}
          style={{ opacity: segmentOpacity * opacityMultiplier }}
        />
      );
    }

    return (
      <g 
        key={`bar-${index}`} 
        transform={`translate(${startX + index * totalBarWidth}, ${centerY})`}
      >
        {segments}
      </g>
    );
  };

  // Generate arrays
  const bars = useMemo(() => {
    return new Array(BAR_COUNT).fill(0).map((_, i) => renderBar(i));
  }, [frame]); // Re-calculate every frame for animation

  const reflectionBars = useMemo(() => {
    return new Array(BAR_COUNT).fill(0).map((_, i) => renderBar(i, 0.3));
  }, [frame]);

  // --- CSS Styles ---
  const containerStyle: React.CSSProperties = {
    backgroundColor: '#000000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  // Strong neon glow using SVG filter or CSS box-shadow simulation
  // SVG filters perform better for complex groups
  const filterId = "neon-glow";

  return (
    <AbsoluteFill style={containerStyle}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: 'absolute' }}
      >
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            {/* Blur for the glow */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            {/* Combine blur and original */}
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main Group with Glow */}
        <g style={{ filter: `url(#${filterId})` }}>
          {/* 1. Main Bars */}
          {bars}

          {/* 2. Reflection (Flipped Vertically) */}
          <g transform={`translate(0, ${centerY * 2}) scale(1, -1) translate(0, -${centerY * 2})`}>
             {/* Offset Y slightly to create gap between floor and object */}
            <g transform={`translate(0, 20)`}>
              {reflectionBars}
            </g>
          </g>
        </g>
        
        {/* Floor Line for visual grounding */}
        <line 
          x1={startX} 
          y1={centerY + 10} 
          x2={startX + totalWidth} 
          y2={centerY + 10} 
          stroke="rgba(255,255,255,0.2)" 
          strokeWidth="2"
        />

      </svg>
    </AbsoluteFill>
  );
};

export const compositionConfig = {
  id: 'NeonEqualizer',
  component: NeonEqualizer,
  width: 3840,
  height: 2160,
  fps: 30,
  durationInSeconds: 10,
  defaultProps: {},
};

export default NeonEqualizer;
