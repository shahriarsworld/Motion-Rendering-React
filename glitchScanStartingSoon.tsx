import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  random,
  interpolate,
  Easing,
} from 'remotion';

// =============================================================================
// CONFIGURATION
// =============================================================================
export const compositionConfig = {
  id: 'StreamGlitch',
  durationInSeconds: 9,     // 9 seconds = exactly 3 cycles of the 3s scan
  fps: 30,
  width: 3840, // 4K Resolution
  height: 2160,
  defaultProps: {
    primaryText: 'STARTING SOON',
    secondaryText: '',
    accentColor: '#00FFFF', // Cyan
    baseColor: '#FFFFFF',   // White
    scanDuration: 90,       // 90 Frames = 3 seconds per sweep
  },
};

type GlitchProps = typeof compositionConfig.defaultProps;

// =============================================================================
// SUB-COMPONENT: SCANLINES (Texture)
// =============================================================================
const Scanlines: React.FC<{ scanDuration: number }> = ({ scanDuration }) => {
  const frame = useCurrentFrame();
  
  // SEAMLESS SCROLL LOGIC:
  // The background pattern is 8px high.
  // We want to scroll exactly 16px (2 full pattern repeats) every scan cycle.
  // This ensures that at frame 90, the position visually matches frame 0.
  const cycleFrame = frame % scanDuration;
  const scrollOffset = (cycleFrame / scanDuration) * 16; 

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 50%)',
        backgroundSize: '100% 8px',
        opacity: 0.3,
        mixBlendMode: 'overlay',
        transform: `translateY(${scrollOffset}px)`, 
        pointerEvents: 'none',
      }}
    />
  );
};

// =============================================================================
// SUB-COMPONENT: GLITCH CHARACTER
// =============================================================================
const GlitchChar: React.FC<{
  char: string;
  index: number;
  beamProgress: number; // 0 to 1
  totalChars: number;
  config: GlitchProps;
}> = ({ char, index, beamProgress, totalChars, config }) => {
  const frame = useCurrentFrame();
  
  // Calculate relative position of this character (0.0 to 1.0)
  const charPos = index / totalChars;
  
  // Determine distance from the beam
  const dist = Math.abs(beamProgress - charPos);
  
  // "HIT" Logic: If beam is close, trigger intense glitch
  const isHit = dist < 0.15;

  // SEAMLESS NOISE GENERATION:
  // We wrap the frame seed by the scanDuration. 
  // This ensures the random jitter pattern repeats perfectly every cycle, 
  // preventing a jump cut when the video loops.
  const loopFrame = frame % config.scanDuration;
  const seed = index * 123 + loopFrame;
  
  const jitterX = (random(seed) - 0.5) * (isHit ? 60 : 4); 
  const jitterY = (random(seed + 1) - 0.5) * (isHit ? 10 : 2);
  
  // Color Logic
  const isFlicker = random(seed + 2) > 0.95;
  const color = isHit || isFlicker ? config.accentColor : config.baseColor;
  const opacity = isHit ? random(seed + 3) * 0.5 + 0.5 : 1;

  // RGB Split Logic
  const split = isHit ? 20 : 0; 

  const commonStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    fontWeight: 900,
    transform: `translate(${jitterX}px, ${jitterY}px)`,
    opacity,
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: 'auto' }}>
      {/* Ghost Spacer */}
      <span style={{ opacity: 0 }}>{char === ' ' ? '\u00A0' : char}</span>

      {/* LAYER 1: RED */}
      <span
        style={{
          ...commonStyle,
          color: isHit ? '#FF0000' : color, 
          transform: `translate(${jitterX - split}px, ${jitterY}px)`,
          mixBlendMode: 'screen',
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>

      {/* LAYER 2: BLUE */}
      <span
        style={{
          ...commonStyle,
          color: isHit ? '#0000FF' : color,
          transform: `translate(${jitterX + split}px, ${jitterY}px)`,
          mixBlendMode: 'screen',
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>

      {/* LAYER 3: MAIN */}
      <span style={{ ...commonStyle, color }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
      
      {/* LAYER 4: BLOCK DISPLACEMENT */}
      {isHit && random(seed + 4) > 0.7 && (
        <div 
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '50%', 
                backgroundColor: 'black',
                transform: `translate(${random(seed+5)*20}px, 0)`,
            }}
        />
      )}
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const StreamGlitch: React.FC<GlitchProps> = (props) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // 1. SEAMLESS BEAM LOGIC
  // The beam sweeps every 'scanDuration' frames.
  const beamCycle = frame % props.scanDuration;
  const beamProgress = interpolate(beamCycle, [0, props.scanDuration], [-0.2, 1.2]); 

  const chars = props.primaryText.split('');

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', overflow: 'hidden' }}>
      
      {/* 1. TOP TEXT */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          width: '100%',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: 40,
          letterSpacing: 800,
          color: props.baseColor,
          opacity: 0.8,
        }}
      >
        {props.secondaryText}
      </div>

      {/* 2. MAIN TEXT CONTAINER */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          fontSize: 350,
          whiteSpace: 'nowrap',
        }}
      >
        {chars.map((char, i) => (
          <GlitchChar
            key={i}
            index={i}
            char={char}
            beamProgress={beamProgress}
            totalChars={chars.length}
            config={props}
          />
        ))}
      </div>

      {/* 3. THE SCANNER BEAM LIGHT */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            rgba(0, 255, 255, 0) 40%, 
            rgba(0, 255, 255, 0.1) 48%, 
            rgba(0, 255, 255, 0.4) 50%, 
            rgba(0, 255, 255, 0.1) 52%, 
            rgba(0, 255, 255, 0) 60%, 
            transparent 100%
          )`,
          left: `${(beamProgress * 100) - 50}%`, 
          width: '100%',
          mixBlendMode: 'screen', 
        }}
      />
      
      {/* 4. SEAMLESS SCANLINES */}
      <Scanlines scanDuration={props.scanDuration} />
      
      {/* 5. VIGNETTE */}
      <AbsoluteFill
         style={{
            background: 'radial-gradient(circle, transparent 40%, black 100%)',
         }}
      />
    </AbsoluteFill>
  );
};

export default StreamGlitch;
