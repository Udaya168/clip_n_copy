import { useEffect, useRef } from "react";
import { useLocation } from "@tanstack/react-router";

export function useScrollRestoration(isReady: boolean = true) {
  const location = useLocation();
  const stateKey = typeof window !== 'undefined' 
    ? (window.history?.state?.key || window.history?.state?.__TSR_key || 'default') 
    : 'default';
    
  const searchStr = Object.keys(location.search).length ? JSON.stringify(location.search) : "";
  const key = `scroll_${location.pathname}${searchStr}_${stateKey}`;
  const hasRestored = useRef(false);

  useEffect(() => {
    if (!isReady) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const saveScroll = () => {
      sessionStorage.setItem(key, window.scrollY.toString());
    };

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(saveScroll, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
      saveScroll();
    };
  }, [key, isReady]);

  useEffect(() => {
    if (!isReady || hasRestored.current) return;

    const saved = sessionStorage.getItem(key);
    if (saved !== null) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: parseInt(saved, 10), behavior: "instant" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    hasRestored.current = true;
  }, [isReady, key]);
  
  useEffect(() => {
    hasRestored.current = false;
  }, [key]);
}
