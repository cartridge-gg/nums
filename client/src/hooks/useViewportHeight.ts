import { useEffect, useState } from "react";

/**
 * Hook to detect if the viewport height is smaller than 100vh
 * (common issue on Chrome Android where the browser UI affects viewport height)
 * Returns the additional padding needed in pixels
 */
export const useViewportHeight = (): number => {
  const [paddingBottom, setPaddingBottom] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updatePadding = () => {
      // Use visualViewport API if available (most accurate for mobile)
      if (window.visualViewport) {
        const visualHeight = window.visualViewport.height;
        
        // Get the CSS viewport height (100vh)
        const testDiv = document.createElement("div");
        testDiv.style.height = "100vh";
        testDiv.style.position = "absolute";
        testDiv.style.visibility = "hidden";
        document.body.appendChild(testDiv);
        const cssHeight = testDiv.offsetHeight;
        document.body.removeChild(testDiv);
        
        // On Chrome Android, when browser UI is visible:
        // - visualHeight < cssHeight (visual viewport is smaller)
        // - window.innerHeight might also be smaller
        const difference = cssHeight - visualHeight;
        
        // Only add padding if there's a meaningful difference (more than 20px)
        if (difference > 20) {
          setPaddingBottom(difference);
        } else {
          setPaddingBottom(0);
        }
      } else {
        // Fallback for browsers without visualViewport API
        const actualHeight = window.innerHeight;
        
        const testDiv = document.createElement("div");
        testDiv.style.height = "100vh";
        testDiv.style.position = "absolute";
        testDiv.style.visibility = "hidden";
        document.body.appendChild(testDiv);
        const cssHeight = testDiv.offsetHeight;
        document.body.removeChild(testDiv);
        
        const difference = cssHeight - actualHeight;
        
        if (difference > 20) {
          setPaddingBottom(difference);
        } else {
          setPaddingBottom(0);
        }
      }
    };

    // Initial check with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(updatePadding, 100);

    // Listen to resize events
    window.addEventListener("resize", updatePadding);
    window.addEventListener("orientationchange", () => {
      setTimeout(updatePadding, 100);
    });
    
    // Use visualViewport API if available (better for mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updatePadding);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updatePadding);
      window.removeEventListener("orientationchange", updatePadding);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", updatePadding);
      }
    };
  }, []);

  return paddingBottom;
};

