"use client";

import { useEffect } from "react";

/**
 * Locks the app like a native app: no pinch zoom, no double-tap zoom,
 * no ctrl+wheel zoom, no rubber-band bounce, no iOS text auto-zoom.
 */
export default function ViewportLock() {
  useEffect(() => {
    const stop = (e: Event) => e.preventDefault();

    // iOS Safari pinch
    document.addEventListener("gesturestart", stop as EventListener, { passive: false });
    document.addEventListener("gesturechange", stop as EventListener, { passive: false });
    document.addEventListener("gestureend", stop as EventListener, { passive: false });

    // multi-finger touch and double tap
    let lastTouch = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
      const now = Date.now();
      if (now - lastTouch <= 320) e.preventDefault();
      lastTouch = now;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener("touchstart", onTouchStart, { passive: false });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("dblclick", stop as EventListener, { passive: false });

    // desktop zoom shortcuts
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["+", "-", "=", "0"].includes(e.key)) e.preventDefault();
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);

    // stop iOS from restoring a zoomed viewport
    const meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    if (meta) {
      meta.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover");
    }

    return () => {
      document.removeEventListener("gesturestart", stop as EventListener);
      document.removeEventListener("gesturechange", stop as EventListener);
      document.removeEventListener("gestureend", stop as EventListener);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("dblclick", stop as EventListener);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return null;
}
