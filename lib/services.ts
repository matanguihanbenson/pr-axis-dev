export type PillarId = "design" | "build" | "automate";

export type Service = {
  id: string;
  name: string;
  summary: string;
  gets: string[];
  /** The starter price, only where a starter maps to one named service. */
  startingPrice?: string;
};

export type Pillar = {
  id: PillarId;
  step: number;
  label: string;
  intro: string;
  services: Service[];
};

export const PILLARS: Pillar[] = [
  {
    id: "design",
    step: 1,
    label: "Design",
    intro:
      "The look, the words, and the flow that make a product feel considered the first time someone meets it.",
    services: [
      {
        id: "ui-ux",
        name: "UI/UX Design",
        summary:
          "Interfaces people understand on first sight. Designed in Figma, tested with real flows, never generic.",
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
          "Visuals that carry the brand, covering social, print, and product graphics with one consistent look.",
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
          "A name, a look, and a voice that hold together everywhere the company shows up.",
        gets: [
          "A logo set that holds up at any size, from favicon to signage",
          "Colors and type chosen to work together, not picked one by one",
          "Simple usage rules, so anyone can keep the brand consistent",
        ],
      },
      {
        id: "video",
        name: "Video & Motion",
        summary:
          "Short motion pieces that explain the product faster than a paragraph can.",
        gets: [
          "A short piece that explains the product faster than a paragraph",
          "Cut to work on the site and on social, not just one place",
          "Storyboarded first, so you approve the idea before the animation",
        ],
      },
      {
        id: "audit",
        name: "Design Audit",
        summary:
          "A professional review of your website or app. Every place visitors get confused or stuck, listed and ranked, with how to fix each one.",
        startingPrice: "from $300",
        gets: [
          "Every place visitors get confused or stuck, listed and ranked by impact",
          "A fix for each finding, in plain language",
          "One report you can hand to any developer to act on",
        ],
      },
    ],
  },
  {
    id: "build",
    step: 2,
    label: "Build",
    intro:
      "Websites, web apps, mobile apps, and internal systems. Fast, built to last, and shaped around how your business actually works.",
    services: [
      {
        id: "websites",
        name: "Websites",
        summary:
          "A fast site that introduces your business and shows visitors what you do, so they understand it in seconds.",
        startingPrice: "from $500",
        gets: [
          "A fast site that says what you do in the first screen",
          "Built search-ready, with the titles and descriptions in place",
          "A clear path from visitor to inquiry on every page",
        ],
      },
      {
        id: "web-apps",
        name: "Web Apps",
        summary:
          "Working products in the browser: dashboards, tools, and systems your team actually uses.",
        gets: [
          "A working product in the browser: dashboards, tools, and systems",
          "Built around your team's actual workflow, not a generic template",
          "Something your team can use on day one, not just look at",
        ],
      },
      {
        id: "mobile-apps",
        name: "Mobile Apps",
        summary:
          "Apps for iOS and Android from one codebase, designed for one-handed real life.",
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
          "Internal systems that replace spreadsheets and manual work, one source of truth, not five.",
        gets: [
          "One source of truth replacing spreadsheets and manual work",
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
      "The repetitive work, handled on its own: inquiries caught, follow-ups sent, records kept clean.",
    services: [
      {
        id: "lead-capture",
        name: "Lead Capture Agent",
        summary:
          "Catches every inquiry and puts it in one place, the moment it arrives.",
        gets: [
          "Your team stops doing the same task by hand. The system does it, the same way, every time.",
          "Every inquiry, in one place, the moment it arrives",
          "Each lead logged with where it came from",
        ],
      },
      {
        id: "follow-up",
        name: "Follow-up Agent",
        summary:
          "Sends the follow-up at the right time, so no inquiry goes unanswered.",
        gets: [
          "The right follow-up, at the right time, without anyone remembering to send it",
          "No inquiry sits unanswered because a day slipped by",
          "Every follow-up logged, so you can see what went out",
        ],
      },
      {
        id: "research",
        name: "Data & Research Agent",
        summary:
          "Gathers the facts on a lead or a market and hands you a short brief, not a pile of tabs.",
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
          "Turns the week's numbers into a short summary: what happened, what matters, what's next.",
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
          "Keeps your records clean, logs every interaction, and shows what needs a follow-up and what is falling through, automatically.",
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
    name: "Design audit",
    price: "from $300",
    line: "Your site or app reviewed, with every sticking point and its fix.",
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
