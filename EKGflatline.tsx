import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';


export const compositionConfig = {
  id: 'NeonEKG',
  durationInSeconds: 15,
  fps: 30,
  width: 3840, // 4K Resolution
  height: 2160,
  defaultProps: {
    gridSize: 100,
    lineColor: '#00FF00', // Classic EKG Green
    gridColor: '#003300', // Dark Green Grid
    beatFrequency: 30,    // Frames per beat (1 sec at 30fps)
    flatlineStart: 210,   // Frame where heart stops (7 seconds)
  },
};

type EKGProps = typeof compositionConfig.defaultProps;

const Grid: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundImage: `
          linear-gradient(${color} 2px, transparent 2px),
          linear-gradient(90deg, ${color} 2px, transparent 2px)
        `,
        backgroundSize: `${size}px ${size}px`,
        opacity: 0.5,
      }}
    />
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export const NeonEKG: React.FC<EKGProps> = ({
  gridSize,
  lineColor,
  gridColor,
  beatFrequency,
  flatlineStart,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // 1. GENERATE THE PATH DATA
  // We calculate the Y position for every X pixel up to the current frame
  const points = useMemo(() => {
    const pts = [];
    // We only draw the "tail" (last 1500px) to simulate fading
    const tailLength = 2000; 
    
    // The "Head" X position moves constantly to the right, wrapping around
    const speed = 15; // Pixels per frame
    const currentHeadX = frame * speed;
    
    // We iterate backwards from the head to draw the trail
    for (let i = 0; i < tailLength; i+=5) { // Step by 5 for performance
      const x = currentHeadX - i;
      if (x < 0) break; // Don't draw before start

      // Determine time (t) for this specific point in the past
      const tFrame = x / speed;
      
      // LOGIC: Is this point in the "Alive" phase or "Dead" phase?
      let amplitude = 0;
      
      if (tFrame < flatlineStart) {
        // ALIVE: Calculate Beat
        const beatProgress = (tFrame % beatFrequency) / beatFrequency; // 0 to 1
        
        // The "PQRST" Wave Math
        // 0.1-0.2: P Wave (Small bump)
        // 0.4-0.5: QRS Complex (Down, HUGE UP, Down)
        // 0.6-0.7: T Wave (Medium bump)
        
        if (beatProgress > 0.1 && beatProgress < 0.2) amplitude = -30 * Math.sin((beatProgress - 0.1) * Math.PI * 10);
        else if (beatProgress > 0.4 && beatProgress < 0.45) amplitude = 50; // Q dip
        else if (beatProgress >= 0.45 && beatProgress < 0.5) amplitude = -350; // R Spike (Up is negative Y)
        else if (beatProgress >= 0.5 && beatProgress < 0.55) amplitude = 80;  // S dip
        else if (beatProgress > 0.7 && beatProgress < 0.85) amplitude = -50 * Math.sin((beatProgress - 0.7) * Math.PI * 6);
      } else {
        // DEAD: Flatline
        // Add tiny random noise so it looks like a real sensor
        amplitude = (Math.random() - 0.5) * 5; 
      }

      // Wrap X to screen width (Oscilloscope effect)
      // We use modulo to make it loop across the screen
      const screenX = x % width;
      
      // If we wrapped, we need to break the line so it doesn't draw a line across the screen
      // For this simple version, we just let it scroll endlessly.
      // To keep it simple: We simulate a "Running Tape" view where X just keeps going.
      // Actually, let's do the "Scrolling View" (New data on right, pushes old left)
      
      pts.push({ x, y: amplitude });
    }
    return pts;
  }, [frame, beatFrequency, flatlineStart, width]);

  // RE-CALCULATION FOR SCROLLING VIEW
  // Instead of a moving dot, let's keep the dot fixed at X=3000 and scroll the world left.
  // This looks more like a modern monitor.
  
  const polylinePoints = useMemo(() => {
      const p = [];
      const speed = 20;
      // We calculate "What is the Y value at X?"
      // We want to fill the screen width (3840)
      for (let x = 0; x <= width; x += 10) {
          // The "Time" at this X pixel depends on current frame
          // If we want new data on the Right, Time increases with X?
          // No, Time is (Frame * Speed) - (Width - x)
          // Effectively: Right side is "Now", Left side is "Past"
          
          const timeOffset = width - x; // How far back in pixels this point is
          const visualTime = (frame * speed) - timeOffset;
          const tFrame = visualTime / speed;

          if (tFrame < 0) continue; // Don't draw negative time

          let y = 0;
           if (tFrame < flatlineStart) {
            // BEAT LOGIC
            const beatProgress = (tFrame % beatFrequency) / beatFrequency;
            if (beatProgress > 0.1 && beatProgress < 0.2) y = -30 * Math.sin((beatProgress - 0.1) * Math.PI * 10); // P
            else if (beatProgress > 0.4 && beatProgress < 0.43) y = 50; // Q
            else if (beatProgress >= 0.43 && beatProgress < 0.47) y = -400; // R (SPIKE)
            else if (beatProgress >= 0.47 && beatProgress < 0.5) y = 80;  // S
            else if (beatProgress > 0.6 && beatProgress < 0.75) y = -60 * Math.sin((beatProgress - 0.6) * Math.PI * 6); // T
           } else {
             // FLATLINE
             y = (Math.sin(tFrame) * 2); // Tiny noise
           }
           
           p.push(`${x},${(height / 2) + y}`);
      }
      return p.join(' ');
  }, [frame, width, height, beatFrequency, flatlineStart]);


  return (
    <AbsoluteFill style={{ backgroundColor: '#000500' }}> {/* Very Dark Green Black */}
      
      {/* 1. GRID BACKGROUND */}
      <Grid size={gridSize} color={gridColor} />
      
      {/* 2. THE EKG LINE */}
      <svg
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      >
        <polyline
            points={polylinePoints}
            fill="none"
            stroke={lineColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
                filter: `drop-shadow(0 0 15px ${lineColor}) drop-shadow(0 0 30px ${lineColor})`
            }}
        />
      </svg>

      {/* 3. VIGNETTE OVERLAY (Monitor Look) */}
       <AbsoluteFill
        style={{
          background: 'radial-gradient(circle, transparent 60%, black 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

export default NeonEKG;
