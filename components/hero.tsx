"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import {
  CELL,
  MIRROR_SIDE,
  buildCircuitPath,
  type Side,
} from "@/lib/circuit-paths";

// How much of the current line is lit at once.
const DASH = 96;

// The hero line that cycles. "We" stays put; only the rest is typed.
const PHRASES = ["design it.", "build it.", "automate it."];
const TYPE_MS = 60;
const HOLD_MS = 1500;
const DELETE_MS = 30;
const PAUSE_MS = 320;

type Phase = "typing" | "holding" | "deleting" | "pausing";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const leadRef = useRef<HTMLSpanElement>(null);
  const rotatorRef = useRef<HTMLSpanElement>(null);
  const restRef = useRef<HTMLDivElement>(null);
  const laneRefs = useRef<(SVGPathElement | null)[]>([]);

  const [phrase, setPhrase] = useState(0);
  const [count, setCount] = useState(PHRASES[0].length);
  const [phase, setPhase] = useState<Phase>("holding");

  // Type a phrase, hold it, delete it, then move to the next one. Every
  // character keeps its slot, so the line never reflows as it is typed;
  // only its opacity, blur and position change. Reduced motion parks on the
  // first phrase with a still caret.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const length = PHRASES[phrase].length;

    if (phase === "typing") {
      if (count >= length) {
        const done = window.setTimeout(() => setPhase("holding"), 0);
        return () => window.clearTimeout(done);
      }
      const timer = window.setTimeout(() => setCount(count + 1), TYPE_MS);
      return () => window.clearTimeout(timer);
    }

    if (phase === "holding") {
      const timer = window.setTimeout(() => setPhase("deleting"), HOLD_MS);
      return () => window.clearTimeout(timer);
    }

    if (phase === "deleting") {
      if (count > 0) {
        const timer = window.setTimeout(() => setCount(count - 1), DELETE_MS);
        return () => window.clearTimeout(timer);
      }
      const paused = window.setTimeout(() => setPhase("pausing"), 0);
      return () => window.clearTimeout(paused);
    }

    // Pausing: the line is empty and the caret rests, then the next phrase
    // starts with no visible jump between the two widths.
    const timer = window.setTimeout(() => {
      setPhrase((current) => (current + 1) % PHRASES.length);
      setPhase("typing");
    }, PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [count, phase, phrase]);

  useEffect(() => {
    // The grid sits under the text column below 1024px, and this is decoration.
    if (window.matchMedia("(max-width: 1023px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const hero = sectionRef.current;
    const inner = hero?.querySelector(".hero__inner");
    if (!hero || !inner) return;

    const timers: number[] = [];
    const animations: Animation[] = [];
    let stopped = false;
    // Which edge each lane last entered from, so the next run can mirror it.
    const lastSide: Record<number, Side | null> = { 0: null, 1: null };
    const SIDES: Side[] = ["left", "right", "top", "bottom"];

    // The text block, in grid cells, with a margin: pulses route around it.
    const blockedBox = () => {
      const heroRect = hero.getBoundingClientRect();
      const textRect = inner.getBoundingClientRect();
      const pad = 8;
      return {
        c0: Math.floor((textRect.left - heroRect.left - pad) / CELL),
        c1: Math.ceil((textRect.right - heroRect.left + pad) / CELL),
        r0: Math.floor((textRect.top - heroRect.top - pad) / CELL),
        r1: Math.ceil((textRect.bottom - heroRect.top + pad) / CELL),
      };
    };

    const run = (el: SVGPathElement, lane: number, index: number) => {
      if (stopped) return;

      // Balance: enter from the edge opposite the other lane's last entry, so
      // a right-hand run is answered by a left-hand one. Sometimes the axis
      // flips instead (a down run answered by an up run), otherwise a pair
      // that settled horizontal would stay horizontal forever.
      const other = lastSide[1 - lane];
      let side: Side;
      if (!other) {
        side = SIDES[Math.floor(Math.random() * SIDES.length)];
      } else if (Math.random() < 0.3) {
        const otherWasHorizontal = other === "left" || other === "right";
        side = otherWasHorizontal
          ? Math.random() < 0.5
            ? "top"
            : "bottom"
          : Math.random() < 0.5
            ? "left"
            : "right";
      } else {
        side = MIRROR_SIDE[other];
      }
      lastSide[lane] = side;

      const path = buildCircuitPath(
        hero.clientWidth,
        hero.clientHeight,
        blockedBox(),
        lane,
        Math.random,
        side,
      );

      if (!path) {
        timers.push(window.setTimeout(() => run(el, lane, index), 1500));
        return;
      }

      el.setAttribute("d", path.d);
      el.dataset.side = side;
      el.style.strokeDasharray = `${DASH} ${path.length + DASH}`;

      // A new pace each run, and a pace that changes inside the run: the dash
      // sprints, eases through the middle and sprints again.
      const speed = 110 + Math.random() * 190;
      // Long routes would crawl; keep every run inside a lively band.
      const duration = Math.min(
        11000,
        Math.max(4000, (path.length / speed) * 1000),
      );
      const at = (fraction: number) => DASH + (-path.length - DASH) * fraction;
      const firstStop = 0.34 + Math.random() * 0.16;
      const firstTime = 0.2 + Math.random() * 0.12;
      const secondStop = firstStop + 0.1 + Math.random() * 0.12;
      const secondTime = 0.55 + Math.random() * 0.15;
      const glide = "cubic-bezier(0.42, 0, 0.58, 1)";

      const animation = el.animate(
        [
          { strokeDashoffset: at(0), offset: 0, easing: glide },
          { strokeDashoffset: at(firstStop), offset: firstTime, easing: glide },
          { strokeDashoffset: at(secondStop), offset: secondTime, easing: glide },
          { strokeDashoffset: at(1), offset: 1 },
        ],
        {
          duration,
          easing: "linear",
          fill: "both",
        },
      );
      animations.push(animation);

      animation.onfinish = () => {
        if (stopped) return;
        timers.push(
          window.setTimeout(() => run(el, lane, index), 600 + Math.random() * 1800),
        );
      };
    };

    laneRefs.current.forEach((el, index) => {
      if (el) run(el, index, index);
    });

    return () => {
      stopped = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      animations.forEach((animation) => animation.cancel());
    };
  }, []);

  useEffect(() => {
    // Motion is an enhancement: the hero text is server-rendered and visible,
    // and the grid stays static when motion is reduced.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let context: { revert: () => void } | undefined;

    void (async () => {
      try {
        const [{ gsap }, { SplitText }] = await Promise.all([
          import("gsap"),
          import("gsap/SplitText"),
        ]);
        if (cancelled || !leadRef.current || !rotatorRef.current) return;
        gsap.registerPlugin(SplitText);

        context = gsap.context(() => {
          const split = new SplitText(leadRef.current, { type: "words" });
          gsap.from(split.words, {
            opacity: 0,
            y: 18,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.05,
          });
          gsap.from(rotatorRef.current, {
            opacity: 0,
            y: 12,
            duration: 0.6,
            delay: 0.35,
            ease: "power3.out",
          });
          gsap.from(restRef.current, {
            opacity: 0,
            y: 12,
            duration: 0.5,
            delay: 0.3,
            ease: "power2.out",
          });
        });
      } catch {
        // If the animation chunk cannot load, the static hero stays as it is.
      }
    })();

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, []);

  return (
    <section className="hero" id="top" ref={sectionRef}>
      <div className="hero__grid" aria-hidden="true" />

      {/* Circuit pulses: hairlines of the grid itself, in accent, cruising the
          lines and turning at intersections. Decorative. */}
      <div className="hero__circuits" aria-hidden="true">
        <svg className="hero__circuit-map" focusable="false">
          {[0].map((lane) => (
            <path
              key={lane}
              className="hero__circuit-line"
              ref={(el) => {
                laneRefs.current[lane] = el;
              }}
            />
          ))}
        </svg>
      </div>

      <div className="page-shell hero__inner">
        <h1 className="h1 hero__title">
          <span className="hero__title-lead" ref={leadRef}>
            You bring the idea.
          </span>
          <span className="hero__rotator" ref={rotatorRef} aria-hidden="true">
            <span className="hero__rotator-we">We</span>
            <span className="hero__typed">
              {[...PHRASES[phrase]].map((char, index) => (
                <span
                  key={`${phrase}-${index}`}
                  className="hero__typed-char"
                  data-visible={index < count}
                  style={{ order: index < count ? index : index + 1 }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
              {phase !== "pausing" && (
                <span
                  className="hero__caret"
                  data-busy={phase !== "holding"}
                  style={{ order: count }}
                />
              )}
            </span>
          </span>
          <span className="visually-hidden">
            We design it, build it, and automate it.
          </span>
        </h1>
        <div ref={restRef} className="stack-md">
          <p className="p p--large">
            The work that eats your week, handled for you, so your time goes to
            the work only you can do.
          </p>
          <div className="hero__cta">
            <Button label="Work with us" variant="primary" href="#contact" />
          </div>
        </div>
      </div>
    </section>
  );
}
