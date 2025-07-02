import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { CicatrizandoSvg } from '../cicatrizando-logo/CicatrizandoSvg';

// Define the ref handle types
export interface LoadingScreenHandle {
  show: () => void;
  hide: () => void;
}

interface LoadingScreenProps {
  className?: string;
}

export const LoadingScreen = forwardRef<LoadingScreenHandle, LoadingScreenProps>(
  ({ className }, ref) => {
    const [visible] = useState(false);
    const [opacity, setOpacity] = useState(0);
    const [shouldRender, setShouldRender] = useState(false);

    // Fade durations in milliseconds
    const fadeInDuration = 400;
    const fadeOutDuration = 400;

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      show: () => {
        setShouldRender(true);
        // Small delay to ensure DOM is ready for the transition
        setTimeout(() => setOpacity(1), 10);
      },
      hide: () => {
        setOpacity(0);
        // Wait for fade out animation to complete before removing from DOM
        setTimeout(() => setShouldRender(false), fadeOutDuration);
      }
    }));

    // Handle initial animation
    useEffect(() => {
      if (visible && opacity === 0) {
        setTimeout(() => setOpacity(1), 10);
      }
    }, [visible, opacity]);

    if (!shouldRender) return null;

    return (
      <div 
        className={`fixed inset-0 flex flex-col items-center justify-center bg-white z-50 ${className || ''}`}
        style={{
          transition: `opacity ${opacity === 1 ? fadeInDuration : fadeOutDuration}ms ease-in-out`,
          opacity: opacity
        }}
      >
        <div className="animate-pulse">
          <CicatrizandoSvg width={250} height={42} />
        </div>
        <div className="mt-8 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#0120AC] rounded-full animate-loading-bar"></div>
        </div>
      </div>
    );
  }
);

LoadingScreen.displayName = 'LoadingScreen';