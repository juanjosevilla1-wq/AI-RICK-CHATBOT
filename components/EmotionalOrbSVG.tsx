



import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { EmotionalState } from '../types';

type BehaviorState = 'idle' | 'thinking' | 'speaking';

interface EmotionalOrbSVGProps {
  behaviorState: BehaviorState;
  emotionalState: EmotionalState;
  clientMousePosition: { x: number, y: number } | null;
  avatarRef: React.RefObject<HTMLDivElement>;
}

const EmotionalOrbSVG: React.FC<EmotionalOrbSVGProps> = ({ behaviorState, emotionalState, clientMousePosition, avatarRef }) => {
  const [mouthVariant, setMouthVariant] = useState(0); // 0: closed, 1: slightly open, 2: wide open
  const [thinkingPupilOffset, setThinkingPupilOffset] = useState({ x: 0, y: 0 }); // for dynamic thinking state
  const [eyeBlink, setEyeBlink] = useState(false); // for subtle idle blinking

  // --- Mouth Animation (Speaking) ---
  useEffect(() => {
    if (behaviorState === 'speaking') {
      const interval = setInterval(() => {
        setMouthVariant(prev => (prev + 1) % 3);
      }, 150);
      return () => clearInterval(interval);
    } else {
      setMouthVariant(0); // Reset mouth to closed when not speaking
    }
  }, [behaviorState]);

  // --- Eye Tracking (Idle and Speaking) ---
  const calculatePupilOffset = useCallback(() => {
    if (!clientMousePosition || !avatarRef.current) return { x: 0, y: 0 };

    const avatarRect = avatarRef.current.getBoundingClientRect();
    const avatarCenterX = avatarRect.left + avatarRect.width / 2;
    const avatarCenterY = avatarRect.top + avatarRect.height / 2;

    const mouseXRelativeToAvatar = clientMousePosition.x - avatarCenterX;
    const mouseYRelativeToAvatar = clientMousePosition.y - avatarCenterY;

    // Normalize and scale movement for subtlety, clamped to a max offset
    const maxOffset = 3; // Max pupil movement in pixels
    const sensitivity = 30; // Divisor controls how much mouse movement translates to pupil movement
    const offsetX = Math.max(-maxOffset, Math.min(maxOffset, mouseXRelativeToAvatar / sensitivity));
    const offsetY = Math.max(-maxOffset, Math.min(maxOffset, mouseYRelativeToAvatar / sensitivity));

    return { x: offsetX, y: offsetY };
  }, [clientMousePosition, avatarRef]);

  const mousePupilOffset = useMemo(() => calculatePupilOffset(), [calculatePupilOffset]);

  // --- Thinking Animation ---
  useEffect(() => {
    if (behaviorState === 'thinking') {
      const interval = setInterval(() => {
        // Random small movements for pupils
        setThinkingPupilOffset({
          x: Math.random() * 4 - 2, // -2 to 2
          y: Math.random() * 4 - 2, // -2 to 2
        });
      }, 250); // Change position every 250ms
      return () => clearInterval(interval);
    } else {
      setThinkingPupilOffset({ x: 0, y: 0 }); // Reset thinking pupil position
    }
  }, [behaviorState]);
  
  // --- Subtle Blinking (Idle) ---
  useEffect(() => {
    if (behaviorState === 'idle') {
      const blinkInterval = setInterval(() => {
        setEyeBlink(true);
        setTimeout(() => setEyeBlink(false), 100); // Blink duration
      }, Math.random() * 3000 + 2000); // Random blink every 2-5 seconds
      return () => clearInterval(blinkInterval);
    } else {
      setEyeBlink(false);
    }
  }, [behaviorState]);

  const mouthPaths: { [key in EmotionalState]: string[] } = {
    [EmotionalState.IDLE]: [
      "M 47 68 Q 50 69 53 68", // Closed (slight smile)
      "M 47 69 Q 50 72 53 69", // Slightly open
      "M 47 68 C 48 74, 52 74, 53 68", // Wide open
    ],
    [EmotionalState.HAPPY]: [
      "M 45 68 Q 50 75 55 68", // Wide happy smile
      "M 45 69 Q 50 78 55 69", // Even wider
      "M 45 68 C 46 79, 54 79, 55 68", // Heart-like smile
    ],
    [EmotionalState.SAD]: [
      "M 47 72 Q 50 69 53 72", // Frown
      "M 47 73 Q 50 68 53 73", // Deeper frown
      "M 47 72 C 48 67, 52 67, 53 72", // Sad curve
    ],
    [EmotionalState.ANGRY]: [
      "M 46 70 L 50 66 L 54 70", // Sharp V-mouth
      "M 46 71 L 50 65 L 54 71", // Sharper V-mouth
      "M 46 70 C 47 64, 53 64, 54 70", // Angry grimace
    ],
    [EmotionalState.CONFUSED]: [
      "M 48 70 Q 50 70 52 70", // Small 'o'
      "M 48 71 Q 50 71 52 71", // Slightly open 'o'
      "M 48 70 C 49 72, 51 72, 52 70", // Wider 'o'
    ],
    [EmotionalState.INSPIRED]: [
      "M 46 68 Q 50 71 54 68", // Determined smile
      "M 46 69 Q 50 73 54 69", // Wider determined smile
      "M 46 68 C 47 75, 53 75, 54 68", // Broad determined smile
    ],
  };

  const currentMouthPaths = mouthPaths[emotionalState] || mouthPaths[EmotionalState.IDLE];
  const currentMouthPath = behaviorState === 'speaking' ? currentMouthPaths[mouthVariant] : currentMouthPaths[0];

  let currentPupilOffset = { x: 0, y: 0 };
  if (behaviorState === 'thinking') {
    currentPupilOffset = thinkingPupilOffset;
  } else if (behaviorState === 'idle' || behaviorState === 'speaking') {
    currentPupilOffset = mousePupilOffset;
  }
  
  const innerGroupClass = useMemo(() => {
    switch (behaviorState) {
      case 'idle': return 'idle-float';
      case 'thinking': return 'thinking-tremble';
      case 'speaking': return 'speaking-bounce';
      default: return '';
    }
  }, [behaviorState]);

  // Main shape and core styling based on emotional state
  const getOrbStyle = useCallback(() => {
    switch (emotionalState) {
      case EmotionalState.HAPPY:
        return {
          mainFill: "url(#happyGradient)",
          coreFill: "#FFD700", // Gold
          auraColor: "#FFC107", // Amber
          stroke: "#FF9800", // Orange
          ringColor: "#FFB300", // Darker Amber for ring
          pedestalFill: "url(#happyPedestalGradient)",
          particles: <g className="happy-sparkle"><circle cx="50" cy="50" r="1.5" fill="white" opacity="0.8" /><circle cx="55" cy="45" r="1.2" fill="yellow" opacity="0.7" /></g>
        };
      case EmotionalState.SAD:
        return {
          mainFill: "url(#sadGradient)",
          coreFill: "#B3E5FC", // Light Blue
          auraColor: "#2196F3", // Blue
          stroke: "#1976D2", // Darker Blue
          ringColor: "#0D47A1", // Even darker blue for ring
          pedestalFill: "url(#sadPedestalGradient)",
          particles: <g className="sad-tear"><circle cx="48" cy="75" r="1.5" fill="white" opacity="0.7" /><circle cx="52" cy="78" r="1.2" fill="lightblue" opacity="0.6" /></g>
        };
      case EmotionalState.ANGRY:
        return {
          mainFill: "url(#angryGradient)",
          coreFill: "#FF4081", // Pink-Red
          auraColor: "#F44336", // Red
          stroke: "#D32F2F", // Dark Red
          ringColor: "#C62828", // Dark red for ring
          pedestalFill: "url(#angryPedestalGradient)",
          particles: <g className="angry-spike"><line x1="50" y1="50" x2="55" y2="45" stroke="red" strokeWidth="1" opacity="0.8" /><line x1="50" y1="50" x2="45" y2="55" stroke="darkred" strokeWidth="1" opacity="0.7" /></g>
        };
      case EmotionalState.CONFUSED:
        return {
          mainFill: "url(#confusedGradient)",
          coreFill: "#FFEB3B", // Yellow
          auraColor: "#FFC107", // Amber
          stroke: "#FFA000", // Orange
          ringColor: "#FF8F00", // Dark orange for ring
          pedestalFill: "url(#confusedPedestalGradient)",
          particles: <g className="confused-thought"><circle cx="50" cy="50" r="1.5" fill="white" opacity="0.7" /><circle cx="55" cy="52" r="1.2" fill="yellow" opacity="0.6" /></g>
        };
      case EmotionalState.INSPIRED:
        return {
          mainFill: "url(#inspiredGradient)",
          coreFill: "#FFFFFF", // White (for rainbow glow)
          auraColor: "url(#rainbowGradient)", // Rainbow
          stroke: "#7B1FA2", // Deep Purple
          ringColor: "#4A148C", // Dark purple for ring
          pedestalFill: "url(#inspiredPedestalGradient)",
          particles: <g className="inspired-rainbow"><circle cx="50" cy="50" r="1.5" fill="red" opacity="0.8" /><circle cx="55" cy="45" r="1.2" fill="blue" opacity="0.7" /></g>
        };
      case EmotionalState.IDLE:
      default:
        return {
          mainFill: "url(#idleOrbGradient)", // Glossy blue gradient
          coreFill: "#B3E5FC", // Light Blue
          auraColor: "#90CAF9", // Lighter Blue
          stroke: "#1976D2", // Darker Blue
          ringColor: "#00BCD4", // Cyan for the ring, like the image
          pedestalFill: "url(#idlePedestalGradient)", // Gradient for pedestal
          particles: (
            <g className="idle-orb-particles">
              <circle cx="20" cy="30" r="2" fill="rgba(0,188,212,0.6)" filter="url(#glow)"/>
              <circle cx="80" cy="70" r="2" fill="rgba(0,188,212,0.6)" filter="url(#glow)"/>
              <circle cx="30" cy="80" r="2" fill="rgba(0,188,212,0.6)" filter="url(#glow)"/>
              <circle cx="70" cy="20" r="2" fill="rgba(0,188,212,0.6)" filter="url(#glow)"/>
              <circle cx="15" cy="55" r="2" fill="rgba(0,188,212,0.6)" filter="url(#glow)"/>
            </g>
          )
        };
    }
  }, [emotionalState]);

  const { mainFill, coreFill, auraColor, stroke, ringColor, pedestalFill, particles } = getOrbStyle();

  // Define main shape paths for each emotional state
  // IDLE is now a circle. Other shapes remain paths.
  const shapePaths: { [key in EmotionalState]: string } = {
    [EmotionalState.IDLE]: "M 50 50 m -35, 0 a 35,35 0 1,0 70,0 a 35,35 0 1,0 -70,0", // Circle (represented as a path for consistency with other shapes)
    [EmotionalState.HAPPY]: "M50,15 C70,10 85,30 85,50 C85,70 70,85 50,90 C30,85 15,70 15,50 C15,30 30,10 50,15 Z", // Heart-like shape
    [EmotionalState.SAD]: "M50,15 C30,0 20,30 20,50 C20,70 30,90 50,95 C70,90 80,70 80,50 C80,30 70,0 50,15 Z", // Teardrop
    [EmotionalState.ANGRY]: "M50,10 L65,30 L55,40 L70,60 L60,50 L75,70 L50,90 L25,70 L40,50 L30,60 L45,40 L35,30 Z", // Lightning bolt
    [EmotionalState.CONFUSED]: "M50,15 C65,10 75,25 75,40 C75,55 65,70 55,75 L55,85 A5,5 0 0145,85 L45,75 C35,70 25,55 25,40 C25,25 35,10 50,15 Z", // Question mark
    [EmotionalState.INSPIRED]: "M50,10 A40,40 0 1150,90 A40,40 0 0050,10 Z M50,30 A20,20 0 1050,70 A20,20 0 0150,30 Z", // Spiral
  };
  const currentShapePath = shapePaths[emotionalState];

  const getOverlayBehaviorClass = useCallback(() => {
    switch (behaviorState) {
      case 'idle': return 'idle-pulse-overlay';
      case 'thinking': return 'thinking-shimmer-overlay';
      case 'speaking': return 'speaking-breath-overlay';
      default: return '';
    }
  }, [behaviorState]);

  // Eye and Mouth positions adjust slightly for different shapes for better fit
  const getFacialFeatureOffsets = useCallback(() => {
    switch (emotionalState) {
      case EmotionalState.HAPPY: return { eyesY: 40, mouthY: 65, pupilAdjustX: 0, pupilAdjustY: 0 };
      case EmotionalState.SAD: return { eyesY: 50, mouthY: 70, pupilAdjustX: 0, pupilAdjustY: 0 };
      case EmotionalState.ANGRY: return { eyesY: 40, mouthY: 65, pupilAdjustX: 0, pupilAdjustY: 0 };
      case EmotionalState.CONFUSED: return { eyesY: 45, mouthY: 68, pupilAdjustX: 0, pupilAdjustY: 0 };
      case EmotionalState.INSPIRED: return { eyesY: 40, mouthY: 65, pupilAdjustX: 0, pupilAdjustY: 0 };
      case EmotionalState.IDLE:
      default: return { eyesY: 45, mouthY: 68, pupilAdjustX: 0, pupilAdjustY: 0 };
    }
  }, [emotionalState]);

  const { eyesY, mouthY, pupilAdjustX, pupilAdjustY } = getFacialFeatureOffsets();

  // Determine if the current shape is a circle (for IDLE) to adjust how it's drawn
  const isIdleOrb = emotionalState === EmotionalState.IDLE;


  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" aria-hidden="true">
      <defs>
        <style>
          {`
            .idle-float { animation: float 6s ease-in-out infinite; }
            @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(8px); } 100% { transform: translateY(0px); } }

            .thinking-tremble { animation: tremble 0.2s linear infinite alternate; }
            @keyframes tremble { 0% { transform: translate(0px, 0px); } 25% { transform: translate(0.5px, 0.5px); } 50% { transform: translate(0px, -0.5px); } 75% { transform: translate(-0.5px, 0.5px); } 100% { transform: translate(0px, 0px); } }

            .speaking-bounce { animation: speaking-bounce 0.4s ease-in-out infinite alternate; }
            @keyframes speaking-bounce { 0% { transform: translateY(0px); } 100% { transform: translateY(-2px); } }

            /* Overlay for behavioral states, applied to the main shape */
            .idle-pulse-overlay {
                animation: idle-pulse-overlay 4s ease-in-out infinite alternate;
            }
            @keyframes idle-pulse-overlay {
                0%, 100% { transform: scale(1); filter: brightness(1); }
                50% { transform: scale(1.02); filter: brightness(1.05); }
            }

            .thinking-shimmer-overlay {
                animation: thinking-shimmer-overlay 2s ease-in-out infinite alternate;
            }
            @keyframes thinking-shimmer-overlay {
                0%, 100% { filter: brightness(1); }
                25% { filter: brightness(1.1); }
                50% { filter: brightness(1.2); }
                75% { filter: brightness(1.1); }
            }

            .speaking-breath-overlay {
                animation: speaking-breath-overlay 0.8s ease-in-out infinite alternate;
            }
            @keyframes speaking-breath-overlay {
                0%, 100% { transform: scale(1); filter: brightness(1); }
                50% { transform: scale(1.03); filter: brightness(1.2); }
            }

            /* Particle animations */
            .happy-sparkle circle { animation: sparkle 1s ease-out infinite; }
            @keyframes sparkle {
                0% { transform: translate(0, 0) scale(0.5); opacity: 1; }
                100% { transform: translate(0, -15px) scale(1); opacity: 0; }
            }

            .sad-tear circle { animation: tear 2s linear infinite; }
            @keyframes tear {
                0% { transform: translate(0, 0) scale(0.8); opacity: 1; }
                100% { transform: translate(0, 10px) scale(0.5); opacity: 0; }
            }
            
            .angry-spike line { animation: spike 0.5s ease-out infinite; }
            @keyframes spike {
                0% { transform: scale(0.5); opacity: 1; }
                100% { transform: scale(1.5); opacity: 0; }
            }

            .confused-thought circle { animation: thought 3s ease-in-out infinite alternate; }
            @keyframes thought {
                0% { transform: translate(0,0) rotate(0); }
                50% { transform: translate(5px, -5px) rotate(15deg); }
                100% { transform: translate(0,0) rotate(0); }
            }

            .inspired-rainbow circle { animation: rainbow-burst 1s ease-out infinite; }
            @keyframes rainbow-burst {
                0% { transform: scale(0.5); opacity: 1; }
                100% { transform: scale(2); opacity: 0; }
            }

            .idle-orb-particles circle { animation: idle-particle-float 4s ease-in-out infinite alternate; }
            @keyframes idle-particle-float {
                0% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
                25% { transform: translateY(-3px) translateX(2px) rotate(10deg); opacity: 0.6; }
                50% { transform: translateY(-6px) translateX(-2px) rotate(-10deg); opacity: 0.8; }
                75% { transform: translateY(-3px) translateX(2px) rotate(10deg); opacity: 0.6; }
                100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
            }

            .orb-ring-rotate {
              transform-origin: 50px 50px; /* Center of the SVG viewBox */
              animation: orb-ring-rotate 10s linear infinite;
            }
            @keyframes orb-ring-rotate {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .holographic-scan {
                animation: holo-scan 3s linear infinite;
            }
            @keyframes holo-scan {
                0% { transform: translateY(-50%); opacity: 0; }
                50% { opacity: 0.3; }
                100% { transform: translateY(50%); opacity: 0; }
            }
          `}
        </style>
        {/* Gradients for main orb body */}
        <radialGradient id="idleOrbGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{stopColor:"#90CAF9", stopOpacity:1}} />
          <stop offset="40%" style={{stopColor:"#2196F3", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#1565C0", stopOpacity:1}} />
        </radialGradient>
        <linearGradient id="idlePedestalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:"#00BCD4", stopOpacity:0.8}} />
          <stop offset="100%" style={{stopColor:"#00838F", stopOpacity:0.8}} />
        </linearGradient>

        <linearGradient id="happyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:"#FFF59D", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#FFC107", stopOpacity:1}} />
        </linearGradient>
        <linearGradient id="happyPedestalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:"#FFB300", stopOpacity:0.8}} />
          <stop offset="100%" style={{stopColor:"#FB8C00", stopOpacity:0.8}} />
        </linearGradient>

        <linearGradient id="sadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:"#E1F5FE", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#0277BD", stopOpacity:1}} />
        </linearGradient>
        <linearGradient id="sadPedestalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:"#1976D2", stopOpacity:0.8}} />
          <stop offset="100%" style={{stopColor:"#0D47A1", stopOpacity:0.8}} />
        </linearGradient>

        <linearGradient id="angryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:"#FFEBEE", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#C62828", stopOpacity:1}} />
        </linearGradient>
        <linearGradient id="angryPedestalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:"#D32F2F", stopOpacity:0.8}} />
          <stop offset="100%" style={{stopColor:"#B71C1C", stopOpacity:0.8}} />
        </linearGradient>

        <linearGradient id="confusedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:"#FFFDE7", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#FBC02D", stopOpacity:1}} />
        </linearGradient>
        <linearGradient id="confusedPedestalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:"#FFC107", stopOpacity:0.8}} />
          <stop offset="100%" style={{stopColor:"#FFA000", stopOpacity:0.8}} />
        </linearGradient>

        <linearGradient id="inspiredGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:"#F3E5F5", stopOpacity:1}} />
          <stop offset="25%" style={{stopColor:"#E1BEE7", stopOpacity:1}} />
          <stop offset="50%" style={{stopColor:"#CE93D8", stopOpacity:1}} />
          <stop offset="75%" style={{stopColor:"#BA68C8", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#8E24AA", stopOpacity:1}} />
        </linearGradient>
        <linearGradient id="inspiredPedestalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:"#7B1FA2", stopOpacity:0.8}} />
          <stop offset="100%" style={{stopColor:"#4A148C", stopOpacity:0.8}} />
        </linearGradient>

        <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor:"#FF1744"}}/>
          <stop offset="20%" style={{stopColor:"#FF9100"}}/>
          <stop offset="40%" style={{stopColor:"#FFEA00"}}/>
          <stop offset="60%" style={{stopColor:"#00E676"}}/>
          <stop offset="80%" style={{stopColor:"#2979FF"}}/>
          <stop offset="100%" style={{stopColor:"#D500F9"}}/>
        </linearGradient>

        <filter id="f1" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feOffset in="blur" dx="0" dy="0" result="offsetBlur" />
            <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75" specularExponent="20" lightingColor="#bbbbbb" result="specOut">
                <fePointLight x="-5000" y="-10000" z="20000"/>
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"/>
            <feMerge>
                <feMergeNode in="offsetBlur" />
                <feMergeNode in="litPaint" />
            </feMerge>
        </filter>
        {/* Filter for a subtle glow effect */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        <pattern id="hologram-scan" width="100" height="10" patternUnits="userSpaceOnUse">
            <line x1="0" y1="5" x2="100" y2="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        </pattern>
      </defs>
      <g className={innerGroupClass} transform="translate(0,0)"> {/* Outer group for floating/trembling */}
        
        {/* Pedestal - always rendered but its fill changes */}
        <path d="M40 78 C 38 85, 62 85, 60 78 L 55 78 L 50 82 L 45 78 Z" fill={pedestalFill} filter="url(#f1)" transform="scale(0.8) translate(12, 20)"/>
        <path d="M46 76 Q 50 78 54 76 L 52 70 L 48 70 Z" fill={pedestalFill} transform="scale(0.8) translate(12, 20)"/>


        {/* Main Orb/Shape - conditional rendering for circle vs path */}
        {isIdleOrb ? (
          <circle cx="50" cy="50" r="35"
                  fill={mainFill} stroke={stroke} strokeWidth="1"
                  className={getOverlayBehaviorClass()} filter="url(#f1)"/>
        ) : (
          <path d={currentShapePath}
                fill={mainFill} stroke={stroke} strokeWidth="2"
                className={getOverlayBehaviorClass()} filter="url(#f1)" />
        )}
        
        {/* Luminous Core - smaller version of the main shape */}
        {isIdleOrb ? (
            <circle cx="50" cy="50" r="25" fill={coreFill} filter="url(#f1)" opacity="0.8" />
        ) : (
            <path d={currentShapePath}
                  transform="scale(0.6) translate(40,30)" // Scaled down and centered
                  fill={coreFill} filter="url(#f1)" opacity="0.8" />
        )}

        {/* Holographic Scanline Overlay */}
        <rect x="0" y="0" width="100" height="100" fill="url(#hologram-scan)" className="holographic-scan" style={{pointerEvents:'none'}} clipPath={isIdleOrb ? 'circle(35px at 50px 50px)' : undefined}/>

        {/* Orbiting Ring - only for IDLE state, but changes color based on emotion */}
        {isIdleOrb && (
            <g className="orb-ring-rotate">
              <ellipse cx="50" cy="50" rx="38" ry="15" fill="none" stroke={ringColor} strokeWidth="2" opacity="0.6" filter="url(#glow)">
                  {/* Additional partial ring for front effect */}
                  <animate attributeName="stroke-dasharray" values="100, 100; 10, 190; 100, 100" dur="20s" repeatCount="indefinite" />
                  <animate attributeName="stroke-dashoffset" values="0; 200; 0" dur="20s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="50" cy="50" rx="38" ry="15" fill="none" stroke={ringColor} strokeWidth="2" opacity="0.6" transform="rotate(90 50 50)" filter="url(#glow)" />
            </g>
        )}
        
        {/* Aura / Particles for current emotional state */}
        <g opacity="0.8">
            {particles}
        </g>

        {/* Face area behind eyes/mouth (subtle highlight) */}
        <circle cx="50" cy="50" r="25" fill="rgba(255,255,255,0.05)" />

        {/* Eyes */}
        <g fill="#000000" stroke="#000000" strokeWidth="0.5">
          <circle cx="40" cy={eyesY} r="5" />
          <circle cx="60" cy={eyesY} r="5" />
        </g>
        
        {/* Pupils */}
        <g fill="#FFFFFF"> {/* Pupils are white for the image look */}
          <circle cx={40 + currentPupilOffset.x + pupilAdjustX} cy={eyesY + currentPupilOffset.y + pupilAdjustY} r="2.5" />
          <circle cx={60 + currentPupilOffset.x + pupilAdjustX} cy={eyesY + currentPupilOffset.y + pupilAdjustY} r="2.5" />
        </g>
        
        {/* Blinking effect (rectangles that cover pupils) */}
        {eyeBlink && (
          <g>
            <rect x="35" y={eyesY - 3} width="10" height="6" fill="#000000" /> {/* Blink with black color */}
            <rect x="55" y={eyesY - 3} width="10" height="6" fill="#000000" />
          </g>
        )}

        {/* Mouth */}
        <path d={currentMouthPath} 
              stroke="#000000" strokeWidth="1.5" fill="none" transform={`translate(0, ${mouthY - 68})`} />
      </g>
    </svg>
  );
};

export default EmotionalOrbSVG;