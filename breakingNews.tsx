import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Oswald"; // Standard News Font
import { BiWorld } from "react-icons/bi";

// 1. Load "News" Style Font (Bold & Condensed)
const { fontFamily } = loadFont();

// =============================================================================
// CONFIGURATION
// =============================================================================
export const newsConfig = {
  id: 'BreakingNews',
  durationInSeconds: 10,
  fps: 30,
  width: 3840, // 4K
  height: 2160,
  defaultProps: {
    primaryColor: '#D00000', // Classic News Red
    secondaryColor: '#FFFFFF',
    tickerColor: '#1a1a1a', // Dark Grey/Black for ticker
    accentColor: '#FFD700', // Gold/Yellow accent
    headlineText: "MAJOR CYBER ATTACK REPORTED GLOBALLY",
    tickerText: " •  URGENT: INTERNET SERVICES DISRUPTED IN MULTIPLE REGIONS  •  EXPERTS ADVISE CAUTION  •  STAY TUNED FOR LIVE UPDATES  •  MARKETS REACT SHARPLY TO OUTAGE",
    categoryText: "BREAKING NEWS",
  }
};

// =============================================================================
// SUB-COMPONENT: ROTATING GLOBE
// =============================================================================
const RotatingGlobe = ({ color }: { color: string }) => {
    const frame = useCurrentFrame();
    // Slow rotation
    const rotation = interpolate(frame, [0, 300], [0, 360]); 
    
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `rotate(${rotation}deg)`
        }}>
            <BiWorld size={80} color={color} />
        </div>
    );
};

// =============================================================================
// SUB-COMPONENT: LIVE INDICATOR
// =============================================================================
const LiveIndicator = () => {
    const frame = useCurrentFrame();
    // Blinking effect
    const opacity = interpolate(frame % 30, [0, 15, 30], [1, 0.4, 1]);

    return (
        <div style={{
            position: 'absolute', top: -60, left: 0,
            background: 'white', color: '#D00000',
            padding: '5px 15px', fontWeight: 900, fontSize: 24,
            borderRadius: 4, letterSpacing: 2,
            opacity: opacity,
            boxShadow: '0 0 10px rgba(0,0,0,0.5)'
        }}>
            LIVE
        </div>
    );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export const BreakingNews: React.FC<typeof newsConfig.defaultProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // --- ANIMATIONS ---
  
  // 1. Main Slide In (Spring)
  const entrySpr = spring({ frame, fps, config: { damping: 14, stiffness: 80 } });
  const slideIn = interpolate(entrySpr, [0, 1], [-width, 0]); // Slide from left
  
  // 2. Ticker Scroll (Linear, Infinite loop feel)
  // Adjust speed by changing the divisor (e.g., frame * 4)
  const tickerOffset = (frame * 6) % 2000; 

  // 3. Text Reveal
  const textOpacity = interpolate(frame, [15, 25], [0, 1]);


  // --- STYLES ---

  const containerStyle: React.CSSProperties = {
      position: 'absolute',
      bottom: 150, // Distance from bottom
      left: 100, // Distance from left
      width: width - 200, // Full width minus margins
      fontFamily: fontFamily,
      transform: `translateX(${slideIn}px)`,
  };

  const mainBarStyle: React.CSSProperties = {
      display: 'flex',
      height: 220,
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  };

  const categoryBoxStyle: React.CSSProperties = {
      width: 650,
      background: `linear-gradient(90deg, ${props.primaryColor} 0%, #a00000 100%)`, // Gradient Red
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 80,
      fontWeight: 900,
      textTransform: 'uppercase',
      clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0% 100%)', // Slanted edge
      zIndex: 10,
      position: 'relative',
  };

  const headlineBoxStyle: React.CSSProperties = {
      flex: 1,
      background: 'rgba(255, 255, 255, 0.95)',
      color: 'black',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 80, // Offset for the slant
      marginLeft: -50, // Pull behind the red box
      fontSize: 70,
      fontWeight: 700,
      textTransform: 'uppercase',
      clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)', // Slanted edge right
  };

  const tickerBoxStyle: React.CSSProperties = {
      height: 80,
      width: '94%', // Slightly shorter than main bar
      background: props.tickerColor,
      marginTop: 0,
      marginLeft: 20,
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative',
      color: '#fff',
      fontSize: 35,
      fontWeight: 500,
      letterSpacing: 1.5,
      clipPath: 'polygon(0 0, 100% 0, 99% 100%, 1% 100%)', // Subtle trapizoid
  };

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      
      {/* Lower Third Container */}
      <div style={containerStyle}>
        
        {/* "LIVE" Tag */}
        <LiveIndicator />

        {/* Top Row: Category + Headline */}
        <div style={mainBarStyle}>
            
            {/* Red "BREAKING NEWS" Box */}
            <div style={categoryBoxStyle}>
                <div style={{ marginRight: 20 }}>
                    <RotatingGlobe color="rgba(255,255,255,0.4)" />
                </div>
                {props.categoryText}
                {/* Shiny gloss overlay */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '50%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)'
                }}/>
            </div>

            {/* White Headline Box */}
            <div style={headlineBoxStyle}>
                <span style={{ opacity: textOpacity }}>
                    {props.headlineText}
                </span>
            </div>
        </div>

        {/* Bottom Row: Scrolling Ticker */}
        <div style={tickerBoxStyle}>
            {/* Ticker Label */}
            <div style={{
                background: props.accentColor,
                color: 'black',
                height: '100%',
                padding: '0 20px',
                display: 'flex', alignItems: 'center',
                fontWeight: 900,
                zIndex: 5,
                boxShadow: '5px 0 15px rgba(0,0,0,0.3)'
            }}>
                UPDATE
            </div>
            
            {/* Scrolling Text Content (Duplicated for illusion of length) */}
            <div style={{ 
                whiteSpace: 'nowrap', 
                transform: `translateX(-${tickerOffset}px)`,
                paddingLeft: 20,
                display: 'flex',
                gap: 50
            }}>
                <span>{props.tickerText}</span>
                <span>{props.tickerText}</span> 
                <span>{props.tickerText}</span>
                <span>{props.tickerText}</span>
            </div>
        </div>

      </div>
    </AbsoluteFill>
  );
};
