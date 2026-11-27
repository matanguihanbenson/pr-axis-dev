import { ESTIMATE_SERVICES } from "@/lib/estimate-helpers";
import { buildQuote, formatQuoteRange } from "@/lib/quote";
import { findPackage, packageSaving, packageTotal } from "@/lib/packages";
import { formatMoney } from "@/lib/services";
import { normalize, type KbEntry, type KbMatch } from "./kb";


/**
 * Turns a visitor's sentence into the same selection keys the inquiry form
 * sends, so the chatbot and the calculator answer from one quote engine.
 */

type CustomRule = {
  id: string;
  patterns: RegExp[];
  services: string[];
  labels: string[];
};

const CUSTOM_RULES: CustomRule[] = [
  {
    id: "restaurant",
    patterns: [
      /\brestaurant/,
      /\bqr\b/,
      /\bsmart menu\b/,
      /\bmenu page\b/,
      /\bordering\b/,
    ],
    services: ["build:web-apps", "design:ui-ux", "automate:crm"],
    labels: [
      "Web App (menu page, ordering, admin dashboard)",
      "UI/UX Design",
      "CRM & Insights Agent for the forecasting add-on",
    ],
  },
  {
    id: "elearning",
    patterns: [
      /\be learning\b/,
      /\belearning\b/,
      /\bonline course/,
      /\blearning platform/,
      /\blms\b/,
      /\bcourses\b/,
    ],
    services: ["build:web-apps", "design:ui-ux"],
    labels: ["Web App", "UI/UX Design"],
  },
];

const SERVICE_RULES: { key: string; patterns: RegExp[] }[] = [
  {
    key: "build:websites",
    patterns: [/\bwebsites?\b/, /\bweb sites?\b/, /\bone page\b/, /\blanding page\b/],
  },
  {
    key: "build:web-apps",
    patterns: [
      /\bweb apps?\b/,
      /\bweb application/,
      /\bdashboards?\b/,
      /\bportals?\b/,
      /\binternal tool/,
      /\bplatform\b/,
      /\bsaas\b/,
    ],
  },
  {
    key: "build:mobile-apps",
    patterns: [/\bmobile app/, /\bios\b/, /\bandroid\b/, /\bflutter\b/, /\bapp store\b/],
  },
  {
    key: "design:ui-ux",
    patterns: [/\bui ux\b/, /\bui\/ux\b/, /\buser experience/, /\bfigma\b/, /\binterface design\b/],
  },
  {
    key: "design:brand",
    patterns: [/\bbrand(ing)?\b/, /\blogo\b/, /\bidentity design\b/, /\bbrand guide\b/],
  },
  {
    key: "design:graphics",
    patterns: [/\bgraphics? design\b/, /\bsocial graphics\b/, /\bads design\b/],
  },
  {
    key: "design:redesign",
    patterns: [/\bredesign/, /\bmakeover\b/, /\baudit\b/],
  },
  {
    key: "automate:lead-capture",
    patterns: [/\blead capture\b/, /\bcapture (leads|inquiries)\b/, /\bcontact form\b/],
  },
  {
    key: "automate:follow-up",
    patterns: [/\bfollow up\b/, /\bfollowup\b/, /\bnurture\b/],
  },
  {
    key: "automate:research",
    patterns: [/\bresearch\b/, /\bmarket data\b/, /\bmarket brief\b/],
  },
  {
    key: "automate:reporting",
    patterns: [/\breporting\b/, /\breports?\b/, /\bweekly summary\b/, /\banalytics\b/],
  },
  {
    key: "automate:crm",
    patterns: [/\bcrm\b/, /\binsights\b/, /\bcustomer records\b/, /\bpipeline\b/],
  },
  {
    key: "build:systems",
    patterns: [/\binternal system/, /\bsystems?\b/, /\boperations tool\b/],
  },
];

const PRICE_INTENT =
  /\bhow much\b|\bprice|\bcosts?\b|\bbudget\b|\bquotes?\b|\bestimates?\b|\bpricing\b|\bcheap\b|\bafford\b/;
const CAPABILITY_INTENT =
  /\bcan you\b|\bcould you\b|\bdo you (build|make|do|work)\b|\bare you able\b|\bis it possible\b/;
const INQUIRY_INTENT =
  /\b(start|begin|get started|send|submit|reach|contact|talk|hire|inquiry|enquiry)\b/;
const IDENTITY =
  /\b(are you (a )?(real )?(person|human|bot|ai|robot)|who are you|what are you|are you marcus|is this (a )?(bot|ai|human)|are you (an )?(ai|assistant))\b/;

export type Detection = {
  services: string[];
  custom: CustomRule | null;
};

export function detect(text: string): Detection {
  const padded = normalize(text);
  const custom =
    CUSTOM_RULES.find((rule) => rule.patterns.some((pattern) => pattern.test(padded))) ??
    null;

  if (custom) return { services: custom.services, custom };

  const services = SERVICE_RULES.filter((rule) =>
    rule.patterns.some((pattern) => pattern.test(padded)),
  ).map((rule) => rule.key);

  return { services: [...new Set(services)], custom: null };
}

export function hasPriceIntent(text: string) {
  return PRICE_INTENT.test(normalize(text));
}

export function hasCapabilityIntent(text: string) {
  return CAPABILITY_INTENT.test(normalize(text));
}

export function hasInquiryIntent(text: string) {
  return INQUIRY_INTENT.test(normalize(text));
}

/** "Are you a real person?" and friends get the identity line, not a pitch. */
export function isIdentityQuestion(text: string) {
  return IDENTITY.test(normalize(text));
}

export function identityAnswer(kb: KbEntry[]) {
  return kb.find((entry) => entry.id === "faq-ask-marcus")?.answer ?? null;
}

export type Handoff = { href: string; label: string };

export function handoffFor(services: string[], packageSlug?: string): Handoff {
  if (packageSlug) {
    return { href: `/?package=${encodeURIComponent(packageSlug)}#contact`, label: "Start your inquiry" };
  }
  if (services.length > 0) {
    return {
      href: `/?services=${encodeURIComponent(services.join(","))}#contact`,
      label: "Start your inquiry",
    };
  }
  return { href: "/#contact", label: "Start your inquiry" };
}

export const ESTIMATE_NOTE =
  "Rough estimate, not a quote. The final price depends on scope, and we confirm it before any work starts.";

function labelFor(key: string) {
  return ESTIMATE_SERVICES.find((service) => service.key === key)?.name ?? key;
}

/**
 * Prices are never reasoned about by a model: every number here comes from
 * buildQuote, the same module the form calculator uses.
 */
export function quoteAnswer(
  detection: Detection,
  kb: KbEntry[],
  options: { capability: boolean },
): { reply: string; handoff: Handoff } | null {
  const { services, custom } = detection;
  if (services.length === 0) return null;

  const quote = buildQuote(services);
  if (!quote) return null;

  const prefix = options.capability ? "Yes. " : "";
  const handoff = handoffFor(services, quote.matched?.slug);

  if (quote.matched) {
    const bundle = quote.matched;
    const bundles = findPackage(bundle.slug) ?? bundle;
    return {
      reply: `${prefix}That matches the ${bundles.name}: ${formatMoney(bundles.price)} instead of ${formatMoney(packageTotal(bundles))}. You save ${formatMoney(packageSaving(bundles))}.`,
      handoff,
    };
  }

  if (services.length === 1) {
    const name = labelFor(services[0]);
    const entry = kb.find(
      (item) => item.topic === "services" && item.title === name,
    );
    if (entry) {
      // The entry already states the range and what moves the price.
      return { reply: `${entry.answer}\n\n${ESTIMATE_NOTE}`, handoff };
    }
  }

  const labels = custom ? custom.labels : services.map(labelFor);
  return {
    reply: `${prefix}${labels.join(" + ")}. Rough estimate: ${formatQuoteRange(quote.low, quote.high)}. ${ESTIMATE_NOTE}`,
    handoff,
  };
}

/**
 * A confident hit, or a short question, is answered as written with no model
 * call. A longer question with only a single-word keyword hit goes to the
 * model, which is the only place judgment is needed.
 */
export function directKbAnswer(
  match: KbMatch | undefined,
  wordCount: number,
): string | null {
  if (!match || match.score < 3) return null;
  if (match.score >= 6 || wordCount <= 8) return match.entry.answer;
  return null;
}
