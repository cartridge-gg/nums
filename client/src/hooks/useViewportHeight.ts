import { useEffect, useState } from "react";

/**
 * Hook to get the actual viewport height
 * On Chrome Android, the browser UI is an overlay, so 100vh includes space
 * that's not actually visible. This hook returns the real visible height.
 */
export const useViewportHeight = (): number | null => {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateHeight = () => {
      // Use visualViewport API if available (most accurate for mobile)
      // This gives the actual visible viewport height, excluding browser UI
      if (window.visualViewport) {
        setHeight(window.visualViewport.height);
      } else {
        // Fallback: use window.innerHeight
        setHeight(window.innerHeight);
      }
    };

    // Initial check
    updateHeight();

    // Listen to resize events
    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", () => {
      setTimeout(updateHeight, 100);
    });

    // Use visualViewport API if available (better for mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateHeight);
    }

    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", updateHeight);
      }
    };
  }, []);

  return height;
};
