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
  id: 'CleanProgressBar',
  durationInFrames: 300, // 10 seconds * 30 fps
  fps: 30,
  width: 3840,
  height: 2160,
};

// Theme constants
const THEME = {
  backgroundColor: '#000000',
  primaryColor: '#4CAF50',
  trackColor: '#222222',
  textColor: '#FFFFFF',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

// =============================================================================
// STYLES
// =============================================================================
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: THEME.backgroundColor,
  fontFamily: THEME.fontFamily,
  color: THEME.textColor,
};

const contentWrapperStyle: React.CSSProperties = {
  width: 1600,
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
};

const labelStyle: React.CSSProperties = {
  fontSize: 48,
  fontWeight: 500,
  letterSpacing: '1px',
  opacity: 0.9,
};

const trackStyle: React.CSSProperties = {
  width: '100%',
  height: 40,
  backgroundColor: THEME.trackColor,
  borderRadius: 4,
  overflow: 'hidden',
};

const fillStyle: React.CSSProperties = {
  height: '100%',
  backgroundColor: THEME.primaryColor,
};

const percentageStyle: React.CSSProperties = {
  fontSize: 64,
  fontWeight: 700,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export const CleanProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // FIX: Subtract 1 from duration so the last frame maps to exactly 1.0
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Now frame 299 will result in progress = 1, and 1 * 100 = 100.
  const percentage = Math.floor(progress * 100);

  return (
    <AbsoluteFill style={containerStyle}>
      <div style={contentWrapperStyle}>
        
        {/* 1. Top Label */}
        <div style={labelStyle}>
          Loading...
        </div>

        {/* 2. The Progress Bar Track & Fill */}
        <div style={trackStyle}>
          <div 
            style={{
                ...fillStyle,
                width: `${progress * 100}%`
            }} 
          />
        </div>

        {/* 3. Percentage Text */}
        <div style={percentageStyle}>
          {percentage}%
        </div>

      </div>
    </AbsoluteFill>
  );
};
