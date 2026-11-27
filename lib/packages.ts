import { formatMoney, serviceKey } from "./services";

export type PackageItem = {
  label: string;
  price: number;
  /** The form option this item is when it is sold on its own, if any. */
  key?: string;
};

export type PackageAddOn = {
  id: string;
  label: string;
  /** null means a custom quote. */
  price: number | null;
  /** A per-unit note, such as "per page". */
  unit?: string;
};

export type Bundle = {
  slug: string;
  name: string;
  who: string;
  price: number;
  contents: PackageItem[];
  addOns: PackageAddOn[];
  /**
   * The form options whose selection makes this package a match. Null when the
   * package includes work that is not sold as a standalone option.
   */
  matchKeys: string[] | null;
};

export const PACKAGES: Bundle[] = [
  {
    slug: "launch",
    name: "Launch Package",
    who: "A new business that needs to exist online and start getting customers this month, not next quarter.",
    price: 1050,
    contents: [
      { label: "Brand Design", price: 400, key: serviceKey("design", "brand") },
      { label: "One-page Website", price: 500, key: serviceKey("build", "websites") },
      {
        label: "Lead Capture Agent",
        price: 400,
        key: serviceKey("automate", "lead-capture"),
      },
    ],
    addOns: [
      { id: "extra-page", label: "Extra website page", price: 150, unit: "per page" },
      { id: "follow-up-agent", label: "Follow-up Agent", price: 400 },
      { id: "social-kit", label: "Social Media Kit Package", price: 450 },
    ],
    matchKeys: [
      serviceKey("design", "brand"),
      serviceKey("build", "websites"),
      serviceKey("automate", "lead-capture"),
    ],
  },
  {
    slug: "branding",
    name: "Branding Package",
    who: "A business that wants a brand it can actually use from day one, not a logo file that sits in a folder.",
    price: 550,
    contents: [
      {
        label: "Brand Design (logo set, colors, type, usage rules)",
        price: 400,
        key: serviceKey("design", "brand"),
      },
      { label: "Branded social templates", price: 250 },
    ],
    addOns: [
      { id: "brand-guide", label: "Full brand guide", price: 150 },
      { id: "logo-variation", label: "Extra logo variation", price: 100 },
      { id: "one-page-website", label: "One-page Website", price: 500 },
    ],
    matchKeys: null,
  },
  {
    slug: "social-media",
    name: "Social Media Kit Package",
    who: "A business that posts on social but every post looks different, so nobody recognizes it.",
    price: 450,
    contents: [
      {
        label:
          "12 reusable post and story templates, sized for each platform you use (Instagram, Facebook, TikTok, LinkedIn)",
        price: 350,
      },
      {
        label:
          "Posting guide (which template for what, and the colors and fonts to use)",
        price: 200,
      },
    ],
    addOns: [
      { id: "extra-templates", label: "6 extra templates", price: 150 },
      { id: "content-calendar", label: "Monthly content calendar", price: 200 },
      { id: "brand-design", label: "Brand Design", price: 400 },
    ],
    matchKeys: null,
  },
  {
    slug: "crm",
    name: "CRM Package",
    who: "A business losing track of inquiries and leads, and only noticing when a deal is already gone.",
    price: 1400,
    contents: [
      {
        label: "Lead Capture Agent",
        price: 400,
        key: serviceKey("automate", "lead-capture"),
      },
      {
        label: "Follow-up Agent",
        price: 400,
        key: serviceKey("automate", "follow-up"),
      },
      {
        label: "CRM & Insights Agent",
        price: 500,
        key: serviceKey("automate", "crm"),
      },
      {
        label: "Reporting Agent",
        price: 400,
        key: serviceKey("automate", "reporting"),
      },
    ],
    addOns: [
      { id: "research-agent", label: "Data & Research Agent", price: 400 },
      { id: "extra-channel", label: "Extra channel", price: 150 },
      { id: "extra-agent", label: "Extra agent", price: 400 },
    ],
    matchKeys: [
      serviceKey("automate", "lead-capture"),
      serviceKey("automate", "follow-up"),
      serviceKey("automate", "crm"),
      serviceKey("automate", "reporting"),
    ],
  },
  {
    slug: "rebrand-rebuild",
    name: "Rebrand & Rebuild Package",
    who: "A business whose look and site no longer fit what it sells, and that wants both fixed at once instead of in two separate jobs.",
    price: 1550,
    contents: [
      { label: "Brand Design", price: 400, key: serviceKey("design", "brand") },
      { label: "UI/UX Design", price: 600, key: serviceKey("design", "ui-ux") },
      { label: "Multi-page Website", price: 900, key: serviceKey("build", "websites") },
    ],
    addOns: [
      { id: "extra-page", label: "Extra website page", price: 150, unit: "per page" },
      { id: "lead-capture", label: "Lead Capture Agent", price: 400 },
      { id: "social-templates", label: "Branded social templates", price: 250 },
    ],
    matchKeys: [
      serviceKey("design", "brand"),
      serviceKey("design", "ui-ux"),
      serviceKey("build", "websites"),
    ],
  },
  {
    slug: "full-automate",
    name: "Full Automate Package",
    who: "A business that wants the repetitive work handled end to end, so the team stops doing the same task by hand.",
    price: 1700,
    contents: [
      {
        label: "Lead Capture Agent",
        price: 400,
        key: serviceKey("automate", "lead-capture"),
      },
      {
        label: "Follow-up Agent",
        price: 400,
        key: serviceKey("automate", "follow-up"),
      },
      {
        label: "Data & Research Agent",
        price: 400,
        key: serviceKey("automate", "research"),
      },
      {
        label: "Reporting Agent",
        price: 400,
        key: serviceKey("automate", "reporting"),
      },
      {
        label: "CRM & Insights Agent",
        price: 500,
        key: serviceKey("automate", "crm"),
      },
    ],
    addOns: [
      { id: "extra-workflow", label: "Extra workflow", price: 400 },
      { id: "extra-channel", label: "Extra channel", price: 150 },
      { id: "custom-integration", label: "Custom integration", price: null },
    ],
    matchKeys: [
      serviceKey("automate", "lead-capture"),
      serviceKey("automate", "follow-up"),
      serviceKey("automate", "research"),
      serviceKey("automate", "reporting"),
      serviceKey("automate", "crm"),
    ],
  },
];

export function findPackage(slug: string) {
  return PACKAGES.find((item) => item.slug === slug);
}

export function packageTotal(bundle: Bundle) {
  return bundle.contents.reduce((sum, item) => sum + item.price, 0);
}

export function packageSaving(bundle: Bundle) {
  return packageTotal(bundle) - bundle.price;
}

export function packageKey(slug: string) {
  return `package:${slug}`;
}

export function formatAddOnPrice(addOn: PackageAddOn) {
  if (addOn.price === null) return "Custom quote";
  return `${formatMoney(addOn.price)}${addOn.unit ? ` ${addOn.unit}` : ""}`;
}

export function addOnKey(packageSlug: string, addOnId: string) {
  return `addon:${packageSlug}:${addOnId}`;
}

export const ADDON_OPTIONS = PACKAGES.flatMap((bundle) =>
  bundle.addOns.map((addOn) => ({
    key: addOnKey(bundle.slug, addOn.id),
    packageSlug: bundle.slug,
    packageName: bundle.name,
    addOn,
  })),
);

export function findAddOn(key: string) {
  return ADDON_OPTIONS.find((option) => option.key === key);
}
