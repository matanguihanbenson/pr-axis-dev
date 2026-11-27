import Link from "next/link";
import { PillarProvider } from "./pillar-context";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <PillarProvider>
      <SiteHeader />
      <main className="demo-page">{children}</main>
      <SiteFooter />
    </PillarProvider>
  );
}

export function DemoHead({
  name,
  who,
}: {
  name: string;
  who: string;
}) {
  return (
    <div className="demo-page__head">
      <Link className="demo-page__back" href="/#pricing">
        All packages
      </Link>
      <span className="eyebrow">Package demo</span>
      <h1 className="h1">{name}</h1>
      <p className="p p--large">{who}</p>
    </div>
  );
}
