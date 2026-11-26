"use client";

import { Card } from "@astryxdesign/core/Card";
import { ALL_SERVICES } from "@/lib/services";
import { usePillar } from "./pillar-context";

export function OfferGrid() {
  const { selectService } = usePillar();

  const openInPillar = (pillarId: string, serviceId: string) => {
    selectService(pillarId as never, serviceId);
    const target = document.getElementById("services");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <div className="offer-grid">
      {ALL_SERVICES.map(({ pillarId, pillarLabel, service }) => (
        <Card key={`${pillarId}-${service.id}`} padding={4}>
          <div className="offer-card">
            <span className="offer-card__pillar">{pillarLabel}</span>
            <h3 className="h3">{service.name}</h3>
            <p className="p">{service.summary}</p>
            <a
              className="offer-card__link"
              href="#services"
              onClick={(event) => {
                event.preventDefault();
                openInPillar(pillarId, service.id);
              }}
            >
              Open in {pillarLabel}
            </a>
          </div>
        </Card>
      ))}
    </div>
  );
}
