import { PILLARS, formatRange } from "./services";

export type EstimateService = {
  key: string;
  name: string;
  from: number;
  to: number;
  range: string;
};

export const ESTIMATE_SERVICES: EstimateService[] = PILLARS.flatMap((pillar) =>
  pillar.services.map((service) => ({
    key: `${pillar.id}:${service.id}`,
    name: service.name,
    from: service.price.from,
    to: service.price.to,
    range: formatRange(service.price),
  })),
);
