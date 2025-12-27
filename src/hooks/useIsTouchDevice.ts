import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is on a touch device
 * Uses both media query and touch point detection for accuracy
 */
export function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check for touch capability
    const checkTouch = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      // Also check media query for hover capability (no hover = likely touch)
      const prefersTouch = window.matchMedia('(hover: none)').matches;

      setIsTouchDevice(hasTouch || isMobile || prefersTouch);
    };

    checkTouch();

    // Re-check on resize (in case of device orientation change or external keyboard)
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  return isTouchDevice;
}
