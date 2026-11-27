"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@astryxdesign/core/Card";
import { formatMoney, STARTERS } from "@/lib/services";
import {
  PACKAGES,
  formatAddOnPrice,
  packageSaving,
  packageTotal,
} from "@/lib/packages";
import type { Bundle } from "@/lib/packages";

const WHO = {
  launch: "For a new business that needs to be online, and taking inquiries, this month.",
  branding:
    "For a business that needs a brand it can use from day one, not a logo sitting in a folder.",
  "social-media":
    "For a business posting on social where every post looks like it came from a different company.",
  crm: "For a business that loses track of leads and only finds out when the deal is gone.",
  "rebrand-rebuild":
    "For a business whose look and site no longer match what it actually sells.",
  "full-automate":
    "For a business that wants the repetitive work handled end to end.",
} as const;

function CheckMark() {
  return (
    <svg
      className="package-card__check"
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.2 6.2 4.8 8.8 9.8 3.4" />
    </svg>
  );
}

function PackageCard({ bundle, index }: { bundle: Bundle; index: number }) {
  const total = packageTotal(bundle);
  const saving = packageSaving(bundle);
  const percent = Math.round((saving / total) * 100);
  const who = WHO[bundle.slug as keyof typeof WHO] ?? bundle.who;

  return (
    <article className="package-card">
      <div className="package-card__head">
        <span className="package-card__index">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="package-card__save">Save {formatMoney(saving)}</span>
      </div>

      <div className="package-card__intro">
        <h3 className="h3 package-card__name">{bundle.name}</h3>
        <p className="p package-card__who">{who}</p>
      </div>

      <div className="package-card__price-block">
        <div className="package-card__price-row">
          <span className="package-card__price">
            {formatMoney(bundle.price)}
          </span>
          <span className="package-card__was">
            <s>{formatMoney(total)}</s> separately
          </span>
        </div>
        <p className="package-card__save-line">
          {percent}% less than booking the parts on their own.
        </p>
      </div>

      <div className="package-card__section">
        <span className="package-card__label">Inside</span>
        <ul className="package-card__includes">
          {bundle.contents.map((item) => (
            <li key={item.label}>
              <CheckMark />
              <span className="package-card__include-label">{item.label}</span>
              <span className="package-card__include-price">
                {formatMoney(item.price)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="package-card__section package-card__section--addons">
        <span className="package-card__label">Add-ons</span>
        <ul className="package-card__list package-card__list--muted">
          {bundle.addOns.map((addOn) => (
            <li key={addOn.label}>
              <span>{addOn.label}</span>
              <span>{formatAddOnPrice(addOn)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="package-card__actions">
        <Link
          className="package-card__start"
          href={`/?package=${bundle.slug}#contact`}
        >
          Start with this package
        </Link>
        <Link className="package-card__demo" href={`/${bundle.slug}`}>
          See it work
          <svg
            className="package-card__arrow"
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
        </Link>
      </div>
    </article>
  );
}

function Arrow({ direction }: { direction: "prev" | "next" }) {
  return (
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
      <path d={direction === "prev" ? "M7.5 2 3.5 6l4 4" : "M4.5 2 8.5 6l-4 4"} />
    </svg>
  );
}

export function PricingSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [fill, setFill] = useState({ width: 100, left: 0 });

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setAtStart(track.scrollLeft <= 1);
    setAtEnd(max <= 1 || track.scrollLeft >= max - 1);

    const visible = Math.min(1, track.clientWidth / track.scrollWidth);
    const width = visible * 100;
    const left = max <= 1 ? 0 : (track.scrollLeft / max) * (100 - width);
    setFill({ width, left });
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync]);

  const step = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".package-card");
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 16;
    const distance = card
      ? card.getBoundingClientRect().width + gap
      : track.clientWidth;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({
      left: direction * distance,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  return (
    <section className="section" id="pricing">
      <div className="page-shell">
        <div className="section-head" data-reveal>
          <span className="eyebrow">Pricing</span>
          <h2 className="h2">Starter prices</h2>
          <p className="p">
            Fixed prices for the smallest version of each service. Anything
            bigger gets a custom quote once we&apos;ve seen what you need.
          </p>
        </div>

        <div className="starter-grid">
          {STARTERS.map((starter) => (
            <Card key={starter.name} padding={4}>
              <div className="stack-sm">
                <h3 className="h4">{starter.name}</h3>
                <span className="starter__price">{starter.price}</span>
                <p className="p">{starter.line}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="packages-head" data-reveal>
          <div className="packages-head__text">
            <span className="eyebrow">Bundles</span>
            <h3 className="h2">Packages</h3>
            <p className="p">
              Some work belongs together. Take a bundle and pay less than
              booking each piece on its own.
            </p>
          </div>

          <div className="packages-head__controls">
            <span className="packages-count">
              {PACKAGES.length} packages
            </span>
            <button
              type="button"
              className="package-control"
              aria-label="Previous packages"
              aria-controls="package-track"
              onClick={() => step(-1)}
              disabled={atStart}
            >
              <Arrow direction="prev" />
            </button>
            <button
              type="button"
              className="package-control"
              aria-label="Next packages"
              aria-controls="package-track"
              onClick={() => step(1)}
              disabled={atEnd}
            >
              <Arrow direction="next" />
            </button>
          </div>
        </div>

        <div
          className="package-track"
          id="package-track"
          ref={trackRef}
          onScroll={sync}
          role="region"
          aria-label="Packages"
          tabIndex={0}
        >
          {PACKAGES.map((bundle, index) => (
            <PackageCard key={bundle.slug} bundle={bundle} index={index} />
          ))}
        </div>

        <div className="package-rail" aria-hidden="true">
          <span
            className="package-rail__fill"
            style={{ width: `${fill.width}%`, left: `${fill.left}%` }}
          />
        </div>

        <p className="p pricing-note">
          Every price here is an estimate, not a quote. We look at the scope
          first, then confirm the final number before any work starts. Bigger
          projects get their own quote. One project, one price: no
          subscriptions, no per-seat fees.
        </p>
      </div>
    </section>
  );
}
