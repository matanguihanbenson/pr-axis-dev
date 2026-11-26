"use client";

import { useEffect } from "react";

/**
 * GSAP owns scroll reveals only. Every revealed element is a plain wrapper, so
 * no element is animated by both Motion and GSAP.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let context: { revert: () => void } | undefined;

    void (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        context = gsap.context(() => {
          const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]");
          targets.forEach((target) => {
            gsap.from(target, {
              opacity: 0,
              y: 16,
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: target,
                start: "top 88%",
                once: true,
              },
            });
          });
        });
      } catch {
        // Reveals are decorative; the content is already in the HTML.
      }
    })();

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, []);

  return null;
}
