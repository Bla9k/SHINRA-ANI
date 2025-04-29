
'use client';

import React, { createContext, useContext, type ReactNode } from 'react';
import anime from 'animejs'; // Import animejs

interface AnimationContextProps {
  // Define any animation-related state or functions you want to share
  // Example: trigger an animation
  playAnimation: (targets: anime.AnimeParams['targets'], options: anime.AnimeAnimParams) => anime.AnimeInstance | null;
}

const AnimationContext = createContext<AnimationContextProps | undefined>(undefined);

export const AnimationProvider = ({ children }: { children: ReactNode }) => {
  // Basic animation function using animejs
  const playAnimation = (targets: anime.AnimeParams['targets'], options: anime.AnimeAnimParams): anime.AnimeInstance | null => {
    if (typeof window !== 'undefined' && anime) { // Ensure animejs is loaded
      return anime({
        targets,
        ...options,
      });
    }
    return null;
  };

  const value = {
    playAnimation,
    // Add other animation-related values here
  };

  // Ensure no whitespace is introduced here
  return (
    <AnimationContext.Provider value={value}>{children}</AnimationContext.Provider>
  );
};

// Custom hook to use the animation context
export const useAnimation = (): AnimationContextProps => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};
