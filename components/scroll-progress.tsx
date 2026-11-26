"use client";

import { useEffect, useRef } from "react";
import { PILLARS, type PillarId } from "@/lib/services";
import { usePillar } from "./pillar-context";

/**
 * The page's wire: a fixed hairline at the viewport edge that fills downward
 * with scroll progress, with one dot per pillar. Hidden on narrow screens.
 * Under reduced motion the line stays but the fill never runs.
 */
export function ScrollProgress() {
  const fillRef = useRef<HTMLSpanElement>(null);
  const { pillarId, setPillar } = usePillar();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;

    let cancelled = false;
    let context: { revert: () => void } | undefined;

    void (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled || !fillRef.current) return;
        gsap.registerPlugin(ScrollTrigger);

        context = gsap.context(() => {
          // Transform only: the fill scales, the layout never changes.
          gsap.to(fillRef.current, {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: document.documentElement,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        });
      } catch {
        // Without the timeline the wire is simply an unfilled hairline.
      }
    })();

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, []);

  const goToPillar = (id: PillarId) => {
    setPillar(id);
    const target = document.getElementById("services");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <div className="scroll-progress">
      <span className="scroll-progress__fill" ref={fillRef} aria-hidden="true" />
      <div className="scroll-progress__dots">
        {PILLARS.map((pillar, index) => (
          <button
            key={pillar.id}
            type="button"
            className="scroll-progress__dot"
            data-active={pillar.id === pillarId}
            aria-current={pillar.id === pillarId ? "true" : undefined}
            aria-label={`Go to ${pillar.label}`}
            onClick={() => goToPillar(pillar.id)}
            style={{ top: `${25 + index * 25}%` }}
          />
        ))}
      </div>
    </div>
  );
}
