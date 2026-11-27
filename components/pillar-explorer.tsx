"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { PILLARS, formatServicePrice, type PillarId } from "@/lib/services";
import { usePillar } from "./pillar-context";

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

  const stepperRef = useRef<HTMLDivElement>(null);
  const sparkRef = useRef<HTMLSpanElement>(null);
  const padRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const outlineRefs = useRef<
    Record<string, { a: SVGPathElement | null; b: SVGPathElement | null }>
  >({});
  const previousPillar = useRef<PillarId | null>(null);
  // Which border is currently lit: follows pillarId, a beat behind the spark.
  const [lit, setLit] = useState<PillarId>(pillarId);

  const serviceListRef = useRef<HTMLDivElement>(null);
  // Vertical centre of the chosen service row, in the list's coordinates.
  const [markerY, setMarkerY] = useState<number | null>(null);
  // The neighbouring ticks only stretch while the marker is travelling.
  const [moving, setMoving] = useState(false);
  const seenService = useRef(false);

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

  // Keep the long tick on the chosen service through resizes and late
  // webfonts. One marker moves between rows, so the swap reads as a single
  // continuous motion rather than a blink between two states.
  useEffect(() => {
    const list = serviceListRef.current;
    if (!list) return;

    const place = () => {
      const active = list.querySelector<HTMLElement>(
        '.service-option[aria-pressed="true"]',
      );
      if (!active) return;
      setMarkerY(active.offsetTop + active.offsetHeight / 2);
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(list);
    list
      .querySelectorAll<HTMLElement>(".service-option")
      .forEach((row) => observer.observe(row));
    window.addEventListener("resize", place);
    // The list flips between a vertical ruler and a horizontal carousel.
    const layout = window.matchMedia("(max-width: 900px)");
    layout.addEventListener("change", place);
    void document.fonts?.ready.then(place);
    // A pillar switch mounts a new list; settle once the rows have layout.
    let frame = 0;
    const settle = () => {
      frame = window.requestAnimationFrame(() => {
        frame = window.requestAnimationFrame(place);
      });
    };
    settle();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", place);
      layout.removeEventListener("change", place);
    };
  }, [pillar, service.id]);

  // Stretch the ticks that touch the marker while it travels, then let them
  // settle back once it lands on the new row.
  useEffect(() => {
    if (!seenService.current) {
      seenService.current = true;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setMoving(true);
    const timer = window.setTimeout(() => setMoving(false), 470);
    return () => window.clearTimeout(timer);
  }, [service.id]);

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

  // On small screens the list is a horizontal carousel: keep the chosen
  // service centred, with the strip scrolling under it.
  useEffect(() => {
    const list = serviceListRef.current;
    if (!list) return;

    const layout = window.matchMedia("(max-width: 900px)");
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const center = (behavior: ScrollBehavior) => {
      if (!layout.matches) return;
      const active = list.querySelector<HTMLElement>(
        '.service-option[aria-pressed="true"]',
      );
      if (!active) return;
      const target =
        active.offsetLeft + active.offsetWidth / 2 - list.clientWidth / 2;
      list.scrollTo({ left: Math.max(0, target), behavior });
    };
    const glide = () => center(reduce ? "auto" : "smooth");

    const frame = window.requestAnimationFrame(glide);
    // The chosen row grows a little, so settle once that size has landed.
    const settle = window.setTimeout(glide, 260);
    // A breakpoint switch reflows the strip: jump straight to the centre.
    const onLayoutChange = () => center("instant");
    layout.addEventListener("change", onLayoutChange);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      layout.removeEventListener("change", onLayoutChange);
    };
  }, [service.id, pillar]);

  // Dragging the strip until an item sits under the middle of the ruler makes
  // that service active, so a swipe and a tap end in the same place.
  useEffect(() => {
    const list = serviceListRef.current;
    if (!list) return;
    const layout = window.matchMedia("(max-width: 900px)");

    const pickCentred = () => {
      if (!layout.matches) return;
      const middle = list.scrollLeft + list.clientWidth / 2;
      const rows = Array.from(
        list.querySelectorAll<HTMLElement>(".service-option"),
      );
      let closest: HTMLElement | null = rows[0] ?? null;
      let distance = Infinity;
      for (const row of rows) {
        const next = Math.abs(row.offsetLeft + row.offsetWidth / 2 - middle);
        if (next < distance) {
          distance = next;
          closest = row;
        }
      }
      const id = closest?.dataset.serviceId;
      if (id && id !== service.id) selectService(pillar.id, id);
    };

    let timer = 0;
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(pickCentred, 160);
    };

    list.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      list.removeEventListener("scroll", onScroll);
    };
  }, [pillar, service.id, selectService]);

  // Extend each ruler line in turn as the blue tick sweeps past it, then let
  // it fall back to its normal width a beat later. Lines further along the
  // path start later, so the extensions travel with the blue tick.
  const playTrail = (from: number | null, to: number) => {
    if (from === null || from === to) return;
    if (window.matchMedia("(max-width: 900px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const list = serviceListRef.current;
    if (!list) return;

    const span = to - from;
    list.querySelectorAll<HTMLElement>(".service-list__tick").forEach((tick) => {
      const progress = (Number(tick.dataset.y ?? 0) - from) / span;
      // The two lines touching the resting blue tick are the marker's own.
      if (progress <= 0.02 || progress >= 1) return;

      const base = tick.dataset.major === "true" ? 13 : 7;
      tick.getAnimations().forEach((animation) => animation.cancel());
      tick.animate(
        [
          { width: `${base}px` },
          { width: "16px", offset: 0.45 },
          { width: "16px", offset: 0.62 },
          { width: `${base}px` },
        ],
        {
          duration: 280,
          delay: progress * 380,
          easing: "ease-in-out",
        },
      );
    });
  };

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
    <>
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

      {/* Keyed, so the CSS enter animation swaps instantly on interrupt and
          the panel can never show the previous pillar or service. */}
      <div
        key={pillar.id}
        id={`${pillar.id}-panel`}
        role="tabpanel"
        aria-labelledby={`${pillar.id}-tab`}
        className="pillar-panel"
      >
        <div className="pillar__intro">
          {pillar.panelNote ? (
            <p className="p p--strong">{pillar.panelNote}</p>
          ) : null}
          <p className="p">{pillar.intro}</p>
        </div>

        <div className="pillar">
          <div className="service-carousel">
            <span className="service-list__ruler" aria-hidden="true" />
            <span className="service-list__carriage" aria-hidden="true">
              <span className="service-list__carriage-neighbor service-list__carriage-neighbor--left" />
              <span className="service-list__carriage-neighbor service-list__carriage-neighbor--right" />
            </span>
            <div
              className="service-list"
              ref={serviceListRef}
              role="group"
              aria-label={`${pillar.label} services`}
            >
            <span className="service-list__scale" aria-hidden="true">
              {Array.from(
                { length: pillar.services.length * 6 },
                (_, index) => (
                  <span
                    key={index}
                    className="service-list__tick"
                    data-major={index % 6 === 0}
                    data-y={index * 8}
                    style={{ top: index * 8 }}
                  />
                ),
              )}
            </span>
            <span
              className="service-list__aura"
              aria-hidden="true"
              data-ready={markerY !== null}
              data-moving={moving}
              style={
                markerY === null
                  ? undefined
                  : { transform: `translateY(${markerY}px)` }
              }
            >
              <span className="service-list__step service-list__step--up" />
              <span className="service-list__step service-list__step--down" />
            </span>
            <span
              className="service-list__marker"
              aria-hidden="true"
              data-ready={markerY !== null}
              style={
                markerY === null
                  ? undefined
                  : { transform: `translateY(${markerY - 1}px)` }
              }
            />
            {pillar.services.map((item) => (
              <button
                key={item.id}
                type="button"
                className="service-option"
                data-service-id={item.id}
                aria-pressed={item.id === service.id}
                onClick={(event) => {
                  const row = event.currentTarget;
                  playTrail(markerY, row.offsetTop + row.offsetHeight / 2);
                  selectService(pillar.id, item.id);
                }}
              >
                {item.name}
              </button>
            ))}
            </div>
          </div>

          <div className="service-detail">
            <div key={service.id} className="stack-md service-detail__body">
              <h3 className="h3">{service.name}</h3>
              <p className="p">{service.summary}</p>
              <p className="service-detail__price">
                {formatServicePrice(service)}
                {service.note ? `, ${service.note.toLowerCase()}` : null}
              </p>
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
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
