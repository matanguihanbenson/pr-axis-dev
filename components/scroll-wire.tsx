"use client";

import { useEffect } from "react";

/**
 * A 2px wire at the left edge, filling as the page scrolls, with the three
 * pillar dots spaced along it. Hidden below 768px. Decorative only, so it is
 * aria-hidden and never takes pointer events.
 */
export function ScrollWire() {
  useEffect(() => {
    const update = () => {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, root.scrollTop / max)) : 0;
      root.style.setProperty("--page-progress", `${progress * 100}%`);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    observer.observe(document.body);
    document.fonts?.ready.then(update).catch(() => {});

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="scroll-wire" aria-hidden="true">
      <span className="scroll-wire__fill" />
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="scroll-wire__dot"
          style={{ top: `${25 + index * 25}%` }}
        />
      ))}
    </div>
  );
}
