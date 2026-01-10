import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';

const NeonRecIndicator: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // --- Configuration ---
  const TARGET_WIDTH = 1800; // Requested size
  const COLOR_RED = '#FF0000';
  const GLOW_COLOR = 'rgba(255, 0, 0, 0.8)';
  
  // --- Animation Logic ---
  // Pulse every 2 seconds (60 frames)
  const cycleDurationFrames = 60; 
  const t = (frame / cycleDurationFrames) * Math.PI * 2;
  const opacity = interpolate(Math.sin(t), [-1, 1], [0.3, 1.0]);

  // --- Styles ---

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#000000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const pillStyle: React.CSSProperties = {
    // Layout
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center content horizontally
    
    // Dimensions
    width: `${TARGET_WIDTH}px`,
    padding: '80px 0', // Vertical padding
    
    // Border & Shape
    border: `25px solid ${COLOR_RED}`, // Thicker border for large size
    borderRadius: '500px', // Large radius for pill shape
    
    // Appearance
    backgroundColor: 'transparent',
    opacity: opacity,
    
    // Intense Massive Glow
    boxShadow: `
      0 0 40px ${GLOW_COLOR}, 
      0 0 100px ${GLOW_COLOR}, 
      inset 0 0 40px ${GLOW_COLOR}
    `,
  };

  const dotStyle: React.CSSProperties = {
    width: '200px',
    height: '200px',
    backgroundColor: COLOR_RED,
    borderRadius: '50%',
    marginRight: '100px', // Spacing between dot and text
    boxShadow: `0 0 50px ${GLOW_COLOR}`,
  };

  const textStyle: React.CSSProperties = {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontWeight: 'bold',
    fontSize: '400px', // Massive font size
    color: COLOR_RED,
    letterSpacing: '20px',
    lineHeight: '0.8', // Tight line height to align better with dot
    // Text Glow
    textShadow: `
      0 0 20px ${GLOW_COLOR}, 
      0 0 80px ${GLOW_COLOR}
    `,
  };

  return (
    <AbsoluteFill style={containerStyle}>
      <div style={pillStyle}>
        {/* The Recording Dot */}
        <div style={dotStyle} />
        
        {/* The "REC" Text */}
        <span style={textStyle}>REC</span>
      </div>
    </AbsoluteFill>
  );
};

export const compositionConfig = {
  id: 'NeonRecIndicator',
  component: NeonRecIndicator,
  width: 3840,
  height: 2160,
  fps: 30,
  durationInSeconds: 10,
  defaultProps: {},
};

export default NeonRecIndicator;
