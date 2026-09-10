import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();
  
  // Track if we are currently in the middle of restoring a scroll position
  // to avoid overwriting the saved position with a partial scroll state.
  const isRestoring = useRef(false);

  // Save the scroll position for the current location key
  useEffect(() => {
    const handleScroll = () => {
      if (!isRestoring.current) {
        sessionStorage.setItem(`scroll-pos-${location.key}`, window.scrollY.toString());
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      // Save one last time on unmount just in case
      if (!isRestoring.current) {
        sessionStorage.setItem(`scroll-pos-${location.key}`, window.scrollY.toString());
      }
    };
  }, [location.key]);

  // Restore or reset scroll position on navigation
  useEffect(() => {
    if (navigationType === "POP") {
      // Navigating Back/Forward -> Restore previous scroll position
      const savedStr = sessionStorage.getItem(`scroll-pos-${location.key}`);
      const savedPosition = savedStr ? parseInt(savedStr, 10) : 0;
      
      isRestoring.current = true;
      
      const restore = () => {
        window.scrollTo({
          top: savedPosition,
          left: 0,
          behavior: "instant",
        });
      };
      
      // Attempt immediate restoration
      restore();
      
      // Attempt delayed restoration to account for React rendering and dynamically fetched content (like products)
      const timeoutId1 = setTimeout(restore, 50);
      const timeoutId2 = setTimeout(() => {
        restore();
        isRestoring.current = false;
      }, 150);

      return () => {
        clearTimeout(timeoutId1);
        clearTimeout(timeoutId2);
        isRestoring.current = false; // Ensure it unlocks if unmounted quickly
      };
    } else {
      // Navigating to a new page (PUSH or REPLACE) -> Scroll to top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
      // Ensure we clear out old saved position if it happens to exist
      sessionStorage.setItem(`scroll-pos-${location.key}`, "0");
      return undefined;
    }
  }, [location.key, navigationType]);

  return null;
}
