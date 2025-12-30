import React from 'react';
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
  id: 'FloatingSlider',
  durationInSeconds: 10,
  fps: 30,
  width: 3840, // 4K Resolution
  height: 2160,
  defaultProps: {
    barWidth: 2400,
    barHeight: 80,
    knobSize: 130, // Big "Dot"
    primaryColor: '#ff0000', // Indigo/Purple
    secondaryColor: '#ff4d4d', // Blue
    trackColor: 'rgba(255, 255, 255, 0.15)', // Glassy background
    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
  },
};

type SliderProps = typeof compositionConfig.defaultProps;

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export const FloatingSlider: React.FC<SliderProps> = ({
  barWidth,
  barHeight,
  knobSize,
  primaryColor,
  secondaryColor,
  trackColor,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 1. PROGRESS LOGIC
  // Smooth ease-in-out movement from 0 to 100
  const progress = interpolate(frame, [0, durationInFrames - 30], [0, 100], {
    easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smooth ease
    extrapolateRight: 'clamp',
  });

  const percentDisplay = Math.floor(progress);

  // 2. POSITIONING MATH
  // We calculate the X position in pixels based on the percentage
  // 0% = Left Edge, 100% = Right Edge
  const currentX = (progress / 100) * barWidth;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* CONTAINER: Holds the entire slider mechanism */}
      <div
        style={{
          position: 'relative',
          width: barWidth,
          height: knobSize * 2, // Height enough to hold the floating text
          display: 'flex',
          alignItems: 'center', // Vertically center the bar
        }}
      >
        
        {/* =========================================
            LAYER 1: THE TRACK (Background)
           ========================================= */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            height: barHeight,
            backgroundColor: trackColor,
            borderRadius: barHeight / 2,
            backdropFilter: 'blur(10px)', // Glass effect
            border: '2px solid rgba(255,255,255,0.1)',
          }}
        />

        {/* =========================================
            LAYER 2: THE FILL (Colored Gradient)
           ========================================= */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: currentX, // Expands based on progress
            height: barHeight,
            background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
            borderRadius: barHeight / 2,
            boxShadow: `0 0 40px ${primaryColor}60`, // Glow behind the fill
            // Prevent fill from overflowing the rounded corners at the start
            overflow: 'hidden', 
          }}
        />

        {/* =========================================
            LAYER 3: THE MOVING GROUP (Knob + Text)
            This div moves horizontally.
           ========================================= */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '50%', // Center vertically relative to the bar
            transform: `translate(${currentX}px, -50%)`, // Move X, Center Y
            // We set width to 0 so the elements inside are centered on the exact X point
            width: 0, 
            height: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            willChange: 'transform',
          }}
        >
          
          {/* A. FLOATING TEXT (Above the knob) */}
          <div
            style={{
              position: 'absolute',
              bottom: knobSize / 2 + 30, // Push it above the knob
              fontFamily: fontFamily,
              fontSize: 90,
              fontWeight: 900,
              color: 'white',
              whiteSpace: 'nowrap',
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              // Center the text horizontally on the point
              transform: 'translateX(-50%)', 
            }}
          >
            {percentDisplay}%
          </div>

          {/* B. THE KNOB (The Dot) */}
          <div
            style={{
              width: knobSize,
              height: knobSize,
              backgroundColor: '#FFFFFF',
              borderRadius: '50%',
              // Center the knob exactly on the point
              transform: 'translate(-50%, 0)', 
              boxShadow: `
                0 0 0 8px rgba(255,255,255,0.2), 
                0 10px 40px rgba(0,0,0,0.6)
              `,
              zIndex: 10,
            }}
          >
             {/* Small inner dot for detail */}
             <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '20%',
                height: '20%',
                backgroundColor: secondaryColor,
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.8
             }}/>
          </div>

        </div>

      </div>
    </AbsoluteFill>
  );
};

export default FloatingSlider;
