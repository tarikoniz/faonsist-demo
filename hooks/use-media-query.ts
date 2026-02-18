'use client';

import { useState, useEffect } from 'react';
import { LAYOUT } from '@/lib/constants';

const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
};

type BreakpointKey = keyof typeof BREAKPOINTS;

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);

        // Set initial value
        setMatches(media.matches);

        // Create listener
        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Add listener
        media.addEventListener('change', listener);

        // Cleanup
        return () => {
            media.removeEventListener('change', listener);
        };
    }, [query]);

    return matches;
}

export function useBreakpoint(breakpoint: BreakpointKey): boolean {
    const minWidth = BREAKPOINTS[breakpoint];
    return useMediaQuery(`(min-width: ${minWidth}px)`);
}

export function useIsMobile(): boolean {
    return !useMediaQuery(`(min-width: ${LAYOUT.MOBILE_BREAKPOINT}px)`);
}

export function useIsTablet(): boolean {
    const isMobile = useIsMobile();
    const isDesktop = useMediaQuery(`(min-width: ${LAYOUT.TABLET_BREAKPOINT}px)`);
    return !isMobile && !isDesktop;
}

export function useIsDesktop(): boolean {
    return useMediaQuery(`(min-width: ${LAYOUT.TABLET_BREAKPOINT}px)`);
}

export function useWindowSize(): { width: number; height: number } {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
}
