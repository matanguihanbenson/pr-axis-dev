"use client";

import { useEffect, useRef, useState } from "react";
import { PILLARS, type PillarId } from "@/lib/services";
import { usePillar } from "./pillar-context";

type SectionId = "services" | "offer" | "pricing";

const NAV_ITEMS: {
  href: string;
  label: string;
  section: SectionId;
  pillar?: PillarId;
}[] = [
  {
    href: "#design",
    label: PILLARS[0].label,
    section: "services",
    pillar: PILLARS[0].id,
  },
  {
    href: "#build",
    label: PILLARS[1].label,
    section: "services",
    pillar: PILLARS[1].id,
  },
  {
    href: "#automate",
    label: PILLARS[2].label,
    section: "services",
    pillar: PILLARS[2].id,
  },
  { href: "#offer", label: "What we offer", section: "offer" },
  { href: "#pricing", label: "Pricing", section: "pricing" },
];

function Arrow() {
  return (
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
  );
}

export function SiteHeader() {
  const { pillarId, setPillar } = usePillar();
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Scroll spy: a link is active while its section sits under the sticky
  // header. The three pillars share one section, so the open pillar decides
  // which of them is lit. Anywhere else (hero, work, process, contact) none is.
  //
  // An anchor parks its section at that section's scroll-margin-top, not at
  // the header's edge, so the probe line has to sit there too; otherwise a
  // clicked section is still below the line and nothing lights until the
  // visitor scrolls a little further by hand.
  useEffect(() => {
    const sections = (["services", "offer", "pricing"] as SectionId[])
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (!sections.length) return;

    let disposed = false;

    const measure = () => {
      if (disposed) return;

      const header = document.querySelector<HTMLElement>(".site-header");
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      const margin =
        parseFloat(getComputedStyle(sections[0]).scrollMarginTop) || 0;
      // A couple of pixels of slack absorbs sub-pixel landing positions.
      const line = Math.max(headerHeight + 8, margin) + 2;

      let current: SectionId | null = null;
      for (const section of sections) {
        const box = section.getBoundingClientRect();
        if (box.top <= line && box.bottom > line) {
          current = section.id as SectionId;
          break;
        }
      }

      // The final block can be too short for the page to scroll it up to the
      // line (and a click cannot go further than the document end). At the
      // bottom, whichever nav section is still on screen owns the state.
      if (!current) {
        const atBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 2;
        if (atBottom) {
          const onScreen = sections.filter((section) => {
            const box = section.getBoundingClientRect();
            return box.top < window.innerHeight && box.bottom > line;
          });
          const last = onScreen[onScreen.length - 1];
          if (last) current = last.id as SectionId;
        }
      }

      setActiveSection((previous) => (previous === current ? previous : current));
    };

    // Measure on the event itself rather than in an animation frame: a
    // throttled tab can stop running frames, and the state must be right when
    // the visitor looks at it. Three rect reads per event is cheap.
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("scrollend", measure);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    window.addEventListener("hashchange", measure);

    // Late webfonts, images and reveals can move sections without a scroll.
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    document.fonts.ready.then(measure).catch(() => {});

    return () => {
      disposed = true;
      window.removeEventListener("scroll", measure);
      window.removeEventListener("scrollend", measure);
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      window.removeEventListener("hashchange", measure);
      observer.disconnect();
    };
  }, []);

  // The mobile menu only exists below the desktop breakpoint. If the window
  // grows past it while the menu is open, drop the menu so the layout cannot
  // get stuck in its expanded state.
  useEffect(() => {
    if (!menuOpen) return;
    const desktop = window.matchMedia("(min-width: 901px)");
    const onChange = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    onChange();
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [menuOpen]);

  // Escape closes the menu and hands focus back to the button that opened it.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const isActive = (item: (typeof NAV_ITEMS)[number]) =>
    item.section === activeSection &&
    (item.pillar ? item.pillar === pillarId : true);

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

  const closeMenu = () => setMenuOpen(false);

  const renderLink = (
    item: (typeof NAV_ITEMS)[number],
    onNavigate?: () => void,
  ) => (
    <a
      key={item.href}
      href={item.href}
      aria-current={isActive(item) ? "true" : undefined}
      onClick={(event) => {
        if (item.pillar) goToPillar(event, item.pillar);
        onNavigate?.();
      }}
    >
      {item.label}
    </a>
  );

  return (
    <header className="site-header">
      <div className="page-shell site-header__inner">
        <a className="wordmark" href="#top" onClick={closeMenu}>
          pr-axis<span> dev</span>
        </a>

        <nav className="site-nav" aria-label="Sections">
          {NAV_ITEMS.map((item) => renderLink(item))}
        </nav>

        <div className="site-header__actions">
          <a className="nav-cta" href="#contact">
            Work with us
            <Arrow />
          </a>

          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="menu-toggle__bars" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div className="site-menu" id="site-menu" data-open={menuOpen}>
        <div className="site-menu__clip">
          <div className="site-menu__inner">
            <nav className="site-menu__nav" aria-label="Sections">
              {NAV_ITEMS.map((item) => renderLink(item, closeMenu))}
            </nav>
            <a
              className="nav-cta nav-cta--block"
              href="#contact"
              onClick={closeMenu}
            >
              Work with us
              <Arrow />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
