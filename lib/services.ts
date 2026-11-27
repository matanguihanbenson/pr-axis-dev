export type PillarId = "design" | "build" | "automate";

export type MoneyRange = { from: number; to: number };

export type Service = {
  id: string;
  name: string;
  summary: string;
  gets: string[];
  /** Smallest scope to largest scope, in USD. */
  price: MoneyRange;
  /** An extra line for a service whose entry price is not the whole story. */
  note?: string;
  /** Short log lines for the animated agent console. */
  scene?: string[];
};

export type Pillar = {
  id: PillarId;
  step: number;
  label: string;
  intro: string;
  /** A line shown above the intro, used by the Automate panel. */
  panelNote?: string;
  services: Service[];
};

export const PILLARS: Pillar[] = [
  {
    id: "design",
    step: 1,
    label: "Design",
    intro:
      "How it looks, how it reads, and how it moves. Settled before build, so the first impression holds up long after the scroll.",
    services: [
      {
        id: "ui-ux",
        name: "UI/UX Design",
        summary:
          "Screens people understand on first sight. Every layout follows what someone came to do, not what looked good in the deck.",
        price: { from: 600, to: 1500 },
        gets: [
          "A clickable Figma design to approve before anything is built",
          "Every screen mapped to what a visitor is actually trying to do",
          "Layouts that work on a phone first, then scale up to desktop",
        ],
      },
      {
        id: "graphics",
        name: "Graphics Design",
        summary:
          "One visual language across social, print, and product, so the brand looks like itself wherever it lands.",
        price: { from: 250, to: 800 },
        gets: [
          "One consistent look across social, print, and product graphics",
          "Files delivered in the formats you need to use them",
          "A visual style that still looks like you a year from now",
        ],
      },
      {
        id: "brand",
        name: "Brand Design",
        summary:
          "A name, a mark, and a voice that still sound like you a year from now, not just at the pitch.",
        price: { from: 400, to: 1200 },
        gets: [
          "A logo set that holds up at any size, from favicon to signage",
          "Colors and type chosen to work together, not picked one by one",
          "Simple usage rules, so anyone can keep the brand consistent",
        ],
      },
      {
        id: "redesign",
        name: "Redesign",
        summary:
          "For the site that looks dated and behaves worse. First a free audit, then the rebuild it actually needs, not another coat of paint.",
        price: { from: 800, to: 2500 },
        note: "The audit is free.",
        gets: [
          "A free audit of the site or system, every sticking point ranked by impact",
          "New screens and flows, a full redesign, not a patch",
          "Handed over ready to build",
        ],
      },
    ],
  },
  {
    id: "build",
    step: 2,
    label: "Build",
    intro:
      "Sites, apps, and internal tools. Fast to use, boring to maintain, and shaped around the work your team already does.",
    services: [
      {
        id: "websites",
        name: "Websites",
        summary:
          "A site that explains the business in seconds and gives every visitor an obvious next step.",
        price: { from: 500, to: 2000 },
        gets: [
          "A site that loads fast and says what you do without making people hunt for it",
          "Built search-ready, with the titles and descriptions in place",
          "A clear path from visitor to inquiry on every page",
        ],
      },
      {
        id: "web-apps",
        name: "Web Apps",
        summary:
          "The dashboard, the tool, the system your team opens every morning because it makes the day shorter.",
        price: { from: 1500, to: 5000 },
        gets: [
          "A working product in the browser, not a clickable mockup",
          "Built around your team's actual workflow, not a generic template",
          "Something your team can use on day one, not just look at",
        ],
      },
      {
        id: "mobile-apps",
        name: "Mobile Apps",
        summary:
          "One app for both stores, built for the hand holding it, not for the demo screen.",
        price: { from: 1800, to: 5000 },
        gets: [
          "One codebase for iOS and Android",
          "Designed for one-handed, real-life use",
          "App-store-ready build, not a prototype",
        ],
      },
      {
        id: "systems",
        name: "Systems",
        summary:
          "Spreadsheets out, one source of truth in. The workflow your team already follows, with the chaos removed.",
        price: { from: 1200, to: 4000 },
        gets: [
          "Every record in one place, replacing the spreadsheet sprawl",
          "The workflow your team actually follows, built into the system",
          "Handed over with a walkthrough, so nobody is left guessing",
        ],
      },
    ],
  },
  {
    id: "automate",
    step: 3,
    label: "Automate",
    intro:
      "Inquiries caught, follow-ups sent, records kept clean. The repetitive half of the week, handled quietly in the background.",
    panelNote:
      "The work that never changes should never need a person. We hand it to a system that runs the same way every single time.",
    services: [
      {
        id: "lead-capture",
        name: "Lead Capture Agent",
        summary:
          "Every inquiry caught, whichever door it came through, and dropped in one place before it goes cold.",
        price: { from: 400, to: 900 },
        scene: ["Inquiry received", "Contact captured", "Source logged"],
        gets: [
          "No inquiry sitting in an inbox nobody checked",
          "Nothing lost between inbox, form, and chat",
          "Each lead logged with where it came from",
        ],
      },
      {
        id: "follow-up",
        name: "Follow-up Agent",
        summary:
          "The follow-up that goes out because the system remembered, not because someone had a spare minute.",
        price: { from: 400, to: 900 },
        scene: ["Follow-up due", "Draft prepared", "Message sent"],
        gets: [
          "The right follow-up, at the right time, without anyone remembering to send it",
          "No inquiry goes unanswered because a day slipped by",
          "Every follow-up logged, so you can see what went out",
        ],
      },
      {
        id: "research",
        name: "Data & Research Agent",
        summary:
          "The facts on a lead or a market, gathered while you do something else, handed over as one short brief.",
        price: { from: 400, to: 1000 },
        scene: ["Brief requested", "Sources checked", "Summary ready"],
        gets: [
          "A short brief on a lead or a market, not a pile of open tabs",
          "The facts that matter for the decision, gathered for you",
          "Sources noted, so you can check anything that looks off",
        ],
      },
      {
        id: "reporting",
        name: "Reporting Agent",
        summary:
          "The week's numbers written up before you ask, in the same shape every time.",
        price: { from: 400, to: 900 },
        scene: ["Week closed", "Numbers gathered", "Report posted"],
        gets: [
          "The week's numbers as a short summary: what happened, what matters, what's next",
          "No more opening five tools to answer one question",
          "The same report, the same shape, every week",
        ],
      },
      {
        id: "crm",
        name: "CRM & Insights Agent",
        summary:
          "Your records kept honest, every interaction logged, and the follow-ups that are slipping surfaced before they disappear.",
        price: { from: 500, to: 1200 },
        scene: ["Activity logged", "Record updated", "Gap flagged"],
        gets: [
          "Records kept clean, with every interaction logged automatically",
          "A clear view of response times, follow-up gaps, and conversion trends",
          "A short list of what needs a follow-up, and what is falling through",
        ],
      },
    ],
  },
];

export const ALL_SERVICES = PILLARS.flatMap((pillar) =>
  pillar.services.map((service) => ({
    pillarId: pillar.id,
    pillarLabel: pillar.label,
    service,
  })),
);

export function findService(pillarId: PillarId, serviceId: string) {
  return PILLARS.find((p) => p.id === pillarId)?.services.find(
    (s) => s.id === serviceId,
  );
}

export function serviceKey(pillarId: string, serviceId: string) {
  return `${pillarId}:${serviceId}`;
}

export function formatMoney(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

export function formatRange(range: MoneyRange) {
  const from = formatMoney(range.from);
  if (range.from === range.to) return from;
  return `${from} to ${formatMoney(range.to)}`;
}

export function formatServicePrice(service: Service) {
  return formatRange(service.price);
}

export const STARTERS = [
  {
    name: "One-page website",
    price: "from $500",
    line: "A single page that says what you do, loads fast, and brings the inquiry in.",
  },
  {
    name: "One automation",
    price: "from $400",
    line: "One repetitive workflow, automated from start to finish.",
  },
  {
    name: "Free audit",
    price: "Free",
    line: "Your site or app reviewed, with every sticking point ranked by impact. Redesign from $800.",
  },
];

export const PROCESS_STEPS = [
  {
    title: "We map the workflow",
    line: "What you need, how it works today, and what finished looks like.",
  },
  {
    title: "We build it",
    line: "One piece at a time, shown to you as it works, not after.",
  },
  {
    title: "We hand it over and maintain it",
    line: "It runs on its own. We keep it running.",
  },
];
