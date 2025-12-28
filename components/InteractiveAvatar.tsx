

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import EmotionalOrbSVG from './EmotionalOrbSVG';
import { EmotionalState } from '../types';

type BehaviorState = 'idle' | 'thinking' | 'speaking';

interface InteractiveAvatarProps {
  isThinking: boolean;
  isSpeaking: boolean;
  emotionalState: EmotionalState; // New prop for emotional state
  position: { x: number; y: number }; // Prop for avatar position
  onPositionChange: (newPosition: { x: number; y: number }) => void; // Callback to update position
}

// Map emotional states to placeholder audio file paths
const audioMap: Record<EmotionalState, string | null> = {
  [EmotionalState.IDLE]: '/audio/idle_hum.mp3', // Subtle, low-key background hum
  [EmotionalState.HAPPY]: '/audio/happy_twinkle.mp3', // Cheerful, light chimes
  [EmotionalState.SAD]: '/audio/sad_synth.mp3', // Melancholic, soft synth pad
  [EmotionalState.ANGRY]: '/audio/angry_rumble.mp3', // Low, subtle rumble
  [EmotionalState.CONFUSED]: '/audio/confused_query.mp3', // Gentle, questioning tone
  [EmotionalState.INSPIRED]: '/audio/inspired_chimes.mp3', // Uplifting, ethereal chimes
};

const InteractiveAvatar: React.FC<InteractiveAvatarProps> = ({ isThinking, isSpeaking, emotionalState, position, onPositionChange }) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragStartOffset = useRef({ x: 0, y: 0 });
    const avatarRef = useRef<HTMLDivElement>(null);

    const [behaviorState, setBehaviorState] = useState<BehaviorState>('idle'); // Renamed state
    const [isVisible, setIsVisible] = useState(false);
    
    // State to track global mouse position
    const [clientMousePosition, setClientMousePosition] = useState<{ x: number, y: number } | null>(null);

    // Audio-related state and refs
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentAudioState = useRef<EmotionalState | null>(null); // To prevent re-playing same audio

    useEffect(() => {
        // Fade in animation on mount
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isThinking) {
            setBehaviorState('thinking');
        } else if (isSpeaking) {
            setBehaviorState('speaking');
        } else {
            setBehaviorState('idle');
        }
    }, [isThinking, isSpeaking]);

    // Effect to listen for global mouse movement for eye tracking
    useEffect(() => {
      const handleDocumentMouseMove = (e: MouseEvent) => {
        setClientMousePosition({ x: e.clientX, y: e.clientY });
      };
      document.addEventListener('mousemove', handleDocumentMouseMove);
      return () => {
        document.removeEventListener('mousemove', handleDocumentMouseMove);
      };
    }, []);

    // --- Audio Playback Effect ---
    useEffect(() => {
      const currentAudioFile = audioMap[emotionalState];

      // Only change audio if the emotional state (and thus its audio file) actually changed
      if (currentAudioState.current === emotionalState) {
          return;
      }
      currentAudioState.current = emotionalState; // Update the ref to track the current state

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ''; // Clear source to stop loading/buffering
        audioRef.current.load(); // Force reload
      }

      if (currentAudioFile) {
        if (!audioRef.current) {
          audioRef.current = new Audio();
          audioRef.current.loop = true;
          audioRef.current.volume = 0.1; // Start with low volume to be ambient
        }
        audioRef.current.src = currentAudioFile;
        // Attempt to play, catching potential autoplay policy errors
        audioRef.current.play().catch(e => console.warn("Audio autoplay blocked or failed:", e));
      }

      // Cleanup function: pause and reset audio when component unmounts or emotionalState changes
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = ''; // Clear source for cleanup
          audioRef.current.load();
        }
      };
    }, [emotionalState]); // Re-run effect only when emotionalState changes

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!avatarRef.current) return;
        e.preventDefault();
        setIsDragging(true);
        const rect = avatarRef.current.getBoundingClientRect();
        dragStartOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        avatarRef.current.style.transition = 'none'; // Disable transition during drag for smooth movement
        avatarRef.current.style.willChange = 'left, top'; // Optimize for dragging
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        if(avatarRef.current) {
            // Re-enable animation-related transitions (if any apply to the div itself)
            avatarRef.current.style.transition = 'opacity 0.5s, left 0.3s ease-out, top 0.3s ease-out'; // Re-enable transitions
            avatarRef.current.style.willChange = 'auto'; // Reset will-change
        }
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        let newX = e.clientX - dragStartOffset.current.x;
        let newY = e.clientY - dragStartOffset.current.y;
        
        if (avatarRef.current) {
            const rect = avatarRef.current.getBoundingClientRect();
            newX = Math.max(0, Math.min(newX, window.innerWidth - rect.width));
            newY = Math.max(0, Math.min(newY, window.innerHeight - rect.height));
        }

        onPositionChange({ x: newX, y: newY }); // Use onPositionChange prop
    }, [isDragging, onPositionChange]);
    
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const containerClasses = `fixed z-20 w-36 h-36 transition-opacity duration-500 will-change-transform ${isVisible ? 'opacity-100' : 'opacity-0 -translate-y-10'} `;
    // Apply position directly from props
    const dynamicStyles: React.CSSProperties = { 
        left: `${position.x}px`, 
        top: `${position.y}px`, 
        cursor: 'grab',
        transition: isDragging ? 'none' : 'opacity 0.5s, left 0.3s ease-out, top 0.3s ease-out' // Dynamic transition
    };

    return (
        <div
            ref={avatarRef}
            className={containerClasses + (isDragging ? 'active:cursor-grabbing' : '')}
            style={dynamicStyles}
            onMouseDown={handleMouseDown}
            title="Arrastra a Rick"
        >
            <EmotionalOrbSVG 
                behaviorState={behaviorState} 
                emotionalState={emotionalState}
                clientMousePosition={clientMousePosition}
                avatarRef={avatarRef}
            />
        </div>
    );
};

export default InteractiveAvatar;
