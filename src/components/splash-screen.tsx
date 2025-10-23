
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export default function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start the main animation shortly after mount
    const animTimer = setTimeout(() => {
      setIsAnimating(true);
    }, 500);

    // Start fading out the whole splash screen after the animation has had time to run
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2000); // This should be a bit less than the final timeout

    // Signal completion and unmount the component
    const completionTimer = setTimeout(() => {
      onAnimationComplete();
    }, 2500); // Total duration of the splash screen

    return () => {
      clearTimeout(animTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completionTimer);
    };
  }, [onAnimationComplete]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500 ease-in-out',
        isFadingOut ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div
        className={cn(
          'absolute text-center transition-all duration-1000 ease-in-out',
           'top-1/2 left-1/2 splash-logo-start',
           isAnimating && 'splash-logo-end'
        )}
      >
        <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-4xl font-bold text-transparent">
          Snapter Games
        </span>
      </div>
    </div>
  );
}
