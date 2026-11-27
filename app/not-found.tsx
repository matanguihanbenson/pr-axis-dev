import Link from "next/link";
import { PACKAGES } from "@/lib/packages";
import { PillarProvider } from "@/components/pillar-context";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Page not found | pr-axis dev",
};

export default function NotFound() {
  return (
    <PillarProvider>
      <SiteHeader />
      <main className="not-found">
        <div className="page-shell not-found__inner">
          <span className="eyebrow">404</span>
          <h1 className="h1">This page does not exist.</h1>
          <p className="p p--large">
            The link may be old, or the page may have moved. Everything the
            studio offers is one click away.
          </p>
          <div className="not-found__actions">
            <Link className="not-found__cta" href="/">
              Back to the homepage
            </Link>
            <Link className="not-found__link" href="/#pricing">
              See the pricing
            </Link>
          </div>

          <div className="not-found__packages">
            <span className="eyebrow">Packages</span>
            <ul>
              {PACKAGES.map((bundle) => (
                <li key={bundle.slug}>
                  <Link href={`/${bundle.slug}`}>{bundle.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <SiteFooter />
    </PillarProvider>
  );
}
