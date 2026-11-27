import { ESTIMATE_SERVICES } from "./estimate-helpers";
import {
  PACKAGES,
  findAddOn,
  formatAddOnPrice,
  packageSaving,
  packageTotal,
  type Bundle,
} from "./packages";
import { formatMoney } from "./services";

export type QuoteLine = {
  key: string;
  label: string;
  value: string;
  low: number;
  high: number;
};

export type Quote = {
  lines: QuoteLine[];
  low: number;
  high: number;
  savings: string[];
  matched: Bundle | null;
};

export function formatQuoteRange(low: number, high: number) {
  if (low === high) return formatMoney(low);
  return `${formatMoney(low)} to ${formatMoney(high)}`;
}

export function buildQuote(selected: string[]): Quote | null {
  const serviceKeys = selected.filter(
    (key) => !key.startsWith("package:") && !key.startsWith("addon:"),
  );
  const packageSlugs = selected
    .filter((key) => key.startsWith("package:"))
    .map((key) => key.slice("package:".length));
  const addOnKeys = selected.filter((key) => key.startsWith("addon:"));

  const services = serviceKeys.flatMap((key) => {
    const found = ESTIMATE_SERVICES.find((service) => service.key === key);
    return found ? [found] : [];
  });
  const chosen = PACKAGES.filter((bundle) => packageSlugs.includes(bundle.slug));
  const addOns = addOnKeys.flatMap((key) => {
    const found = findAddOn(key);
    return found ? [found] : [];
  });

  if (services.length === 0 && chosen.length === 0 && addOns.length === 0) {
    return null;
  }

  // A chosen package already includes its parts, so a part selected as well is
  // not charged twice.
  const bundledKeys = new Set(
    chosen.flatMap((bundle) =>
      bundle.contents
        .map((item) => item.key)
        .filter((key): key is string => Boolean(key)),
    ),
  );
  const looseServices = services.filter(
    (service) => !bundledKeys.has(service.key),
  );

  // A selected service that the chosen package already covers is shown as
  // included rather than dropped, so no pick disappears from the estimate.
  const included = chosen.flatMap((bundle) =>
    bundle.contents
      .filter(
        (item) =>
          item.key && services.some((service) => service.key === item.key),
      )
      .map((item) => ({
        key: `included:${bundle.slug}:${item.key}`,
        label: item.label,
        value: "Included",
        low: 0,
        high: 0,
      })),
  );

  const lines: QuoteLine[] = [];
  const savings: string[] = [];
  let low = 0;
  let high = 0;

  chosen.forEach((bundle) => {
    lines.push({
      key: `package:${bundle.slug}`,
      label: `${bundle.name} (package)`,
      value: formatMoney(bundle.price),
      low: bundle.price,
      high: bundle.price,
    });
    low += bundle.price;
    high += bundle.price;
    savings.push(
      `The ${bundle.name} saves ${formatMoney(packageSaving(bundle))} against booking its parts separately.`,
    );
  });

  included.forEach((line) => lines.push(line));

  // A package the visitor has effectively built from its parts.
  let matched: Bundle | null = null;
  let matchedExtras: typeof services = [];

  if (chosen.length === 0 && services.length > 0) {
    const keys = new Set(services.map((item) => item.key));
    for (const bundle of PACKAGES) {
      if (!bundle.matchKeys) continue;
      const included = bundle.matchKeys.every((key) => keys.has(key));
      if (!included) continue;
      const exact = keys.size === bundle.matchKeys.length;
      if (!exact && matched) continue;
      matched = bundle;
      matchedExtras = services.filter(
        (item) => !bundle.matchKeys!.includes(item.key),
      );
      if (exact) break;
    }
  }

  if (matched) {
    lines.push({
      key: `package:${matched.slug}`,
      label: `${matched.name} (package)`,
      value: formatMoney(matched.price),
      low: matched.price,
      high: matched.price,
    });
    low += matched.price;
    high += matched.price;
    savings.push(
      `This matches the ${matched.name}: ${formatMoney(matched.price)} instead of ${formatMoney(packageTotal(matched))}. You save ${formatMoney(packageSaving(matched))}.`,
    );
  }

  const individuallyPriced = matched ? matchedExtras : looseServices;
  individuallyPriced.forEach((item) => {
    lines.push({
      key: item.key,
      label: item.name,
      value: formatQuoteRange(item.from, item.to),
      low: item.from,
      high: item.to,
    });
    low += item.from;
    high += item.to;
  });

  addOns.forEach(({ key, addOn }) => {
    const price = addOn.price ?? 0;
    lines.push({
      key,
      label: addOn.label,
      value: formatAddOnPrice(addOn),
      low: price,
      high: price,
    });
    low += price;
    high += price;
  });

  return { lines, low, high, savings, matched };
}
