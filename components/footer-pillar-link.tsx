"use client";

import type { PillarId } from "@/lib/services";
import { usePillar } from "./pillar-context";

/**
 * The footer's pillar links share one section, so they open that pillar in the
 * services panel before easing to it. The href stays a real deep link.
 */
export function FooterPillarLink({
  id,
  label,
}: {
  id: PillarId;
  label: string;
}) {
  const { setPillar } = usePillar();

  return (
    <a
      className="site-footer__link"
      href={`#${id}`}
      onClick={(event) => {
        event.preventDefault();
        setPillar(id);
        const target = document.getElementById("services");
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        target?.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });
      }}
    >
      {label}
    </a>
  );
}
