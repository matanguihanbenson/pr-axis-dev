"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { PILLARS, type PillarId } from "@/lib/services";

type RequestedService = { pillarId: PillarId; serviceId: string };

type PillarContextValue = {
  pillarId: PillarId;
  serviceId: string;
  requestedService: RequestedService | null;
  setPillar: (pillarId: PillarId) => void;
  selectService: (pillarId: PillarId, serviceId: string) => void;
  startWithService: (pillarId: PillarId, serviceId: string) => void;
};

const PillarContext = createContext<PillarContextValue | null>(null);

const DEFAULT_PILLAR = PILLARS[0];

function isPillarId(value: string): value is PillarId {
  return PILLARS.some((pillar) => pillar.id === value);
}

function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({
    behavior: reduce ? "auto" : "smooth",
    block: "start",
  });
}

export function PillarProvider({ children }: { children: React.ReactNode }) {
  const [pillarId, setPillarId] = useState<PillarId>(DEFAULT_PILLAR.id);
  const [serviceId, setServiceId] = useState(
    DEFAULT_PILLAR.services[0]?.id ?? "",
  );
  const [requestedService, setRequestedService] =
    useState<RequestedService | null>(null);

  const setPillar = useCallback((next: PillarId) => {
    setPillarId(next);
    const pillar = PILLARS.find((item) => item.id === next);
    if (pillar) setServiceId(pillar.services[0]?.id ?? "");
    // Deep links (#design / #build / #automate) update without a jump.
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${next}`);
    }
  }, []);

  const selectService = useCallback((pillar: PillarId, service: string) => {
    setPillarId(pillar);
    setServiceId(service);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${pillar}`);
    }
  }, []);

  const startWithService = useCallback(
    (pillar: PillarId, service: string) => {
      selectService(pillar, service);
      setRequestedService({ pillarId: pillar, serviceId: service });
      scrollToId("contact");
    },
    [selectService],
  );

  // A shared link such as /#build opens that pillar.
  useEffect(() => {
    const applyHash = (scroll: boolean) => {
      const hash = window.location.hash.replace("#", "");
      if (!isPillarId(hash)) return;
      const pillar = PILLARS.find((item) => item.id === hash);
      if (!pillar) return;
      setPillarId(pillar.id);
      setServiceId(pillar.services[0]?.id ?? "");
      if (scroll) scrollToId("services");
    };

    applyHash(false);

    const onHashChange = () => applyHash(true);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const value = useMemo(
    () => ({
      pillarId,
      serviceId,
      requestedService,
      setPillar,
      selectService,
      startWithService,
    }),
    [
      pillarId,
      serviceId,
      requestedService,
      setPillar,
      selectService,
      startWithService,
    ],
  );

  return (
    <PillarContext.Provider value={value}>{children}</PillarContext.Provider>
  );
}

export function usePillar() {
  const context = useContext(PillarContext);
  if (!context) {
    throw new Error("usePillar must be used inside PillarProvider");
  }
  return context;
}
