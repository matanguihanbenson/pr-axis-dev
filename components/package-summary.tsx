import Link from "next/link";
import {
  findPackage,
  formatAddOnPrice,
  packageSaving,
  packageTotal,
} from "@/lib/packages";
import { formatMoney } from "@/lib/services";

export function PackageSummary({ slug }: { slug: string }) {
  const bundle = findPackage(slug);
  if (!bundle) return null;

  return (
    <div className="package-summary">
      <div className="package-summary__grid">
        <div className="package-summary__block">
          <h2 className="h3">What is inside</h2>
          <ul className="package-card__list">
            {bundle.contents.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                <span>{formatMoney(item.price)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="package-summary__block">
          <h2 className="h3">Add-ons</h2>
          <ul className="package-card__list package-card__list--muted">
            {bundle.addOns.map((addOn) => (
              <li key={addOn.label}>
                <span>{addOn.label}</span>
                <span>{formatAddOnPrice(addOn)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <dl className="package-card__totals package-summary__totals">
        <div>
          <dt>Individual</dt>
          <dd>{formatMoney(packageTotal(bundle))}</dd>
        </div>
        <div>
          <dt>Package</dt>
          <dd>{formatMoney(bundle.price)}</dd>
        </div>
        <div className="package-card__saving">
          <dt>You save</dt>
          <dd>{formatMoney(packageSaving(bundle))}</dd>
        </div>
      </dl>

      <Link
        className="package-summary__cta"
        href={`/?package=${bundle.slug}#contact`}
      >
        Start with this package
      </Link>
    </div>
  );
}
