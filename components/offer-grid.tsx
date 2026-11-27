"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { formatMoney, PILLARS } from "@/lib/services";
import type { PillarId, Service } from "@/lib/services";
import { usePillar } from "./pillar-context";

// One line-mark per service, drawn in the same hairline language as the page.
const ICONS: Record<string, ReactNode> = {
  "ui-ux": (
    <>
      <rect x="2.5" y="3.5" width="11" height="8" rx="1.5" />
      <path d="M2.5 6.5h11M5.5 14h5" />
    </>
  ),
  graphics: (
    <>
      <path d="M2.5 12.5 8 3.5l5.5 9z" />
      <circle cx="8" cy="9.8" r="1.4" />
    </>
  ),
  brand: (
    <>
      <path d="M8 2.5v11M2.5 8h11M4.2 4.2l7.6 7.6M11.8 4.2 4.2 11.8" />
    </>
  ),
  redesign: (
    <>
      <path d="M2.8 8a5.2 5.2 0 1 1 1.5 3.7" />
      <path d="M2.5 4.6v3.6h3.6" />
    </>
  ),
  websites: (
    <>
      <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
      <path d="M2 6.2h12" />
    </>
  ),
  "web-apps": (
    <>
      <rect x="2" y="2.5" width="4.8" height="11" rx="1" />
      <rect x="9.2" y="2.5" width="4.8" height="4.8" rx="1" />
      <rect x="9.2" y="9.2" width="4.8" height="4.3" rx="1" />
    </>
  ),
  "mobile-apps": (
    <>
      <rect x="5" y="2" width="6" height="12" rx="1.6" />
      <path d="M7.4 12.2h1.2" />
    </>
  ),
  systems: (
    <>
      <rect x="2.5" y="2.5" width="8" height="8" rx="1.2" />
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.2" />
    </>
  ),
  "lead-capture": (
    <>
      <path d="M2.5 3.5h11l-4.2 5v5l-2.6 1.5v-6.5z" />
    </>
  ),
  "follow-up": (
    <>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 5.2V8l2 1.4" />
    </>
  ),
  research: (
    <>
      <circle cx="7" cy="7" r="3.6" />
      <path d="M9.9 9.9 13.5 13.5M5.4 7h3.2M7 5.4v3.2" />
    </>
  ),
  reporting: (
    <>
      <path d="M3.5 13V8.5M8 13V4.5M12.5 13V10M2.5 13h11" />
    </>
  ),
  crm: (
    <>
      <rect x="2.5" y="3.5" width="11" height="9" rx="1.5" />
      <path d="M5 7h4M5 9.5h6" />
    </>
  ),
};

function ServiceIcon({ id }: { id: string }) {
  return (
    <svg
      className="offer-card__icon"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[id] ?? ICONS.systems}
    </svg>
  );
}

type FilterId = "all" | PillarId;

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  ...PILLARS.map((pillar) => ({ id: pillar.id, label: pillar.label })),
];

export function OfferGrid() {
  const { selectService } = usePillar();
  const [filter, setFilter] = useState<FilterId>("all");
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const syncEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setAtStart(track.scrollLeft <= 1);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 1);
  }, []);

  // A narrower filter means fewer cards, which can make the track fit again.
  useEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = 0;
    const frame = requestAnimationFrame(syncEdges);
    return () => cancelAnimationFrame(frame);
  }, [filter, syncEdges]);

  useEffect(() => {
    syncEdges();
    window.addEventListener("resize", syncEdges);
    return () => window.removeEventListener("resize", syncEdges);
  }, [syncEdges]);

  const step = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".offer-card");
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 16;
    const distance = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({
      left: direction * distance,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  const openInPillar = (pillarId: PillarId, serviceId: string) => {
    selectService(pillarId, serviceId);
    const target = document.getElementById("services");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  };

  const card = (pillarId: PillarId, pillarLabel: string, service: Service) => (
    <a
      key={`${pillarId}-${service.id}`}
      className="offer-card"
      href="#services"
      onClick={(event) => {
        event.preventDefault();
        openInPillar(pillarId, service.id);
      }}
    >
      <span className="offer-card__top">
        <span className="offer-card__icon-frame">
          <ServiceIcon id={service.id} />
        </span>
        <span className="offer-card__pillar">{pillarLabel}</span>
        <span className="offer-card__price">
          from {formatMoney(service.price.from)}
        </span>
      </span>
      <h4 className="offer-card__name">{service.name}</h4>
      <span className="offer-card__body">
        <p className="p">{service.summary}</p>
        <div className="offer-card__gets-block">
          <span className="offer-card__label">What you get</span>
          <ul className="offer-card__gets">
            {service.gets.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </span>
      <span className="offer-card__foot">
        <span className="offer-card__link">See details</span>
        <svg
          className="offer-card__arrow"
          viewBox="0 0 12 12"
          aria-hidden="true"
          focusable="false"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 6h7.5M6.5 3l3 3-3 3" />
        </svg>
      </span>
    </a>
  );

  const ctaCard = (
    <a className="offer-card offer-card--cta" href="#contact">
      <span className="offer-card__top">
        <span className="offer-card__icon-frame">
          <svg
            className="offer-card__icon"
            viewBox="0 0 16 16"
            aria-hidden="true"
            focusable="false"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3v10M3 8h10" />
          </svg>
        </span>
        <span className="offer-card__pillar">Any service</span>
      </span>
      <h4 className="offer-card__name">Not sure yet?</h4>
      <span className="offer-card__body">
        <p className="p">Tell us what you need and we will take it from there.</p>
      </span>
      <span className="offer-card__foot">
        <span className="offer-card__link">Go to the form</span>
        <svg
          className="offer-card__arrow"
          viewBox="0 0 12 12"
          aria-hidden="true"
          focusable="false"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 6h7.5M6.5 3l3 3-3 3" />
        </svg>
      </span>
    </a>
  );

  const somethingElseCard = (
    <a className="offer-card offer-card--cta" href="#contact">
      <span className="offer-card__top">
        <span className="offer-card__icon-frame">
          <svg
            className="offer-card__icon"
            viewBox="0 0 16 16"
            aria-hidden="true"
            focusable="false"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 13 13 3M6 3h7v7" />
          </svg>
        </span>
        <span className="offer-card__pillar">Custom work</span>
      </span>
      <h4 className="offer-card__name">Something else?</h4>
      <span className="offer-card__body">
        <p className="p">
          Tell us what you have in mind and we will scope it with you.
        </p>
      </span>
      <span className="offer-card__foot">
        <span className="offer-card__link">Go to the form</span>
        <svg
          className="offer-card__arrow"
          viewBox="0 0 12 12"
          aria-hidden="true"
          focusable="false"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 6h7.5M6.5 3l3 3-3 3" />
        </svg>
      </span>
    </a>
  );

  const visible = PILLARS.filter(
    (pillar) => filter === "all" || pillar.id === filter,
  ).flatMap((pillar) =>
    pillar.services.map((service) => card(pillar.id, pillar.label, service)),
  );

  return (
    <div className="offer">
      <div className="offer-toolbar">
        <div className="offer-filters" role="group" aria-label="Filter services">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="offer-filter"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="offer-controls">
          <button
            type="button"
            className="offer-control"
            aria-label="Previous services"
            onClick={() => step(-1)}
            disabled={atStart}
          >
            <svg
              viewBox="0 0 12 12"
              aria-hidden="true"
              focusable="false"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7.5 2 3.5 6l4 4" />
            </svg>
            <span className="offer-control__label">Prev</span>
          </button>
          <button
            type="button"
            className="offer-control"
            aria-label="Next services"
            onClick={() => step(1)}
            disabled={atEnd}
          >
            <span className="offer-control__label">Next</span>
            <svg
              viewBox="0 0 12 12"
              aria-hidden="true"
              focusable="false"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4.5 2 8.5 6l-4 4" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className="offer-track"
        ref={trackRef}
        onScroll={syncEdges}
        role="region"
        aria-label="Services"
      >
        {visible}
        {ctaCard}
        {somethingElseCard}
      </div>
    </div>
  );
}
