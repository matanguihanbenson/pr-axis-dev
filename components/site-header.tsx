"use client";

import { PILLARS, type PillarId } from "@/lib/services";
import { usePillar } from "./pillar-context";

const NAV_ITEMS: { href: string; label: string; pillar?: PillarId }[] = [
  { href: "#design", label: PILLARS[0].label, pillar: PILLARS[0].id },
  { href: "#build", label: PILLARS[1].label, pillar: PILLARS[1].id },
  { href: "#automate", label: PILLARS[2].label, pillar: PILLARS[2].id },
  { href: "#offer", label: "What we offer" },
];

export function SiteHeader() {
  const { setPillar } = usePillar();

  // The pillars share one section, so their links set the pillar as well as
  // jumping to it. The href stays real, so middle-click and new tabs still work.
  const goToPillar = (event: React.MouseEvent<HTMLAnchorElement>, id: PillarId) => {
    event.preventDefault();
    setPillar(id);
    const target = document.getElementById("services");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <header className="site-header">
      <div className="page-shell site-header__inner">
        <a className="wordmark" href="#top">
          pr-axis<span> dev</span>
        </a>

        <nav className="site-nav" aria-label="Sections">
          {NAV_ITEMS.map((item) =>
            item.pillar ? (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => goToPillar(event, item.pillar as PillarId)}
              >
                {item.label}
              </a>
            ) : (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="site-header__actions">
          <a className="nav-cta" href="#contact">
            Work with us
            <svg
              className="nav-cta__arrow"
              viewBox="0 0 10 10"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M2 8 L8 2 M3.75 2 H8 V6.25"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
