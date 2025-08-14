import { useState, useEffect } from 'react';

/**
 * Custom hook for media queries
 * Provides responsive breakpoint detection for mobile-first design
 * @param {string} query - CSS media query string
 * @returns {boolean} - Whether the media query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handleChange = (event) => {
      setMatches(event.matches);
    };

    // Add event listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Predefined media query hooks for common breakpoints
 */
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsSmallMobile = () => useMediaQuery('(max-width: 480px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
export const useIsLargeDesktop = () => useMediaQuery('(min-width: 1440px)');

/**
 * Hook for orientation detection
 */
export const useIsPortrait = () => useMediaQuery('(orientation: portrait)');
export const useIsLandscape = () => useMediaQuery('(orientation: landscape)');

/**
 * Hook for device capabilities
 */
export const useHasTouch = () => useMediaQuery('(pointer: coarse)');
export const useHasHover = () => useMediaQuery('(hover: hover)');
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const usePrefersDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)');

/**
 * Hook for high-DPI displays
 */
export const useIsHighDPI = () => useMediaQuery('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)');

/**
 * Hook for mobile-specific features
 */
export const useIsMobileDevice = () => {
  const isMobile = useIsMobile();
  const hasTouch = useHasTouch();
  const isPortrait = useIsPortrait();
  
  return isMobile && hasTouch && isPortrait;
};

export default useMediaQuery; 