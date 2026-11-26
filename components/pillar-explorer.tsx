"use client";

import { useEffect, useRef, useState } from "react";
import { LazyMotion, m, useReducedMotion } from "motion/react";
import { Button } from "@astryxdesign/core/Button";
import { PILLARS, type PillarId } from "@/lib/services";
import { usePillar } from "./pillar-context";

// The DOM animation feature set is fetched after hydration, not with first paint.
const loadMotionFeatures = () =>
  import("motion/react").then((mod) => mod.domAnimation);

const SPARK_WIDTH = 24;
// Spark travel time. The destination outline starts drawing as it lands.
const SPARK_MS = 330;
const CORNER = 8;

/**
 * The pad's accent outline as two halves: one starts at the bottom middle and
 * runs left and up, the other starts at the top middle and runs right and
 * down. They meet at both middles, so the border closes in from four sides.
 */
function outlineHalves(width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  const midX = width / 2;
  const inset = 0.5;
  const left = [
    `M${midX} ${height - inset}`,
    `L${r} ${height - inset}`,
    `A${r} ${r} 0 0 1 ${inset} ${height - r}`,
    `L${inset} ${r}`,
    `A${r} ${r} 0 0 1 ${r} ${inset}`,
    `L${midX} ${inset}`,
  ].join(" ");
  const right = [
    `M${midX} ${inset}`,
    `L${width - r} ${inset}`,
    `A${r} ${r} 0 0 1 ${width - inset} ${r}`,
    `L${width - inset} ${height - r}`,
    `A${r} ${r} 0 0 1 ${width - r} ${height - inset}`,
    `L${midX} ${height - inset}`,
  ].join(" ");
  return { left, right };
}

export function PillarExplorer() {
  const { pillarId, serviceId, setPillar, selectService, startWithService } =
    usePillar();
  const reduceMotion = useReducedMotion();

  const stepperRef = useRef<HTMLDivElement>(null);
  const sparkRef = useRef<HTMLSpanElement>(null);
  const padRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const outlineRefs = useRef<
    Record<string, { a: SVGPathElement | null; b: SVGPathElement | null }>
  >({});
  const previousPillar = useRef<PillarId | null>(null);
  // Which border is currently lit: follows pillarId, a beat behind the spark.
  const [lit, setLit] = useState<PillarId>(pillarId);

  const pillar = PILLARS.find((item) => item.id === pillarId) ?? PILLARS[0];
  const service =
    pillar.services.find((item) => item.id === serviceId) ?? pillar.services[0];

  // Light the new border as the spark arrives.
  useEffect(() => {
    if (lit === pillarId) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => setLit(pillarId),
      reduce ? 0 : SPARK_MS - 80,
    );
    return () => window.clearTimeout(timer);
  }, [pillarId, lit]);

  // Fit each pad's outline to its measured box; pads differ in width.
  useEffect(() => {
    const stepper = stepperRef.current;
    if (!stepper) return;

    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      // Whole CSS pixels on device-pixel boundaries: a 1px stroke drawn at a
      // fractional offset is antialiased across two rows and reads heavier.
      const snap = (value: number) => Math.round(value * dpr) / dpr - value;

      PILLARS.forEach((item) => {
        const pad = padRefs.current[item.id];
        const paths = outlineRefs.current[item.id];
        if (!pad || !paths?.a || !paths.b) return;

        // Move the pad itself onto the pixel grid (never more than 1px), so
        // its fill, its border and the drawn ring all share whole pixels.
        // Measured against the unsnapped position, so it never drifts.
        const rect = pad.getBoundingClientRect();
        const prevX = Number(pad.dataset.snapX ?? 0);
        const prevY = Number(pad.dataset.snapY ?? 0);
        const baseLeft = rect.left - prevX;
        const baseTop = rect.top - prevY;
        const x = snap(baseLeft);
        const y = snap(baseTop);
        pad.dataset.snapX = String(x);
        pad.dataset.snapY = String(y);
        pad.style.transform = x || y ? `translate(${x}px, ${y}px)` : "";

        const width = Math.round(pad.getBoundingClientRect().width);
        const height = Math.round(pad.getBoundingClientRect().height);
        const { left, right } = outlineHalves(width, height, CORNER);
        paths.a.setAttribute("d", left);
        paths.b.setAttribute("d", right);

        const svg = paths.a.ownerSVGElement;
        if (!svg) return;
        svg.style.width = `${width}px`;
        svg.style.height = `${height}px`;
        svg.style.transform = "";
      });
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(stepper);
    PILLARS.forEach((item) => {
      const pad = padRefs.current[item.id];
      if (pad) observer.observe(pad);
    });
    // A viewport change moves the pads without resizing them.
    window.addEventListener("resize", fit);
    // Text metrics land after first paint (webfonts, the hero headline split),
    // which shifts the pads by fractions without resizing anything.
    let frame = 0;
    const settle = () => {
      frame = window.requestAnimationFrame(() => {
        frame = window.requestAnimationFrame(fit);
      });
    };
    settle();
    void document.fonts?.ready.then(fit);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", fit);
    };
  }, []);

  // Send a spark down the rail from the old pad to the new one.
  useEffect(() => {
    const from = previousPillar.current;
    previousPillar.current = pillarId;
    if (!from || from === pillarId) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stepper = stepperRef.current;
    const spark = sparkRef.current;
    const fromPad = padRefs.current[from];
    const toPad = padRefs.current[pillarId];
    if (!stepper || !spark || !fromPad || !toPad) return;

    const box = stepper.getBoundingClientRect();
    const start = fromPad.getBoundingClientRect();
    const end = toPad.getBoundingClientRect();
    const fromX = start.left + start.width / 2 - box.left - SPARK_WIDTH / 2;
    const toX = end.left + end.width / 2 - box.left - SPARK_WIDTH / 2;

    const animation = spark.animate(
      [
        { transform: `translateX(${fromX}px)`, opacity: 1 },
        { transform: `translateX(${toX}px)`, opacity: 1, offset: 0.86 },
        { transform: `translateX(${toX}px)`, opacity: 0 },
      ],
      // Slight overshoot on arrival: the bouncy snap.
      {
        duration: SPARK_MS,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        fill: "forwards",
      },
    );
    return () => animation.cancel();
  }, [pillarId]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = PILLARS.findIndex((item) => item.id === pillarId);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % PILLARS.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + PILLARS.length) % PILLARS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = PILLARS.length - 1;
    else return;
    event.preventDefault();
    setPillar(PILLARS[next].id);
    padRefs.current[PILLARS[next].id]?.focus();
  };

  return (
    <LazyMotion features={loadMotionFeatures}>
      <div className="stepper" ref={stepperRef}>
        <span className="stepper__rail" aria-hidden="true">
          <span className="stepper__spark" ref={sparkRef} />
        </span>
        <div
          className="stepper__pads"
          role="tablist"
          aria-label="Choose a pillar"
          onKeyDown={onKeyDown}
        >
          {PILLARS.map((item) => (
            <button
              key={item.id}
              ref={(el) => {
                padRefs.current[item.id] = el;
              }}
              type="button"
              role="tab"
              id={`${item.id}-tab`}
              className="stepper__pad"
              aria-selected={item.id === pillarId}
              aria-controls={`${item.id}-panel`}
              tabIndex={item.id === pillarId ? 0 : -1}
              data-active={item.id === lit}
              onClick={() => setPillar(item.id)}
            >
              <svg
                className="stepper__outline"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  pathLength={1}
                  ref={(el) => {
                    const entry = (outlineRefs.current[item.id] ??= {
                      a: null,
                      b: null,
                    });
                    entry.a = el;
                  }}
                />
                <path
                  pathLength={1}
                  ref={(el) => {
                    const entry = (outlineRefs.current[item.id] ??= {
                      a: null,
                      b: null,
                    });
                    entry.b = el;
                  }}
                />
              </svg>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* A keyed enter animation swaps instantly on interrupt, so the panel can
          never show the previous pillar or service. */}
      <m.div
        key={pillar.id}
        id={`${pillar.id}-panel`}
        role="tabpanel"
        aria-labelledby={`${pillar.id}-tab`}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <div className="pillar__intro">
          <p className="p">{pillar.intro}</p>
        </div>

        <div className="pillar">
          <div
            className="service-list"
            role="group"
            aria-label={`${pillar.label} services`}
          >
            {pillar.services.map((item) => (
              <button
                key={item.id}
                type="button"
                className="service-option"
                aria-pressed={item.id === service.id}
                onClick={() => selectService(pillar.id, item.id)}
              >
                <span className="service-option__marker" aria-hidden="true" />
                {item.name}
              </button>
            ))}
          </div>

          <div className="service-detail">
            <m.div
              key={service.id}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="stack-md"
            >
              <h3 className="h3">{service.name}</h3>
              <p className="p">{service.summary}</p>
              <ul className="service-detail__list">
                {service.gets.map((item) => (
                  <li key={item}>
                    <span
                      className="service-detail__bullet"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <div>
                <Button
                  label="Start with this"
                  variant="secondary"
                  onClick={() => startWithService(pillar.id, service.id)}
                />
              </div>
            </m.div>
          </div>
        </div>
      </m.div>
    </LazyMotion>
  );
}
